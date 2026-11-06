import { Form } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import OfferingController from '@/actions/App/Http/Controllers/OfferingController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { Category, Offering } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    offering?: Offering | null;
    categories: Category[];
};

const inputClassName = 'h-11 rounded-xl px-4';
const selectClassName = 'h-11! w-full rounded-xl px-4';

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

function ActiveField({ defaultChecked }: { defaultChecked: boolean }) {
    const [active, setActive] = useState(defaultChecked);

    return (
        <div className="flex items-center gap-2">
            <Checkbox
                id="offering-active"
                checked={active}
                onCheckedChange={(checked) => setActive(checked === true)}
            />
            <input type="hidden" name="active" value={active ? '1' : '0'} />
            <Label htmlFor="offering-active" className="text-sm font-normal">
                Ativo (disponível para novos lançamentos)
            </Label>
        </div>
    );
}

export default function OfferingFormDialog({
    open,
    onOpenChange,
    offering = null,
    categories,
}: Props) {
    const isEditing = offering !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-medium">
                        {isEditing ? 'Editar item' : 'Novo item'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {isEditing
                            ? 'Atualize os dados do produto ou serviço.'
                            : 'Cadastre um produto ou serviço que você oferece.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    key={offering?.id ?? 'new'}
                    {...(isEditing
                        ? OfferingController.update.form(offering)
                        : OfferingController.store.form())}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <RequiredLabel htmlFor="offering-category">
                                        Categoria
                                    </RequiredLabel>
                                    <Select
                                        name="category_id"
                                        defaultValue={
                                            offering?.category_id?.toString() ??
                                            undefined
                                        }
                                        required
                                    >
                                        <SelectTrigger
                                            id="offering-category"
                                            className={selectClassName}
                                        >
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category_id} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <RequiredLabel htmlFor="offering-name">
                                    Nome
                                </RequiredLabel>
                                <Input
                                    id="offering-name"
                                    name="name"
                                    defaultValue={offering?.name ?? ''}
                                    className={inputClassName}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    placeholder="Ex.: Manutenção de computador"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="offering-description"
                                    className="text-xs font-semibold"
                                >
                                    Descrição
                                </Label>
                                <textarea
                                    id="offering-description"
                                    name="description"
                                    defaultValue={offering?.description ?? ''}
                                    rows={3}
                                    placeholder="Descreva brevemente o que está incluso"
                                    className="min-h-20 w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2">
                                <RequiredLabel htmlFor="offering-price">
                                    Preço
                                </RequiredLabel>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xs text-muted-foreground">
                                        R$
                                    </span>
                                    <Input
                                        id="offering-price"
                                        name="price"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        max="99999999.99"
                                        step="0.01"
                                        defaultValue={offering?.price ?? ''}
                                        className="h-11 rounded-xl pr-4 pl-11"
                                        required
                                        placeholder="0,00"
                                    />
                                </div>
                                <InputError message={errors.price} />
                            </div>

                            <ActiveField
                                defaultChecked={offering?.active ?? true}
                            />

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
                                    data-test="save-offering-button"
                                >
                                    <Check />
                                    {isEditing
                                        ? 'Salvar alterações'
                                        : 'Cadastrar item'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
