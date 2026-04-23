import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
	readContentPages,
	totalContentPages,
	progressPercentage,
}: {
	readContentPages: number;
	totalContentPages: number;
	progressPercentage: number;
}) {
	const navigate = useNavigate();
	const { user } = useRouteContext({ from: "/_private" });
	const { open } = useSidebar();
	const hue = (progressPercentage / 100) * 120;
	const progressColor = `hsl(${hue}, 80%, 50%)`;

	return (
		<SidebarMenu>
			<SidebarMenuItem className={clsx("px-2", !open ? "hidden" : "block")}>
				<div className="mb-2 flex items-center justify-between text-xs font-medium">
					<span className="text-sidebar-foreground/70">Reading Progress</span>
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
			<SidebarMenuItem>
				<SidebarMenuButton asChild size="lg">
					<Link to="/profile">
						<Avatar className="h-8 w-8 rounded-md">
							<AvatarImage
								src={user?.image ?? undefined}
								alt={user?.name ?? "User"}
								referrerPolicy="no-referrer"
								className="rounded-md object-cover"
							/>
							<AvatarFallback className="rounded-md">
								{user?.email?.charAt(0).toUpperCase() ?? "U"}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">
								{user?.name || "User"}
							</span>
							<p className="truncate text-xs">{user?.email}</p>
						</div>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
			<SidebarMenuItem>
				<SidebarMenuButton
					onClick={async () => {
						await authClient.signOut();
						navigate({ to: "/login" });
					}}
					className="cursor-pointer text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
				>
					<LogOut />
					<span>Sign Out</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
