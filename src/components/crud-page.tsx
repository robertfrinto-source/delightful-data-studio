import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
export type Row = Record<string, any>;
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
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="w-56 pr-9" placeholder="بحث..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {canCreate && <Button onClick={() => setEditing({ ...defaults })}><Plus className="h-4 w-4" /> إضافة</Button>}
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{cols.map((f) => <TableHead key={f.key} className="text-right">{f.label}</TableHead>)}<TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={cols.length + 1} className="text-center text-muted-foreground">جارٍ التحميل...</TableCell></TableRow>}
            {!isLoading && rows.length === 0 && <TableRow><TableCell colSpan={cols.length + 1} className="py-10 text-center text-muted-foreground">لا توجد بيانات</TableCell></TableRow>}
            {rows.map((r) => (
              <TableRow key={r.id}>
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
