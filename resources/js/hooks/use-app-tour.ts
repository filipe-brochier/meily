import { usePage } from '@inertiajs/react';
import { driver } from 'driver.js';
import type { DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCallback, useEffect } from 'react';

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

export function useAppTour(): () => void {
    const userId = usePage().props.auth.user.id;
    const storageKey = `meily:tour-completed:${userId}`;

    const startTour = useCallback(() => {
        const availableSteps = steps.filter(
            (step) =>
                typeof step.element !== 'string' ||
                document.querySelector(step.element) !== null,
        );

        const tour = driver({
            steps: availableSteps,
            popoverClass: 'meily-tour',
            showProgress: true,
            progressText: '{{current}} de {{total}}',
            nextBtnText: 'Próximo',
            prevBtnText: 'Voltar',
            doneBtnText: 'Concluir',
            onDestroyed: () => localStorage.setItem(storageKey, '1'),
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
    }, [storageKey]);

    useEffect(() => {
        if (localStorage.getItem(storageKey) !== null) {
            return;
        }

        const timeout = window.setTimeout(startTour, 600);

        return () => window.clearTimeout(timeout);
    }, [startTour, storageKey]);

    return startTour;
}
