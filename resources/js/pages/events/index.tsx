import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import DeleteEventDialog from '@/components/delete-event-dialog';
import EventFormDialog from '@/components/event-form-dialog';
import { Button } from '@/components/ui/button';
import type { CalendarEvent, EventOption, EventStatus } from '@/types';

type Props = {
    month: string;
    today: string;
    events: CalendarEvent[];
    clients: EventOption[];
    offerings: EventOption[];
};

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const statusDot: Record<EventStatus, string> = {
    scheduled: 'bg-primary',
    completed: 'bg-emerald-500',
    canceled: 'bg-muted-foreground/50',
};

const statusBadge: Record<EventStatus, { label: string; className: string }> = {
    scheduled: { label: 'Agendado', className: 'bg-primary/10 text-primary' },
    completed: {
        label: 'Concluído',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    canceled: { label: 'Cancelado', className: 'bg-muted text-muted-foreground' },
};

function parseMonth(month: string): { year: number; monthIndex: number } {
    const [year, monthNumber] = month.split('-').map(Number);

    return { year, monthIndex: monthNumber - 1 };
}

function formatMonthKey(year: number, monthIndex: number): string {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTimeRange(event: CalendarEvent): string {
    const start = event.start_time.slice(0, 5);

    return event.end_time ? `${start} – ${event.end_time.slice(0, 5)}` : start;
}

export default function EventsIndex({
    month,
    today,
    events,
    clients,
    offerings,
}: Props) {
    const [selectedDate, setSelectedDate] = useState(
        today.startsWith(month) ? today : `${month}-01`,
    );
    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(
        null,
    );
    const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(
        null,
    );

    const { year, monthIndex } = parseMonth(month);

    const eventsByDate = useMemo(() => {
        const grouped = new Map<string, CalendarEvent[]>();

        events.forEach((event) => {
            grouped.set(event.date, [...(grouped.get(event.date) ?? []), event]);
        });

        return grouped;
    }, [events]);

    const monthLabel = capitalize(
        new Date(year, monthIndex, 1).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
        }),
    );

    const leadingBlanks = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array.from({ length: leadingBlanks }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    const selectedEvents = eventsByDate.get(selectedDate) ?? [];
    const selectedLabel = capitalize(
        new Date(`${selectedDate}T00:00:00`).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        }),
    );

    function goToMonth(targetMonth: string, nextSelectedDate: string) {
        setSelectedDate(nextSelectedDate);

        router.get(
            EventController.index.url(),
            { month: targetMonth },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['events', 'month'],
            },
        );
    }

    function shiftMonth(delta: number) {
        const target = new Date(year, monthIndex + delta, 1);
        const key = formatMonthKey(target.getFullYear(), target.getMonth());

        goToMonth(key, today.startsWith(key) ? today : `${key}-01`);
    }

    function goToToday() {
        goToMonth(today.slice(0, 7), today);
    }

    function openCreate() {
        setEditingEvent(null);
        setFormOpen(true);
    }

    function openEdit(event: CalendarEvent) {
        setEditingEvent(event);
        setFormOpen(true);
    }

    return (
        <>
            <Head title="Agenda" />

            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                    <section
                        className="rounded-xl border bg-card p-4 shadow-xs md:p-5"
                        data-tour="events-calendar"
                    >
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <h2 className="text-lg font-medium">
                                {monthLabel}
                            </h2>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="h-8 rounded-lg px-3 text-xs"
                                    onClick={goToToday}
                                >
                                    Hoje
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 rounded-lg"
                                    aria-label="Mês anterior"
                                    onClick={() => shiftMonth(-1)}
                                >
                                    <ChevronLeft />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 rounded-lg"
                                    aria-label="Próximo mês"
                                    onClick={() => shiftMonth(1)}
                                >
                                    <ChevronRight />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {weekdays.map((weekday) => (
                                <div
                                    key={weekday}
                                    className="py-2 text-center text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
                                >
                                    {weekday}
                                </div>
                            ))}

                            {cells.map((day, index) => {
                                if (day === null) {
                                    return <div key={`blank-${index}`} />;
                                }

                                const date = `${month}-${String(day).padStart(2, '0')}`;
                                const dayEvents = eventsByDate.get(date) ?? [];
                                const isSelected = date === selectedDate;
                                const isToday = date === today;

                                return (
                                    <button
                                        key={date}
                                        type="button"
                                        onClick={() => setSelectedDate(date)}
                                        aria-label={`Dia ${day}, ${dayEvents.length} evento(s)`}
                                        aria-pressed={isSelected}
                                        className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm transition-colors ${
                                            isSelected
                                                ? 'bg-primary text-primary-foreground'
                                                : isToday
                                                  ? 'bg-primary/10 font-semibold text-primary hover:bg-primary/15'
                                                  : 'hover:bg-muted'
                                        }`}
                                    >
                                        <span>{day}</span>
                                        <span className="flex h-1.5 items-center gap-0.5">
                                            {dayEvents
                                                .slice(0, 3)
                                                .map((event) => (
                                                    <span
                                                        key={event.id}
                                                        className={`size-1.5 rounded-full ${
                                                            isSelected
                                                                ? 'bg-primary-foreground'
                                                                : statusDot[
                                                                      event
                                                                          .status
                                                                  ]
                                                        }`}
                                                    />
                                                ))}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs md:p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="font-medium">{selectedLabel}</h2>
                                <p className="text-xs text-muted-foreground">
                                    {selectedEvents.length === 0
                                        ? 'Nenhum evento'
                                        : selectedEvents.length === 1
                                          ? '1 evento'
                                          : `${selectedEvents.length} eventos`}
                                </p>
                            </div>

                            <Button
                                onClick={openCreate}
                                className="h-9 rounded-lg px-4"
                                data-test="new-event-button"
                            >
                                <Plus />
                                Novo evento
                            </Button>
                        </div>

                        {selectedEvents.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                <CalendarDays className="size-6" />
                                Nada agendado para este dia.
                            </div>
                        ) : (
                            <ul
                                className="flex flex-col gap-3"
                                data-tour="events-list"
                            >
                                {selectedEvents.map((event) => {
                                    const badge = statusBadge[event.status];
                                    const canceled = event.status === 'canceled';
                                    const details = [
                                        event.client?.name,
                                        event.offering?.name,
                                    ].filter(Boolean);

                                    return (
                                        <li
                                            key={event.id}
                                            className="flex flex-col gap-2 rounded-xl border p-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 space-y-1">
                                                    <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                        <Clock className="size-3.5" />
                                                        {formatTimeRange(event)}
                                                    </p>
                                                    <p
                                                        className={`font-medium ${canceled ? 'text-muted-foreground line-through' : ''}`}
                                                    >
                                                        {event.title}
                                                    </p>
                                                    {details.length > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {details.join(
                                                                ' · ',
                                                            )}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8 rounded-lg text-muted-foreground hover:text-primary"
                                                        aria-label={`Editar ${event.title}`}
                                                        onClick={() =>
                                                            openEdit(event)
                                                        }
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                                                        aria-label={`Excluir ${event.title}`}
                                                        onClick={() =>
                                                            setDeletingEvent(
                                                                event,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>

                                            {event.status !== 'scheduled' && (
                                                <span
                                                    className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            )}

                                            {event.notes && (
                                                <p className="text-xs whitespace-pre-line text-muted-foreground">
                                                    {event.notes}
                                                </p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            <EventFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                event={editingEvent}
                defaultDate={selectedDate}
                clients={clients}
                offerings={offerings}
            />

            <DeleteEventDialog
                event={deletingEvent}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingEvent(null);
                    }
                }}
            />
        </>
    );
}

EventsIndex.layout = {
    title: 'Agenda',
    description: 'Organize seus compromissos',
};
