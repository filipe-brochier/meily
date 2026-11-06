<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * List the user's transactions, filtered by type and by description or category name.
     * The balance covers every filtered transaction (not only the current page), ignoring canceled ones.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = trim((string) $request->query('search', ''));
        $type = in_array($request->query('type'), ['income', 'expense'], true)
            ? $request->query('type')
            : null;
        $term = '%'.addcslashes($search, '\\%_').'%';

        $filtered = $user
            ->transactions()
            ->when($type, fn (Builder $query) => $query->where('type', $type))
            ->when($search !== '', fn (Builder $query) => $query->where(
                fn (Builder $query) => $query
                    ->where('description', 'like', $term)
                    ->orWhereHas('category', fn (Builder $query) => $query->where('name', 'like', $term))
            ));

        $totals = (clone $filtered)
            ->where('status', '!=', 'canceled')
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance")
            ->value('balance');

        $transactions = $filtered
            ->with('category:id,name')
            ->orderByDesc('happened_on')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE, ['id', 'category_id', 'type', 'status', 'description', 'amount', 'happened_on'])
            ->withQueryString();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'balance' => number_format((float) $totals, 2, '.', ''),
            'search' => $search,
            'type' => $type,
        ]);
    }

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
            'initialType' => $request->query('type') === 'expense' ? 'expense' : 'income',
            'initialClientId' => $user->clients()->whereKey($request->integer('client_id'))->value('id'),
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
