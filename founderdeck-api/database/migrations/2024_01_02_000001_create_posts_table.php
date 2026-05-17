<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 150);
            $table->string('tagline', 255);
            $table->text('description');
            $table->string('industry');
            $table->json('tech_stack')->nullable();
            $table->enum('funding_stage', ['idea', 'mvp', 'seed', 'series_a', 'looking_for_cofounders']);
            $table->string('cover_image_url')->nullable();
            $table->string('demo_url')->nullable();
            $table->string('github_repo_url')->nullable();
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('views_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index('industry');
            $table->index('funding_stage');
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
