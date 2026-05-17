<?php

use Illuminate\Support\Facades\Broadcast;

/**
 * Private channel for user-specific real-time events.
 * Used for: notifications, messages, collab status changes.
 */
Broadcast::channel('user.{id}', function ($user, $id) {
    return $user->id === $id;
});
