<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Anyone can view posts.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Anyone can view a single post.
     */
    public function view(?User $user, Post $post): bool
    {
        return true;
    }

    /**
     * Only entrepreneurs can create posts.
     */
    public function create(User $user): bool
    {
        return $user->isEntrepreneur();
    }

    /**
     * Only the post owner (entrepreneur) can update their post.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id && $user->isEntrepreneur();
    }

    /**
     * Only the post owner (entrepreneur) can delete their post.
     * Super admins can also delete via admin routes (handled separately).
     */
    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id && $user->isEntrepreneur();
    }
}
