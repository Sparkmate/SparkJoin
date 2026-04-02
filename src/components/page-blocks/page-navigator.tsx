import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Link,
  useLocation,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useState } from "react";
import { navGroups } from "../../config/navigation";
import { useTRPC } from "#/integrations/trpc/react";
import { Button } from "../ui/button";

export function PageNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useRouteContext({ from: "/_private" });
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const readPagesQueryOptions = trpc.user.getReadPages.queryOptions();
  const { data: readPagesData } = useQuery(readPagesQueryOptions);
  const [optimisticReadByPageId, setOptimisticReadByPageId] = useState<
    Record<string, boolean>
  >({});
  const toggleReadMutation = useMutation(
    trpc.user.togglePageRead.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData(readPagesQueryOptions.queryKey, data);
        router.invalidate();
      },
    })
  );
  const isUpdating = toggleReadMutation.isPending;

  // Find current group and item
  let currentGroup = null;
  let currentItemIndex = -1;

  for (const group of navGroups) {
    const index = group.items.findIndex((item) => item.path === currentPath);
    if (index !== -1) {
      currentGroup = group;
      currentItemIndex = index;
      break;
    }
  }

  // If we are not on a subsection page (e.g. Home, or Section Overview), don't show navigation
  // Section overviews have paths like /culture, /company, etc. which are not in group.items (group.items has /culture/vision)
  // Except Home which is '/' and is in group.items. We probably don't want this on Home.
  if (
    !currentGroup ||
    currentGroup.title === "Dashboard" ||
    currentGroup.title === "Admin"
  ) {
    return null;
  }

  const sectionPath = `/${currentGroup.title.toLowerCase()}`;
  const prevItem =
    currentItemIndex > 0 ? currentGroup.items[currentItemIndex - 1] : null;
  const nextItem =
    currentItemIndex < currentGroup.items.length - 1
      ? currentGroup.items[currentItemIndex + 1]
      : null;

  const leftLink = prevItem
    ? {
        path: prevItem.path,
        label: "Previous Page",
        title: prevItem.name,
      }
    : {
        path: sectionPath,
        label: "Back to",
        title: `${currentGroup.title} Overview`,
      };

  const rightLink = nextItem
    ? {
        path: nextItem.path,
        label: "Next Page",
        title: nextItem.name,
      }
    : prevItem
      ? {
          path: sectionPath,
          label: "Back to",
          title: `${currentGroup.title} Overview`,
        }
      : null;

  const currentPageId = currentGroup?.items[currentItemIndex]?.id;
  const isReadFromServer = currentPageId
    ? readPagesData?.pagesRead?.includes(currentPageId) ??
      user?.pagesRead?.includes(currentPageId) ??
      false
    : false;
  const isRead = currentPageId
    ? optimisticReadByPageId[currentPageId] ?? isReadFromServer
    : false;

  const toggleReadStatus = async () => {
    if (!user || isUpdating || !currentGroup?.items[currentItemIndex]?.id)
      return;

    const pageId = currentGroup.items[currentItemIndex].id;
    const nextRead = !isRead;

    setOptimisticReadByPageId((prev) => ({
      ...prev,
      [pageId]: nextRead,
    }));

    try {
      await toggleReadMutation.mutateAsync({
        pageId,
        read: nextRead,
      });
    } catch (error) {
      // Revert optimistic state if the server update fails.
      setOptimisticReadByPageId((prev) => {
        const next = { ...prev };
        delete next[pageId];
        return next;
      });
      console.error("Failed to update read status:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 md:px-8 md:pb-24 mt-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-brand-dark pt-8">
        <div className="flex-1 flex justify-start w-full sm:w-auto">
          <Link
            to={leftLink.path}
            className="group flex items-center gap-3 text-brand-gray hover:text-white transition-none w-full sm:w-auto"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center border border-brand-dark group-hover:border-brand-accent group-hover:bg-brand-surface transition-none">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono uppercase tracking-widest text-brand-accent mb-1">
                {leftLink.label}
              </div>
              <div className="font-bold uppercase tracking-tight font-title truncate">
                {leftLink.title}
              </div>
            </div>
          </Link>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex justify-center order-first sm:order-0 mb-2 sm:mb-0">
          <Button
            onClick={toggleReadStatus}
            disabled={isUpdating}
            className={`flex items-center justify-center gap-3 px-6 py-3 border transition-none font-mono text-xs uppercase tracking-widest w-full sm:w-auto disabled:opacity-80 ${
              isRead
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-brand-surface border-brand-dark text-brand-gray hover:text-white hover:border-brand-accent"
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : isRead ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Marked as Read</span>
              </>
            ) : (
              <>
                <Circle className="w-5 h-5" />
                <span>Mark as Read</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 flex justify-end w-full sm:w-auto">
          {rightLink ? (
            <Link
              to={rightLink.path}
              className="group flex items-center gap-3 text-left sm:text-right text-brand-gray hover:text-white transition-none w-full sm:w-auto sm:justify-end"
            >
              <div className="min-w-0 order-2 sm:order-1">
                <div className="text-xs font-mono uppercase tracking-widest text-brand-accent mb-1">
                  {rightLink.label}
                </div>
                <div className="font-bold uppercase tracking-tight font-title truncate">
                  {rightLink.title}
                </div>
              </div>
              <div className="w-10 h-10 shrink-0 flex items-center justify-center border border-brand-dark group-hover:border-brand-accent group-hover:bg-brand-surface transition-none order-1 sm:order-2">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      </div>
    </div>
  );
}
