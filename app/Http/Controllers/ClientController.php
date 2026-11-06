<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Models\Client;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * List the user's clients, optionally filtered by name, phone or email.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $term = '%'.addcslashes($search, '\\%_').'%';

        $clients = $request->user()
            ->clients()
            ->when($search !== '', fn (Builder $query) => $query->where(
                fn (Builder $query) => $query
                    ->where('name', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('email', 'like', $term)
            ))
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'email']);

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'search' => $search,
        ]);
    }

    public function store(ClientRequest $request): RedirectResponse
    {
        $request->user()->clients()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Client created.')]);

        return back();
    }

    public function update(ClientRequest $request, Client $client): RedirectResponse
    {
        Gate::authorize('update', $client);

        $client->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Client updated.')]);

        return back();
    }

    public function destroy(Client $client): RedirectResponse
    {
        Gate::authorize('delete', $client);

        $client->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Client deleted.')]);

        return back();
    }
}
