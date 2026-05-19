<?php

namespace App\Http\Controllers\Api;

use App\Events\CollabStatusChanged;
use App\Events\NewCollabRequest;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendCollabRequest;
use App\Http\Resources\CollabRequestResource;
use App\Mail\CollabAcceptedMail;
use App\Mail\CollabRejectedMail;
use App\Mail\CollabRequestReceivedMail;
use App\Models\CollaborationRequest;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CollabController extends Controller
{
    /**
     * Send a collaboration request to a post's entrepreneur.
     * Requires: auth + investor role.
     * Validation: cannot send duplicate pending request to same post.
     */
    public function store(SendCollabRequest $request, Post $post): JsonResponse
    {
        $user = $request->user();

        // Check for existing pending/accepted request
        $existing = CollaborationRequest::where('sender_id', $user->id)
            ->where('post_id', $post->id)
            ->whereIn('status', ['pending', 'accepted'])
            ->exists();

        if ($existing) {
            return response()->json([
                'message' => 'You already have an active collaboration request for this post.',
            ], 422);
        }

        $collabRequest = CollaborationRequest::create([
            'post_id' => $post->id,
            'sender_id' => $user->id,
            'receiver_id' => $post->user_id,
            'message' => $request->message,
            'status' => 'pending',
            'expires_at' => now()->addDays(20),
        ]);

        $collabRequest->load(['post', 'sender', 'receiver']);

        Mail::to($collabRequest->receiver->email)->queue(new CollabRequestReceivedMail($collabRequest));

        Notification::create([
            'user_id' => $collabRequest->receiver_id,
            'type' => 'new_collab_request',
            'data' => [
                'collab_id' => $collabRequest->id,
                'post_title' => $collabRequest->post->title,
                'sender_name' => $collabRequest->sender->name,
                'sender_avatar' => $collabRequest->sender->avatar_url,
            ],
        ]);

        broadcast(new NewCollabRequest(
            $collabRequest->receiver_id,
            $collabRequest->id,
            $collabRequest->post->title,
            $collabRequest->sender->name,
            $collabRequest->sender->avatar_url
        ));

        return response()->json([
            'data' => new CollabRequestResource($collabRequest),
        ], 201);
    }

    /**
     * List collaboration requests received by the authenticated entrepreneur.
     * Supports status filter: ?status=pending|accepted|rejected|expired
     */
    public function received(Request $request): JsonResponse
    {
        $query = CollaborationRequest::where('receiver_id', $request->user()->id)
            ->with(['post', 'sender']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json(CollabRequestResource::collection($requests)->response()->getData(true));
    }

    /**
     * List collaboration requests sent by the authenticated investor.
     */
    public function sent(Request $request): JsonResponse
    {
        $query = CollaborationRequest::where('sender_id', $request->user()->id)
            ->with(['post', 'receiver']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json(CollabRequestResource::collection($requests)->response()->getData(true));
    }

    /**
     * Accept a collaboration request.
     * Requires: auth + entrepreneur + owns receiving post.
     */
    public function accept(CollaborationRequest $collabRequest): JsonResponse
    {
        $this->authorize('accept', $collabRequest);

        if (!$collabRequest->isPending()) {
            return response()->json([
                'message' => 'This request can no longer be accepted.',
            ], 422);
        }

        $collabRequest->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        $collabRequest->load(['post', 'sender', 'receiver']);

        Mail::to($collabRequest->sender->email)->queue(new CollabAcceptedMail($collabRequest));

        Notification::create([
            'user_id' => $collabRequest->sender_id,
            'type' => 'collab_accepted',
            'data' => [
                'collab_id' => $collabRequest->id,
                'post_title' => $collabRequest->post->title,
                'entrepreneur_name' => $collabRequest->receiver->name,
            ],
        ]);

        broadcast(new CollabStatusChanged(
            $collabRequest->sender_id,
            'accepted',
            $collabRequest->id,
            $collabRequest->post->title,
            $collabRequest->receiver->name
        ));

        return response()->json([
            'data' => new CollabRequestResource($collabRequest),
        ]);
    }

    /**
     * Reject a collaboration request.
     * Requires: auth + entrepreneur + owns receiving post.
     * Cannot reject an already-accepted request.
     */
    public function reject(CollaborationRequest $collabRequest): JsonResponse
    {
        $this->authorize('reject', $collabRequest);

        if ($collabRequest->isAccepted()) {
            return response()->json([
                'message' => 'Cannot reject an already accepted request.',
            ], 422);
        }

        if (!$collabRequest->isPending()) {
            return response()->json([
                'message' => 'This request can no longer be rejected.',
            ], 422);
        }

        $collabRequest->update([
            'status' => 'rejected',
            'responded_at' => now(),
        ]);

        $collabRequest->load(['post', 'sender', 'receiver']);

        Mail::to($collabRequest->sender->email)->queue(new CollabRejectedMail($collabRequest));

        Notification::create([
            'user_id' => $collabRequest->sender_id,
            'type' => 'collab_rejected',
            'data' => [
                'collab_id' => $collabRequest->id,
                'post_title' => $collabRequest->post->title,
                'entrepreneur_name' => $collabRequest->receiver->name,
            ],
        ]);

        broadcast(new CollabStatusChanged(
            $collabRequest->sender_id,
            'rejected',
            $collabRequest->id,
            $collabRequest->post->title,
            $collabRequest->receiver->name
        ));

        return response()->json([
            'data' => new CollabRequestResource($collabRequest),
        ]);
    }

    /**
     * Withdraw a pending collaboration request (investor).
     * Sets status to 'withdrawn', not soft-deleted.
     */
    public function withdraw(CollaborationRequest $collabRequest): JsonResponse
    {
        $this->authorize('withdraw', $collabRequest);

        $collabRequest->update(['status' => 'withdrawn']);

        return response()->json(['message' => 'Collaboration request withdrawn.']);
    }

    /**
     * Cancel an accepted collaboration.
     * Either sender (investor) or receiver (entrepreneur) may cancel.
     */
    public function cancel(CollaborationRequest $collabRequest): JsonResponse
    {
        $this->authorize('cancel', $collabRequest);

        $collabRequest->update([
            'status' => 'cancelled',
            'responded_at' => now(),
        ]);

        $collabRequest->load(['post', 'sender', 'receiver']);

        $user = request()->user();
        $otherUserId = $collabRequest->sender_id === $user->id
            ? $collabRequest->receiver_id
            : $collabRequest->sender_id;

        Notification::create([
            'user_id' => $otherUserId,
            'type' => 'collab_cancelled',
            'data' => [
                'collab_id' => $collabRequest->id,
                'post_title' => $collabRequest->post->title,
                'cancelled_by' => $user->name,
            ],
        ]);

        broadcast(new CollabStatusChanged(
            $otherUserId,
            'cancelled',
            $collabRequest->id,
            $collabRequest->post->title,
            $user->name
        ));

        return response()->json([
            'message' => 'Collaboration cancelled successfully.',
            'data' => new CollabRequestResource($collabRequest),
        ]);
    }
}
