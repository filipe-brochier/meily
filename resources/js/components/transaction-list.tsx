import { ArrowDownRight, ArrowUpRight, Ban, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/types';

export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

function formatDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-');

    return `${day}/${month}/${year}`;
}

export function TransactionList({
    transactions,
    onCancel,
    onReactivate,
    onDelete,
}: {
    transactions: Transaction[];
    onCancel?: (transaction: Transaction) => void;
    onReactivate?: (transaction: Transaction) => void;
    onDelete?: (transaction: Transaction) => void;
}) {
    const showActions = Boolean(onCancel || onReactivate || onDelete);

    return (
        <>
            <div
                className={cn(
                    'hidden gap-4 border-b bg-muted/40 px-5 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:grid',
                    showActions
                        ? 'grid-cols-[1fr_10rem_7rem_9rem_7rem]'
                        : 'grid-cols-[1fr_10rem_7rem_9rem]',
                )}
            >
                <span>Descrição</span>
                <span>Categoria</span>
                <span>Data</span>
                <span className="text-right">Valor</span>
                {showActions && <span className="text-right">Ações</span>}
            </div>

            <ul className="divide-y">
                {transactions.map((transaction) => (
                    <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        onCancel={onCancel}
                        onReactivate={onReactivate}
                        onDelete={onDelete}
                    />
                ))}
            </ul>
        </>
    );
}

function TransactionRow({
    transaction,
    onCancel,
    onReactivate,
    onDelete,
}: {
    transaction: Transaction;
    onCancel?: (transaction: Transaction) => void;
    onReactivate?: (transaction: Transaction) => void;
    onDelete?: (transaction: Transaction) => void;
}) {
    const isIncome = transaction.type === 'income';
    const isCanceled = transaction.status === 'canceled';
    const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
    const showActions = Boolean(onCancel || onReactivate || onDelete);

    return (
        <li
            className={cn(
                'grid items-center gap-x-4 gap-y-1 px-5 py-3.5',
                showActions
                    ? 'grid-cols-[auto_1fr_auto_auto] md:grid-cols-[1fr_10rem_7rem_9rem_7rem]'
                    : 'grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_10rem_7rem_9rem]',
            )}
        >
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

            {showActions && (
                <div className="flex justify-end gap-2">
                    {!isCanceled && onCancel && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-lg bg-card text-muted-foreground hover:text-amber-700"
                            aria-label={`Cancelar ${transaction.description}`}
                            onClick={() => onCancel(transaction)}
                        >
                            <Ban />
                        </Button>
                    )}
                    {isCanceled && onReactivate && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-lg bg-card text-muted-foreground hover:text-primary"
                            aria-label={`Reativar ${transaction.description}`}
                            onClick={() => onReactivate(transaction)}
                        >
                            <RotateCcw />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-lg bg-card text-muted-foreground hover:text-destructive"
                            aria-label={`Excluir ${transaction.description}`}
                            onClick={() => onDelete(transaction)}
                        >
                            <Trash2 />
                        </Button>
                    )}
                </div>
            )}
        </li>
    );
}
