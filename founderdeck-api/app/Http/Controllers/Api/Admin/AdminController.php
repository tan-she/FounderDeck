<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\CollaborationRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalUsers = User::count();
        $usersByRole = User::selectRaw('role, count(*) as count')->groupBy('role')->pluck('count', 'role');
        $totalPosts = Post::count();
        $totalVotes = Vote::count();
        $collabByStatus = CollaborationRequest::selectRaw('status, count(*) as count')
            ->groupBy('status')->pluck('count', 'status');

        // Signups per week (last 8 weeks), grouped in PHP so it works on SQLite,
        // PostgreSQL, and MySQL without vendor-specific date functions.
        $signupsPerWeek = User::where('created_at', '>=', now()->subWeeks(8))
            ->orderBy('created_at')
            ->get(['created_at'])
            ->groupBy(fn(User $user) => $user->created_at->format('o-W'))
            ->map->count();

        return response()->json([
            'total_users' => $totalUsers,
            'users_by_role' => $usersByRole,
            'total_posts' => $totalPosts,
            'total_votes' => $totalVotes,
            'collab_requests_by_status' => $collabByStatus,
            'signups_per_week' => $signupsPerWeek,
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->has('is_banned')) {
            $query->where('is_banned', filter_var($request->is_banned, FILTER_VALIDATE_BOOLEAN));
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json(UserResource::collection($users)->response()->getData(true));
    }

    public function banUser(Request $request, User $user): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $user->update(['is_banned' => true, 'ban_reason' => $request->reason]);
        $user->tokens()->delete(); // Revoke all tokens

        return response()->json(['message' => 'User banned successfully.']);
    }

    public function unbanUser(User $user): JsonResponse
    {
        $user->update(['is_banned' => false, 'ban_reason' => null]);
        return response()->json(['message' => 'User unbanned successfully.']);
    }

    public function deletePost(Post $post): JsonResponse
    {
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully.']);
    }

    public function deleteComment(Comment $comment): JsonResponse
    {
        $comment->delete();
        return response()->json(['message' => 'Comment deleted successfully.']);
    }

    public function reports(Request $request): JsonResponse
    {
        $query = Report::with(['reporter']);

        if ($request->has('is_reviewed')) {
            $query->where('is_reviewed', filter_var($request->is_reviewed, FILTER_VALIDATE_BOOLEAN));
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(20);
        return response()->json($reports);
    }

    public function reviewReport(Report $report): JsonResponse
    {
        $report->update(['is_reviewed' => true]);
        return response()->json(['message' => 'Report marked as reviewed.']);
    }
}
