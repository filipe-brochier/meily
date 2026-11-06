<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

beforeEach(function () {
    Http::fake(['api.pwnedpasswords.com/*' => Http::response('', 200)]);
    $this->app['env'] = 'production';
});

function passwordPasses(string $password): bool
{
    return Validator::make(
        ['password' => $password],
        ['password' => [Password::default()]],
    )->passes();
}

test('production passwords accept 8 characters with mixed case and a number, without symbols', function () {
    expect(passwordPasses('Meily2026'))->toBeTrue();
});

test('production passwords reject weak values', function (string $password) {
    expect(passwordPasses($password))->toBeFalse();
})->with([
    'too short' => 'Ab1cdef',
    'no uppercase' => 'meily2026x',
    'no lowercase' => 'MEILY2026X',
    'no number' => 'MeilyMeily',
]);
