<?php

use App\Http\Controllers\ClientController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('clients', ClientController::class)->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
