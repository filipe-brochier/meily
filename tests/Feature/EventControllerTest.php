<?php

use App\Models\Client;
use App\Models\Event;
use App\Models\Offering;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validEventPayload(array $overrides = []): array
{
    return [
        'title' => 'Visita técnica',
        'date' => '2026-05-20',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'notes' => 'Levar o notebook',
        'status' => 'scheduled',
        ...$overrides,
    ];
}

test('guests are redirected to the login page', function () {
    $this->get(route('events.index'))->assertRedirect(route('login'));
    $this->post(route('events.store'))->assertRedirect(route('login'));
});

describe('index', function () {
    beforeEach(function () {
        $this->travelTo('2026-05-20 10:00:00');
    });

    it('lists only the events of the requested month for the authenticated user', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create(['name' => 'Mariana']);
        Event::factory()->forUser($user)->create(['title' => 'Último dia', 'date' => '2026-05-31', 'start_time' => '08:00', 'client_id' => $client->id]);
        Event::factory()->forUser($user)->create(['title' => 'Primeiro dia', 'date' => '2026-05-01', 'start_time' => '15:00']);
        Event::factory()->forUser($user)->create(['title' => 'Primeiro dia cedo', 'date' => '2026-05-01', 'start_time' => '07:00']);
        Event::factory()->forUser($user)->create(['title' => 'Abril', 'date' => '2026-04-30']);
        Event::factory()->forUser($user)->create(['title' => 'Junho', 'date' => '2026-06-01']);
        Event::factory()->create(['title' => 'Alheio', 'date' => '2026-05-10']);

        $this->actingAs($user)
            ->get(route('events.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('events/index')
                ->where('month', '2026-05')
                ->where('today', '2026-05-20')
                ->has('events', 3)
                ->where('events.0.title', 'Primeiro dia cedo')
                ->where('events.1.title', 'Primeiro dia')
                ->where('events.2.title', 'Último dia')
                ->where('events.2.date', '2026-05-31')
                ->where('events.2.client.name', 'Mariana'));
    });

    it('navigates to another month', function () {
        $user = User::factory()->create();
        Event::factory()->forUser($user)->create(['title' => 'Junho', 'date' => '2026-06-15']);

        $this->actingAs($user)
            ->get(route('events.index', ['month' => '2026-06']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('month', '2026-06')
                ->has('events', 1));
    });

    it('falls back to the current month when the month is invalid', function (string $month) {
        $this->actingAs(User::factory()->create())
            ->get(route('events.index', ['month' => $month]))
            ->assertInertia(fn (Assert $page) => $page->where('month', '2026-05'));
    })->with(['garbage' => 'abc', 'month 13' => '2026-13', 'full date' => '2026-05-10']);

    it('provides only the clients and offerings of the user', function () {
        $user = User::factory()->create();
        Client::factory()->forUser($user)->create();
        Client::factory()->create();
        Offering::factory()->forUser($user)->create();
        Offering::factory()->create();

        $this->actingAs($user)
            ->get(route('events.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('clients', 1)
                ->has('offerings', 1));
    });
});

describe('store', function () {
    it('creates an event for the authenticated user', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();
        $offering = Offering::factory()->forUser($user)->create();

        $this->actingAs($user)
            ->from(route('events.index'))
            ->post(route('events.store'), validEventPayload([
                'client_id' => $client->id,
                'offering_id' => $offering->id,
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('events.index'));

        $this->assertDatabaseHas('events', [
            'user_id' => $user->id,
            'client_id' => $client->id,
            'offering_id' => $offering->id,
            'title' => 'Visita técnica',
            'status' => 'scheduled',
        ]);
    });

    it('allows an event without client, offering, end time and notes', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('events.store'), validEventPayload([
                'end_time' => null,
                'notes' => null,
            ]))
            ->assertSessionHasNoErrors();

        expect($user->events()->first())
            ->client_id->toBeNull()
            ->offering_id->toBeNull()
            ->end_time->toBeNull();
    });

    it('requires title, date, start time and status', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('events.store'), [])
            ->assertSessionHasErrors(['title', 'date', 'start_time', 'status']);

        $this->assertDatabaseCount('events', 0);
    });

    it('rejects invalid values', function (array $overrides, string $field) {
        $this->actingAs(User::factory()->create())
            ->post(route('events.store'), validEventPayload($overrides))
            ->assertSessionHasErrors($field);

        $this->assertDatabaseCount('events', 0);
    })->with([
        'bad date' => [['date' => '20/05/2026'], 'date'],
        'bad time' => [['start_time' => '25:00'], 'start_time'],
        'end before start' => [['start_time' => '10:00', 'end_time' => '09:00'], 'end_time'],
        'end equals start' => [['start_time' => '10:00', 'end_time' => '10:00'], 'end_time'],
        'unknown status' => [['status' => 'done'], 'status'],
    ]);

    it('rejects a client or offering of another user', function (string $field, string $model) {
        $user = User::factory()->create();
        $foreign = $model::factory()->create();

        $this->actingAs($user)
            ->post(route('events.store'), validEventPayload([$field => $foreign->id]))
            ->assertSessionHasErrors($field);

        $this->assertDatabaseCount('events', 0);
    })->with([
        'client' => ['client_id', Client::class],
        'offering' => ['offering_id', Offering::class],
    ]);

    it('rejects a deleted client', function () {
        $user = User::factory()->create();
        $client = Client::factory()->forUser($user)->create();
        $client->delete();

        $this->actingAs($user)
            ->post(route('events.store'), validEventPayload(['client_id' => $client->id]))
            ->assertSessionHasErrors('client_id');
    });
});

describe('update', function () {
    it('updates the event', function () {
        $user = User::factory()->create();
        $event = Event::factory()->forUser($user)->create();

        $this->actingAs($user)
            ->put(route('events.update', $event), validEventPayload(['title' => 'Título novo', 'status' => 'completed']))
            ->assertSessionHasNoErrors();

        expect($event->refresh())
            ->title->toBe('Título novo')
            ->status->toBe('completed');
    });

    it('returns 404 for an event that belongs to another user', function () {
        $event = Event::factory()->create(['title' => 'Original']);

        $this->actingAs(User::factory()->create())
            ->put(route('events.update', $event), validEventPayload(['title' => 'Invadido']))
            ->assertNotFound();

        expect($event->refresh()->title)->toBe('Original');
    });
});

describe('destroy', function () {
    it('deletes the event', function () {
        $user = User::factory()->create();
        $event = Event::factory()->forUser($user)->create();

        $this->actingAs($user)
            ->delete(route('events.destroy', $event))
            ->assertSessionHasNoErrors();

        $this->assertModelMissing($event);
    });

    it('returns 404 for an event that belongs to another user', function () {
        $event = Event::factory()->create();

        $this->actingAs(User::factory()->create())
            ->delete(route('events.destroy', $event))
            ->assertNotFound();

        $this->assertModelExists($event);
    });
});
