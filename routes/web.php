<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\OfferingController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('clients', ClientController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('offerings', OfferingController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('transactions', TransactionController::class)->only(['create', 'store']);
});

require __DIR__.'/settings.php';
