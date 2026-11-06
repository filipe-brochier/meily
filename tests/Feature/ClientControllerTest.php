<?php

use App\Models\Client;
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

describe('store', function () {
    it('creates a client for the authenticated user', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('clients.index'))
            ->post(route('clients.store'), [
                'name' => 'Padaria Tradição',
                'phone' => '(51) 3582-9071',
                'email' => 'contato@padariatradicao.com',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', [
            'user_id' => $user->id,
            'name' => 'Padaria Tradição',
            'phone' => '(51) 3582-9071',
            'email' => 'contato@padariatradicao.com',
        ]);
    });

    it('requires name, phone and email', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('clients.store'), [])
            ->assertSessionHasErrors(['name', 'phone', 'email']);

        $this->assertDatabaseCount('clients', 0);
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
