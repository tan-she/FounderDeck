<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(NotificationResource::collection($notifications)->response()->getData(true));
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        if ($notification->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['data' => new NotificationResource($notification)]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->notifications()
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()->where('is_read', false)->count();
        return response()->json(['count' => $count]);
    }
}
