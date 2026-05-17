<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed the super admin user.
     * Run: php artisan db:seed --class=SuperAdminSeeder
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@founderdeck.com'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@founderdeck.com',
                'password' => 'password', // Change in production! Hashed via cast
                'role' => 'super_admin',
                'profile_completed' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super admin created: admin@founderdeck.com / password');
    }
}
