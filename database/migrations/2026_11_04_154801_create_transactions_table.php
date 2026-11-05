<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('offering_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();

            $table->enum('type', ['income', 'expense']);
            $table->enum('status', ['paid', 'pending', 'canceled'])->default('paid');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->decimal('quantity', 10, 2)->nullable();
            $table->date('happened_on');
            $table->date('due_date')->nullable();
            $table->date('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type', 'happened_on']);
            $table->index(['user_id', 'status', 'due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
