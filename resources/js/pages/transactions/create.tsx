import { Form, Head, Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Info } from 'lucide-react';
import { useState } from 'react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';

type TransactionType = 'income' | 'expense';

type TransactionCategory = {
    id: number;
    type: TransactionType;
    name: string;
};

type TransactionClient = {
    id: number;
    name: string;
};

type TransactionOffering = {
    id: number;
    category_id: number | null;
    name: string;
    price: string;
};

type Props = {
    categories: TransactionCategory[];
    clients: TransactionClient[];
    offerings: TransactionOffering[];
    today: string;
};

const NONE = 'none';

const typeOptions = [
    {
        value: 'income',
        title: 'Receita',
        hint: 'Dinheiro que entrou',
        icon: ArrowUpRight,
        iconClassName: 'bg-emerald-50 text-emerald-600',
    },
    {
        value: 'expense',
        title: 'Despesa',
        hint: 'Dinheiro que saiu',
        icon: ArrowDownRight,
        iconClassName: 'bg-red-50 text-red-600',
    },
] as const;

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

function TransactionForm({
    categories,
    clients,
    offerings,
    today,
    onSaved,
}: Props & { onSaved: () => void }) {
    const [type, setType] = useState<TransactionType>('income');
    const [categoryId, setCategoryId] = useState('');
    const [clientId, setClientId] = useState(NONE);
    const [offeringId, setOfferingId] = useState(NONE);
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('paid');

    const availableCategories = categories.filter(
        (category) => category.type === type,
    );
    const isIncome = type === 'income';

    function changeType(nextType: TransactionType) {
        setType(nextType);
        setCategoryId('');
        setClientId(NONE);
        setOfferingId(NONE);
    }

    function changeCategory(value: string) {
        setCategoryId(value);

        const offering = offerings.find(
            (item) => item.id.toString() === offeringId,
        );

        if (offering && offering.category_id?.toString() !== value) {
            setOfferingId(NONE);
        }
    }

    function changeOffering(value: string) {
        setOfferingId(value);

        const offering = offerings.find((item) => item.id.toString() === value);

        if (!offering) {
            return;
        }

        setAmount(offering.price);

        if (offering.category_id !== null) {
            setCategoryId(offering.category_id.toString());
        }
    }

    return (
        <Form
            {...TransactionController.store.form()}
            options={{ preserveScroll: true }}
            onSuccess={onSaved}
            className="space-y-5"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <span className="text-xs font-semibold">
                            Tipo de movimentação
                        </span>
                        <input type="hidden" name="type" value={type} />
                        <div className="grid gap-3 sm:grid-cols-2">
                            {typeOptions.map((option) => {
                                const Icon = option.icon;
                                const selected = type === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => changeType(option.value)}
                                        className={`flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${selected ? 'border-primary ring-2 ring-primary/20' : 'hover:bg-muted/60'}`}
                                    >
                                        <span
                                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${option.iconClassName}`}
                                        >
                                            <Icon className="size-4" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold">
                                                {option.title}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {option.hint}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError message={errors.type} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="transaction-amount" required>
                                Valor
                            </FieldLabel>
                            <div className="relative">
                                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xs text-muted-foreground">
                                    R$
                                </span>
                                <Input
                                    id="transaction-amount"
                                    name="amount"
                                    type="number"
                                    inputMode="decimal"
                                    min="0.01"
                                    max="99999999.99"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(event.target.value)
                                    }
                                    className="h-11 rounded-xl pr-4 pl-11"
                                    required
                                    placeholder="0,00"
                                />
                            </div>
                            <InputError message={errors.amount} />
                        </div>

                        <div className="grid gap-2">
                            <FieldLabel htmlFor="transaction-date" required>
                                Data
                            </FieldLabel>
                            <Input
                                id="transaction-date"
                                name="happened_on"
                                type="date"
                                defaultValue={today}
                                className={inputClassName}
                                required
                            />
                            <InputError message={errors.happened_on} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="transaction-category" required>
                                Categoria
                            </FieldLabel>
                            <input
                                type="hidden"
                                name="category_id"
                                value={categoryId}
                            />
                            <Select
                                value={categoryId}
                                onValueChange={changeCategory}
                            >
                                <SelectTrigger
                                    id="transaction-category"
                                    className={selectClassName}
                                >
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCategories.map((category) => (
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

                        <div className="grid gap-2">
                            <FieldLabel htmlFor="transaction-status" required>
                                Situação
                            </FieldLabel>
                            <input type="hidden" name="status" value={status} />
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger
                                    id="transaction-status"
                                    className={selectClassName}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paid">
                                        {isIncome ? 'Recebido' : 'Pago'}
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        {isIncome ? 'A receber' : 'A pagar'}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>
                    </div>

                    {isIncome && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <FieldLabel htmlFor="transaction-client">
                                    Cliente
                                </FieldLabel>
                                <input
                                    type="hidden"
                                    name="client_id"
                                    value={clientId === NONE ? '' : clientId}
                                />
                                <Select
                                    value={clientId}
                                    onValueChange={setClientId}
                                >
                                    <SelectTrigger
                                        id="transaction-client"
                                        className={selectClassName}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE}>
                                            Sem cliente
                                        </SelectItem>
                                        {clients.map((client) => (
                                            <SelectItem
                                                key={client.id}
                                                value={client.id.toString()}
                                            >
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.client_id} />
                            </div>

                            <div className="grid gap-2">
                                <FieldLabel htmlFor="transaction-offering">
                                    Produto ou serviço
                                </FieldLabel>
                                <input
                                    type="hidden"
                                    name="offering_id"
                                    value={
                                        offeringId === NONE ? '' : offeringId
                                    }
                                />
                                <Select
                                    value={offeringId}
                                    onValueChange={changeOffering}
                                >
                                    <SelectTrigger
                                        id="transaction-offering"
                                        className={selectClassName}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE}>
                                            Nenhum
                                        </SelectItem>
                                        {offerings.map((offering) => (
                                            <SelectItem
                                                key={offering.id}
                                                value={offering.id.toString()}
                                            >
                                                {offering.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.offering_id} />
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="transaction-description" required>
                            Descrição
                        </FieldLabel>
                        <textarea
                            id="transaction-description"
                            name="description"
                            rows={3}
                            maxLength={255}
                            required
                            placeholder="Ex.: Compra de materiais para atendimento"
                            className="min-h-20 w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-5">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="h-10 rounded-lg px-5"
                        >
                            <Link href={dashboard()}>Cancelar</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-10 rounded-lg px-5"
                            data-test="save-transaction-button"
                        >
                            <Check />
                            Salvar lançamento
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

export default function TransactionsCreate(props: Props) {
    const [formKey, setFormKey] = useState(0);

    return (
        <>
            <Head title="Novo lançamento" />

            <div className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
                <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-xs">
                    <div className="mb-5 space-y-1">
                        <h2 className="font-medium">Dados do lançamento</h2>
                        <p className="text-xs text-muted-foreground">
                            Preencha as informações abaixo. Leva menos de 1
                            minuto.
                        </p>
                    </div>

                    <TransactionForm
                        key={formKey}
                        {...props}
                        onSaved={() => setFormKey((key) => key + 1)}
                    />
                </section>

                <aside className="h-fit space-y-3 rounded-xl border bg-primary/5 p-5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Info className="size-4" />
                    </span>
                    <h3 className="text-sm font-medium">
                        Dica para manter tudo em dia
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Registre suas movimentações assim que elas acontecerem.
                        Assim, seu saldo estará sempre atualizado.
                    </p>
                    <Link
                        href={TransactionController.index.url()}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                        Ver meu histórico
                        <ArrowRight className="size-3.5" />
                    </Link>
                </aside>
            </div>
        </>
    );
}

TransactionsCreate.layout = {
    title: 'Novo lançamento',
    description: 'Registre uma receita ou despesa',
};
