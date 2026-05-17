<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Carbon\Carbon;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL', 'admin@founderdeck.com');
        $password = env('SUPER_ADMIN_PASSWORD', 'password');

        $admin = User::where('email', $email)->first();

        if ($admin) {
            $admin->update([
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'profile_completed' => true,
                'email_verified_at' => Carbon::now(),
            ]);
            $this->command->info("Super admin already exists — credentials updated: {$email}");
        } else {
            User::create([
                'name' => 'Super Admin',
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'profile_completed' => true,
                'email_verified_at' => Carbon::now(),
            ]);
            $this->command->info("Super admin created: {$email}");
        }
    }
}
