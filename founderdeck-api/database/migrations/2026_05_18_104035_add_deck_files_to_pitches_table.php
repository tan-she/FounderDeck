<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Store array of file paths
            if (!Schema::hasColumn('posts', 'deck_files')) {
                $table->json('deck_files')->nullable()->after('slides');
            }
        });
    }
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumnIfExists('deck_files');
        });
    }
};
