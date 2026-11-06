<?php

use App\Models\Category;
use App\Models\Offering;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validOfferingPayload(User $user, array $overrides = []): array
{
    return [
        'category_id' => Category::factory()->forUser($user)->create(['type' => 'income'])->id,
        'name' => 'Manutenção de computador',
        'description' => 'Limpeza, otimização e atualização',
        'price' => '180.00',
        'active' => true,
        ...$overrides,
    ];
}

test('guests are redirected to the login page', function () {
    $this->get(route('offerings.index'))->assertRedirect(route('login'));
});

describe('index', function () {
    it('lists only the user offerings ordered by name with their category', function () {
        $user = User::factory()->create();
        $category = Category::factory()->forUser($user)->create(['type' => 'income', 'name' => 'Serviço']);
        Offering::factory()->forUser($user)->create(['name' => 'Zeta', 'category_id' => $category->id]);
        Offering::factory()->forUser($user)->create(['name' => 'Alfa', 'category_id' => $category->id]);
        Offering::factory()->create(['name' => 'Outro usuário']);

        $this->actingAs($user)
            ->get(route('offerings.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('offerings/index')
                ->has('offerings', 2)
                ->where('offerings.0.name', 'Alfa')
                ->where('offerings.0.category.name', 'Serviço')
                ->where('offerings.1.name', 'Zeta'));
    });

    it('offers only the income categories of the user', function () {
        $user = User::factory()->create();
        $income = Category::factory()->forUser($user)->create(['type' => 'income', 'name' => 'Consultoria']);
        Category::factory()->forUser($user)->create(['type' => 'expense', 'name' => 'Transporte']);
        Category::factory()->create(['type' => 'income', 'name' => 'De outro usuário']);

        $this->actingAs($user)
            ->get(route('offerings.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('categories', 1)
                ->where('categories.0.id', $income->id));
    });

    it('filters offerings by name or description', function (string $search) {
        $user = User::factory()->create();
        Offering::factory()->forUser($user)->create(['name' => 'Instalação de rede', 'description' => 'Rede residencial']);
        Offering::factory()->forUser($user)->create(['name' => 'Suporte técnico', 'description' => 'Atendimento remoto']);

        $this->actingAs($user)
            ->get(route('offerings.index', ['search' => $search]))
            ->assertInertia(fn (Assert $page) => $page
                ->has('offerings', 1)
                ->where('offerings.0.name', 'Instalação de rede')
                ->where('search', $search));
    })->with(['name' => 'instalação', 'description' => 'residencial']);

    it('treats wildcard characters in the search literally', function () {
        $user = User::factory()->create();
        Offering::factory()->forUser($user)->create(['name' => 'Suporte']);

        $this->actingAs($user)
            ->get(route('offerings.index', ['search' => '%']))
            ->assertInertia(fn (Assert $page) => $page->has('offerings', 0));
    });
});

describe('store', function () {
    it('creates an offering for the authenticated user', function () {
        $user = User::factory()->create();
        $payload = validOfferingPayload($user);

        $this->actingAs($user)
            ->from(route('offerings.index'))
            ->post(route('offerings.store'), $payload)
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('offerings.index'));

        $this->assertDatabaseHas('offerings', [
            'user_id' => $user->id,
            'category_id' => $payload['category_id'],
            'name' => 'Manutenção de computador',
            'price' => '180.00',
            'active' => true,
        ]);
    });

    it('allows an empty description', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('offerings.store'), validOfferingPayload($user, ['description' => null]))
            ->assertSessionHasNoErrors();

        expect($user->offerings()->first()->description)->toBeNull();
    });

    it('requires category, name, price and active', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('offerings.store'), [])
            ->assertSessionHasErrors(['category_id', 'name', 'price', 'active']);

        $this->assertDatabaseCount('offerings', 0);
    });

    it('rejects a negative price and extra decimal places', function (array $overrides) {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('offerings.store'), validOfferingPayload($user, $overrides))
            ->assertSessionHasErrors('price');

        $this->assertDatabaseCount('offerings', 0);
    })->with([
        'negative price' => [['price' => '-1']],
        'too many decimals' => [['price' => '10.999']],
    ]);

    it('rejects an expense category', function () {
        $user = User::factory()->create();
        $expense = Category::factory()->forUser($user)->create(['type' => 'expense']);

        $this->actingAs($user)
            ->post(route('offerings.store'), validOfferingPayload($user, ['category_id' => $expense->id]))
            ->assertSessionHasErrors('category_id');

        $this->assertDatabaseCount('offerings', 0);
    });

    it('rejects a category that belongs to another user', function () {
        $user = User::factory()->create();
        $foreign = Category::factory()->create(['type' => 'income']);

        $this->actingAs($user)
            ->post(route('offerings.store'), validOfferingPayload($user, ['category_id' => $foreign->id]))
            ->assertSessionHasErrors('category_id');

        $this->assertDatabaseCount('offerings', 0);
    });
});

describe('update', function () {
    it('updates the offering', function () {
        $user = User::factory()->create();
        $offering = Offering::factory()->forUser($user)->create();
        $payload = validOfferingPayload($user, ['name' => 'Nome novo', 'active' => false]);

        $this->actingAs($user)
            ->put(route('offerings.update', $offering), $payload)
            ->assertSessionHasNoErrors();

        expect($offering->refresh())
            ->name->toBe('Nome novo')
            ->category_id->toBe($payload['category_id'])
            ->active->toBeFalse();
    });

    it('returns 404 for an offering that belongs to another user', function () {
        $user = User::factory()->create();
        $offering = Offering::factory()->create(['name' => 'Original']);

        $this->actingAs($user)
            ->put(route('offerings.update', $offering), validOfferingPayload($user, ['name' => 'Invadido']))
            ->assertNotFound();

        expect($offering->refresh()->name)->toBe('Original');
    });
});

describe('destroy', function () {
    it('soft deletes the offering', function () {
        $user = User::factory()->create();
        $offering = Offering::factory()->forUser($user)->create();

        $this->actingAs($user)
            ->delete(route('offerings.destroy', $offering))
            ->assertSessionHasNoErrors();

        $this->assertSoftDeleted($offering);
    });

    it('returns 404 for an offering that belongs to another user', function () {
        $offering = Offering::factory()->create();

        $this->actingAs(User::factory()->create())
            ->delete(route('offerings.destroy', $offering))
            ->assertNotFound();

        $this->assertNotSoftDeleted($offering);
    });
});
