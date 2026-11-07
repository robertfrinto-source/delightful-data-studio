import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Inbox, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STATUS_AR, fmtDate, fmtMoney } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = any;
export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "money" | "date" | "select" | "textarea" | "ref" | "status";
  options?: { value: string; label: string }[];
  ref?: { table: string; label: string };
  hideInTable?: boolean;
  hideInForm?: boolean;
  required?: boolean;
};

const db = supabase as any;

export function useRefOptions(table: string, label: string) {
  return useQuery({
    queryKey: ["ref", table, label],
    queryFn: async () => {
      const { data, error } = await db.from(table).select(`id, ${label}`).order(label).limit(1000);
      if (error) throw error;
      return (data as Row[]).map((r) => ({ value: r.id as string, label: String(r[label] ?? "") }));
    },
  });
}

export function StatusBadge({ value }: { value: string }) {
  const tone = ["active", "paid", "verified", "approved", "available"].includes(value)
    ? "bg-success/15 text-success"
    : ["pending", "partial", "unpaid"].includes(value)
      ? "bg-warning/20 text-accent-foreground"
      : "bg-destructive/15 text-destructive";
  return <Badge variant="outline" className={`border-0 ${tone}`}>{STATUS_AR[value] ?? value}</Badge>;
}

function RefCell({ f, id }: { f: Field; id: string }) {
  const { data = [] } = useRefOptions(f.ref!.table, f.ref!.label);
  return <>{data.find((o) => o.value === id)?.label ?? "—"}</>;
}

function Cell({ f, v }: { f: Field; v: any }) {
  if (v === null || v === undefined || v === "") return <span className="text-muted-foreground">—</span>;
  if (f.type === "money") return <>{fmtMoney(v)}</>;
  if (f.type === "date") return <>{fmtDate(v)}</>;
  if (f.type === "status") return <StatusBadge value={v} />;
  if (f.type === "select") return <>{f.options?.find((o) => o.value === v)?.label ?? v}</>;
  if (f.type === "ref") return <RefCell f={f} id={v} />;
  return <>{String(v)}</>;
}

function FieldInput({ f, value, onChange }: { f: Field; value: any; onChange: (v: any) => void }) {
  const refOpts = useRefOptions(f.ref?.table ?? "packages", f.ref?.label ?? "name");
  const opts = f.type === "ref" ? refOpts.data ?? [] : f.options ?? [];
  if (f.type === "select" || f.type === "ref" || f.type === "status")
    return (
      <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">—</option>
        {(f.type === "status" ? f.options ?? [] : opts).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  if (f.type === "textarea") return <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  return (
    <Input
      type={f.type === "number" || f.type === "money" ? "number" : f.type === "date" ? "date" : "text"}
      value={value ?? ""}
      onChange={(e) => onChange(f.type === "number" || f.type === "money" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
    />
  );
}

export function CrudPage({
  title, table, fields, defaults = {}, actions, canCreate = true, canEdit = true, filter, order = "created_at",
}: {
  title: string; table: string; fields: Field[]; defaults?: Row;
  actions?: (row: Row) => ReactNode; canCreate?: boolean; canEdit?: boolean;
  filter?: (q: any) => any; order?: string;
}) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      let query = db.from(table).select("*").order(order, { ascending: false }).limit(1000);
      if (filter) query = filter(query);
      const { data, error } = await query;
      if (error) throw error;
      return data as Row[];
    },
  });
  const rows = useMemo(() => {
    if (!q) return data;
    const s = q.toLowerCase();
    return data.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(s)));
  }, [data, q]);

  const save = useMutation({
    mutationFn: async (row: Row) => {
      for (const f of fields) if (f.required && (row[f.key] === undefined || row[f.key] === null || row[f.key] === "")) throw new Error(`حقل "${f.label}" مطلوب`);
      const payload: Row = {};
      for (const f of fields) if (!f.hideInForm && f.key in row) payload[f.key] = row[f.key] === "" ? null : row[f.key];
      const res = row.id ? await db.from(table).update(payload).eq("id", row.id) : await db.from(table).insert({ ...defaults, ...payload });
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("تم الحفظ"); setEditing(null); qc.invalidateQueries({ queryKey: [table] }); qc.invalidateQueries({ queryKey: ["ref", table] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await db.from(table).delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: [table] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const cols = fields.filter((f) => !f.hideInTable);
  const statusCounts = useMemo(() => {
    if (!fields.some((f) => f.key === "status")) return [];
    const m: Record<string, number> = {};
    data.forEach((r) => { if (r.status) m[r.status] = (m[r.status] ?? 0) + 1; });
    return Object.entries(m);
  }, [data, fields]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.length.toLocaleString("ar-EG")} سجل</p>
        </div>
        {canCreate && <Button size="lg" className="bg-gradient-primary shadow-elegant" onClick={() => setEditing({ ...defaults })}><Plus className="h-4 w-4" /> إضافة جديد</Button>}
      </div>
      {statusCounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {statusCounts.map(([s, n]) => (
            <button key={s} onClick={() => setQ(q === s ? "" : s)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${q === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>
              {STATUS_AR[s] ?? s} <span className="font-bold">{n}</span>
            </button>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b bg-muted/40 p-3">
          <div className="relative max-w-sm flex-1"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="bg-background pr-9" placeholder="ابحث في كل الحقول..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {q && <span className="text-xs text-muted-foreground">{rows.length} نتيجة</span>}
        </div>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30">{cols.map((f) => <TableHead key={f.key} className="whitespace-nowrap text-right text-xs font-bold uppercase text-muted-foreground">{f.label}</TableHead>)}<TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell colSpan={cols.length + 1}><div className="h-5 animate-pulse rounded bg-muted" /></TableCell></TableRow>)}
            {!isLoading && rows.length === 0 && (
              <TableRow><TableCell colSpan={cols.length + 1} className="py-16 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <div className="mt-3 font-medium">لا توجد بيانات بعد</div>
                <div className="text-sm text-muted-foreground">{canCreate ? "ابدأ بإضافة أول سجل" : "ستظهر السجلات هنا عند وصولها"}</div>
              </TableCell></TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id} className="transition-colors hover:bg-secondary/40">
                {cols.map((f) => <TableCell key={f.key}><Cell f={f} v={r[f.key]} /></TableCell>)}
                <TableCell className="whitespace-nowrap text-left">
                  <div className="flex justify-end gap-1">
                    {actions?.(r)}
                    {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>}
                    {canEdit && <Button size="icon" variant="ghost" onClick={() => confirm("تأكيد الحذف؟") && del.mutate(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "تعديل" : "إضافة"} — {title}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
              {fields.filter((f) => !f.hideInForm).map((f) => (
                <div key={f.key} className={`space-y-1 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
                  <Label>{f.label}{f.required && " *"}</Label>
                  <FieldInput f={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
                </div>
              ))}
              <Button type="submit" disabled={save.isPending} className="sm:col-span-2">حفظ</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const STATUS_OPTS = (keys: string[]) => keys.map((k) => ({ value: k, label: STATUS_AR[k] ?? k }));
export { db };
