<?php

namespace Database\Factories;

use App\Models\Category;
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
            'category_id' => fn (array $attributes) => Category::factory()->state([
                'user_id' => $attributes['user_id'],
                'type' => 'income',
            ]),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'price' => fake()->randomFloat(2, 0, 99999999),
            'active' => fake()->boolean(),
        ];
    }

    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->getKey(),
        ]);
    }
}
