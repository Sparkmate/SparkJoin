import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "#/components/theme-provider";
import { Button } from "#/components/ui/button";
import type { TRPCRouter } from "#/integrations/trpc/router";
import { getThemeServerFn } from "#/lib/theme";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto max-w-md text-balance text-sm text-muted-foreground sm:text-base">
          The page you are looking for doesn&apos;t exist or may have been
          moved.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="default"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = "/";
            }
          }}
        >
          Go back
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

interface MyRouterContext {
  queryClient: QueryClient;

  trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Join Sparkmate",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "Join Sparkmate",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "apple-touch-icon",
        href: "https://cdn.brandfetch.io/id0nvnoUuq/theme/light/symbol.svg?c=1bxkv1dyj3uktf70hkd0yurufsb0MtP0E4s",
      },
      {
        rel: "icon",
        href: "https://cdn.brandfetch.io/id0nvnoUuq/theme/light/symbol.svg?c=1bxkv1dyj3uktf70hkd0yurufsb0MtP0E4s",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
    scripts: [
      {
        src: "https://cdn.jsdelivr.net/npm/publicalbum@latest/embed-ui.min.js",
        async: true,
      },
    ],
  }),
  loader: () => getThemeServerFn(),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background">
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
        <Toaster
          toastOptions={{
            style: {
              backgroundColor: "var(--primary)",
              color: "var(--background)",
              border: "00.5px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "10px",
            },
            classNames: {
              description: "!text-background",
            },
          }}
        />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
