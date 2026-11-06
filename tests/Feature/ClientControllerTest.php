<?php

use App\Models\Category;
use App\Models\Client;
use App\Models\Event;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('clients.index'))->assertRedirect(route('login'));
});

describe('index', function () {
    it('lists only the user clients ordered by name', function () {
        $user = User::factory()->create();
        Client::factory()->forUser($user)->create(['name' => 'Zeca']);
        Client::factory()->forUser($user)->create(['name' => 'Ana']);
        Client::factory()->create(['name' => 'Outro usuário']);

        $this->actingAs($user)
            ->get(route('clients.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('clients/index')
                ->has('clients', 2)
                ->where('clients.0.name', 'Ana')
                ->where('clients.1.name', 'Zeca'));
    });

    it('filters clients by name, phone or email', function (string $search) {
        $user = User::factory()->create();
        Client::factory()->forUser($user)->create([
            'name' => 'Mariana da Silva',
            'phone' => '(51) 99982-1450',
            'email' => 'mariana@email.com',
        ]);
        Client::factory()->forUser($user)->create([
            'name' => 'Lucas Ferreira',
            'phone' => '(51) 99114-8032',
            'email' => 'lucas@email.com',
        ]);

        $this->actingAs($user)
            ->get(route('clients.index', ['search' => $search]))
            ->assertInertia(fn (Assert $page) => $page
                ->has('clients', 1)
                ->where('clients.0.name', 'Mariana da Silva')
                ->where('search', $search));
    })->with(['name' => 'mariana', 'phone' => '1450', 'email' => 'mariana@']);

    it('treats wildcard characters in the search literally', function () {
        $user = User::factory()->create();
        Client::factory()->forUser($user)->create(['name' => 'Ana']);

        $this->actingAs($user)
            ->get(route('clients.index', ['search' => '%']))
            ->assertInertia(fn (Assert $page) => $page->has('clients', 0));
    });
});

describe('show', function () {
    function clientTransaction(User $user, Client $client, string $type, string $status, string $amount, string $date): Transaction
    {
        return Transaction::factory()->forUser($user)->create([
            'client_id' => $client->id,
            'category_id' => Category::factory()->forUser($user)->create(['type' => $type])->id,
            'offering_id' => null,
            'type' => $type,
            'status' => $status,
            'amount' => $amount,
            'happened_on' => $date,
        ]);
    }

    beforeEach(function () {
        $this->travelTo('2026-05-20 10:00:00');
    });

    it('requires authentication', function () {
        $client = Client::factory()->forUser(User::factory()->create())->create();

        $this->getJson(route('clients.show', $client))->assertUnauthorized();
    });

    it('summarizes the income of the client, ignoring canceled and expense entries', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();
        clientTransaction($user, $client, 'income', 'paid', '100.00', '2026-05-01');
        clientTransaction($user, $client, 'income', 'paid', '50.50', '2026-05-10');
        clientTransaction($user, $client, 'income', 'pending', '80.00', '2026-05-18');
        clientTransaction($user, $client, 'income', 'canceled', '999.00', '2026-05-19');
        clientTransaction($user, $client, 'expense', 'paid', '30.00', '2026-05-12');
        clientTransaction($user, Client::factory()->forUser($user)->create(), 'income', 'paid', '700.00', '2026-05-12');

        $this->actingAs($user)
            ->getJson(route('clients.show', $client))
            ->assertOk()
            ->assertJsonPath('client.id', $client->id)
            ->assertJsonPath('summary.received', '150.50')
            ->assertJsonPath('summary.pending', '80.00')
            ->assertJsonPath('summary.services_count', 3)
            ->assertJsonPath('summary.last_service_on', '2026-05-18')
            ->assertJsonCount(5, 'transactions');
    });

    it('returns an empty profile for a client without activity', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();

        $this->actingAs($user)
            ->getJson(route('clients.show', $client))
            ->assertOk()
            ->assertJsonPath('summary.received', '0.00')
            ->assertJsonPath('summary.services_count', 0)
            ->assertJsonPath('summary.last_service_on', null)
            ->assertJsonCount(0, 'upcoming_events')
            ->assertJsonCount(0, 'transactions');
    });

    it('limits and orders the latest transactions, newest first', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();

        foreach (range(1, 12) as $day) {
            clientTransaction($user, $client, 'income', 'paid', '10.00', sprintf('2026-05-%02d', $day));
        }

        $this->actingAs($user)
            ->getJson(route('clients.show', $client))
            ->assertJsonCount(10, 'transactions')
            ->assertJsonPath('transactions.0.happened_on', fn (string $date) => str_starts_with($date, '2026-05-12'));
    });

    it('lists only scheduled upcoming events of the client, soonest first', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();
        $event = fn (string $title, string $date, string $status = 'scheduled', ?Client $for = null) => Event::factory()
            ->forUser($user)
            ->create(['client_id' => ($for ?? $client)->id, 'title' => $title, 'date' => $date, 'status' => $status]);

        $event('Later', '2026-05-25');
        $event('Soon', '2026-05-21');
        $event('Past', '2026-05-19');
        $event('Done', '2026-05-22', 'completed');
        $event('Other client', '2026-05-22', 'scheduled', Client::factory()->forUser($user)->create());

        $this->actingAs($user)
            ->getJson(route('clients.show', $client))
            ->assertJsonCount(2, 'upcoming_events')
            ->assertJsonPath('upcoming_events.0.title', 'Soon')
            ->assertJsonPath('upcoming_events.1.title', 'Later');
    });

    it('returns 404 for a client that belongs to another user', function () {
        $client = Client::factory()->forUser(User::factory()->create())->create();

        $this->actingAs(User::factory()->create())
            ->getJson(route('clients.show', $client))
            ->assertNotFound();
    });

    it('returns 404 for a deleted client', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();
        $client->delete();

        $this->actingAs($user)
            ->getJson(route('clients.show', $client))
            ->assertNotFound();
    });
});

