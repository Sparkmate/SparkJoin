import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
	value?: Date | null;
	onChange?: (date: Date | undefined) => void;
	disabled?: boolean;
	placeholder?: string;
}

export function DatePicker({
	value,
	onChange,
	disabled,
	placeholder,
}: DatePickerProps) {
	const [internalDate, setInternalDate] = React.useState<Date | undefined>(
		value ?? undefined,
	);

	React.useEffect(() => {
		setInternalDate(value ?? undefined);
	}, [value]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					type="button"
					disabled={disabled}
					data-empty={!internalDate}
					className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{internalDate ? (
						format(internalDate, "PPP")
					) : (
						<span>{placeholder ?? "Pick a date"}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={internalDate}
					onSelect={(date: Date | undefined) => {
						setInternalDate((current) => {
							if (!date) {
								onChange?.(undefined);
								return undefined;
							}

							// Preserve existing time when changing the day
							const base = current ?? new Date();
							const next = new Date(date);
							next.setHours(
								base.getHours(),
								base.getMinutes(),
								base.getSeconds(),
								base.getMilliseconds(),
							);

							onChange?.(next);
							return next;
						});
					}}
				/>
				<div className="border-t px-3 py-2">
					<input
						type="time"
						disabled={disabled}
						className="h-8 w-full rounded-md border bg-background px-2 text-sm shadow-sm"
						value={internalDate ? format(internalDate, "HH:mm") : ""}
						onChange={(e) => {
							const [hoursStr, minutesStr] = e.target.value.split(":");
							const hours = Number(hoursStr);
							const minutes = Number(minutesStr);
							if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

							setInternalDate((current) => {
								const base = current ?? new Date();
								const next = new Date(base);
								next.setHours(hours, minutes, 0, 0);
								onChange?.(next);
								return next;
							});
						}}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
