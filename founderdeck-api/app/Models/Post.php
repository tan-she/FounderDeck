<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'tagline',
        'description',
        'industry',
        'tech_stack',
        'funding_stage',
        'cover_image_url',
        'demo_url',
        'github_repo_url',
        'is_published',
        'views_count',
    ];

    protected function casts(): array
    {
        return [
            'tech_stack' => 'array',
            'is_published' => 'boolean',
            'views_count' => 'integer',
        ];
    }

    // ── Relationships ───────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function collaborationRequests(): HasMany
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tags');
    }

    public function reports()
    {
        return $this->morphMany(Report::class, 'reportable');
    }

    // ── Accessors ───────────────────────────────────────────

    public function getUpvotesCountAttribute(): int
    {
        return $this->votes()->where('vote_type', 'up')->count();
    }

    public function getDownvotesCountAttribute(): int
    {
        return $this->votes()->where('vote_type', 'down')->count();
    }
}
