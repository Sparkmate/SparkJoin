"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ImageWithSkeletonProps = Omit<
	React.ImgHTMLAttributes<HTMLImageElement>,
	"children" | "alt"
> & {
	alt: string;
	containerClassName?: string;
	wrapperClassName?: string;
	skeletonClassName?: string;
	fallback?: React.ReactNode;
};

function ImageWithSkeleton({
	containerClassName,
	wrapperClassName,
	skeletonClassName,
	className,
	onLoad,
	onError,
	fallback,
	alt,
	src,
	...props
}: ImageWithSkeletonProps) {
	const imgRef = React.useRef<HTMLImageElement | null>(null);
	const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(
		"loading",
	);

	React.useEffect(() => {
		if (!src) {
			setStatus("error");
			return;
		}

		setStatus("loading");
		const img = imgRef.current;
		if (!img) return;

		// If the image is already in cache, `onLoad` might not fire in some cases.
		// Checking `complete` + `naturalWidth` lets us hide the skeleton reliably.
		if (img.complete && img.naturalWidth > 0) {
			setStatus("loaded");
		}
	}, [src]);

	const showFallback = status === "error" && fallback != null;

	return (
		<div className={cn("relative overflow-hidden", containerClassName)}>
			<AnimatePresence>
				{status === "loading" ? (
					<motion.div
						key="image-skeleton"
						className={cn("absolute inset-0 z-10", skeletonClassName)}
						initial={{ opacity: 1 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
					>
						<Skeleton className="size-full" />
					</motion.div>
				) : null}
			</AnimatePresence>
			{showFallback ? (
				<div className="absolute inset-0 z-20">{fallback}</div>
			) : null}
			<motion.div
				className={cn("relative z-0", wrapperClassName)}
				initial={false}
				animate={{ opacity: status === "loading" ? 0 : 1 }}
				transition={{ duration: 0.25, ease: "easeOut" }}
			>
				<img
					ref={imgRef}
					className={cn("size-full", className)}
					alt={alt}
					onLoad={(event) => {
						setStatus("loaded");
						onLoad?.(event);
					}}
					onError={(event) => {
						setStatus("error");
						onError?.(event);
					}}
					src={src}
					{...props}
				/>
			</motion.div>
		</div>
	);
}

export { ImageWithSkeleton };