describe('store', function () {
    it('creates a client for the authenticated user', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('clients.index'))
            ->post(route('clients.store'), [
                'name' => 'Padaria Tradição',
                'phone' => '(51) 3582-9071',
                'email' => 'contato@padariatradicao.com',
                'address' => 'Rua das Flores, 120, Centro',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', [
            'user_id' => $user->id,
            'name' => 'Padaria Tradição',
            'phone' => '(51) 3582-9071',
            'email' => 'contato@padariatradicao.com',
            'address' => 'Rua das Flores, 120, Centro',
        ]);
    });

    it('requires only the name', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('clients.store'), [])
            ->assertSessionHasErrors('name')
            ->assertSessionDoesntHaveErrors(['phone', 'email', 'address']);

        $this->assertDatabaseCount('clients', 0);
    });

    it('creates a client with only the name', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('clients.store'), ['name' => 'Cliente Avulso', 'phone' => '', 'email' => '', 'address' => ''])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('clients', [
            'user_id' => $user->id,
            'name' => 'Cliente Avulso',
            'phone' => null,
            'email' => null,
            'address' => null,
        ]);
    });

    it('rejects an invalid email', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('clients.store'), [
                'name' => 'Lucas Ferreira',
                'phone' => '(51) 99114-8032',
                'email' => 'not-an-email',
            ])
            ->assertSessionHasErrors('email');

        $this->assertDatabaseCount('clients', 0);
    });
});

describe('update', function () {
    it('updates the client', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();

        $this->actingAs($user)
            ->put(route('clients.update', $client), [
                'name' => 'Nome novo',
                'phone' => '(51) 3066-1240',
                'email' => 'novo@email.com',
            ])
            ->assertSessionHasNoErrors();

        expect($client->refresh())
            ->name->toBe('Nome novo')
            ->phone->toBe('(51) 3066-1240')
            ->email->toBe('novo@email.com');
    });

    it('returns 404 for a client that belongs to another user', function () {
        $client = Client::factory()->create(['name' => 'Original']);

        $this->actingAs(User::factory()->create())
            ->put(route('clients.update', $client), [
                'name' => 'Invadido',
                'phone' => '(51) 90000-0000',
                'email' => 'invasor@email.com',
            ])
            ->assertNotFound();

        expect($client->refresh()->name)->toBe('Original');
    });

    it('rejects an empty name', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();

        $this->actingAs($user)
            ->put(route('clients.update', $client), [
                'name' => '',
                'phone' => $client->phone,
                'email' => $client->email,
            ])
            ->assertSessionHasErrors('name');
    });
});

describe('destroy', function () {
    it('soft deletes the client', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();

        $this->actingAs($user)
            ->delete(route('clients.destroy', $client))
            ->assertSessionHasNoErrors();

        $this->assertSoftDeleted($client);
    });

    it('returns 404 for a client that belongs to another user', function () {
        $client = Client::factory()->create();

        $this->actingAs(User::factory()->create())
            ->delete(route('clients.destroy', $client))
            ->assertNotFound();

        $this->assertNotSoftDeleted($client);
    });
});
