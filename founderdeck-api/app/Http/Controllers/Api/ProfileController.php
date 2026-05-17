<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(string $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        $posts = Post::query()
            ->where('user_id', $user->id)
            ->where('is_published', true)
            ->with(['user', 'tags'])
            ->withCount([
                'votes as upvotes_count' => fn($q) => $q->where('vote_type', 'up'),
                'votes as downvotes_count' => fn($q) => $q->where('vote_type', 'down'),
                'comments',
                'collaborationRequests',
            ])
            ->orderByDesc('created_at')
            ->limit(12)
            ->get();

        return response()->json([
            'data' => new UserResource($user),
            'posts' => PostResource::collection($posts),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());
        return response()->json(['data' => new UserResource($user)]);
    }
}
