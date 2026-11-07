import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Users, Repeat, Wallet, AlertCircle } from "lucide-react";
import { db } from "@/components/crud-page";
import { fmtMoney } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Overview });

function Overview() {
  const { data } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const [c, s, inv, pay, reg, req] = await Promise.all([
        db.from("customers").select("id", { count: "exact", head: true }),
        db.from("subscriptions").select("package_name,selling_price,cost_price,status"),
        db.from("invoices").select("amount,amount_paid,status,created_at"),
        db.from("payments").select("amount,status,created_at"),
        db.from("registration_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        db.from("requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return { customers: c.count ?? 0, subs: s.data ?? [], invoices: inv.data ?? [], payments: pay.data ?? [], pendingReg: reg.count ?? 0, pendingReq: req.count ?? 0 };
    },
  });
  if (!data) return <div className="text-muted-foreground">جارٍ التحميل...</div>;
  const active = data.subs.filter((s: any) => s.status === "active");
  const mrr = active.reduce((a: number, s: any) => a + Number(s.selling_price), 0);
  const profit = active.reduce((a: number, s: any) => a + Number(s.selling_price) - Number(s.cost_price), 0);
  const outstanding = data.invoices.reduce((a: number, i: any) => a + Number(i.amount) - Number(i.amount_paid), 0);
  const months: Record<string, number> = {};
  data.payments.filter((p: any) => p.status === "verified").forEach((p: any) => {
    const k = p.created_at.slice(0, 7); months[k] = (months[k] ?? 0) + Number(p.amount);
  });
  const revenue = Object.entries(months).sort().slice(-6).map(([m, v]) => ({ m, v }));
  const byPkg: Record<string, number> = {};
  active.forEach((s: any) => { byPkg[s.package_name ?? "—"] = (byPkg[s.package_name ?? "—"] ?? 0) + 1; });
  const pie = Object.entries(byPkg).map(([name, value]) => ({ name, value }));
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  const kpis = [
    { label: "العملاء", value: data.customers, icon: Users },
    { label: "اشتراكات نشطة", value: active.length, icon: Repeat },
    { label: "إيراد شهري متوقع", value: fmtMoney(mrr), sub: `ربح ${fmtMoney(profit)}`, icon: Wallet },
    { label: "مستحقات", value: fmtMoney(outstanding), sub: `${data.pendingReg} طلب اشتراك • ${data.pendingReq} طلب عميل`, icon: AlertCircle },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">نظرة عامة</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border bg-card p-5 shadow-elegant">
            <div className="flex items-center justify-between text-sm text-muted-foreground">{k.label}<k.icon className="h-4 w-4 text-primary" /></div>
            <div className="mt-2 text-2xl font-bold">{k.value}</div>
            {k.sub && <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>}
          </motion.div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 font-bold">التحصيل الشهري</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer><BarChart data={revenue}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="m" /><YAxis /><Tooltip /><Bar dataKey="v" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="mb-4 font-bold">الاشتراكات حسب الباقة</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>{pie.map((_, i) => <Cell key={i} fill={colors[i % 5]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
