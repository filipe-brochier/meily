<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EmailVerificationCodeController extends Controller
{
    /**
     * Verify the user's email address with the fixed access code instead of a signed link.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        if (! hash_equals((string) config('auth.verification_code'), $validated['code'])) {
            throw ValidationException::withMessages([
                'code' => __('The verification code is invalid.'),
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
