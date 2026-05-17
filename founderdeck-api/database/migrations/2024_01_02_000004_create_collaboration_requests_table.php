<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaboration_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('post_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->enum('status', ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'])
                  ->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('expires_at');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['sender_id', 'status']);
            $table->index(['receiver_id', 'status']);
            $table->index(['status', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaboration_requests');
    }
};
