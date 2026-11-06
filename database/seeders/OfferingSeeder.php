<?php

namespace Database\Seeders;

use App\Models\Offering;
use App\Models\User;
use Illuminate\Database\Seeder;

class OfferingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', UserSeeder::TEST_USER_EMAIL)->firstOrFail();
        $incomeCategories = $user->categories()->where('type', 'income')->get();

        Offering::factory()
            ->count(10)
            ->forUser($user)
            ->state(fn () => ['category_id' => $incomeCategories->random()->getKey()])
            ->create();
    }
}
