<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * SQLite stores enum as plain text, so no ALTER TYPE needed.
     * This migration is a no-op placeholder for documentation:
     * the 'cancelled' status is now a valid value for collaboration_requests.status.
     *
     * For PostgreSQL / MySQL production, you would modify the CHECK / ENUM constraint here.
     */
    public function up(): void
    {
        // SQLite: nothing to do – the column is already a text column.
        // If deploying to PostgreSQL, uncomment:
        // DB::statement("ALTER TABLE collaboration_requests DROP CONSTRAINT IF EXISTS collaboration_requests_status_check");
        // DB::statement("ALTER TABLE collaboration_requests ADD CONSTRAINT collaboration_requests_status_check CHECK (status IN ('pending','accepted','rejected','expired','withdrawn','cancelled'))");
    }

    public function down(): void
    {
        // No-op for SQLite.
    }
};
