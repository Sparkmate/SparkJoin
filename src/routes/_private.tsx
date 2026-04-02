import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageNavigation } from "#/components/page-blocks/page-navigator";
import { navGroups } from "#/config/navigation";
import { useIsMobile } from "#/hooks/use-mobile";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/_private")({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user: session.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  const isContentPage = navGroups.some(
    (group) =>
      group.title !== "Dashboard & Metrics" &&
      group.title !== "Admin" &&
      group.items.some((item) => item.path === location.pathname)
  );

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }

    // Update page title
    let pageTitle = "Dashboard";
    if (location.pathname !== "/") {
      for (const group of navGroups) {
        if (group.title !== "Dashboard" && group.title !== "Admin") {
          const item = group.items.find((i) => i.path === location.pathname);
          if (item) {
            pageTitle = item.name;
            break;
          }
        }
        if (location.pathname === `/${group.title.toLowerCase()}`) {
          pageTitle = `${group.title} Overview`;
          break;
        }
      }
    }
    document.title = `${pageTitle} | Join Sparkmate`;
  }, [location.pathname]);

  useEffect(() => {
    setScrollProgress(0);
    const container = document.getElementById("app-main-scroll");
    if (!container || !isContentPage) return;

    const updateProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollableHeight = scrollHeight - clientHeight;
      if (scrollableHeight <= 0) {
        setScrollProgress(100);
        return;
      }
      setScrollProgress((scrollTop / scrollableHeight) * 100);
    };

    updateProgress();
    container.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      container.removeEventListener("scroll", updateProgress);
    };
  }, [isContentPage]);
  return (
    <div className="flex flex-col md:flex-row h-screen bg-brand-bg text-brand-light font-sans overflow-hidden">
      <main
        id="app-main-scroll"
        ref={mainRef}
        className="flex-1 overflow-y-auto"
      >
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {isMobile && (
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-brand-dark">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                </div>
              </header>
            )}

            <div>
              {isContentPage && (
                <div className="sticky top-0 left-0 w-full h-1 bg-brand-dark z-50">
                  <div
                    className="h-full bg-brand-primary transition-all duration-150 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
              )}
              <Outlet />
              <PageNavigation />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </main>
    </div>
  );
}
