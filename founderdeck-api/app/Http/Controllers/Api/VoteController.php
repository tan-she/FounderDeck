<?php

namespace App\Http\Controllers\Api;

use App\Events\PostUpvoted;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    /**
     * Cast, change, or toggle a vote on a post.
     *
     * Logic:
     * - If no existing vote → create vote row
     * - If same vote_type exists → DELETE the vote (toggle off)
     * - If different vote_type → UPDATE the existing vote row
     *
     * Returns current counts + user's vote state.
     */
    public function vote(Request $request, Post $post): JsonResponse
    {
        $request->validate([
            'vote_type' => ['required', 'in:up,down'],
        ]);

        $user = $request->user();
        $voteType = $request->vote_type;

        $existingVote = Vote::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        $userVote = null;
        $isNewUpvote = false;

        if (!$existingVote) {
            // No existing vote — create new
            Vote::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
                'vote_type' => $voteType,
            ]);
            $userVote = $voteType;
            if ($voteType === 'up') $isNewUpvote = true;
        } elseif ($existingVote->vote_type === $voteType) {
            // Same vote — toggle off (remove)
            $existingVote->delete();
            $userVote = null;
        } else {
            // Different vote — update
            $existingVote->update(['vote_type' => $voteType]);
            $userVote = $voteType;
            if ($voteType === 'up') $isNewUpvote = true;
        }

        // Get fresh counts
        $upvotes = $post->votes()->where('vote_type', 'up')->count();
        $downvotes = $post->votes()->where('vote_type', 'down')->count();

        // Dispatch notification/event if it's a new upvote and not self-voting
        if ($isNewUpvote && $user->id !== $post->user_id) {
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'post_upvoted',
                'data' => [
                    'post_id' => $post->id,
                    'post_title' => $post->title,
                    'actor_name' => $user->name,
                    'new_score' => $upvotes - $downvotes,
                ],
            ]);

            broadcast(new PostUpvoted(
                $post->user_id,
                $post->id,
                $post->title,
                $user->name,
                $upvotes - $downvotes
            ));
        }

        return response()->json([
            'upvotes' => $upvotes,
            'downvotes' => $downvotes,
            'user_vote' => $userVote,
        ]);
    }
}
