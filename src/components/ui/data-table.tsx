import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onRowClick?: (row: TData) => void;
	enableRowSelection?: boolean;
	onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onRowClick,
	enableRowSelection = false,
	onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const lastSelectionKeyRef = useRef("");

	const columnsWithSelection: ColumnDef<TData, TValue>[] = enableRowSelection
		? [
				{
					id: "select",
					header: ({ table }) => (
						<Checkbox
							checked={
								table.getIsAllPageRowsSelected() ||
								(table.getIsSomePageRowsSelected() && "indeterminate")
							}
							onCheckedChange={(value) =>
								table.toggleAllPageRowsSelected(!!value)
							}
							aria-label="Select all"
						/>
					),
					cell: ({ row }) => (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							aria-label="Select row"
							onClick={(e) => e.stopPropagation()}
						/>
					),
					enableSorting: false,
					enableHiding: false,
				} as ColumnDef<TData, TValue>,
				...columns,
			]
		: columns;

	const table = useReactTable({
		data,
		columns: columnsWithSelection,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			rowSelection,
		},
		enableRowSelection: enableRowSelection,
	});

	// Notify parent component when selection changes
	useEffect(() => {
		if (!enableRowSelection || !onRowSelectionChange) return;

		const selectedRowIds = Object.keys(rowSelection)
			.filter((rowId) => rowSelection[rowId])
			.sort();
		const nextSelectionKey = selectedRowIds.join(",");
		if (lastSelectionKeyRef.current === nextSelectionKey) return;
		lastSelectionKeyRef.current = nextSelectionKey;

		const selectedRows = selectedRowIds
			.map((rowId) => data[Number(rowId)])
			.filter((row): row is TData => row !== undefined);

		onRowSelectionChange(selectedRows);
	}, [data, enableRowSelection, onRowSelectionChange, rowSelection]);

	return (
		<div className="h-full min-h-0">
			<div className="h-full min-h-0 rounded-md border max-w-[95vw] md:max-w-[calc(100vw-var(--sidebar-width)-4rem)]">
				<Table containerClassName="h-full overflow-auto">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort();
									const sortDirection = header.column.getIsSorted();

									return (
										<TableHead
											key={header.id}
											className="sticky top-0 z-10 bg-background"
										>
											{header.isPlaceholder ? null : canSort ? (
												<Button
													variant="ghost"
													size="sm"
													className="-ml-3 h-8 data-[state=open]:bg-accent"
													onClick={() => {
														const currentSort = header.column.getIsSorted();
														if (currentSort === "asc") {
															header.column.toggleSorting(true);
														} else if (currentSort === "desc") {
															header.column.clearSorting();
														} else {
															header.column.toggleSorting(false);
														}
													}}
												>
													<span>
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
													</span>
													{sortDirection === "asc" ? (
														<ArrowUp className="ml-2 h-4 w-4" />
													) : sortDirection === "desc" ? (
														<ArrowDown className="ml-2 h-4 w-4" />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</Button>
											) : (
												flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className={onRowClick ? "cursor-pointer" : undefined}
									onClick={
										onRowClick ? () => onRowClick(row.original) : undefined
									}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
