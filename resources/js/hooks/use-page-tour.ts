import { usePage } from '@inertiajs/react';
import type { DriveStep } from 'driver.js';
import { useCallback, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import {
    navTourStorageKey,
    pageTourStorageKey,
    SIDEBAR_TRANSITION_MS,
    startPageTour,
} from '@/lib/page-tour';

/**
 * Tour guiado de uma página específica (ex.: Clientes, Agenda). Segue o
 * mesmo padrão do tour de navegação (`useAppTour`). No mobile, os elementos
 * alvo ficam no conteúdo da página, então o menu lateral (drawer) é fechado
 * antes de iniciar, caso esteja aberto, para não ficar na frente do tour.
 *
 * Só toca automaticamente depois que o usuário já viu o tour de navegação,
 * para não exibir dois tours em sequência no primeiro acesso.
 */
export function usePageTour(
    steps: DriveStep[],
    pageKey: string | null,
): () => void {
    const userId = usePage().props.auth.user.id;
    const storageKey = pageKey ? pageTourStorageKey(pageKey, userId) : null;
    const { openMobile, setOpenMobile } = useSidebar();

    const startTour = useCallback(() => {
        if (!storageKey) {
            return;
        }

        if (openMobile) {
            setOpenMobile(false);
            window.setTimeout(
                () => startPageTour(steps, storageKey),
                SIDEBAR_TRANSITION_MS,
            );

            return;
        }

        startPageTour(steps, storageKey);
    }, [openMobile, setOpenMobile, steps, storageKey]);

    useEffect(() => {
        if (!storageKey) {
            return;
        }

        if (localStorage.getItem(navTourStorageKey(userId)) === null) {
            return;
        }

        if (localStorage.getItem(storageKey) !== null) {
            return;
        }

        const timeout = window.setTimeout(startTour, 600);

        return () => window.clearTimeout(timeout);
    }, [startTour, storageKey, userId]);

    return startTour;
}
