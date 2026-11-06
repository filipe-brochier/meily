import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Paginated, Transaction, TransactionType } from '@/types';

const SEARCH_DEBOUNCE_MS = 300;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const TYPE_FILTERS: { value: TransactionType | null; label: string }[] = [
    { value: null, label: 'Todos' },
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' },
];

const LIST_TITLES = {
    all: 'Todos os lançamentos',
    income: 'Receitas',
    expense: 'Despesas',
};

function formatDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-');

    return `${day}/${month}/${year}`;
}

function describeCount(total: number): string {
    return total === 1
        ? '1 movimentação encontrada'
        : `${total} movimentações encontradas`;
}

export default function TransactionsIndex({
    transactions,
    balance,
    search,
    type,
}: {
    transactions: Paginated<Transaction>;
    balance: string;
    search: string;
    type: TransactionType | null;
}) {
    const [query, setQuery] = useState(search);
    const lastSearch = useRef(search);
    const currentType = useRef(type);

    currentType.current = type;

    function visit(nextSearch: string, nextType: TransactionType | null) {
        const params: Record<string, string> = {};

        if (nextSearch) {
            params.search = nextSearch;
        }

        if (nextType) {
            params.type = nextType;
        }

        router.get(TransactionController.index.url(), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['transactions', 'balance', 'search', 'type'],
        });
    }

    useEffect(() => {
        const trimmed = query.trim();

        if (trimmed === lastSearch.current) {
            return;
        }

        const timeout = setTimeout(() => {
            lastSearch.current = trimmed;
            visit(trimmed, currentType.current);
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [query]);

    const balanceValue = Number(balance);
    const isFiltered = search !== '' || type !== null;

    return (
        <>
            <Head title="Histórico financeiro" />

            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar por descrição ou categoria"
                            aria-label="Buscar lançamentos"
                            className="h-10 rounded-xl bg-card pl-9"
                        />
                    </div>

                    <div
                        role="group"
                        aria-label="Filtrar por tipo"
                        className="flex w-fit gap-1 rounded-xl border bg-card p-1"
                    >
                        {TYPE_FILTERS.map((filter) => {
                            const active = filter.value === type;

                            return (
                                <button
                                    key={filter.label}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() =>
                                        visit(query.trim(), filter.value)
                                    }
                                    className={cn(
                                        'h-8 rounded-lg px-4 text-xs font-medium transition-colors',
                                        active
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>

                    <Button
                        asChild
                        className="h-10 rounded-lg px-5"
                        data-test="new-transaction-button"
                    >
                        <Link href={TransactionController.create.url()}>
                            <Plus />
                            Novo lançamento
                        </Link>
                    </Button>
                </div>

                <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                    <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
                        <div className="space-y-0.5">
                            <h2 className="text-sm font-medium">
                                {LIST_TITLES[type ?? 'all']}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {describeCount(transactions.total)}
                            </p>
                        </div>

                        <p className="text-right text-xs text-muted-foreground">
                            Saldo:{' '}
                            <span
                                className={cn(
                                    'text-sm font-semibold whitespace-nowrap',
                                    balanceValue < 0
                                        ? 'text-red-600'
                                        : 'text-emerald-700',
                                )}
                                data-test="transactions-balance"
                            >
                                {currencyFormatter.format(balanceValue)}
                            </span>
                        </p>
                    </header>

                    {transactions.data.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                            {isFiltered
                                ? 'Nenhum lançamento corresponde aos filtros.'
                                : 'Você ainda não registrou nenhum lançamento.'}
                        </p>
                    ) : (
                        <>
                            <div className="hidden grid-cols-[1fr_10rem_7rem_9rem] gap-4 border-b bg-muted/40 px-5 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:grid">
                                <span>Descrição</span>
                                <span>Categoria</span>
                                <span>Data</span>
                                <span className="text-right">Valor</span>
                            </div>

                            <ul className="divide-y">
                                {transactions.data.map((transaction) => (
                                    <TransactionRow
                                        key={transaction.id}
                                        transaction={transaction}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {(transactions.prev_page_url ||
                        transactions.next_page_url) && (
                        <footer className="flex items-center justify-between gap-4 border-t px-5 py-3 text-xs text-muted-foreground">
                            <span>
                                {transactions.from}–{transactions.to} de{' '}
                                {transactions.total}
                            </span>

                            <div className="flex gap-2">
                                <PageLink
                                    href={transactions.prev_page_url}
                                    label="Anterior"
                                >
                                    <ChevronLeft />
                                </PageLink>
                                <PageLink
                                    href={transactions.next_page_url}
                                    label="Próxima"
                                >
                                    <ChevronRight />
                                </PageLink>
                            </div>
                        </footer>
                    )}
                </section>
            </div>
        </>
    );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
    const isIncome = transaction.type === 'income';
    const isCanceled = transaction.status === 'canceled';
    const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

    return (
        <li className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 md:grid-cols-[1fr_10rem_7rem_9rem]">
            <div className="flex min-w-0 items-center gap-3 max-md:contents">
                <span
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                        isIncome
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600',
                    )}
                >
                    <Icon className="size-4" />
                </span>

                <div className="min-w-0">
                    <p
                        className={cn(
                            'truncate text-sm font-medium',
                            isCanceled && 'text-muted-foreground line-through',
                        )}
                    >
                        {transaction.description}
                    </p>
                    <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {isIncome ? 'Receita' : 'Despesa'}
                        {transaction.status === 'pending' && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                                Pendente
                            </span>
                        )}
                        {isCanceled && (
                            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                                Cancelado
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="hidden md:block">
                {transaction.category && (
                    <span className="inline-block max-w-full truncate rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium">
                        {transaction.category.name}
                    </span>
                )}
            </div>

            <p className="hidden text-xs text-muted-foreground md:block">
                {formatDate(transaction.happened_on)}
            </p>

            <div className="text-right">
                <p
                    className={cn(
                        'text-sm font-semibold whitespace-nowrap',
                        isCanceled
                            ? 'text-muted-foreground line-through'
                            : isIncome
                              ? 'text-emerald-700'
                              : 'text-red-600',
                    )}
                >
                    {isIncome ? '+' : '−'}{' '}
                    {currencyFormatter.format(Number(transaction.amount))}
                </p>
                <p className="text-[10px] text-muted-foreground md:hidden">
                    {formatDate(transaction.happened_on)}
                </p>
            </div>
        </li>
    );
}

function PageLink({
    href,
    label,
    children,
}: {
    href: string | null;
    label: string;
    children: React.ReactNode;
}) {
    if (!href) {
        return (
            <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                aria-label={label}
                disabled
            >
                {children}
            </Button>
        );
    }

    return (
        <Button
            asChild
            variant="outline"
            size="icon"
            className="size-8 rounded-lg bg-card"
        >
            <Link
                href={href}
                aria-label={label}
                preserveScroll
                only={['transactions', 'balance', 'search', 'type']}
            >
                {children}
            </Link>
        </Button>
    );
}

TransactionsIndex.layout = {
    title: 'Histórico financeiro',
    description: 'Consulte e filtre suas movimentações',
};
