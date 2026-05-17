<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Never expose encrypted_body raw — always decrypt in the Resource layer.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sender_id' => $this->sender_id,
            'receiver_id' => $this->receiver_id,
            'body' => $this->decrypted_body, // Uses accessor with try/catch
            'is_read' => $this->is_read,
            'read_at' => $this->read_at,
            'sender' => new UserResource($this->whenLoaded('sender')),
            'receiver' => new UserResource($this->whenLoaded('receiver')),
            'created_at' => $this->created_at,
        ];
    }
}
