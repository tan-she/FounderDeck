<?php

namespace App\Policies;

use App\Models\CollaborationRequest;
use App\Models\User;

class CollaborationRequestPolicy
{
    /**
     * Only the receiver (entrepreneur) can accept a collaboration request.
     */
    public function accept(User $user, CollaborationRequest $collabRequest): bool
    {
        return $user->id === $collabRequest->receiver_id && $user->isEntrepreneur();
    }

    /**
     * Only the receiver (entrepreneur) can reject a collaboration request.
     */
    public function reject(User $user, CollaborationRequest $collabRequest): bool
    {
        return $user->id === $collabRequest->receiver_id && $user->isEntrepreneur();
    }

    /**
     * Only the sender (investor) can withdraw a pending collaboration request.
     */
    public function withdraw(User $user, CollaborationRequest $collabRequest): bool
    {
        return $user->id === $collabRequest->sender_id
            && $user->isInvestor()
            && $collabRequest->isPending();
    }

    /**
     * Either the sender (investor) or receiver (entrepreneur) can cancel
     * an accepted collaboration request.
     */
    public function cancel(User $user, CollaborationRequest $collabRequest): bool
    {
        return ($user->id === $collabRequest->sender_id || $user->id === $collabRequest->receiver_id)
            && $collabRequest->isAccepted();
    }
}
