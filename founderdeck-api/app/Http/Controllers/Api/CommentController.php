<?php

namespace App\Http\Controllers\Api;

use App\Events\NewComment;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * List comments for a post, paginated, latest first.
     * Public endpoint.
     */
    public function index(Post $post): JsonResponse
    {
        $comments = $post->comments()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(CommentResource::collection($comments)->response()->getData(true));
    }

    /**
     * Create a comment on a post.
     * Requires: auth.
     */
    public function store(StoreCommentRequest $request, Post $post): JsonResponse
    {
        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
        ]);

        $comment->load('user');

        if ($post->user_id !== $request->user()->id) {
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'new_comment',
                'data' => [
                    'post_id' => $post->id,
                    'post_title' => $post->title,
                    'actor_name' => $request->user()->name,
                    'comment_preview' => mb_substr($comment->body, 0, 60),
                ],
            ]);

            broadcast(new NewComment(
                $post->user_id,
                $post->id,
                $post->title,
                $request->user()->name,
                mb_substr($comment->body, 0, 60)
            ));
        }

        return response()->json([
            'data' => new CommentResource($comment),
        ], 201);
    }

    /**
     * Update a comment.
     * Requires: auth + owns comment (enforced by policy).
     */
    public function update(StoreCommentRequest $request, Comment $comment): JsonResponse
    {
        $this->authorize('update', $comment);

        $comment->update(['body' => $request->body]);
        $comment->load('user');

        return response()->json([
            'data' => new CommentResource($comment),
        ]);
    }

    /**
     * Delete a comment (soft delete).
     * Requires: auth + owns comment OR super_admin (enforced by policy).
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully.']);
    }
}
