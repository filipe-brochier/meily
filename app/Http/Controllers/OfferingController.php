<?php

namespace App\Http\Controllers;

use App\Http\Requests\OfferingRequest;
use App\Models\Offering;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OfferingController extends Controller
{
    /**
     * List the user's products and services, optionally filtered by name or description.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = trim((string) $request->query('search', ''));
        $term = '%'.addcslashes($search, '\\%_').'%';

        $offerings = $user
            ->offerings()
            ->with('category:id,name')
            ->when($search !== '', fn (Builder $query) => $query->where(
                fn (Builder $query) => $query
                    ->where('name', 'like', $term)
                    ->orWhere('description', 'like', $term)
            ))
            ->orderBy('name')
            ->get(['id', 'category_id', 'name', 'description', 'price', 'active']);

        return Inertia::render('offerings/index', [
            'offerings' => $offerings,
            'categories' => $user->categories()
                ->where('type', 'income')
                ->orderBy('name')
                ->get(['id', 'name']),
            'search' => $search,
        ]);
    }

    public function store(OfferingRequest $request): RedirectResponse
    {
        $request->user()->offerings()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Offering created.')]);

        return back();
    }

    public function update(OfferingRequest $request, Offering $offering): RedirectResponse
    {
        Gate::authorize('update', $offering);

        $offering->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Offering updated.')]);

        return back();
    }

    public function destroy(Offering $offering): RedirectResponse
    {
        Gate::authorize('delete', $offering);

        $offering->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Offering deleted.')]);

        return back();
    }
}
