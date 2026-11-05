<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Client;
use App\Models\Offering;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'client_id' => Client::factory(),
            'offering_id' => Offering::factory(),
            'category_id' => Category::factory(),
            'type' => fake()->randomElement(['income', 'expense']),
            'status' => fake()->randomElement(['paid', 'pending', 'canceled']),
            'description' => fake()->sentence(),
            'amount' => fake()->randomFloat(2, 0, 99999999),
            'quantity' => fake()->optional()->randomFloat(2, 0, 99999999),
            'happened_on' => fake()->date(),
            'due_date' => fake()->optional()->date(),
            'paid_at' => fake()->optional()->date(),
        ];
    }
}
