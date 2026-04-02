import {
	createFileRoute,
	Outlet,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { getSession } from "@/lib/auth.functions";
import { usePageTracking } from "@/lib/analytics-tracker";

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
	const { user } = useRouteContext({ from: "/_private" });
	const posthog = usePostHog();
	
	// Track page visits for analytics
	usePageTracking();

	useEffect(() => {
		if (!posthog || !user?.email) return;

		posthog.identify(user.email, {
			email: user.email,
			name: user.name,
			role: user.role,
		});
	}, [posthog, user?.email, user?.name, user?.role]);

	return <Outlet />;
}
