import { CircleHelp } from 'lucide-react';
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
    title,
    description,
    onStartTour,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    title?: string;
    description?: string;
    onStartTour?: () => void;
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-card px-4 transition-[width,height] ease-linear md:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 shrink-0" />
                {title ? (
                    <div className="flex min-w-0 flex-col">
                        <h1 className="truncate text-base leading-tight font-semibold">
                            {title}
                        </h1>
                        {description && (
                            <p className="hidden truncate text-xs text-muted-foreground sm:block">
                                {description}
                            </p>
                        )}
                    </div>
                ) : (
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onStartTour}
                    data-tour="tour-button"
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <CircleHelp className="size-4" />
                    <span className="hidden sm:inline">Tour guiado</span>
                </button>
                <span className="hidden text-xs text-muted-foreground md:block">
                    {formatToday()}
                </span>
            </div>
        </header>
    );
}
