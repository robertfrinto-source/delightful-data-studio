import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, db, type Row } from "@/components/crud-page";
import { fmtDate, fmtMoney } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({ meta: [{ title: "حسابي — نظام الاشتراكات" }, { name: "description", content: "خطوطك وفواتيرك وطلباتك" }, { property: "og:title", content: "حسابي" }, { property: "og:description", content: "خطوطك وفواتيرك وطلباتك" }] }),
  component: Portal,
});

const KINDS = [{ value: "change_package", label: "تغيير باقة" }, { value: "extra", label: "إضافة جيجات/دقائق" }, { value: "suspend", label: "إيقاف خط" }, { value: "new_line", label: "خط جديد" }];

function Portal() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["portal"],
    queryFn: async () => {
      const { data: c } = await db.from("customers").select("*").maybeSingle();
      if (!c) return null;
      const [l, s, i, p, r, n, pk] = await Promise.all([
        db.from("lines").select("*").order("created_at"),
        db.from("subscriptions").select("*").order("created_at", { ascending: false }),
        db.from("invoices").select("*").order("created_at", { ascending: false }),
        db.from("payments").select("*").order("created_at", { ascending: false }),
        db.from("requests").select("*").order("created_at", { ascending: false }),
        db.from("notifications").select("*").order("created_at", { ascending: false }),
        db.from("packages").select("id,name,selling_price"),
      ]);
      return { c, lines: l.data ?? [], subs: s.data ?? [], invoices: i.data ?? [], payments: p.data ?? [], requests: r.data ?? [], notifs: n.data ?? [], packages: pk.data ?? [] } as Record<string, any>;
    },
  });
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); nav({ to: "/auth", replace: true }); };

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>;
  return (
    <div className="min-h-screen">
      <header className="bg-hero text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div><div className="text-sm opacity-70">مرحباً</div><h1 className="text-2xl font-bold">{data?.c?.full_name ?? "عميلنا العزيز"}</h1></div>
          <Button variant="secondary" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> خروج</Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        {!data ? (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">لم يتم ربط حسابك بعد بملف عميل. تواصل مع الإدارة وتأكد من تسجيل نفس البريد الإلكتروني.</div>
        ) : (
          <Tabs defaultValue="lines">
            <TabsList className="flex-wrap">
              <TabsTrigger value="lines">خطوطي</TabsTrigger>
              <TabsTrigger value="invoices">الفواتير</TabsTrigger>
              <TabsTrigger value="pay">دفع</TabsTrigger>
              <TabsTrigger value="requests">الطلبات</TabsTrigger>
              <TabsTrigger value="notifs">الإشعارات {data.notifs.filter((n: Row) => !n.is_read).length || ""}</TabsTrigger>
            </TabsList>
            <TabsContent value="lines" className="grid gap-4 pt-4 sm:grid-cols-2">
              {data.lines.length === 0 && <Empty />}
              {data.lines.map((l: Row) => (
                <div key={l.id} className="rounded-2xl border bg-card p-5 shadow-elegant">
                  <div className="flex justify-between"><span className="font-bold" dir="ltr">{l.number}</span><StatusBadge value={l.status} /></div>
                  <div className="mt-1 text-sm text-muted-foreground">{data.packages.find((p: Row) => p.id === l.package_id)?.name ?? "—"} • {l.line_type === "main" ? "رئيسي" : "فرعي"}</div>
                  {!!l.gb_total && <Usage label="الجيجا" used={l.gb_used} total={l.gb_total} />}
                  {!!l.minutes_total && <Usage label="الدقائق" used={l.minutes_used} total={l.minutes_total} />}
                </div>
              ))}
              {data.subs.map((s: Row) => (
                <div key={s.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex justify-between"><span className="font-bold">{s.package_name}</span><StatusBadge value={s.status} /></div>
                  <div className="mt-2 text-sm text-muted-foreground">{fmtMoney(s.selling_price)} • التجديد {fmtDate(s.renewal_date)}</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="invoices" className="space-y-2 pt-4">
              {data.invoices.length === 0 && <Empty />}
              {data.invoices.map((i: Row) => (
                <div key={i.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <div><div className="font-bold">{i.billing_period ?? "فاتورة"}</div><div className="text-sm text-muted-foreground">استحقاق {fmtDate(i.due_date)}</div></div>
                  <div className="text-left"><div className="font-bold">{fmtMoney(i.amount)}</div><div className="text-xs text-muted-foreground">مدفوع {fmtMoney(i.amount_paid)}</div></div>
                  <StatusBadge value={i.status} />
                </div>
              ))}
            </TabsContent>
            <TabsContent value="pay" className="pt-4"><PayForm customerId={data.c.id} invoices={data.invoices.filter((i: Row) => i.status !== "paid")} payments={data.payments} /></TabsContent>
            <TabsContent value="requests" className="pt-4"><RequestForm customerId={data.c.id} lines={data.lines} packages={data.packages} requests={data.requests} /></TabsContent>
            <TabsContent value="notifs" className="space-y-2 pt-4">
              {data.notifs.length === 0 && <Empty />}
              {data.notifs.map((n: Row) => (
                <div key={n.id} className={`rounded-xl border p-4 ${n.is_read ? "bg-card" : "bg-secondary"}`} onClick={async () => { if (!n.is_read) { await db.from("notifications").update({ is_read: true }).eq("id", n.id); qc.invalidateQueries({ queryKey: ["portal"] }); } }}>
                  <div className="font-bold">{n.title}</div><div className="text-sm text-muted-foreground">{n.message}</div><div className="mt-1 text-xs text-muted-foreground">{fmtDate(n.created_at)}</div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

const Empty = () => <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground sm:col-span-2">لا توجد بيانات</div>;

function Usage({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.min(100, (Number(used) / Number(total)) * 100);
  return (
    <div className="mt-3"><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span>{used ?? 0} / {total}</span></div><Progress value={pct} /></div>
  );
}

function PayForm({ customerId, invoices, payments }: { customerId: string; invoices: Row[]; payments: Row[] }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ invoice_id: invoices[0]?.id ?? "", amount: "", method: "vodafone_cash", reference: "" });
  const [file, setFile] = useState<File | null>(null);
  const m = useMutation({
    mutationFn: async () => {
      if (!Number(f.amount)) throw new Error("أدخل المبلغ");
      let receipt_path: string | null = null;
      if (file) {
        const { data: u } = await supabase.auth.getUser();
        receipt_path = `${u.user!.id}/${Date.now()}-${file.name}`;
        const up = await supabase.storage.from("receipts").upload(receipt_path, file);
        if (up.error) throw up.error;
      }
      const { error } = await db.from("payments").insert({ customer_id: customerId, invoice_id: f.invoice_id || null, amount: Number(f.amount), method: f.method, reference: f.reference, receipt_path });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("تم إرسال الدفعة للمراجعة"); setF({ ...f, amount: "", reference: "" }); setFile(null); qc.invalidateQueries({ queryKey: ["portal"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form className="space-y-3 rounded-2xl border bg-card p-5" onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
        <h3 className="font-bold">تسجيل دفعة</h3>
        <div className="space-y-1"><Label>الفاتورة</Label>
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={f.invoice_id} onChange={(e) => setF({ ...f, invoice_id: e.target.value })}>
            <option value="">—</option>{invoices.map((i) => <option key={i.id} value={i.id}>{i.billing_period} — {fmtMoney(Number(i.amount) - Number(i.amount_paid))}</option>)}
          </select></div>
        <div className="space-y-1"><Label>المبلغ</Label><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
        <div className="space-y-1"><Label>الطريقة</Label>
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>
            <option value="vodafone_cash">فودافون كاش</option><option value="instapay">إنستاباي</option><option value="bank">تحويل بنكي</option><option value="cash">نقدي</option>
          </select></div>
        <div className="space-y-1"><Label>رقم العملية</Label><Input value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></div>
        <div className="space-y-1"><Label>صورة الإيصال</Label><Input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        <Button type="submit" className="w-full" disabled={m.isPending}>إرسال</Button>
      </form>
      <div className="space-y-2">
        <h3 className="font-bold">مدفوعاتي</h3>
        {payments.map((p) => <div key={p.id} className="flex justify-between rounded-xl border bg-card p-3 text-sm"><span>{fmtMoney(p.amount)}</span><span>{fmtDate(p.created_at)}</span><StatusBadge value={p.status} /></div>)}
      </div>
    </div>
  );
}

function RequestForm({ customerId, lines, packages, requests }: { customerId: string; lines: Row[]; packages: Row[]; requests: Row[] }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ kind: "change_package", line_id: lines[0]?.id ?? "", requested_package_id: "", details: "" });
  const m = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("requests").insert({ customer_id: customerId, kind: f.kind, line_id: f.line_id || null, requested_package_id: f.requested_package_id || null, details: f.details });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("تم إرسال الطلب"); qc.invalidateQueries({ queryKey: ["portal"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const sel = "h-10 w-full rounded-md border bg-background px-3 text-sm";
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form className="space-y-3 rounded-2xl border bg-card p-5" onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
        <h3 className="font-bold">طلب جديد</h3>
        <div className="space-y-1"><Label>نوع الطلب</Label><select className={sel} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}</select></div>
        <div className="space-y-1"><Label>الخط</Label><select className={sel} value={f.line_id} onChange={(e) => setF({ ...f, line_id: e.target.value })}><option value="">—</option>{lines.map((l) => <option key={l.id} value={l.id}>{l.number}</option>)}</select></div>
        {f.kind === "change_package" && <div className="space-y-1"><Label>الباقة المطلوبة</Label><select className={sel} value={f.requested_package_id} onChange={(e) => setF({ ...f, requested_package_id: e.target.value })}><option value="">—</option>{packages.map((p) => <option key={p.id} value={p.id}>{p.name} — {fmtMoney(p.selling_price)}</option>)}</select></div>}
        <div className="space-y-1"><Label>تفاصيل</Label><Textarea value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} /></div>
        <Button type="submit" className="w-full" disabled={m.isPending}>إرسال</Button>
      </form>
      <div className="space-y-2">
        <h3 className="font-bold">طلباتي</h3>
        {requests.map((r) => <div key={r.id} className="rounded-xl border bg-card p-3 text-sm"><div className="flex justify-between"><span>{KINDS.find((k) => k.value === r.kind)?.label}</span><StatusBadge value={r.status} /></div>{r.admin_response && <div className="mt-1 text-muted-foreground">{r.admin_response}</div>}</div>)}
      </div>
    </div>
  );
}
