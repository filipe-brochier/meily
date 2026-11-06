<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Show the form to record a new income or expense.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('transactions/create', [
            'categories' => $user->categories()
                ->orderBy('name')
                ->get(['id', 'type', 'name']),
            'clients' => $user->clients()
                ->orderBy('name')
                ->get(['id', 'name']),
            'offerings' => $user->offerings()
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'category_id', 'name', 'price']),
            'today' => now()->toDateString(),
        ]);
    }

    public function store(TransactionRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $request->user()->transactions()->create([
            ...$data,
            'paid_at' => $data['status'] === 'paid' ? $data['happened_on'] : null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction saved.')]);

        return to_route('transactions.create');
    }
}
