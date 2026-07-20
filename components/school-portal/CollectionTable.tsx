"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, ChevronLeft, ChevronRight, Pencil, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "./notifications";

type RecordValue = string | number | boolean | string[] | Record<string, unknown> | null | undefined;
type DataRecord = Record<string, RecordValue>;

type Props<T extends object> = {
  title: string;
  description?: string;
  rows: T[];
  idKey?: keyof T;
  columns?: Array<keyof T>;
  onChange: (rows: T[]) => void;
};

const humanize = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const display = (value: RecordValue) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const badgeTone = (key: string, value: RecordValue) => {
  const normalized = display(value).toLowerCase();
  if (/rejected|failed|suspended|withdrawn|overdue|unpaid|on_hold|high/.test(normalized)) return "border-red-700 bg-red-50 text-red-700";
  if (/accepted|active|approved|completed|cleared|eligible|graduated|paid|passed|verified|published|yes/.test(normalized)) return "border-emerald-700 bg-emerald-50 text-emerald-800";
  if (/pending|new|planned|submitted|assigned|in_progress|partially_paid|upcoming|medium/.test(normalized)) return "border-amber-700 bg-amber-50 text-amber-800";
  if (/admin|student|website|whatsapp|staff|mpesa|bank|cash|pdf|video|link|policy/.test(normalized)) return "border-blue-700 bg-blue-50 text-blue-800";
  if (key.toLowerCase().includes("grade") && /d-|e|f/.test(normalized)) return "border-red-600 bg-red-50 text-red-600";
  return "border-zinc-500 bg-zinc-100 text-zinc-700";
};

const isBadgeField = (key: string, value: RecordValue) => {
  const normalizedKey = key.toLowerCase();
  return typeof value === "boolean" || ["status", "source", "role", "type", "priority", "grade", "kcsegrade", "eligibilitystatus", "paymentmethod", "targettype"].some((name) => normalizedKey.includes(name));
};

