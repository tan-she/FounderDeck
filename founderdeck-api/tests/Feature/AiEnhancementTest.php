<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\DeepSeekService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AiEnhancementTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_ai_enhance(): void
    {
        $this->postJson('/api/ai/enhance-pitch', [
            'field' => 'description',
            'content' => 'This is a rough pitch for our startup.',
        ])->assertUnauthorized();
    }

    public function test_non_entrepreneur_cannot_access_ai_enhance(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $this->actingAs($investor, 'sanctum')
            ->postJson('/api/ai/enhance-pitch', [
                'field' => 'description',
                'content' => 'This is a rough pitch for our startup.',
            ])->assertForbidden();
    }

    public function test_entrepreneur_can_enhance_pitch_successfully_with_think_tags_stripped(): void
    {
        $entrepreneur = User::factory()->create(['role' => 'entrepreneur']);

        // Mock DeepSeekService
        $mockService = Mockery::mock(DeepSeekService::class);
        $mockService->shouldReceive('askDeepSeek')
            ->once()
            ->andReturn("<think>\nThinking about how to rewrite this pitch.\n</think>\nHere is the incredibly enhanced professional startup description.");

        $this->app->instance(DeepSeekService::class, $mockService);

        $this->actingAs($entrepreneur, 'sanctum')
            ->postJson('/api/ai/enhance-pitch', [
                'field' => 'description',
                'content' => 'This is a rough pitch for our startup.',
            ])
            ->assertOk()
            ->assertJson([
                'status' => 'success',
                'enhanced_content' => 'Here is the incredibly enhanced professional startup description.',
            ]);
    }

    public function test_validation_works_for_ai_enhance(): void
    {
        $entrepreneur = User::factory()->create(['role' => 'entrepreneur']);

        // Missing fields
        $this->actingAs($entrepreneur, 'sanctum')
            ->postJson('/api/ai/enhance-pitch', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['field', 'content']);

        // Invalid field values
        $this->actingAs($entrepreneur, 'sanctum')
            ->postJson('/api/ai/enhance-pitch', [
                'field' => 'invalid_field_name',
                'content' => 'Rough notes here.',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['field']);
    }
}
