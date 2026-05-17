<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollabRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'status' => $this->status,
            'responded_at' => $this->responded_at,
            'expires_at' => $this->expires_at,
            'post' => new PostResource($this->whenLoaded('post')),
            'sender' => new UserResource($this->whenLoaded('sender')),
            'receiver' => new UserResource($this->whenLoaded('receiver')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