export default function CollectionTable<T extends object>({ title, description, rows, idKey = "id" as keyof T, columns, onChange }: Props<T>) {
  const { confirm, toast } = useNotifications();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<T | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const keys = useMemo(() => {
    if (columns?.length) return columns;
    const first = rows[0];
    return first ? Object.keys(first).filter((key) => key !== idKey).slice(0, 7) as Array<keyof T> : [];
  }, [columns, rows, idKey]);
  const filtered = useMemo(() => rows.filter((row) => Object.values(row).some((value) => display(value as RecordValue).toLowerCase().includes(search.toLowerCase()))), [rows, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => { if (page >= pageCount) setPage(pageCount - 1); }, [page, pageCount]);
  useEffect(() => { setPage(0); }, [search, pageSize]);

  const rowId = (row: T) => String(row[idKey] ?? JSON.stringify(row));
  const responsiveColumnClass = (index: number) => index < 2 ? "table-cell" : index === 2 ? "hidden sm:table-cell" : index === 3 ? "hidden md:table-cell" : index === 4 ? "hidden lg:table-cell" : "hidden xl:table-cell";
  const startEdit = (row: T) => {
    setEditing(row);
    setDraft(Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "")])));
  };
  const saveEdit = () => {
    if (!editing) return;
    const updated = { ...editing } as T;
    Object.entries(editing).forEach(([key, original]) => {
      const value = draft[key] ?? "";
      try {
        (updated as DataRecord)[key] = typeof original === "number" ? Number(value) : typeof original === "boolean" ? value === "true" : typeof original === "object" ? JSON.parse(value || "null") : value;
      } catch {
        (updated as DataRecord)[key] = value;
      }
    });
    onChange(rows.map((row) => rowId(row) === rowId(editing) ? updated : row));
    setEditing(null);
    toast("Record updated", { tone: "success", message: `${title} changes were saved to PostgreSQL.` });
  };
  const deleteSelected = async () => {
    if (!selected.size) return;
    if (!await confirm({ title: `Delete ${selected.size} record(s)?`, message: `The selected ${title.toLowerCase()} records will be removed from PostgreSQL.`, confirmLabel: "Delete selected", tone: "danger" })) return;
    onChange(rows.filter((row) => !selected.has(rowId(row))));
    setSelected(new Set());
    toast("Records deleted", { tone: "success", message: `${selected.size} record(s) removed.` });
  };
  const deleteOne = async (row: T) => {
    if (!await confirm({ title: "Delete this record?", message: `This ${title.toLowerCase()} record will be removed from PostgreSQL.`, confirmLabel: "Delete record", tone: "danger" })) return;
    onChange(rows.filter((item) => rowId(item) !== rowId(row)));
    toast("Record deleted", { tone: "success" });
  };

  return <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <header className="border-b-2 border-zinc-900 pb-3"><h3 className="text-base font-black uppercase tracking-wide">{title}</h3>{description && <p className="mt-1 text-[10px] font-bold uppercase text-zinc-400">{description}</p>}</header>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="h-10 w-full border-2 border-zinc-900 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400" /></label>
      <div className="flex items-center gap-2"><select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="h-10 border-2 border-zinc-900 bg-white px-2 text-xs font-black"><option value={5}>5 rows</option><option value={10}>10 rows</option><option value={25}>25 rows</option><option value={50}>50 rows</option></select><button type="button" disabled={!selected.size} onClick={deleteSelected} className="flex h-10 items-center gap-2 border-2 border-zinc-900 bg-red-600 px-3 text-xs font-black uppercase text-white disabled:opacity-30"><Trash2 size={14} /> Delete ({selected.size})</button></div>
    </div>
    <div className="w-full overflow-hidden rounded-sm border border-zinc-300 bg-white shadow-[0_4px_14px_rgba(24,24,27,0.08)]">
      <table className="w-full table-fixed border-collapse text-left"><thead className="border-b-2 border-zinc-900 bg-zinc-100"><tr><th className="w-10 p-2 sm:w-12 sm:p-3"><input type="checkbox" aria-label="Select visible rows" checked={visible.length > 0 && visible.every((row) => selected.has(rowId(row)))} onChange={(event) => setSelected((current) => { const next = new Set(current); visible.forEach((row) => event.target.checked ? next.add(rowId(row)) : next.delete(rowId(row))); return next; })} /></th>{keys.map((key, index) => <th key={String(key)} className={`${responsiveColumnClass(index)} truncate p-2 text-[9px] font-black uppercase tracking-wider text-zinc-500 sm:p-3 sm:text-[10px]`}>{humanize(String(key))}</th>)}<th className="w-24 p-2 text-right text-[9px] font-black uppercase tracking-wider sm:w-32 sm:p-3 sm:text-[10px] xl:w-52">Actions</th></tr></thead>
        <tbody className="divide-y divide-zinc-200 bg-white">{visible.map((row) => <motion.tr layout key={rowId(row)} className="hover:bg-yellow-50/60"><td className="p-2 sm:p-3"><input type="checkbox" aria-label={`Select ${rowId(row)}`} checked={selected.has(rowId(row))} onChange={(event) => setSelected((current) => { const next = new Set(current); event.target.checked ? next.add(rowId(row)) : next.delete(rowId(row)); return next; })} /></td>{keys.map((key, index) => { const field = String(key); const value = (row as Record<string, RecordValue>)[field]; const warningGrade = field.toLowerCase().includes("grade") && /d-|e|f/i.test(display(value)); return <td key={field} className={`${responsiveColumnClass(index)} overflow-hidden p-2 text-[11px] font-semibold text-zinc-700 sm:p-3 sm:text-xs`}>{isBadgeField(field, value) ? <span className={`inline-flex max-w-full items-center gap-1 truncate rounded-sm border px-1.5 py-1 font-mono text-[9px] font-black uppercase tracking-wide sm:px-2 sm:text-[10px] ${badgeTone(field, value)}`}>{warningGrade && <AlertTriangle size={11} />}{display(value)}</span> : <span className="block truncate" title={display(value)}>{display(value)}</span>}</td>; })}<td className="p-2 sm:p-3"><div className="flex items-center justify-end gap-1.5"><button type="button" title="Edit record" onClick={() => startEdit(row)} className="inline-flex h-8 items-center gap-1 rounded-sm border border-zinc-900 bg-yellow-400 px-2 text-[9px] font-black uppercase text-zinc-900 shadow-[1px_1px_0_#18181b] transition hover:bg-yellow-300"><Pencil size={12} /><span className="hidden xl:inline">Edit record</span></button><button type="button" title="Delete record" onClick={() => deleteOne(row)} className="inline-flex h-8 items-center gap-1 rounded-sm border border-red-700 bg-white px-2 text-[9px] font-black uppercase text-red-700 transition hover:bg-red-600 hover:text-white"><Trash2 size={12} /><span className="hidden xl:inline">Delete</span></button></div></td></motion.tr>)}{!visible.length && <tr><td colSpan={keys.length + 2} className="p-12 text-center text-xs font-black uppercase text-zinc-400">No matching records</td></tr>}</tbody>
      </table>
    </div>
    <footer className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between"><span className="font-bold text-zinc-500">Showing {visible.length} of {filtered.length} record(s)</span><div className="flex items-center gap-2"><button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="border-2 border-zinc-900 p-2 disabled:opacity-30"><ChevronLeft size={15} /></button><span className="font-black">Page {page + 1} of {pageCount}</span><button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)} className="border-2 border-zinc-900 p-2 disabled:opacity-30"><ChevronRight size={15} /></button></div></footer>
    <AnimatePresence>{editing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] flex items-center justify-center bg-zinc-950/65 p-4 backdrop-blur-sm" onMouseDown={() => setEditing(null)}><motion.div initial={{ scale: .95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .96, y: 10 }} onMouseDown={(event) => event.stopPropagation()} className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto border-4 border-zinc-900 bg-white p-5 shadow-[7px_7px_0_#18181b]"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-black uppercase">Edit {title} record</h3><p className="text-xs text-zinc-500">Changes persist to PostgreSQL after saving.</p></div><button type="button" onClick={() => setEditing(null)}><X size={20} /></button></div><div className="grid gap-4 sm:grid-cols-2">{Object.keys(editing).map((key) => { const record = editing as Record<string, RecordValue>; return <label key={key} className={typeof record[key] === "object" ? "sm:col-span-2" : ""}><span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-zinc-500">{humanize(key)}</span>{typeof record[key] === "object" ? <textarea rows={5} value={draft[key] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} className="w-full border-2 border-zinc-900 p-2 font-mono text-xs" /> : <input disabled={key === String(idKey)} value={draft[key] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} className="h-10 w-full border-2 border-zinc-900 px-2 text-sm disabled:bg-zinc-100" />}</label>; })}</div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="border-2 border-zinc-900 px-4 py-2 text-xs font-black uppercase">Cancel</button><button type="button" onClick={saveEdit} className="border-2 border-zinc-900 bg-zinc-900 px-4 py-2 text-xs font-black uppercase text-white">Save changes</button></div></motion.div></motion.div>}</AnimatePresence>
  </motion.section>;
}
