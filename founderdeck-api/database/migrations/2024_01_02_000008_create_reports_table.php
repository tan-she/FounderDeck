<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('reporter_id')->constrained('users');
            $table->string('reportable_type'); // 'post' or 'comment'
            $table->uuid('reportable_id');
            $table->string('reason');
            $table->boolean('is_reviewed')->default(false);
            $table->timestamps();

            $table->index(['reportable_type', 'reportable_id']);
            $table->index('is_reviewed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
