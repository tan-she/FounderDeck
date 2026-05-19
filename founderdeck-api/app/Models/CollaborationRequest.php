<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CollaborationRequest extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'collaboration_requests';

    protected $fillable = [
        'post_id',
        'sender_id',
        'receiver_id',
        'message',
        'status',
        'responded_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    // ── Relationships ───────────────────────────────────────

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * The investor who sent the collaboration request.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * The entrepreneur who receives the collaboration request.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    // ── Status checks ───────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }
}
