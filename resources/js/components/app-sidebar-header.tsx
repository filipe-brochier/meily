import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

function formatToday(): string {
    const [weekday] = new Date()
        .toLocaleDateString('pt-BR', { weekday: 'long' })
        .split('-');
    const dayAndMonth = new Date().toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
    });

    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${dayAndMonth}`;
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-card px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
                {formatToday()}
            </span>
        </header>
    );
}
