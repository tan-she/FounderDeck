<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CollabStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $investor_id;
    public array $payload;

    public function __construct(string $investor_id, string $status, string $collab_id, string $post_title, string $entrepreneur_name)
    {
        $this->investor_id = $investor_id;

        $typeMap = [
            'accepted' => 'collab_accepted',
            'rejected' => 'collab_rejected',
            'cancelled' => 'collab_cancelled',
        ];

        $this->payload = [
            'type' => $typeMap[$status] ?? 'collab_' . $status,
            'collab_id' => $collab_id,
            'post_title' => $post_title,
            'entrepreneur_name' => $entrepreneur_name,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->investor_id}"),
        ];
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
