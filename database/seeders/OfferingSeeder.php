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

        Offering::factory()->count(10)->forUser($user)->create();
    }
}
