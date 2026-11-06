import { Head, router } from '@inertiajs/react';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import OfferingController from '@/actions/App/Http/Controllers/OfferingController';
import DeleteOfferingDialog from '@/components/delete-offering-dialog';
import OfferingFormDialog from '@/components/offering-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category, Offering } from '@/types';

const SEARCH_DEBOUNCE_MS = 300;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export default function OfferingsIndex({
    offerings,
    categories,
    search,
}: {
    offerings: Offering[];
    categories: Category[];
    search: string;
}) {
    const [query, setQuery] = useState(search);
    const [formOpen, setFormOpen] = useState(false);
    const [editingOffering, setEditingOffering] = useState<Offering | null>(
        null,
    );
    const [deletingOffering, setDeletingOffering] = useState<Offering | null>(
        null,
    );
    const lastSearch = useRef(search);

    useEffect(() => {
        const trimmed = query.trim();

        if (trimmed === lastSearch.current) {
            return;
        }

        const timeout = setTimeout(() => {
            lastSearch.current = trimmed;

            router.get(
                OfferingController.index.url(),
                trimmed ? { search: trimmed } : {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['offerings', 'search'],
                },
            );
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [query]);

    function openCreate() {
        setEditingOffering(null);
        setFormOpen(true);
    }

    function openEdit(offering: Offering) {
        setEditingOffering(offering);
        setFormOpen(true);
    }

    return (
        <>
            <Head title="Produtos e serviços" />

            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
                <header className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Produtos e serviços
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Organize tudo o que você oferece
                    </p>
                </header>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar produto ou serviço"
                            aria-label="Buscar produtos e serviços"
                            className="h-10 rounded-xl bg-card pl-9"
                        />
                    </div>

                    <Button
                        onClick={openCreate}
                        className="h-10 rounded-lg px-5"
                        data-test="new-offering-button"
                    >
                        <Plus />
                        Novo item
                    </Button>
                </div>

                {offerings.length === 0 ? (
                    <p className="rounded-xl border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
                        {search
                            ? 'Nenhum item corresponde à busca.'
                            : 'Você ainda não cadastrou nenhum produto ou serviço.'}
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {offerings.map((offering) => {
                            const dimmed = offering.active ? '' : 'opacity-60';

                            return (
                                <article
                                    key={offering.id}
                                    className="flex flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div
                                            className={`flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary ${dimmed}`}
                                        >
                                            <Package className="size-5" />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8 rounded-lg bg-card text-muted-foreground hover:text-primary"
                                                aria-label={`Editar ${offering.name}`}
                                                onClick={() =>
                                                    openEdit(offering)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8 rounded-lg bg-card text-muted-foreground hover:text-destructive"
                                                aria-label={`Excluir ${offering.name}`}
                                                onClick={() =>
                                                    setDeletingOffering(
                                                        offering,
                                                    )
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className={`space-y-1 ${dimmed}`}>
                                        <p className="flex flex-wrap items-center gap-x-2 text-[10px] font-semibold tracking-wider text-primary uppercase">
                                            <span>
                                                {offering.category?.name ??
                                                    'Sem categoria'}
                                            </span>
                                            {!offering.active && (
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                                                    Inativo
                                                </span>
                                            )}
                                        </p>
                                        <h2 className="font-medium">
                                            {offering.name}
                                        </h2>
                                        <p className="min-h-4 border-b pb-2 text-xs text-muted-foreground">
                                            {offering.description}
                                        </p>
                                    </div>

                                    <p
                                        className={`text-xl font-semibold ${dimmed}`}
                                    >
                                        {currencyFormatter.format(
                                            Number(offering.price),
                                        )}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            <OfferingFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                offering={editingOffering}
                categories={categories}
            />

            <DeleteOfferingDialog
                offering={deletingOffering}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingOffering(null);
                    }
                }}
            />
        </>
    );
}

OfferingsIndex.layout = {
    breadcrumbs: [],
};
