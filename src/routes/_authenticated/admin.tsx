import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Users, Package, Phone, Repeat, FileText, Wallet, Inbox, UserPlus, Boxes, Bell, LogOut, Signal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user!.id, _role: "admin" });
    if (!ok) throw redirect({ to: "/portal" });
  },
  head: () => ({ meta: [{ title: "لوحة التحكم — نظام الاشتراكات" }, { name: "description", content: "إدارة النظام" }, { property: "og:title", content: "لوحة التحكم" }, { property: "og:description", content: "إدارة النظام" }] }),
  component: AdminLayout,
});

const GROUPS = [
  { title: "الرئيسية", items: [{ to: "/admin", label: "نظرة عامة", icon: LayoutDashboard }] },
  { title: "العملاء", items: [
    { to: "/admin/registrations", label: "طلبات الاشتراك", icon: UserPlus },
    { to: "/admin/customers", label: "العملاء", icon: Users },
    { to: "/admin/requests", label: "طلبات العملاء", icon: Inbox },
    { to: "/admin/notifications", label: "الإشعارات", icon: Bell },
  ] },
  { title: "الخدمات", items: [
    { to: "/admin/packages", label: "الباقات", icon: Package },
    { to: "/admin/lines", label: "الخطوط", icon: Phone },
    { to: "/admin/subscriptions", label: "الاشتراكات", icon: Repeat },
    { to: "/admin/inventory", label: "المخزون", icon: Boxes },
  ] },
  { title: "المالية", items: [
    { to: "/admin/invoices", label: "الفواتير", icon: FileText },
    { to: "/admin/payments", label: "المدفوعات", icon: Wallet },
  ] },
] as const;
const ALL = GROUPS.flatMap((g) => g.items);

function AdminLayout() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data: me } = useMe();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = [...ALL].reverse().find((n) => path === n.to || path.startsWith(n.to + "/")) ?? ALL[0];
  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };
  const email = me?.user.email ?? "";
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-68 shrink-0 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground md:flex" style={{ width: 264 }}>
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Signal className="h-5 w-5" /></div>
          <div><div className="font-display text-lg font-bold leading-none">اشتراكاتي</div><div className="mt-1 text-xs opacity-60">لوحة الإدارة</div></div>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider opacity-50">{g.title}</div>
              {g.items.map((n) => (
                <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/admin" }}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-80 transition-all hover:bg-sidebar-accent hover:opacity-100"
                  activeProps={{ className: "bg-sidebar-accent !opacity-100 text-sidebar-primary font-medium" }}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent font-bold uppercase">{email.charAt(0)}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-sm" dir="ltr">{email}</div><div className="text-xs opacity-60">مدير النظام</div></div>
            <button onClick={signOut} title="خروج" className="rounded-md p-2 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>لوحة التحكم</span><span>/</span><span className="font-medium text-foreground">{current.label}</span>
          </div>
          <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b bg-sidebar p-2 md:hidden">
          {ALL.map((n) => <Link key={n.to} to={n.to} className="whitespace-nowrap rounded px-3 py-1 text-xs text-sidebar-foreground" activeProps={{ className: "bg-sidebar-accent" }} activeOptions={{ exact: n.to === "/admin" }}>{n.label}</Link>)}
        </div>
        <main className="mx-auto max-w-7xl p-6 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
