import { usePage } from '@inertiajs/react';
import type { DriveStep } from 'driver.js';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useAppTour } from '@/hooks/use-app-tour';
import { usePageTour } from '@/hooks/use-page-tour';
import { pageTours } from '@/lib/page-tours';
import type { AppLayoutProps } from '@/types';

const EMPTY_STEPS: DriveStep[] = [];

function AppSidebarLayoutContent({
    children,
    breadcrumbs = [],
    title,
    description,
}: AppLayoutProps) {
    const startNavTour = useAppTour();
    const { component } = usePage();
    const pageTour = pageTours[component];
    const startPageTour = usePageTour(
        pageTour?.steps ?? EMPTY_STEPS,
        pageTour?.key ?? null,
    );
    const startTour = pageTour ? startPageTour : startNavTour;

    return (
        <>
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-clip bg-muted dark:bg-muted/40"
            >
                <AppSidebarHeader
                    breadcrumbs={breadcrumbs}
                    title={title}
                    description={description}
                    onStartTour={startTour}
                />
                {children}
            </AppContent>
        </>
    );
}

export default function AppSidebarLayout(props: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebarLayoutContent {...props} />
        </AppShell>
    );
}
