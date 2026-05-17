<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostUpvoted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $entrepreneur_id;
    public array $payload;

    /**
     * Create a new event instance.
     */
    public function __construct(string $entrepreneur_id, string $post_id, string $post_title, string $actor_name, int $new_score)
    {
        $this->entrepreneur_id = $entrepreneur_id;
        $this->payload = [
            'type' => 'post_upvoted',
            'post_id' => $post_id,
            'post_title' => $post_title,
            'actor_name' => $actor_name,
            'new_score' => $new_score,
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->entrepreneur_id}"),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
