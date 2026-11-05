<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * @var array<string, list<string>>
     */
    private const DEFAULT_CATEGORIES = [
        'income' => ['Serviço', 'Produto', 'Consultoria'],
        'expense' => ['Transporte', 'Contas', 'Outros'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', UserSeeder::TEST_USER_EMAIL)->firstOrFail();

        foreach (self::DEFAULT_CATEGORIES as $type => $names) {
            foreach ($names as $name) {
                $user->categories()->firstOrCreate(['type' => $type, 'name' => $name]);
            }
        }
    }
}
