<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    private function applyPostIncludes($query)
    {
        return $query
            ->with(['user', 'tags'])
            ->withCount([
                'votes as upvotes_count' => fn($q) => $q->where('vote_type', 'up'),
                'votes as downvotes_count' => fn($q) => $q->where('vote_type', 'down'),
                'comments',
                'collaborationRequests',
            ]);
    }

    private function loadPostCounts(Post $post): Post
    {
        $post->loadCount([
            'votes as upvotes_count' => fn($q) => $q->where('vote_type', 'up'),
            'votes as downvotes_count' => fn($q) => $q->where('vote_type', 'down'),
            'comments',
            'collaborationRequests',
        ]);

        return $post;
    }

    /**
     * List all published posts with filtering, sorting, and pagination.
     * Public endpoint.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $this->applyPostIncludes(
            Post::query()->where('is_published', true)
        );

        // ── Filters ─────────────────────────────────────────
        if ($request->filled('industry')) {
            $query->where('industry', $request->industry);
        }

        if ($request->filled('funding_stage')) {
            $query->where('funding_stage', $request->funding_stage);
        }

        if ($request->filled('tech_stack')) {
            $query->whereJsonContains('tech_stack', $request->tech_stack);
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('name', $request->tag);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('tagline', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // ── Sorting ─────────────────────────────────────────
        $sort = $request->get('sort', 'trending');

        switch ($sort) {
            case 'latest':
                $query->orderBy('created_at', 'desc');
                break;

            case 'most_voted':
                $query
                    ->orderByDesc('upvotes_count')
                    ->orderBy('downvotes_count')
                    ->orderByDesc('created_at');
                break;

            case 'most_viewed':
                $query->orderBy('views_count', 'desc');
                break;

            case 'trending':
            default:
                $query
                    ->orderByDesc('upvotes_count')
                    ->orderByDesc('comments_count')
                    ->orderByDesc('collaboration_requests_count')
                    ->orderByDesc('created_at');
                break;
        }

        $perPage = min((int) $request->get('per_page', 12), 50);
        $posts = $query->paginate($perPage);

        return response()->json(PostResource::collection($posts)->response()->getData(true));
    }

    /**
     * List posts owned by the authenticated entrepreneur.
     */
    public function mine(Request $request): JsonResponse
    {
        $posts = $this->applyPostIncludes(
            $request->user()->posts()->getQuery()
        )
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->get('per_page', 12), 50));

        return response()->json(PostResource::collection($posts)->response()->getData(true));
    }

    /**
     * Show a single post. Increments views_count.
     * Public endpoint.
     */
    public function show(Post $post): JsonResponse
    {
        $post->increment('views_count');
        $post->load(['user', 'tags']);
        $this->loadPostCounts($post);

        return response()->json([
            'data' => new PostResource($post),
        ]);
    }

    /**
     * Create a new pitch post.
     * Requires: auth + entrepreneur role (enforced by middleware + StorePostRequest).
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $post = $request->user()->posts()->create($request->validated());

        // Handle tags
        if ($request->filled('tags')) {
            $tagIds = collect($request->tags)->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => strtolower(trim($tagName))])->id;
            });
            $post->tags()->sync($tagIds);
        }

        $post->load(['user', 'tags']);
        $this->loadPostCounts($post);

        return response()->json([
            'data' => new PostResource($post),
        ], 201);
    }

    /**
     * Update a pitch post.
     * Requires: auth + entrepreneur + owns post (enforced by middleware + policy).
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $this->authorize('update', $post);

        $post->update($request->validated());

        // Handle tags if provided
        if ($request->has('tags')) {
            $tagIds = collect($request->tags)->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => strtolower(trim($tagName))])->id;
            });
            $post->tags()->sync($tagIds);
        }

        $post->load(['user', 'tags']);
        $this->loadPostCounts($post);

        return response()->json([
            'data' => new PostResource($post),
        ]);
    }

    /**
     * Delete a pitch post (soft delete).
     * Requires: auth + entrepreneur + owns post.
     */
    public function destroy(Post $post): JsonResponse
    {
        $this->authorize('delete', $post);

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully.']);
    }
}
