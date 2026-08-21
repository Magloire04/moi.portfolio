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
        // User::factory(10)->create();

        // Only seed a throwaway admin user in local development. Now that
        // canAccessPanel() can grant real Filament access (see App\Models\User),
        // running this seeder in production must never mint a working admin
        // account with the factory's public default password.
        if (app()->environment('local')) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }
    }
}
