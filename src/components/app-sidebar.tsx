import { useRouteContext } from "@tanstack/react-router";
import type * as React from "react";
import { DownloadDataRoomButton } from "@/components/blocks/download-data-room-button";
import { WhatsNewSidebarCard } from "@/components/blocks/whats-new-sidebar-card";
import { NavMain } from "@/components/nav/nav-main";
import { NavUser } from "@/components/nav/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navMain } from "@/config/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const { user } = useRouteContext({ from: "/_private" });
  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              onClick={() => toggleSidebar()}
              className="cursor-pointer"
            >
              <div>
                <div className=" text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img
                    src="/logo-yellow.svg"
                    alt="Sparkmate"
                    className="size-6"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sparkmate Hub</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain.filter((item) => !item.hidden)} />
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-4 items-stretch">
        <WhatsNewSidebarCard />
        <DownloadDataRoomButton
          variant="secondary"
          label="Download Financial Models"
        />
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
