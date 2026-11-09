<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailVerificationCodeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OfferingController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('email/verify-code', EmailVerificationCodeController::class)
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.code');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('clients', ClientController::class)->only(['index', 'show', 'store', 'update', 'destroy']);

    Route::resource('offerings', OfferingController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('events', EventController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('transactions', TransactionController::class)->only(['index', 'create', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
