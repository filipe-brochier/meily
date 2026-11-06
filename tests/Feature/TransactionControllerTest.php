<?php

use App\Models\Category;
use App\Models\Client;
use App\Models\Offering;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validTransactionPayload(User $user, array $overrides = []): array
{
    return [
        'type' => 'income',
        'category_id' => Category::factory()->forUser($user)->create(['type' => 'income'])->id,
        'amount' => '180.00',
        'happened_on' => '2026-05-20',
        'status' => 'paid',
        'description' => 'Manutenção de computador',
        ...$overrides,
    ];
}

test('guests are redirected to the login page', function () {
    $this->get(route('transactions.create'))->assertRedirect(route('login'));
    $this->post(route('transactions.store'))->assertRedirect(route('login'));
});

describe('create', function () {
    it('provides only the data of the authenticated user', function () {
        $user = User::factory()->create();
        $income = Category::factory()->forUser($user)->create(['type' => 'income']);
        Category::factory()->forUser($user)->create(['type' => 'expense']);
        Category::factory()->create();
        Client::factory()->forUser($user)->create();
        Client::factory()->create();
        Offering::factory()->forUser($user)->create(['active' => true, 'category_id' => $income->id]);
        Offering::factory()->forUser($user)->create(['active' => false, 'category_id' => $income->id]);
        Offering::factory()->create(['active' => true]);

        $this->actingAs($user)
            ->get(route('transactions.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('transactions/create')
                ->has('categories', 2)
                ->has('clients', 1)
                ->has('offerings', 1)
                ->where('today', now()->toDateString()));
    });
});

describe('store', function () {
    it('records an income with client and offering', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();
        $payload = validTransactionPayload($user, ['client_id' => $client->id]);
        $offering = Offering::factory()->forUser($user)->create([
            'active' => true,
            'category_id' => $payload['category_id'],
        ]);
        $payload['offering_id'] = $offering->id;

        $this->actingAs($user)
            ->post(route('transactions.store'), $payload)
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('transactions.create'));

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'income',
            'category_id' => $payload['category_id'],
            'client_id' => $client->id,
            'offering_id' => $offering->id,
            'amount' => '180.00',
            'status' => 'paid',
            'description' => 'Manutenção de computador',
        ]);
    });

    it('records an expense without client or offering', function () {
        $user = User::factory()->create();
        $category = Category::factory()->forUser($user)->create(['type' => 'expense']);

        $this->actingAs($user)
            ->post(route('transactions.store'), validTransactionPayload($user, [
                'type' => 'expense',
                'category_id' => $category->id,
                'client_id' => null,
                'offering_id' => null,
            ]))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'expense',
            'client_id' => null,
            'offering_id' => null,
        ]);
    });

    it('sets the payment date only for paid transactions', function (string $status, ?string $paidAt) {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('transactions.store'), validTransactionPayload($user, ['status' => $status]))
            ->assertSessionHasNoErrors();

        expect($user->transactions()->first()->paid_at?->toDateString())->toBe($paidAt);
    })->with([
        'paid' => ['paid', '2026-05-20'],
        'pending' => ['pending', null],
    ]);

    it('requires type, category, amount, date, status and description', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('transactions.store'), [])
            ->assertSessionHasErrors(['type', 'category_id', 'amount', 'happened_on', 'status', 'description']);

        $this->assertDatabaseCount('transactions', 0);
    });

    it('rejects invalid values', function (array $overrides, string $field) {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('transactions.store'), validTransactionPayload($user, $overrides))
            ->assertSessionHasErrors($field);

        $this->assertDatabaseCount('transactions', 0);
    })->with([
        'zero amount' => [['amount' => '0'], 'amount'],
        'too many decimals' => [['amount' => '10.999'], 'amount'],
        'invalid type' => [['type' => 'other'], 'type'],
        'canceled status' => [['status' => 'canceled'], 'status'],
        'malformed date' => [['happened_on' => '20/05/2026'], 'happened_on'],
    ]);

    it('rejects a category that does not match the type', function () {
        $user = User::factory()->create();
        $expense = Category::factory()->forUser($user)->create(['type' => 'expense']);

        $this->actingAs($user)
            ->post(route('transactions.store'), validTransactionPayload($user, ['category_id' => $expense->id]))
            ->assertSessionHasErrors('category_id');
    });

    it('rejects records that belong to another user', function (string $field) {
        $user = User::factory()->create();
        $foreignId = match ($field) {
            'category_id' => Category::factory()->create(['type' => 'income'])->id,
            'client_id' => Client::factory()->create()->id,
            'offering_id' => Offering::factory()->create(['active' => true])->id,
        };

        $this->actingAs($user)
            ->post(route('transactions.store'), validTransactionPayload($user, [$field => $foreignId]))
            ->assertSessionHasErrors($field);

        $this->assertDatabaseCount('transactions', 0);
    })->with(['category_id', 'client_id', 'offering_id']);

    it('rejects an offering that belongs to a different category', function () {
        $user = User::factory()->create();
        $other = Category::factory()->forUser($user)->create(['type' => 'income', 'name' => 'Outra categoria']);
        $offering = Offering::factory()->forUser($user)->create(['active' => true, 'category_id' => $other->id]);

        $this->actingAs($user)
            ->post(route('transactions.store'), validTransactionPayload($user, ['offering_id' => $offering->id]))
            ->assertSessionHasErrors('offering_id');

        $this->assertDatabaseCount('transactions', 0);
    });

    it('rejects an inactive or deleted offering and a deleted client', function () {
        $user = User::factory()->create();
        $inactive = Offering::factory()->forUser($user)->create(['active' => false]);
        $client = Client::factory()->forUser($user)->create();
        $client->delete();

        $this->actingAs($user)
            ->post(route('transactions.store'), validTransactionPayload($user, [
                'offering_id' => $inactive->id,
                'client_id' => $client->id,
            ]))
            ->assertSessionHasErrors(['offering_id', 'client_id']);
    });

    it('does not accept client or offering on an expense', function () {
        $user = User::factory()->create();
        $category = Category::factory()->forUser($user)->create(['type' => 'expense']);
        $client = Client::factory()->forUser($user)->create();
        $offering = Offering::factory()->forUser($user)->create(['active' => true]);

        $this->actingAs($user)
            ->post(route('transactions.store'), validTransactionPayload($user, [
                'type' => 'expense',
                'category_id' => $category->id,
                'client_id' => $client->id,
                'offering_id' => $offering->id,
            ]))
            ->assertSessionHasErrors(['client_id', 'offering_id']);
    });
});
