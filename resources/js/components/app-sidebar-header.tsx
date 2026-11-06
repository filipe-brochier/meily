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
}: {
    breadcrumbs?: BreadcrumbItemType[];
    title?: string;
    description?: string;
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
            <span className="hidden shrink-0 text-xs text-muted-foreground md:block">
                {formatToday()}
            </span>
        </header>
    );
}
