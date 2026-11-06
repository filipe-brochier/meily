<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', UserSeeder::TEST_USER_EMAIL)->firstOrFail();
        $clients = $user->clients()->get();
        $offerings = $user->offerings()->get();

        Event::factory()
            ->count(12)
            ->forUser($user)
            ->state(fn () => [
                'client_id' => $clients->random()->getKey(),
                'offering_id' => $offerings->random()->getKey(),
            ])
            ->create();
    }
}
