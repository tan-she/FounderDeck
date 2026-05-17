<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendMessageRequest;
use App\Http\Resources\MessageResource;
use App\Http\Resources\UserResource;
use App\Mail\NewMessageMail;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class MessageController extends Controller
{
    /**
     * List unique conversation partners with last message preview and unread count.
     * Preview is decrypted and truncated to 60 chars.
     */
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Get all unique conversation partner IDs
        $partnerIds = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->selectRaw("CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as partner_id", [$userId])
            ->distinct()
            ->pluck('partner_id');

        $conversations = $partnerIds->map(function ($partnerId) use ($userId) {
            $partner = User::find($partnerId);
            if (!$partner) return null;

            $lastMessage = Message::where(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
            })->orWhere(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
            })->orderBy('created_at', 'desc')->first();

            $unreadCount = Message::where('sender_id', $partnerId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            $preview = $lastMessage ? mb_substr($lastMessage->decrypted_body, 0, 60) : null;

            return [
                'user' => new UserResource($partner),
                'last_message_preview' => $preview,
                'unread_count' => $unreadCount,
                'last_message_at' => $lastMessage?->created_at,
            ];
        })
        ->filter()
        ->sortByDesc('last_message_at')
        ->values();

        return response()->json(['data' => $conversations]);
    }

    /**
     * Get full message thread with a specific user.
     * Messages are decrypted via the MessageResource.
     * Paginated, ordered by created_at ASC.
     */
    public function thread(Request $request, string $userId): JsonResponse
    {
        $authId = $request->user()->id;

        $messages = Message::where(function ($q) use ($authId, $userId) {
            $q->where('sender_id', $authId)->where('receiver_id', $userId);
        })->orWhere(function ($q) use ($authId, $userId) {
            $q->where('sender_id', $userId)->where('receiver_id', $authId);
        })
        ->with(['sender', 'receiver'])
        ->orderBy('created_at', 'asc')
        ->paginate(50);

        return response()->json(MessageResource::collection($messages)->response()->getData(true));
    }

    /**
     * Send a message to a user.
     * Encrypts body with Crypt::encryptString() before storing.
     * Returns the decrypted message object for optimistic display.
     */
    public function send(SendMessageRequest $request, string $userId): JsonResponse
    {
        $receiver = User::findOrFail($userId);

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $receiver->id,
            'encrypted_body' => Message::encryptBody($request->body),
        ]);

        $message->load(['sender', 'receiver']);

        Mail::to($message->receiver->email)->queue(new NewMessageMail($message));

        Notification::create([
            'user_id' => $message->receiver_id,
            'type' => 'new_message',
            'data' => [
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'sender_avatar' => $message->sender->avatar_url,
                'message_preview' => mb_substr($message->decrypted_body, 0, 60),
            ],
        ]);

        broadcast(new MessageSent(
            $message->receiver_id,
            $message->sender_id,
            $message->sender->name,
            $message->sender->avatar_url,
            mb_substr($message->decrypted_body, 0, 60),
            $message->created_at->toIso8601String()
        ));

        return response()->json([
            'data' => new MessageResource($message),
        ], 201);
    }

    /**
     * Mark all unread messages from a specific user as read.
     */
    public function markAsRead(Request $request, string $userId): JsonResponse
    {
        Message::where('sender_id', $userId)
            ->where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'Messages marked as read.']);
    }
}
