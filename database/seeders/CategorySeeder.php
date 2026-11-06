<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()
            ->where('email', UserSeeder::TEST_USER_EMAIL)
            ->firstOrFail()
            ->createDefaultCategories();
    }
}
