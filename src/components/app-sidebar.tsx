import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouteContext, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import {
	Button,
	NavUser,
	ReleaseBadge,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@spkm/ui";
import { NavMain } from "#/components/nav/nav-main";
import { useTRPC } from "#/integrations/trpc/react";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";
import { navGroups } from "@/config/navigation";

const APP_RELEASE = {
	label: "SparkJoin",
	version: "2.0.0",
} as const;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user, role } = useRouteContext({ from: "/_private" });
	const navigate = useNavigate();
	const trpc = useTRPC();
	const { data: readPagesData } = useQuery(
		trpc.user.getReadPages.queryOptions(),
	);
	const { open, toggleSidebar } = useSidebar();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isAdmin = role === "admin";

	const visibleGroups = React.useMemo(
		() => navGroups.filter((group) => group.title !== "Admin" || isAdmin),
		[isAdmin],
	);

	const contentPages = React.useMemo(
		() =>
			navGroups
				.filter(
					(group) =>
						group.title !== "YOUR APPLICATION" && group.title !== "Admin",
				)
				.flatMap((group) => group.items),
		[],
	);
	const totalContentPages = contentPages.length;
	const readContentPages =
		readPagesData?.pagesRead?.length ?? user?.pagesRead?.length ?? 0;

	const progressPercentage =
		totalContentPages > 0 ? (readContentPages / totalContentPages) * 100 : 0;

	const hue = (progressPercentage / 100) * 120;
	const progressColor = `hsl(${hue}, 80%, 50%)`;

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader className="pt-4 ">
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
					className="w-full flex items-center justify-center px-2 py-2 cursor-pointer hover:border-none hover:bg-transparent"
				>
					<img
						src="https://cdn.brandfetch.io/id0nvnoUuq/theme/light/logo.svg?c=1bxkv1dyj3uktf70hkd0yurufsb0MtP0E4s"
						alt="Sparkmate Logo"
						className="h-6 object-contain group-data-[collapsible=icon]:hidden"
					/>
					<img
						src="https://cdn.brandfetch.io/id0nvnoUuq/theme/light/symbol.svg?c=1bxkv1dyj3uktf70hkd0yurufsb0MtP0E4s"
						alt="Sparkmate Symbol"
						className="hidden h-8 w-8 object-contain group-data-[collapsible=icon]:block"
					/>
				</Button>
				<div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
					<ReleaseBadge
						label={APP_RELEASE.label}
						version={APP_RELEASE.version}
					/>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain groups={visibleGroups} pathname={pathname} />
			</SidebarContent>
			<SidebarFooter className="border-t border-brand-dark">
				<SidebarMenu>
					<SidebarMenuItem className={cn("px-2", !open ? "hidden" : "block")}>
						<div className="mb-2 flex items-center justify-between text-xs font-medium">
							<span className="text-sidebar-foreground/70">
								Reading Progress
							</span>
							<span style={{ color: progressColor }}>
								{readContentPages} / {totalContentPages}
							</span>
						</div>
						<div className="h-1 w-full bg-sidebar-accent">
							<div
								className="h-full transition-all duration-300"
								style={{
									width: `${progressPercentage}%`,
									backgroundColor: progressColor,
								}}
							/>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
				<NavUser
					user={{
						name: user?.name,
						email: user?.email,
						image: user?.image,
					}}
					onProfileClick={() => navigate({ to: "/profile" })}
					onSignOut={async () => {
						await authClient.signOut();
						navigate({ to: "/login" });
					}}
				/>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
