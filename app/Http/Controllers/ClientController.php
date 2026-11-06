<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Models\Client;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    private const PROFILE_EVENTS = 5;

    private const PROFILE_TRANSACTIONS = 10;

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
            ->get(['id', 'name', 'phone', 'email', 'address']);

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'search' => $search,
        ]);
    }

    /**
     * Return the client profile as JSON for the side panel: finance summary,
     * upcoming events and latest transactions. Canceled transactions are ignored in
     * the summary; pending income counts as "to receive" and paid income as received.
     */
    public function show(Request $request, Client $client): JsonResponse
    {
        Gate::authorize('view', $client);

        $summary = $client->transactions()
            ->where('type', 'income')
            ->where('status', '!=', 'canceled')
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as received")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending")
            ->selectRaw('COUNT(*) as services_count')
            ->selectRaw('MAX(happened_on) as last_service_on')
            ->first();

        return response()->json([
            'client' => $client->only(['id', 'name', 'phone', 'email', 'address']),
            'summary' => [
                'received' => number_format((float) $summary->received, 2, '.', ''),
                'pending' => number_format((float) $summary->pending, 2, '.', ''),
                'services_count' => (int) $summary->services_count,
                'last_service_on' => $summary->last_service_on
                    ? CarbonImmutable::parse($summary->last_service_on)->toDateString()
                    : null,
            ],
            'upcoming_events' => $request->user()->events()
                ->with('offering:id,name')
                ->where('client_id', $client->id)
                ->where('status', 'scheduled')
                ->where('date', '>=', CarbonImmutable::now()->toDateString())
                ->orderBy('date')
                ->orderBy('start_time')
                ->limit(self::PROFILE_EVENTS)
                ->get(['id', 'client_id', 'offering_id', 'title', 'date', 'start_time', 'end_time', 'notes', 'status']),
            'transactions' => $client->transactions()
                ->with('category:id,name')
                ->orderByDesc('happened_on')
                ->orderByDesc('id')
                ->limit(self::PROFILE_TRANSACTIONS)
                ->get(['id', 'category_id', 'type', 'status', 'description', 'amount', 'happened_on']),
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
