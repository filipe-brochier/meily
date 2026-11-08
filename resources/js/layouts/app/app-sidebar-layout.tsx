import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useAppTour } from '@/hooks/use-app-tour';
import type { AppLayoutProps } from '@/types';

function AppSidebarLayoutContent({
    children,
    breadcrumbs = [],
    title,
    description,
}: AppLayoutProps) {
    const startTour = useAppTour();

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
