<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', UserSeeder::TEST_USER_EMAIL)->firstOrFail();

        $clients = $user->clients;
        $offerings = $user->offerings;
        $categoriesByType = $user->categories->groupBy('type');

        Transaction::factory()
            ->count(30)
            ->forUser($user)
            ->state(fn (array $attributes) => [
                'client_id' => $clients->random()->getKey(),
                'offering_id' => $offerings->random()->getKey(),
                'category_id' => $categoriesByType[$attributes['type']]->random()->getKey(),
            ])
            ->create();
    }
}
