<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->when($this->isCurrentUser($request), $this->email),
            'role' => $this->role,
            'avatar_url' => $this->avatar_url,
            'bio' => $this->bio,
            'linkedin_url' => $this->linkedin_url,
            'github_url' => $this->github_url,
            'is_banned' => $this->when($request->user()?->isSuperAdmin(), $this->is_banned),
            'ban_reason' => $this->when($request->user()?->isSuperAdmin(), $this->ban_reason),
            'profile_completed' => $this->when($this->isCurrentUser($request), $this->profile_completed),
            'created_at' => $this->created_at,
        ];
    }

    private function isCurrentUser(Request $request): bool
    {
        return $request->user()?->id === $this->id;
    }
}
