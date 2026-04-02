import { useQuery } from "@tanstack/react-query";
import { useRouteContext, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import { NavMain } from "#/components/nav/nav-main";
import { NavUser } from "#/components/nav/nav-user";
import { useTRPC } from "#/integrations/trpc/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { navGroups } from "@/config/navigation";
import { Button } from "./ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useRouteContext({ from: "/_private" });
  const trpc = useTRPC();
  const { data: readPagesData } = useQuery(trpc.user.getReadPages.queryOptions());
  const { toggleSidebar } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin =
    user?.email === "morgan@sparkmate.com" ||
    user?.email === "maxime@sparkmate.com" ||
    user?.email === "ampy@sparkmate.com" ||
    user?.email === "yago@sparkmate.com";

  const visibleGroups = React.useMemo(
    () => navGroups.filter((group) => group.title !== "Admin" || isAdmin),
    [isAdmin]
  );

  const contentPages = React.useMemo(
    () =>
      navGroups
        .filter(
          (group) =>
            group.title !== "Dashboard" && group.title !== "Admin"
        )
        .flatMap((group) => group.items),
    []
  );
  const totalContentPages = contentPages.length;
  const readContentPages =
    readPagesData?.pagesRead?.length ?? user?.pagesRead?.length ?? 0;

  const progressPercentage =
    totalContentPages > 0 ? (readContentPages / totalContentPages) * 100 : 0;

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
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={visibleGroups} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter className="border-t border-brand-dark">
        <NavUser
          readContentPages={readContentPages}
          totalContentPages={totalContentPages}
          progressPercentage={progressPercentage}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
