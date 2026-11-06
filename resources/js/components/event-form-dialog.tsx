import { Form } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CalendarEvent, EventOption } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event?: CalendarEvent | null;
    defaultDate: string;
    clients: EventOption[];
    offerings: EventOption[];
};

const NONE = 'none';

const statusOptions = [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'completed', label: 'Concluído' },
    { value: 'canceled', label: 'Cancelado' },
];

const inputClassName = 'h-11 rounded-xl px-4';
const selectClassName = 'h-11! w-full rounded-xl px-4';

function FieldLabel({
    htmlFor,
    required = false,
    children,
}: {
    htmlFor: string;
    required?: boolean;
    children: string;
}) {
    return (
        <Label htmlFor={htmlFor} className="text-xs font-semibold">
            {children}
            {required && <span className="text-destructive"> *</span>}
        </Label>
    );
}

function OptionalSelect({
    id,
    name,
    placeholder,
    options,
    defaultValue,
}: {
    id: string;
    name: string;
    placeholder: string;
    options: EventOption[];
    defaultValue: number | null;
}) {
    const [value, setValue] = useState(defaultValue?.toString() ?? NONE);

    return (
        <>
            <input
                type="hidden"
                name={name}
                value={value === NONE ? '' : value}
            />
            <Select value={value} onValueChange={setValue}>
                <SelectTrigger id={id} className={selectClassName}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={NONE}>Nenhum</SelectItem>
                    {options.map((option) => (
                        <SelectItem
                            key={option.id}
                            value={option.id.toString()}
                        >
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    );
}

export default function EventFormDialog({
    open,
    onOpenChange,
    event = null,
    defaultDate,
    clients,
    offerings,
}: Props) {
    const isEditing = event !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] gap-5 overflow-y-auto rounded-2xl p-6 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-medium">
                        {isEditing ? 'Editar evento' : 'Novo evento'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {isEditing
                            ? 'Atualize os dados do compromisso.'
                            : 'Registre um compromisso na sua agenda.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    key={event?.id ?? `new-${defaultDate}`}
                    {...(isEditing
                        ? EventController.update.form(event)
                        : EventController.store.form())}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <FieldLabel htmlFor="event-title" required>
                                    Título
                                </FieldLabel>
                                <Input
                                    id="event-title"
                                    name="title"
                                    defaultValue={event?.title ?? ''}
                                    className={inputClassName}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    placeholder="Ex.: Visita técnica"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-3 grid gap-2 sm:col-span-1">
                                    <FieldLabel htmlFor="event-date" required>
                                        Data
                                    </FieldLabel>
                                    <Input
                                        id="event-date"
                                        name="date"
                                        type="date"
                                        defaultValue={
                                            event?.date ?? defaultDate
                                        }
                                        className={inputClassName}
                                        required
                                    />
                                    <InputError message={errors.date} />
                                </div>

                                <div className="col-span-3 grid grid-cols-2 gap-3 sm:col-span-2">
                                    <div className="grid gap-2">
                                        <FieldLabel
                                            htmlFor="event-start-time"
                                            required
                                        >
                                            Início
                                        </FieldLabel>
                                        <Input
                                            id="event-start-time"
                                            name="start_time"
                                            type="time"
                                            defaultValue={
                                                event?.start_time.slice(
                                                    0,
                                                    5,
                                                ) ?? ''
                                            }
                                            className={inputClassName}
                                            required
                                        />
                                        <InputError
                                            message={errors.start_time}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <FieldLabel htmlFor="event-end-time">
                                            Fim
                                        </FieldLabel>
                                        <Input
                                            id="event-end-time"
                                            name="end_time"
                                            type="time"
                                            defaultValue={
                                                event?.end_time?.slice(0, 5) ??
                                                ''
                                            }
                                            className={inputClassName}
                                        />
                                        <InputError
                                            message={errors.end_time}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <FieldLabel htmlFor="event-client">
                                    Cliente
                                </FieldLabel>
                                <OptionalSelect
                                    id="event-client"
                                    name="client_id"
                                    placeholder="Selecione"
                                    options={clients}
                                    defaultValue={event?.client_id ?? null}
                                />
                                <InputError message={errors.client_id} />
                            </div>

                            <div className="grid gap-2">
                                <FieldLabel htmlFor="event-offering">
                                    Produto ou serviço
                                </FieldLabel>
                                <OptionalSelect
                                    id="event-offering"
                                    name="offering_id"
                                    placeholder="Selecione"
                                    options={offerings}
                                    defaultValue={event?.offering_id ?? null}
                                />
                                <InputError message={errors.offering_id} />
                            </div>

                            <div className="grid gap-2">
                                <FieldLabel htmlFor="event-status" required>
                                    Status
                                </FieldLabel>
                                <Select
                                    name="status"
                                    defaultValue={event?.status ?? 'scheduled'}
                                    required
                                >
                                    <SelectTrigger
                                        id="event-status"
                                        className={selectClassName}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <FieldLabel htmlFor="event-notes">
                                    Observações
                                </FieldLabel>
                                <textarea
                                    id="event-notes"
                                    name="notes"
                                    defaultValue={event?.notes ?? ''}
                                    rows={3}
                                    placeholder="Endereço, o que levar, detalhes combinados..."
                                    className="min-h-20 w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <DialogFooter className="gap-2 border-t pt-4">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-lg px-5"
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-10 rounded-lg px-5"
                                    data-test="save-event-button"
                                >
                                    <Check />
                                    {isEditing
                                        ? 'Salvar alterações'
                                        : 'Criar evento'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
