<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCollabRequest implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $entrepreneur_id;
    public array $payload;

    public function __construct(string $entrepreneur_id, string $collab_id, string $post_title, string $sender_name, ?string $sender_avatar)
    {
        $this->entrepreneur_id = $entrepreneur_id;
        $this->payload = [
            'type' => 'collab_request',
            'collab_id' => $collab_id,
            'post_title' => $post_title,
            'sender_name' => $sender_name,
            'sender_avatar' => $sender_avatar,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->entrepreneur_id}"),
        ];
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
