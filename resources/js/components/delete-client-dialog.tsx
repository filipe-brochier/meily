import { router } from '@inertiajs/react';
import { useState } from 'react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
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
import type { Client } from '@/types';

type Props = {
    client: Client | null;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteClientDialog({ client, onOpenChange }: Props) {
    const [processing, setProcessing] = useState(false);

    function confirmDelete() {
        if (!client) {
            return;
        }

        router.delete(ClientController.destroy.url(client), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={client !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir cliente</DialogTitle>
                    <DialogDescription>
                        Tem certeza de que deseja excluir{' '}
                        <strong>{client?.name}</strong>? Esta ação não pode ser
                        desfeita.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        disabled={processing}
                        onClick={confirmDelete}
                        data-test="confirm-delete-client-button"
                    >
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
