import { router } from '@inertiajs/react';
import { useState } from 'react';
import EventController from '@/actions/App/Http/Controllers/EventController';
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
import type { CalendarEvent } from '@/types';

type Props = {
    event: CalendarEvent | null;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteEventDialog({ event, onOpenChange }: Props) {
    const [processing, setProcessing] = useState(false);

    function confirmDelete() {
        if (!event) {
            return;
        }

        router.delete(EventController.destroy.url(event), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={event !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir evento</DialogTitle>
                    <DialogDescription>
                        Tem certeza de que deseja excluir{' '}
                        <strong>{event?.title}</strong>? Esta ação não pode ser
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
                        data-test="confirm-delete-event-button"
                    >
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
