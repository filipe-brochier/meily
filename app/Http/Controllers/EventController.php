<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventRequest;
use App\Models\Event;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Show the calendar of the requested month (defaults to the current one).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $month = $this->requestedMonth($request);

        return Inertia::render('events/index', [
            'month' => $month->format('Y-m'),
            'events' => $user->events()
                ->with(['client:id,name', 'offering:id,name'])
                ->where('date', '>=', $month->toDateString())
                ->where('date', '<', $month->addMonth()->toDateString())
                ->orderBy('date')
                ->orderBy('start_time')
                ->get(['id', 'client_id', 'offering_id', 'title', 'date', 'start_time', 'end_time', 'notes', 'status']),
            'clients' => $user->clients()->orderBy('name')->get(['id', 'name']),
            'offerings' => $user->offerings()->orderBy('name')->get(['id', 'name']),
            'today' => now()->toDateString(),
        ]);
    }

    public function store(EventRequest $request): RedirectResponse
    {
        $request->user()->events()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Event created.')]);

        return back();
    }

    public function update(EventRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('update', $event);

        $event->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Event updated.')]);

        return back();
    }

    public function destroy(Event $event): RedirectResponse
    {
        Gate::authorize('delete', $event);

        $event->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Event deleted.')]);

        return back();
    }

    private function requestedMonth(Request $request): CarbonImmutable
    {
        $month = (string) $request->query('month', '');

        if (preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month) === 1) {
            return CarbonImmutable::createFromFormat('!Y-m', $month);
        }

        return CarbonImmutable::now()->startOfMonth();
    }
}
