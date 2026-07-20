"use client";

import { useMemo, useState, useTransition } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownUp, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime-local" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
};

type Option = { value: string; label: string };
type RowData = Record<string, string>;
type ServerAction = (formData: FormData) => Promise<void>;

type Props = {
  module: string;
  title: string;
  singularTitle: string;
  idColumn: string;
  badgeKey?: string;
  rows: RowData[];
  columns: { key: string; label: string }[];
  fields: Field[];
  options: Record<string, Option[]>;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createAction: ServerAction;
  updateAction: ServerAction;
  deleteAction: ServerAction;
};

function RecordForm({ fields, options, action, submitLabel }: { fields: Field[]; options: Record<string, Option[]>; action: ServerAction; submitLabel: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      action={(formData) => startTransition(async () => { await action(formData); router.refresh(); })}
    >
      {fields.map((field) => (
        <label key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{field.label}</span>
          {field.type === "textarea" ? (
            <textarea name={field.name} required={field.required} placeholder={field.placeholder} rows={4} className="portal-field resize-y" />
          ) : field.type === "select" ? (
            <select name={field.name} required={field.required} className="portal-field">
              <option value="">Select {field.label}</option>
              {(options[field.name] ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : (
            <Input name={field.name} required={field.required} type={field.type ?? "text"} placeholder={field.placeholder} />
          )}
        </label>
      ))}
      <div className="flex justify-end gap-3 border-t border-[hsl(var(--border))] pt-4 md:col-span-2">
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}

function RowActions({ row, module, idColumn, statusOptions, canEdit, canDelete, updateAction, deleteAction }: {
  row: RowData; module: string; idColumn: string; statusOptions: Option[]; canEdit: boolean; canDelete: boolean; updateAction: ServerAction; deleteAction: ServerAction;
}) {
  const id = row[idColumn];
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <div className="flex items-center justify-end gap-1">
      {module === "students" ? <Button type="button" size="icon" variant="ghost" title="Open student dashboard" onClick={() => router.push(`/portal/admin/students/${id}`)}><Eye className="h-4 w-4" /></Button> : null}
      {canEdit ? (
        <Dialog>
          <DialogTrigger asChild><Button size="icon" variant="ghost" title="Edit record"><Pencil className="h-4 w-4" /></Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Edit record</DialogTitle><DialogDescription>Update this record without leaving the table.</DialogDescription></DialogHeader>
            <form action={(formData) => startTransition(async () => { await updateAction(formData); router.refresh(); })} className="space-y-4">
              <input type="hidden" name="id" value={id} />
              <label><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Status</span>
                <select name="status" defaultValue={row.status ?? ""} className="portal-field" required>
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  {!statusOptions.some((option) => option.value === row.status) && row.status ? <option value={row.status}>{row.status}</option> : null}
                </select>
              </label>
              <div className="flex justify-end gap-3"><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button disabled={pending}>{pending ? "Updating…" : "Update"}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
      {canDelete ? (
        <Dialog>
          <DialogTrigger asChild><Button size="icon" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" title="Delete record"><Trash2 className="h-4 w-4" /></Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Delete record?</DialogTitle><DialogDescription>This action will remove or archive the selected record. It cannot always be undone.</DialogDescription></DialogHeader>
            <form action={(formData) => startTransition(async () => { await deleteAction(formData); router.refresh(); })} className="flex justify-end gap-3">
              <input type="hidden" name="id" value={id} />
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button variant="destructive" disabled={pending}>{pending ? "Deleting…" : "Delete"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

export default function AdminCrudTable(props: Props) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const statusOptions = props.options.status?.length ? props.options.status : [
    "active", "new", "under_review", "accepted", "rejected", "submitted", "in_progress",
    "approved", "published", "paid", "partially_paid", "completed", "archived",
  ].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));
  const columns = useMemo<ColumnDef<RowData>[]>(() => [
    ...props.columns.map((column): ColumnDef<RowData> => ({
      accessorKey: column.key,
      header: ({ column: tableColumn }) => <button type="button" className="flex items-center gap-2" onClick={() => tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc")}>{column.label}<ArrowDownUp className="h-3 w-3 opacity-50" /></button>,
      cell: ({ row }) => props.badgeKey === column.key
        ? <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">{row.original[column.key] || "-"}</span>
        : <span className="line-clamp-2 max-w-[280px]">{row.original[column.key] || "-"}</span>,
    })),
    { id: "actions", enableSorting: false, header: () => <span className="block text-right">Actions</span>, cell: ({ row }) => <RowActions row={row.original} module={props.module} idColumn={props.idColumn} statusOptions={statusOptions} canEdit={props.canEdit} canDelete={props.canDelete} updateAction={props.updateAction} deleteAction={props.deleteAction} /> },
  ], [props, statusOptions]);

  const table = useReactTable({ data: props.rows, columns, state: { globalFilter, sorting }, onGlobalFilterChange: setGlobalFilter, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 10 } } });

  return (
    <section className="portal-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[hsl(var(--border))] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><Input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder={`Search ${props.title.toLowerCase()}…`} className="pl-9" /></div>
        {props.canCreate ? <Dialog><DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add {props.singularTitle}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add {props.singularTitle}</DialogTitle><DialogDescription>Complete the form below. Related records can be selected from the available lists.</DialogDescription></DialogHeader><RecordForm fields={props.fields} options={props.options} action={props.createAction} submitLabel={`Create ${props.singularTitle}`} /></DialogContent></Dialog> : null}
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[760px]"><TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>{group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
          <TableBody>{table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}{table.getRowModel().rows.length === 0 ? <TableRow><TableCell colSpan={columns.length} className="h-28 text-center text-[hsl(var(--muted-foreground))]">No matching records.</TableCell></TableRow> : null}</TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-3"><p className="text-xs text-[hsl(var(--muted-foreground))]">{table.getFilteredRowModel().rows.length} record(s)</p><div className="flex items-center gap-2"><Button size="icon" variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft className="h-4 w-4" /></Button><span className="text-xs font-semibold">Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</span><Button size="icon" variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRight className="h-4 w-4" /></Button></div></div>
    </section>
  );
}
