import { router } from '@inertiajs/react';
import { useState } from 'react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
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
import type { Transaction } from '@/types';

type Props = {
    transaction: Transaction | null;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteTransactionDialog({
    transaction,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    function confirmDelete() {
        if (!transaction) {
            return;
        }

        router.delete(TransactionController.destroy.url(transaction), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={transaction !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir lançamento</DialogTitle>
                    <DialogDescription>
                        Tem certeza de que deseja excluir{' '}
                        <strong>{transaction?.description}</strong>? Esta ação
                        não pode ser desfeita.
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
                        data-test="confirm-delete-transaction-button"
                    >
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
