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

export default function CancelTransactionDialog({
    transaction,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    function confirmCancel() {
        if (!transaction) {
            return;
        }

        router.patch(
            TransactionController.update.url(transaction),
            { status: 'canceled' },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => onOpenChange(false),
            },
        );
    }

    return (
        <Dialog open={transaction !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancelar lançamento</DialogTitle>
                    <DialogDescription>
                        Tem certeza de que deseja cancelar{' '}
                        <strong>{transaction?.description}</strong>? Ele
                        continuará no histórico, mas deixará de contar no
                        saldo.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Voltar</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        disabled={processing}
                        onClick={confirmCancel}
                        data-test="confirm-cancel-transaction-button"
                    >
                        Cancelar lançamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
