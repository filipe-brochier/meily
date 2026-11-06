import { Link, useHttp } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { currencyFormatter } from '@/components/transaction-list';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { Client, ClientProfile } from '@/types';

type Props = {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (client: Client) => void;
};

function formatDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-');

    return `${day}/${month}/${year}`;
}

function formatShortDate(value: string): string {
    const [, month, day] = value.slice(0, 10).split('-');

    return `${day}/${month}`;
}

export default function ClientProfileSheet({
    client,
    open,
    onOpenChange,
    onEdit,
}: Props) {
    const http = useHttp<Record<string, never>, ClientProfile>({});
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const latestRequest = useRef(0);
    const getInitials = useInitials();

    useEffect(() => {
        setProfile(null);
        setFailed(false);

        if (!client || !open) {
            return;
        }

        const request = ++latestRequest.current;
        const isLatest = () => request === latestRequest.current;

        http.get(ClientController.show.url(client), {
            onSuccess: (response) => {
                if (isLatest()) {
                    setProfile(response);
                }
            },
            onHttpException: () => {
                if (isLatest()) {
                    setFailed(true);
                }

                return false;
            },
            onNetworkError: () => {
                if (isLatest()) {
                    setFailed(true);
                }

                return false;
            },
        });
    }, [client?.id, open, attempt]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="w-full gap-0 overflow-y-auto p-0 data-[state=open]:duration-300 sm:max-w-md"
                data-test="client-profile-sheet"
            >
                {client && (
                    <>
                        <SheetHeader className="gap-4 border-b bg-primary/5 p-5 pr-12">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-12">
                                    <AvatarFallback className="bg-primary/10 font-medium text-primary">
                                        {getInitials(client.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 space-y-0.5">
                                    <SheetTitle className="truncate text-lg font-medium">
                                        {client.name}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs">
                                        Ficha do cliente
                                    </SheetDescription>
                                </div>
                            </div>

                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                {client.phone && (
                                    <li className="flex items-center gap-2">
                                        <Phone className="size-3.5" />
                                        <a
                                            href={`tel:${client.phone}`}
                                            className="hover:text-primary hover:underline"
                                        >
                                            {client.phone}
                                        </a>
                                    </li>
                                )}
                                {client.email && (
                                    <li className="flex min-w-0 items-center gap-2">
                                        <Mail className="size-3.5 shrink-0" />
                                        <a
                                            href={`mailto:${client.email}`}
                                            className="truncate hover:text-primary hover:underline"
                                        >
                                            {client.email}
                                        </a>
                                    </li>
                                )}
                                {client.address && (
                                    <li className="flex min-w-0 items-center gap-2">
                                        <MapPin className="size-3.5 shrink-0" />
                                        <span className="truncate">
                                            {client.address}
                                        </span>
                                    </li>
                                )}
                            </ul>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    asChild
                                    className="h-9 rounded-lg px-4"
                                    data-test="client-new-transaction-button"
                                >
                                    <Link
                                        href={TransactionController.create.url({
                                            query: { client_id: client.id },
                                        })}
                                    >
                                        <Plus />
                                        Novo lançamento
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-9 rounded-lg bg-card px-4"
                                    onClick={() => onEdit(client)}
                                >
                                    <Pencil />
                                    Editar
                                </Button>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 space-y-6 p-5">
                            {failed ? (
                                <div className="space-y-3 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    <p>Não foi possível carregar a ficha.</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setAttempt((value) => value + 1)
                                        }
                                    >
                                        Tentar novamente
                                    </Button>
                                </div>
                            ) : profile === null ? (
                                <ProfileSkeleton />
                            ) : (
                                <ProfileContent profile={profile} />
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true">
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                    <div
                        key={index}
                        className="h-20 animate-pulse rounded-xl bg-muted"
                    />
                ))}
            </div>
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
            <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </div>
    );
}

function SummaryCard({
    label,
    value,
    valueClassName,
}: {
    label: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <div className="space-y-1 rounded-xl border bg-card p-3.5">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
            </p>
            <p className={cn('text-lg font-semibold', valueClassName)}>
                {value}
            </p>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-3">
            <h3 className="text-sm font-medium">{title}</h3>
            {children}
        </section>
    );
}

function EmptyNote({ children }: { children: string }) {
    return (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">
            {children}
        </p>
    );
}

function ProfileContent({ profile }: { profile: ClientProfile }) {
    const { summary, upcoming_events: events, transactions } = profile;

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <SummaryCard
                    label="Recebido"
                    value={currencyFormatter.format(Number(summary.received))}
                    valueClassName="text-emerald-700"
                />
                <SummaryCard
                    label="A receber"
                    value={currencyFormatter.format(Number(summary.pending))}
                    valueClassName={
                        Number(summary.pending) > 0 ? 'text-amber-700' : ''
                    }
                />
                <SummaryCard
                    label="Atendimentos"
                    value={String(summary.services_count)}
                />
                <SummaryCard
                    label="Último atendimento"
                    value={
                        summary.last_service_on
                            ? formatDate(summary.last_service_on)
                            : '—'
                    }
                />
            </div>

            <Section title="Próximos compromissos">
                {events.length === 0 ? (
                    <EmptyNote>Nenhum compromisso agendado.</EmptyNote>
                ) : (
                    <ul className="divide-y rounded-xl border">
                        {events.map((event) => (
                            <li
                                key={event.id}
                                className="flex items-start gap-3 p-3"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <CalendarDays className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {event.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatShortDate(event.date)} ·{' '}
                                        {event.start_time.slice(0, 5)}
                                        {event.offering &&
                                            ` · ${event.offering.name}`}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>

            <Section title="Últimos lançamentos">
                {transactions.length === 0 ? (
                    <EmptyNote>Nenhum lançamento para este cliente.</EmptyNote>
                ) : (
                    <ul className="divide-y rounded-xl border">
                        {transactions.map((transaction) => {
                            const isIncome = transaction.type === 'income';
                            const isCanceled =
                                transaction.status === 'canceled';
                            const Icon = isIncome
                                ? ArrowUpRight
                                : ArrowDownRight;

                            return (
                                <li
                                    key={transaction.id}
                                    className="flex items-center gap-3 p-3"
                                >
                                    <span
                                        className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                            isIncome
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-red-50 text-red-600',
                                        )}
                                    >
                                        <Icon className="size-4" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={cn(
                                                'truncate text-sm font-medium',
                                                isCanceled &&
                                                    'text-muted-foreground line-through',
                                            )}
                                        >
                                            {transaction.description}
                                        </p>
                                        <p className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground">
                                            {formatDate(
                                                transaction.happened_on,
                                            )}
                                            {transaction.status ===
                                                'pending' && (
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
                                        {currencyFormatter.format(
                                            Number(transaction.amount),
                                        )}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Section>
        </>
    );
}
