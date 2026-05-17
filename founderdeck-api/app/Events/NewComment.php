<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewComment implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $entrepreneur_id;
    public array $payload;

    public function __construct(string $entrepreneur_id, string $post_id, string $post_title, string $actor_name, string $comment_preview)
    {
        $this->entrepreneur_id = $entrepreneur_id;
        $this->payload = [
            'type' => 'new_comment',
            'post_id' => $post_id,
            'post_title' => $post_title,
            'actor_name' => $actor_name,
            'comment_preview' => $comment_preview,
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
