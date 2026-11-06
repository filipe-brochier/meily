import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-3 py-0 group-data-[collapsible=icon]:px-2">
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-widest uppercase">
                Menu principal
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const isActive = isCurrentUrl(item.href);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                data-tour={item.tourId}
                                className="h-10 rounded-lg px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2!"
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span className="group-data-[collapsible=icon]:hidden">
                                        {item.title}
                                    </span>
                                    {isActive && (
                                        <ChevronRight className="ml-auto group-data-[collapsible=icon]:hidden" />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
