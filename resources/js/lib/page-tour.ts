import { driver } from 'driver.js';
import type { DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Opções de popover compartilhadas por todos os tours guiados do app, para
 * manter o mesmo visual e os mesmos textos em português do tour de navegação.
 */
export const TOUR_POPOVER_OPTIONS = {
    popoverClass: 'meily-tour',
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo',
    prevBtnText: 'Voltar',
    doneBtnText: 'Concluir',
} as const;

/** Duração da transição do Sheet do menu lateral no mobile (ver sidebar.tsx). */
export const SIDEBAR_TRANSITION_MS = 550;

export function navTourStorageKey(userId: number): string {
    return `meily:tour-completed:${userId}`;
}

export function pageTourStorageKey(pageKey: string, userId: number): string {
    return `meily:tour-completed:${pageKey}:${userId}`;
}

/**
 * Um elemento "existe" mas pode estar oculto via classes responsivas
 * (ex.: `hidden md:block`). Verificamos se ele realmente ocupa espaço na
 * tela antes de usá-lo como alvo de um passo do tour.
 */
export function isTourElementVisible(selector: string): boolean {
    const element = document.querySelector(selector);

    return element !== null && element.getClientRects().length > 0;
}

function addSkipButton(
    popover: { wrapper: HTMLElement },
    isLastStep: boolean,
    onSkip: () => void,
): void {
    if (isLastStep) {
        return;
    }

    const skipButton = document.createElement('button');
    skipButton.type = 'button';
    skipButton.textContent = 'Pular tour';
    skipButton.className = 'driver-popover-skip-btn';
    skipButton.addEventListener('click', onSkip);
    popover.wrapper.appendChild(skipButton);
}

/**
 * Inicia um tour guiado "simples" (sem a lógica especial de abrir/fechar o
 * menu lateral usada pelo tour de navegação). Filtra passos cujo elemento
 * não existe ou não está visível, e marca a conclusão no localStorage.
 */
export function startPageTour(steps: DriveStep[], storageKey: string): void {
    const availableSteps = steps.filter(
        (step) =>
            typeof step.element !== 'string' ||
            isTourElementVisible(step.element),
    );

    if (availableSteps.length === 0) {
        return;
    }

    const tour = driver({
        steps: availableSteps,
        ...TOUR_POPOVER_OPTIONS,
        onDestroyed: () => {
            localStorage.setItem(storageKey, '1');
        },
        onPopoverRender: (popover, { driver: activeTour }) => {
            addSkipButton(popover, activeTour.isLastStep(), () =>
                activeTour.destroy(),
            );
        },
    });

    tour.drive();
}
