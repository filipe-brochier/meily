import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    ChevronRight,
    CreditCard,
    Package,
    Plus,
    Scale,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
import OfferingController from '@/actions/App/Http/Controllers/OfferingController';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import {
    TransactionList,
    currencyFormatter,
} from '@/components/transaction-list';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Auth, Transaction } from '@/types';

type MonthFlow = {
    month: string;
    income: string;
    expense: string;
};

type Props = {
    month: string;
    summary: {
        income: string;
        expense: string;
        balance: string;
    };
    flow: MonthFlow[];
    recentTransactions: Transaction[];
};

const CHART_TICKS = 4;

const compactFormatter = new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const quickActions: {
    title: string;
    hint: string;
    href: string;
    icon: LucideIcon;
}[] = [
    {
        title: 'Cadastrar cliente',
        hint: 'Adicione um novo contato',
        href: ClientController.index.url(),
        icon: Users,
    },
    {
        title: 'Cadastrar serviço',
        hint: 'Inclua o que você oferece',
        href: OfferingController.index.url(),
        icon: Package,
    },
    {
        title: 'Registrar despesa',
        hint: 'Mantenha seus gastos em dia',
        href: TransactionController.create.url({ query: { type: 'expense' } }),
        icon: CreditCard,
    },
];

function monthDate(month: string): Date {
    return new Date(`${month}-01T12:00:00`);
}

function shortMonthLabel(month: string): string {
    const label = monthDate(month)
        .toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '');

    return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Rounds the highest value up to 1, 2 or 5 times a power of ten so the axis ticks stay readable. */
function niceCeiling(value: number): number {
    if (value <= 0) {
        return CHART_TICKS * 250;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));
    const fraction = value / magnitude;
    const step = [1, 2, 5, 10].find((candidate) => fraction <= candidate) ?? 10;

    return step * magnitude;
}

export default function Dashboard({
    month,
    summary,
    flow,
    recentTransactions,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth.user.name.split(' ')[0];
    const balance = Number(summary.balance);
    const monthName = monthDate(month).toLocaleDateString('pt-BR', {
        month: 'long',
    });

    return (
        <>
            <Head title="Visão geral" />

            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="flex flex-col gap-4 rounded-xl border bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                            Resumo de {monthName}
                        </p>
                        <h2 className="text-xl">
                            Olá, {firstName}!{' '}
                            {balance >= 0
                                ? 'Seu negócio está no caminho certo.'
                                : 'Fique de olho nas despesas deste mês.'}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Confira seus números e mantenha tudo organizado.
                        </p>
                    </div>

                    <Button
                        asChild
                        className="h-10 w-fit rounded-lg px-5"
                        data-test="new-transaction-button"
                    >
                        <Link href={TransactionController.create.url()}>
                            <Plus />
                            Novo lançamento
                        </Link>
                    </Button>
                </section>

                <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                        label="Receitas"
                        value={Number(summary.income)}
                        hint="Entradas no período"
                        icon={ArrowUpRight}
                        iconClassName="bg-emerald-50 text-emerald-600"
                    />
                    <MetricCard
                        label="Despesas"
                        value={Number(summary.expense)}
                        hint="Saídas no período"
                        icon={ArrowDownRight}
                        iconClassName="bg-red-50 text-red-600"
                    />
                    <MetricCard
                        label="Saldo atual"
                        value={balance}
                        hint="Receitas menos despesas"
                        icon={Scale}
                        iconClassName="bg-primary/10 text-primary"
                        valueClassName={balance < 0 ? 'text-red-600' : ''}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <FlowChart flow={flow} />

                    <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
                        <h2 className="text-sm font-medium">Acesso rápido</h2>
                        <p className="mb-3 text-xs text-muted-foreground">
                            O que você deseja fazer?
                        </p>

                        <ul className="divide-y border-t">
                            {quickActions.map((action) => (
                                <li key={action.title}>
                                    <Link
                                        href={action.href}
                                        className="group flex items-center gap-3 py-3"
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <action.icon className="size-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-xs font-semibold">
                                                {action.title}
                                            </span>
                                            <span className="block text-[10px] text-muted-foreground">
                                                {action.hint}
                                            </span>
                                        </span>
                                        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                    <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
                        <div className="space-y-0.5">
                            <h2 className="text-sm font-medium">
                                Movimentações recentes
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Seus últimos lançamentos
                            </p>
                        </div>

                        <Link
                            href={TransactionController.index.url()}
                            className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap text-primary hover:underline"
                        >
                            Ver histórico
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </header>

                    {recentTransactions.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                            Você ainda não registrou nenhum lançamento.
                        </p>
                    ) : (
                        <TransactionList transactions={recentTransactions} />
                    )}
                </section>
            </div>
        </>
    );
}

function MetricCard({
    label,
    value,
    hint,
    icon: Icon,
    iconClassName,
    valueClassName,
}: {
    label: string;
    value: number;
    hint: string;
    icon: LucideIcon;
    iconClassName: string;
    valueClassName?: string;
}) {
    return (
        <article className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                <span
                    className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        iconClassName,
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>

            <p className={cn('text-2xl font-semibold', valueClassName)}>
                {currencyFormatter.format(value)}
            </p>

            <p className="text-[10px] text-muted-foreground">{hint}</p>
        </article>
    );
}

function FlowChart({ flow }: { flow: MonthFlow[] }) {
    const highest = Math.max(
        ...flow.flatMap((item) => [Number(item.income), Number(item.expense)]),
    );
    const ceiling = niceCeiling(highest);
    const ticks = Array.from(
        { length: CHART_TICKS + 1 },
        (_, index) => (ceiling / CHART_TICKS) * (CHART_TICKS - index),
    );

    return (
        <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
            <header className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                    <h2 className="text-sm font-medium">Fluxo financeiro</h2>
                    <p className="text-xs text-muted-foreground">
                        Últimos {flow.length} meses
                    </p>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-primary" />
                        Receitas
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-red-300" />
                        Despesas
                    </span>
                </div>
            </header>

            <div className="mt-6 flex gap-3">
                <div className="flex h-44 flex-col justify-between text-[10px] text-muted-foreground">
                    {ticks.map((tick) => (
                        <span key={tick} className="leading-none">
                            {compactFormatter.format(tick)}
                        </span>
                    ))}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="relative flex h-44 items-end border-b">
                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                            {ticks.map((tick) => (
                                <span key={tick} className="border-t" />
                            ))}
                        </div>

                        {flow.map((item) => (
                            <div
                                key={item.month}
                                className="relative flex h-full flex-1 items-end justify-center gap-1"
                                title={`${shortMonthLabel(item.month)}: ${currencyFormatter.format(Number(item.income))} em receitas, ${currencyFormatter.format(Number(item.expense))} em despesas`}
                            >
                                <Bar
                                    value={Number(item.income)}
                                    ceiling={ceiling}
                                    className="bg-primary"
                                />
                                <Bar
                                    value={Number(item.expense)}
                                    ceiling={ceiling}
                                    className="bg-red-300"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 flex text-[10px] text-muted-foreground">
                        {flow.map((item) => (
                            <span key={item.month} className="flex-1 text-center">
                                {shortMonthLabel(item.month)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function Bar({
    value,
    ceiling,
    className,
}: {
    value: number;
    ceiling: number;
    className: string;
}) {
    return (
        <div
            className={cn('w-2.5 rounded-t-sm sm:w-3', className)}
            style={{ height: `${Math.min(100, (value / ceiling) * 100)}%` }}
        />
    );
}

Dashboard.layout = {
    title: 'Visão geral',
    description: 'Acompanhe o desempenho do seu negócio',
};
