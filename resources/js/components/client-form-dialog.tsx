import { Form } from '@inertiajs/react';
import { Check } from 'lucide-react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
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
import type { Client } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: Client | null;
};

const inputClassName = 'h-11 rounded-xl px-4';

function RequiredLabel({
    htmlFor,
    children,
}: {
    htmlFor: string;
    children: string;
}) {
    return (
        <Label htmlFor={htmlFor} className="text-xs font-semibold">
            {children} <span className="text-destructive">*</span>
        </Label>
    );
}

export default function ClientFormDialog({
    open,
    onOpenChange,
    client = null,
}: Props) {
    const isEditing = client !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-medium">
                        {isEditing ? 'Editar cliente' : 'Novo cliente'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {isEditing
                            ? 'Atualize os dados de contato.'
                            : 'Preencha os dados de contato.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    key={client?.id ?? 'new'}
                    {...(isEditing
                        ? ClientController.update.form(client)
                        : ClientController.store.form())}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <RequiredLabel htmlFor="client-name">
                                    Nome ou razão social
                                </RequiredLabel>
                                <Input
                                    id="client-name"
                                    name="name"
                                    defaultValue={client?.name ?? ''}
                                    className={inputClassName}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    placeholder="Ex.: Maria da Silva"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="client-phone"
                                    className="text-xs font-semibold"
                                >
                                    Telefone
                                </Label>
                                <Input
                                    id="client-phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={client?.phone ?? ''}
                                    className={inputClassName}
                                    autoComplete="off"
                                    placeholder="(51) 99999-9999"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="client-email"
                                    className="text-xs font-semibold"
                                >
                                    E-mail
                                </Label>
                                <Input
                                    id="client-email"
                                    name="email"
                                    type="email"
                                    defaultValue={client?.email ?? ''}
                                    className={inputClassName}
                                    autoComplete="off"
                                    placeholder="nome@email.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="client-address"
                                    className="text-xs font-semibold"
                                >
                                    Endereço
                                </Label>
                                <Input
                                    id="client-address"
                                    name="address"
                                    defaultValue={client?.address ?? ''}
                                    className={inputClassName}
                                    autoComplete="off"
                                    placeholder="Rua, número, bairro, cidade"
                                />
                                <InputError message={errors.address} />
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
                                    data-test="save-client-button"
                                >
                                    <Check />
                                    {isEditing
                                        ? 'Salvar alterações'
                                        : 'Cadastrar cliente'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
