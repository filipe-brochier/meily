<?php

namespace Database\Factories;

use App\Models\Offering;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Offering>
 */
class OfferingFactory extends Factory
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
            'type' => fake()->randomElement(['product', 'service']),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'price' => fake()->randomFloat(2, 0, 99999999),
            'active' => fake()->boolean(),
        ];
    }
}
