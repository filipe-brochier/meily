import { usePage } from '@inertiajs/react';
import { driver } from 'driver.js';
import type { DriveStep, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCallback, useEffect, useRef } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    navTourStorageKey,
    SIDEBAR_TRANSITION_MS,
    TOUR_POPOVER_OPTIONS,
} from '@/lib/page-tour';

const steps: DriveStep[] = [
    {
        popover: {
            title: 'Bem-vindo ao Meily! 👋',
            description:
                'Vamos fazer um tour rápido de 1 minuto para você conhecer o sistema.',
        },
    },
    {
        element: '[data-tour="nav-dashboard"]',
        popover: {
            title: 'Visão geral',
            description:
                'Seu painel com o resumo do negócio: faturamento, despesas e o que vem por aí.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="nav-clients"]',
        popover: {
            title: 'Clientes',
            description:
                'Cadastre seus clientes e consulte o perfil e o histórico de cada um.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="nav-offerings"]',
        popover: {
            title: 'Produtos e serviços',
            description:
                'Cadastre o que você vende, com categoria e preço, para agilizar seus lançamentos.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="nav-events"]',
        popover: {
            title: 'Agenda',
            description:
                'Organize atendimentos, entregas e compromissos para não esquecer nada.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="nav-transactions-create"]',
        popover: {
            title: 'Novo lançamento',
            description:
                'Registre uma venda (entrada) ou uma despesa (saída) em poucos segundos.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="nav-transactions-index"]',
        popover: {
            title: 'Histórico financeiro',
            description: 'Acompanhe todos os lançamentos que você já fez.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="tour-button"]',
        popover: {
            title: 'Pronto! 🎉',
            description:
                'Quando quiser rever este tour, é só clicar aqui. Bom uso!',
            side: 'bottom',
        },
    },
];

function isSidebarStep(step: DriveStep | undefined): boolean {
    return (
        typeof step?.element === 'string' &&
        step.element.startsWith('[data-tour="nav-')
    );
}

export function useAppTour(): () => void {
    const userId = usePage().props.auth.user.id;
    const storageKey = navTourStorageKey(userId);
    const { setOpenMobile } = useSidebar();
    const isMobile = useIsMobile();
    const isMobileRef = useRef(isMobile);

    useEffect(() => {
        isMobileRef.current = isMobile;
    }, [isMobile]);

    const startTour = useCallback(() => {
        const onMobile = isMobileRef.current;

        // No mobile, o menu fica fechado (e fora do DOM) até ser aberto pelo tour.
        const availableSteps = steps.filter(
            (step) =>
                typeof step.element !== 'string' ||
                (onMobile && isSidebarStep(step)) ||
                document.querySelector(step.element) !== null,
        );

        let isSwitchingSidebar = false;

        const moveTo = (activeTour: Driver, targetIndex: number) => {
            const currentStep =
                availableSteps[activeTour.getActiveIndex() ?? 0];
            const targetStep = availableSteps[targetIndex];

            if (
                !targetStep ||
                isSwitchingSidebar ||
                !onMobile ||
                isSidebarStep(currentStep) === isSidebarStep(targetStep)
            ) {
                if (targetStep && !isSwitchingSidebar) {
                    activeTour.moveTo(targetIndex);
                }

                return;
            }

            isSwitchingSidebar = true;
            setOpenMobile(isSidebarStep(targetStep));

            window.setTimeout(() => {
                isSwitchingSidebar = false;

                if (activeTour.isActive()) {
                    activeTour.moveTo(targetIndex);
                }
            }, SIDEBAR_TRANSITION_MS);
        };

        const tour = driver({
            steps: availableSteps,
            onNextClick: (_element, _step, { driver: activeTour }) => {
                if (activeTour.isLastStep()) {
                    activeTour.destroy();

                    return;
                }

                moveTo(activeTour, (activeTour.getActiveIndex() ?? 0) + 1);
            },
            onPrevClick: (_element, _step, { driver: activeTour }) => {
                moveTo(activeTour, (activeTour.getActiveIndex() ?? 0) - 1);
            },
            ...TOUR_POPOVER_OPTIONS,
            onDestroyed: () => {
                localStorage.setItem(storageKey, '1');
                setOpenMobile(false);
            },
            onPopoverRender: (popover, { driver: activeTour }) => {
                if (activeTour.isLastStep()) {
                    return;
                }

                const skipButton = document.createElement('button');
                skipButton.type = 'button';
                skipButton.textContent = 'Pular tour';
                skipButton.className = 'driver-popover-skip-btn';
                skipButton.addEventListener('click', () =>
                    activeTour.destroy(),
                );
                popover.wrapper.appendChild(skipButton);
            },
        });

        tour.drive();
    }, [storageKey, setOpenMobile]);

    useEffect(() => {
        if (localStorage.getItem(storageKey) !== null) {
            return;
        }

        const timeout = window.setTimeout(startTour, 600);

        return () => window.clearTimeout(timeout);
    }, [startTour, storageKey]);

    return startTour;
}
