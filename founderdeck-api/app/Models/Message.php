<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

class Message extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'encrypted_body',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    // ── Relationships ───────────────────────────────────────

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    // ── Encryption helpers ──────────────────────────────────

    /**
     * Decrypt the message body.
     * Returns placeholder text if decryption fails (key rotation, corrupt data).
     * Never log decrypted message content.
     */
    public function getDecryptedBodyAttribute(): string
    {
        try {
            return Crypt::decryptString($this->encrypted_body);
        } catch (DecryptException) {
            return '[Message unavailable]';
        }
    }

    /**
     * Encrypt and set the message body.
     */
    public static function encryptBody(string $body): string
    {
        return Crypt::encryptString($body);
    }
}
