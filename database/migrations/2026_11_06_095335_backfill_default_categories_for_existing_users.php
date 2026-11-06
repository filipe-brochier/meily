<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        User::query()->withTrashed()->each(fn (User $user) => $user->createDefaultCategories());
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
