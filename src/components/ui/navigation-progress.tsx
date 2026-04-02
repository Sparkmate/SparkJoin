import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function NavigationProgress() {
	const router = useRouterState();
	const isLoading = router.status === "pending";
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (isLoading) {
			setProgress(0);
			const interval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 90) return prev;
					return prev + Math.random() * 10;
				});
			}, 200);

			return () => clearInterval(interval);
		}

		// When loading completes, jump to 100% then fade out
		setProgress(100);
	}, [isLoading]);

	if (!isLoading && progress === 0) return null;

	return (
		<div
			className={cn(
				"fixed top-0 left-0 right-0 z-50 h-1 bg-primary transition-all duration-200 ease-out",
				progress === 100 && "opacity-0",
			)}
			style={{
				width: `${progress}%`,
				transition:
					progress === 100
						? "width 0.2s ease-out, opacity 0.5s ease-in 0.2s"
						: "width 0.2s ease-out",
			}}
		/>
	);
}
