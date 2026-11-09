<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
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

    /**
     * Update a transaction's status. Used to cancel a transaction (or reverse that),
     * keeping it in the financial history instead of deleting it.
     */
    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        Gate::authorize('update', $transaction);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['paid', 'pending', 'canceled'])],
        ]);

        $transaction->update([
            'status' => $validated['status'],
            'paid_at' => $validated['status'] === 'paid'
                ? ($transaction->paid_at ?? $transaction->happened_on)
                : null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction updated.')]);

        return back();
    }

    /**
     * Soft delete a transaction, removing it from the financial history entirely.
     */
    public function destroy(Transaction $transaction): RedirectResponse
    {
        Gate::authorize('delete', $transaction);

        $transaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction deleted.')]);

        return back();
    }
}
