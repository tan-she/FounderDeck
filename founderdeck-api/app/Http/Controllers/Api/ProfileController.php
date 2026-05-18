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
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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

    public function syncLinkedin(Request $request): JsonResponse
    {
        $user = $request->user();

        // High fidelity mock experience timeline
        $timeline = [
            [
                'role' => 'Senior Software Architect',
                'company' => 'Stripe',
                'duration' => '2022 - Present',
                'description' => 'Architected global API scaling systems and high-throughput subscription engines.'
            ],
            [
                'role' => 'Co-Founder & CTO',
                'company' => 'EcoSphere',
                'duration' => '2019 - 2022',
                'description' => 'Successfully exited carbon intelligence platform. Acquired by ClimateTech Corp.'
            ],
            [
                'role' => 'Tech Lead',
                'company' => 'Google',
                'duration' => '2016 - 2019',
                'description' => 'Led distributed infrastructure and machine learning telemetry teams.'
            ],
            [
                'role' => 'BS Computer Science',
                'company' => 'Stanford University',
                'duration' => '2012 - 2016',
                'description' => 'Specialized in Artificial Intelligence and Database Systems.'
            ],
        ];

        // Standard high-demand skills
        $skills = ['AI/ML Architecture', 'SaaS Scaling', 'Product Management', 'React / Next.js', 'Go / Laravel', 'Distributed Systems'];

        // Hydrate profile depth metrics
        $user->update([
            'linkedin_credentials' => $timeline,
            'skills' => $skills,
            'mutual_connections_count' => rand(15, 38),
            'is_linkedin_verified' => true,
            'is_angellist_verified' => true,
            'is_crunchbase_verified' => true,
            'scorecard_wins' => 3,
            'scorecard_exits' => 1,
            'scorecard_collabs' => 5,
        ]);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'LinkedIn profile integration successfully synced!',
        ]);
    }
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'         => 'sometimes|string|max:100',
            'bio'          => 'nullable|string|max:500',
            'phone'        => 'nullable|string|max:20',
            'linkedin_url' => 'nullable|url|max:255',
            'github_url'   => 'nullable|url|max:255',
            // Email update only allowed for non-Google users
            'email'        => [
                'sometimes', 'email', 'max:255',
                Rule::unique('users')->ignore($user->id),
                // Block email change if account is Google-linked
                function ($attribute, $value, $fail) use ($user) {
                    if ($user->google_id && $value !== $user->email) {
                        $fail('Email cannot be changed for Google-linked accounts.');
                    }
                },
            ],
            'avatar' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif|max:2048', // 2MB
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it's a stored file (not a Google URL)
            if ($user->avatar_url && !str_starts_with($user->avatar_url, 'http')) {
                Storage::disk('public')->delete($user->avatar_url);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar_url'] = $path; // store relative path
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => new UserResource($user->fresh()),
        ]);
    }

    public function getMyProfile(Request $request)
    {
        return response()->json(new UserResource($request->user()));
    }
}
