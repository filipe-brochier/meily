<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;

test('the default verification code verifies the user', function () {
    Event::fake([Verified::class]);
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.code'), ['code' => '2026'])
        ->assertRedirect(route('dashboard', absolute: false));

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    Event::assertDispatched(Verified::class);
});

test('the verification code can be configured', function () {
    config(['auth.verification_code' => '1234']);
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->post(route('verification.code'), ['code' => '2026'])
        ->assertSessionHasErrors('code');
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();

    $this->actingAs($user)->post(route('verification.code'), ['code' => '1234']);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('a wrong code does not verify the user', function (string $code) {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.code'), ['code' => $code])
        ->assertSessionHasErrors('code');

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
})->with(['wrong' => '0000', 'empty' => '']);

test('guests cannot submit a verification code', function () {
    $this->post(route('verification.code'), ['code' => '2026'])
        ->assertRedirect(route('login'));
});

test('an already verified user is redirected without firing the event', function () {
    Event::fake([Verified::class]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('verification.code'), ['code' => '0000'])
        ->assertRedirect(route('dashboard', absolute: false));

    Event::assertNotDispatched(Verified::class);
});

test('the code attempts are rate limited', function () {
    $user = User::factory()->unverified()->create();

    foreach (range(1, 6) as $attempt) {
        $this->actingAs($user)->post(route('verification.code'), ['code' => '0000']);
    }

    $this->actingAs($user)
        ->post(route('verification.code'), ['code' => '2026'])
        ->assertTooManyRequests();

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});
