import { router } from '@inertiajs/react';
import { useState } from 'react';
import OfferingController from '@/actions/App/Http/Controllers/OfferingController';
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
import type { Offering } from '@/types';

type Props = {
    offering: Offering | null;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteOfferingDialog({ offering, onOpenChange }: Props) {
    const [processing, setProcessing] = useState(false);

    function confirmDelete() {
        if (!offering) {
            return;
        }

        router.delete(OfferingController.destroy.url(offering), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={offering !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir item</DialogTitle>
                    <DialogDescription>
                        Tem certeza de que deseja excluir{' '}
                        <strong>{offering?.name}</strong>? Esta ação não pode
                        ser desfeita.
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
                        data-test="confirm-delete-offering-button"
                    >
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
