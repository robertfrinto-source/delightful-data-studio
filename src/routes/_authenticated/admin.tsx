import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Users, Package, Phone, Repeat, FileText, Wallet, Inbox, UserPlus, Boxes, Bell, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user!.id, _role: "admin" });
    if (!ok) throw redirect({ to: "/portal" });
  },
  head: () => ({ meta: [{ title: "لوحة التحكم — نظام الاشتراكات" }, { name: "description", content: "إدارة النظام" }, { property: "og:title", content: "لوحة التحكم" }, { property: "og:description", content: "إدارة النظام" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { to: "/admin/registrations", label: "طلبات الاشتراك", icon: UserPlus },
  { to: "/admin/customers", label: "العملاء", icon: Users },
  { to: "/admin/packages", label: "الباقات", icon: Package },
  { to: "/admin/lines", label: "الخطوط", icon: Phone },
  { to: "/admin/subscriptions", label: "الاشتراكات", icon: Repeat },
  { to: "/admin/invoices", label: "الفواتير", icon: FileText },
  { to: "/admin/payments", label: "المدفوعات", icon: Wallet },
  { to: "/admin/requests", label: "طلبات العملاء", icon: Inbox },
  { to: "/admin/inventory", label: "المخزون", icon: Boxes },
  { to: "/admin/notifications", label: "الإشعارات", icon: Bell },
] as const;

function AdminLayout() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex">
        <div className="mb-6 px-2 font-display text-xl font-bold text-sidebar-primary">اشتراكاتي</div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/admin" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> خروج</button>
      </aside>
      <div className="flex-1">
        <div className="flex gap-2 overflow-x-auto border-b bg-sidebar p-2 md:hidden">
          {NAV.map((n) => <Link key={n.to} to={n.to} className="whitespace-nowrap rounded px-3 py-1 text-xs text-sidebar-foreground" activeProps={{ className: "bg-sidebar-accent" }} activeOptions={{ exact: n.to === "/admin" }}>{n.label}</Link>)}
        </div>
        <main className="mx-auto max-w-7xl p-6"><Outlet /></main>
      </div>
    </div>
  );
}
