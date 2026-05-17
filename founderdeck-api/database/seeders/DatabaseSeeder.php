<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create entrepreneur Rohit
        $rohit = User::updateOrCreate(
            ['email' => 'rohit123@gmail.com'],
            [
                'name' => 'Rohit Kumar',
                'email' => 'rohit123@gmail.com',
                'password' => '12345678',
                'role' => 'entrepreneur',
                'profile_completed' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create super admin
        User::updateOrCreate(
            ['email' => 'admin@founderdeck.com'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@founderdeck.com',
                'password' => 'password',
                'role' => 'super_admin',
                'profile_completed' => true,
                'email_verified_at' => now(),
            ]
        );

        // Seed some pitches for Rohit
        \App\Models\Post::updateOrCreate(
            ['title' => 'FounderDeck Platform'],
            [
                'user_id' => $rohit->id,
                'tagline' => 'A dynamic neo-brutalist Dribbble styled matchmaking hub for next-gen startups.',
                'description' => 'FounderDeck is an elite matchmaking network designed to break down walls between venture capital and brilliant builders. It leverages localized encrypted messaging pipelines, community upvoting lists, and professional co-founder alignment parameters.',
                'industry' => 'SaaS',
                'tech_stack' => ['React', 'Laravel', 'TailwindCSS', 'MySQL'],
                'funding_stage' => 'seed',
                'demo_url' => 'http://localhost:5173',
                'github_repo_url' => 'https://github.com/founderdeck',
                'is_published' => true,
                'views_count' => 1240,
            ]
        );

        \App\Models\Post::updateOrCreate(
            ['title' => 'Quantum Ledger'],
            [
                'user_id' => $rohit->id,
                'tagline' => 'High throughput, zero-leakage micro-accounting ledgers for DeFi pipelines.',
                'description' => 'Quantum Ledger builds sub-millisecond settlement logs for high-frequency trading applications. Designed to handle stateful replication, automated audit logs, and distributed zero-knowledge verification frameworks.',
                'industry' => 'FinTech',
                'tech_stack' => ['Golang', 'Rust', 'Web3', 'PostgreSQL'],
                'funding_stage' => 'seed',
                'demo_url' => 'https://quantumledger.io',
                'github_repo_url' => 'https://github.com/quantum',
                'is_published' => true,
                'views_count' => 380,
            ]
        );
    }
}
