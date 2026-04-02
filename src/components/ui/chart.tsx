import * as React from "react";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
	string,
	{
		label?: string;
		color?: string;
	}
>;

type ChartContextType = {
	config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextType | null>(null);

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
	config: ChartConfig;
};

export function ChartContainer({
	config,
	className,
	children,
	...props
}: ChartContainerProps) {
	return (
		<ChartContext.Provider value={{ config }}>
			<div
				className={cn(
					"flex h-[320px] w-full items-center justify-center",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</ChartContext.Provider>
	);
}

export function useChartConfig() {
	const context = React.useContext(ChartContext);

	if (!context) {
		throw new Error("useChartConfig must be used within a ChartContainer");
	}

	return context;
}

type ChartTooltipProps = {
	active?: boolean;
	payload?: Array<{
		dataKey: string;
		value: number;
		color?: string;
	}>;
	label?: string;
};

export function ChartTooltipContent({
	active,
	payload,
	label,
}: ChartTooltipProps) {
	const { config } = useChartConfig();

	if (!active || !payload || payload.length === 0) {
		return null;
	}

	return (
		<div className="rounded-md border bg-background/95 px-3 py-2 text-sm shadow-md">
			{label ? <div className="mb-1 font-medium">{label}</div> : null}
			<div className="space-y-1">
				{payload
					.filter((item) => typeof item.value === "number")
					.map((item) => {
						const key = item.dataKey;
						const cfg = config[key] ?? {};

						return (
							<div
								key={key}
								className="flex items-center justify-between gap-4"
							>
								<span className="flex items-center gap-2">
									<span
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: item.color ?? cfg.color }}
									/>
									<span className="text-muted-foreground">
										{cfg.label ?? key}
									</span>
								</span>
								<span className="font-medium">
									{typeof item.value === "number"
										? item.value.toLocaleString("en-US", {
												maximumFractionDigits: 2,
											})
										: item.value}
								</span>
							</div>
						);
					})}
			</div>
		</div>
	);
}
