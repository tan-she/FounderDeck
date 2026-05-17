<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $receiver_id;
    public array $payload;

    public function __construct(string $receiver_id, string $sender_id, string $sender_name, ?string $sender_avatar, string $message_preview, string $sent_at)
    {
        $this->receiver_id = $receiver_id;
        $this->payload = [
            'type' => 'new_message',
            'sender_id' => $sender_id,
            'sender_name' => $sender_name,
            'sender_avatar' => $sender_avatar,
            'message_preview' => $message_preview,
            'sent_at' => $sent_at,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->receiver_id}"),
        ];
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
