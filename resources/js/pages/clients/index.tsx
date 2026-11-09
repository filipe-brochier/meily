import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
import ClientFormDialog from '@/components/client-form-dialog';
import ClientProfileSheet from '@/components/client-profile-sheet';
import DeleteClientDialog from '@/components/delete-client-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import type { Client } from '@/types';

const SEARCH_DEBOUNCE_MS = 300;

export default function ClientsIndex({
    clients,
    search,
}: {
    clients: Client[];
    search: string;
}) {
    const getInitials = useInitials();
    const [query, setQuery] = useState(search);
    const [formOpen, setFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);
    const [profileClient, setProfileClient] = useState<Client | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const lastSearch = useRef(search);

    useEffect(() => {
        const trimmed = query.trim();

        if (trimmed === lastSearch.current) {
            return;
        }

        const timeout = setTimeout(() => {
            lastSearch.current = trimmed;

            router.get(
                ClientController.index.url(),
                trimmed ? { search: trimmed } : {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['clients', 'search'],
                },
            );
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [query]);

    function openCreate() {
        setEditingClient(null);
        setFormOpen(true);
    }

    function openEdit(client: Client) {
        setProfileOpen(false);
        setEditingClient(client);
        setFormOpen(true);
    }

    function openProfile(client: Client) {
        setProfileClient(client);
        setProfileOpen(true);
    }

    const countLabel =
        clients.length === 1
            ? '1 cliente encontrado'
            : `${clients.length} clientes encontrados`;

    return (
        <>
            <Head title="Clientes" />

            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div
                        className="relative w-full sm:max-w-sm"
                        data-tour="clients-search"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar por nome, telefone ou e-mail"
                            aria-label="Buscar clientes"
                            className="h-10 rounded-xl bg-card pl-9"
                        />
                    </div>

                    <Button
                        onClick={openCreate}
                        className="h-10 rounded-lg px-5"
                        data-test="new-client-button"
                    >
                        <Plus />
                        Novo cliente
                    </Button>
                </div>

                <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                    <div className="space-y-1 p-5">
                        <h2 className="font-medium">Seus clientes</h2>
                        <p className="text-xs text-muted-foreground">
                            {countLabel}
                        </p>
                    </div>

                    {clients.length === 0 ? (
                        <p className="border-t px-5 py-10 text-center text-sm text-muted-foreground">
                            {search
                                ? 'Nenhum cliente corresponde à busca.'
                                : 'Você ainda não cadastrou nenhum cliente.'}
                        </p>
                    ) : (
                        <div
                            className="overflow-x-auto"
                            data-tour="clients-table"
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="border-y bg-muted/60 text-[11px] tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            Cliente
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Telefone
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            E-mail
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Endereço
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {clients.map((client, index) => (
                                        <tr
                                            key={client.id}
                                            onClick={() => openProfile(client)}
                                            className="cursor-pointer transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-8">
                                                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                                            {getInitials(
                                                                client.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <button
                                                        type="button"
                                                        className="text-left font-medium hover:text-primary focus-visible:underline focus-visible:outline-hidden"
                                                        aria-label={`Abrir ficha de ${client.name}`}
                                                    >
                                                        {client.name}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {client.phone ?? '—'}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {client.email ?? '—'}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {client.address ?? '—'}
                                            </td>
                                            <td
                                                className="px-5 py-3"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                                data-tour={
                                                    index === 0
                                                        ? 'clients-row-actions'
                                                        : undefined
                                                }
                                            >
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8 rounded-lg bg-card text-muted-foreground hover:text-primary"
                                                        aria-label={`Editar ${client.name}`}
                                                        onClick={() =>
                                                            openEdit(client)
                                                        }
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8 rounded-lg bg-card text-muted-foreground hover:text-destructive"
                                                        aria-label={`Excluir ${client.name}`}
                                                        onClick={() =>
                                                            setDeletingClient(
                                                                client,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <ClientProfileSheet
                client={profileClient}
                open={profileOpen}
                onOpenChange={setProfileOpen}
                onEdit={openEdit}
            />

            <ClientFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                client={editingClient}
            />

            <DeleteClientDialog
                client={deletingClient}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingClient(null);
                    }
                }}
            />
        </>
    );
}

ClientsIndex.layout = {
    title: 'Clientes',
    description: 'Gerencie seus clientes em um só lugar',
};
