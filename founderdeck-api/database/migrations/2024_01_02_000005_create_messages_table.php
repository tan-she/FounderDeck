<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * Messages table.
         *
         * Messages are encrypted at the application layer using Laravel's Crypt facade
         * (Crypt::encryptString / Crypt::decryptString). They are NOT end-to-end encrypted —
         * the server can decrypt them. The encrypted_body column stores the ciphertext.
         */
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->text('encrypted_body');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['sender_id', 'receiver_id', 'created_at']);
            $table->index(['receiver_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
