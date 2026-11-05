<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public const TEST_USER_EMAIL = 'test@example.com';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->where('email', self::TEST_USER_EMAIL)->first()
            ?? User::factory()->create([
                'name' => 'Test User',
                'email' => self::TEST_USER_EMAIL,
            ]);
    }
}
