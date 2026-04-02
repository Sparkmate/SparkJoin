import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
	groups,
	pathname,
}: {
	groups: {
		title: string;
		path?: string;
		icon?: LucideIcon;
		items?: {
			name: string;
			path: string;
		}[];
	}[];
	pathname: string;
}) {
	const navigate = useNavigate();
	const { isMobile, setOpenMobile } = useSidebar();

	const findGroupForPath = React.useCallback(
		(path: string) =>
			groups.find((group) => {
				const groupPath = group.path ?? `/${group.title.toLowerCase()}`;
				return (
					path === groupPath ||
					(group.items?.some(
						(item) =>
							path === item.path ||
							(item.path !== "/" && path.startsWith(item.path)),
					) ??
						false)
				);
			}),
		[groups],
	);

	const [expandedGroup, setExpandedGroup] = React.useState<string | null>(
		() => {
			const current = findGroupForPath(pathname);
			return current?.title ?? null;
		},
	);

	const userCollapsed = React.useRef<string | null>(null);
	const prevPathname = React.useRef(pathname);
	React.useEffect(() => {
		if (prevPathname.current !== pathname) {
			prevPathname.current = pathname;
			userCollapsed.current = null;
			const current = findGroupForPath(pathname);
			if (current) {
				setExpandedGroup(current.title);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	const isGroupActive = (group: (typeof groups)[number]) => {
		const groupPath = group.path ?? `/${group.title.toLowerCase()}`;
		if (pathname === groupPath) return true;
		return (
			group.items?.some(
				(item) =>
					pathname === item.path ||
					(item.path !== "/" && pathname.startsWith(item.path)),
			) ?? false
		);
	};

	const handleGroupClick = (
		e: React.MouseEvent,
		group: (typeof groups)[number],
	) => {
		e.preventDefault();
		const hasItems = (group.items?.length ?? 0) > 0;
		const groupPath = group.path ?? `/${group.title.toLowerCase()}`;

		if (expandedGroup === group.title && hasItems) {
			userCollapsed.current = group.title;
			setExpandedGroup(null);
		} else {
			userCollapsed.current = null;
			setExpandedGroup(group.title);
			navigate({ to: groupPath });
		}
	};

	const handleSubmenuLinkClick = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<SidebarGroup>
			<SidebarMenu>
				{groups.map((group) => {
					const isExpanded = expandedGroup === group.title;
					const hasItems = (group.items?.length ?? 0) > 0;

					return (
						<Collapsible
							key={group.title}
							asChild
							open={isExpanded}
							onOpenChange={() => {}}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton
										tooltip={group.title}
										isActive={isGroupActive(group)}
										className={
											isGroupActive(group)
												? "border-l-2 border-brand-primary"
												: "border-l-2 border-transparent"
										}
										onClick={(e: React.MouseEvent) =>
											handleGroupClick(e, group)
										}
									>
										{group.icon && <group.icon />}
										<span>{group.title}</span>
										{hasItems &&
											(isExpanded ? (
												<ChevronDown className="ml-auto" />
											) : (
												<ChevronRight className="ml-auto" />
											))}
									</SidebarMenuButton>
								</CollapsibleTrigger>
								{hasItems && (
									<CollapsibleContent>
										<SidebarMenuSub>
											{group.items?.map((subItem) => (
												<SidebarMenuSubItem key={subItem.path}>
													<SidebarMenuSubButton
														isActive={pathname === subItem.path}
														className={
															pathname === subItem.path
																? "border-l-2 border-brand-primary"
																: "border-l-2 border-transparent"
														}
														asChild
													>
														<Link
															to={subItem.path}
															onClick={handleSubmenuLinkClick}
														>
															<span>{subItem.name}</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								)}
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
