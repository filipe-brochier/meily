<?php

namespace App\Http\Controllers;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const FLOW_MONTHS = 6;

    private const RECENT_TRANSACTIONS = 5;

    private const UPCOMING_EVENTS = 4;

    /**
     * Show the current month summary, the last months cash flow and the latest transactions.
     * Canceled transactions are ignored; pending ones count, as in the financial history.
     * Upcoming events are the scheduled ones from today onwards.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $currentMonth = CarbonImmutable::now()->startOfMonth();
        $months = collect(range(self::FLOW_MONTHS - 1, 0))
            ->map(fn (int $monthsAgo) => $currentMonth->subMonths($monthsAgo));

        $columns = [];
        $bindings = [];

        foreach ($months as $index => $start) {
            foreach (['income', 'expense'] as $type) {
                $columns[] = "COALESCE(SUM(CASE WHEN type = ? AND happened_on >= ? AND happened_on < ? THEN amount ELSE 0 END), 0) as {$type}_{$index}";
                array_push($bindings, $type, $start->toDateString(), $start->addMonth()->toDateString());
            }
        }

        $totals = $user->transactions()
            ->where('status', '!=', 'canceled')
            ->where('happened_on', '>=', $months->first()->toDateString())
            ->where('happened_on', '<', $currentMonth->addMonth()->toDateString())
            ->selectRaw(implode(', ', $columns), $bindings)
            ->first();

        $flow = $months->map(fn (CarbonImmutable $start, int $index) => [
            'month' => $start->format('Y-m'),
            'income' => $this->money($totals->{"income_{$index}"}),
            'expense' => $this->money($totals->{"expense_{$index}"}),
        ])->values();

        $current = $flow->last();

        return Inertia::render('dashboard', [
            'month' => $current['month'],
            'summary' => [
                'income' => $current['income'],
                'expense' => $current['expense'],
                'balance' => $this->money($current['income'] - $current['expense']),
            ],
            'flow' => $flow,
            'recentTransactions' => $user->transactions()
                ->with('category:id,name')
                ->orderByDesc('happened_on')
                ->orderByDesc('id')
                ->limit(self::RECENT_TRANSACTIONS)
                ->get(['id', 'category_id', 'type', 'status', 'description', 'amount', 'happened_on']),
            'upcomingEvents' => $user->events()
                ->with(['client:id,name', 'offering:id,name'])
                ->where('status', 'scheduled')
                ->where('date', '>=', CarbonImmutable::now()->toDateString())
                ->orderBy('date')
                ->orderBy('start_time')
                ->limit(self::UPCOMING_EVENTS)
                ->get(),
        ]);
    }

    private function money(float|int|string|null $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
