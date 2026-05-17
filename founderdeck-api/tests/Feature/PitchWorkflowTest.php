<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PitchWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_entrepreneur_can_create_and_list_their_pitch(): void
    {
        $entrepreneur = User::factory()->create([
            'role' => 'entrepreneur',
            'profile_completed' => true,
        ]);

        $payload = [
            'title' => 'Founder Signal',
            'tagline' => 'A validation network for early-stage founders.',
            'description' => 'Founder Signal helps early founders collect investor-quality feedback before they spend months building the wrong product.',
            'industry' => 'SaaS',
            'funding_stage' => 'mvp',
            'tech_stack' => ['Laravel', 'React'],
            'tags' => ['validation', 'founders'],
        ];

        $createResponse = $this->actingAs($entrepreneur, 'sanctum')
            ->postJson('/api/posts', $payload);

        $createResponse->assertCreated()
            ->assertJsonPath('data.title', 'Founder Signal')
            ->assertJsonPath('data.upvotes_count', 0)
            ->assertJsonPath('data.comments_count', 0);

        $this->actingAs($entrepreneur, 'sanctum')
            ->getJson('/api/posts/mine')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Founder Signal');
    }

    public function test_investor_can_vote_comment_and_notify_the_entrepreneur(): void
    {
        $entrepreneur = User::factory()->create(['role' => 'entrepreneur']);
        $investor = User::factory()->create(['role' => 'investor']);

        $post = Post::create([
            'user_id' => $entrepreneur->id,
            'title' => 'Cap Table Club',
            'tagline' => 'Private deal rooms for founders and backers.',
            'description' => 'A focused space where founders can manage lightweight investor discovery and collaboration requests.',
            'industry' => 'FinTech',
            'funding_stage' => 'seed',
        ]);

        $this->actingAs($investor, 'sanctum')
            ->postJson("/api/posts/{$post->id}/vote", ['vote_type' => 'up'])
            ->assertOk()
            ->assertJsonPath('upvotes', 1)
            ->assertJsonPath('user_vote', 'up');

        $this->actingAs($investor, 'sanctum')
            ->postJson("/api/posts/{$post->id}/comments", ['body' => 'Strong positioning. I would like to see customer acquisition assumptions.'])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Strong positioning. I would like to see customer acquisition assumptions.');

        $this->assertSame(2, Notification::where('user_id', $entrepreneur->id)->count());

        $this->getJson("/api/posts/{$post->id}")
            ->assertOk()
            ->assertJsonPath('data.upvotes_count', 1)
            ->assertJsonPath('data.comments_count', 1);
    }
}
