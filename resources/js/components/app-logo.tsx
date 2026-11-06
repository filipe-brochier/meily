import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <AppLogoIcon className="size-9 shrink-0 group-data-[collapsible=icon]:size-8" />
            <div className="ml-1 grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-base font-semibold text-foreground capitalize">
                    {name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Gestão para MEI
                </span>
            </div>
        </>
    );
}
