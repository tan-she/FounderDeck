<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pitch extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'tagline',
        'problem',
        'solution',
        'industry',
        'funding_stage',
        'cover_image',
        'upvotes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
