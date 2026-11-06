<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function dashboardTransaction(User $user, string $type, string $date, string $amount, string $status = 'paid'): Transaction
{
    return Transaction::factory()->forUser($user)->create([
        'type' => $type,
        'category_id' => Category::factory()->forUser($user)->create(['type' => $type])->id,
        'client_id' => null,
        'offering_id' => null,
        'status' => $status,
        'amount' => $amount,
        'happened_on' => $date,
    ]);
}

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

describe('summary', function () {
    beforeEach(function () {
        $this->travelTo('2026-05-20 10:00:00');
    });

    it('sums the current month, ignoring canceled and other users transactions', function () {
        $user = User::factory()->create();
        dashboardTransaction($user, 'income', '2026-05-02', '1000.00');
        dashboardTransaction($user, 'income', '2026-05-10', '200.50', 'pending');
        dashboardTransaction($user, 'income', '2026-05-11', '999.00', 'canceled');
        dashboardTransaction($user, 'expense', '2026-05-15', '300.25');
        dashboardTransaction($user, 'income', '2026-04-30', '777.00');
        dashboardTransaction(User::factory()->create(), 'income', '2026-05-05', '5000.00');

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('month', '2026-05')
                ->where('summary.income', '1200.50')
                ->where('summary.expense', '300.25')
                ->where('summary.balance', '900.25'));
    });

    it('returns the last six months of cash flow, oldest first', function () {
        $user = User::factory()->create();
        dashboardTransaction($user, 'income', '2025-12-01', '100.00');
        dashboardTransaction($user, 'expense', '2026-01-31', '40.00');
        dashboardTransaction($user, 'income', '2026-05-31', '60.00');
        dashboardTransaction($user, 'income', '2025-11-30', '999.00');
        dashboardTransaction($user, 'income', '2026-06-01', '999.00');

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('flow', 6)
                ->where('flow.0', ['month' => '2025-12', 'income' => '100.00', 'expense' => '0.00'])
                ->where('flow.1', ['month' => '2026-01', 'income' => '0.00', 'expense' => '40.00'])
                ->where('flow.5', ['month' => '2026-05', 'income' => '60.00', 'expense' => '0.00']));
    });

    it('shows zeros when there are no transactions', function () {
        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.balance', '0.00')
                ->has('flow', 6)
                ->has('recentTransactions', 0));
    });

    it('lists the five latest transactions of the user', function () {
        $user = User::factory()->create();

        foreach (range(1, 6) as $day) {
            dashboardTransaction($user, 'income', sprintf('2026-05-%02d', $day), '10.00');
        }

        dashboardTransaction(User::factory()->create(), 'income', '2026-05-19', '10.00');

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('recentTransactions', 5)
                ->where('recentTransactions.0.happened_on', fn (string $date) => str_starts_with($date, '2026-05-06'))
                ->where('recentTransactions.0.category.name', fn (string $name) => $name !== ''));
    });
});
