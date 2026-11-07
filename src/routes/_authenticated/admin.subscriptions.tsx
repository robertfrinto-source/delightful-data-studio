import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudPage, STATUS_OPTS, db, type Row } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/subscriptions")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const issueInvoice = async (s: Row) => {
    const period = new Date().toISOString().slice(0, 7);
    const due = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const { error } = await db.from("invoices").insert({ customer_id: s.customer_id, subscription_id: s.id, billing_period: period, amount: s.selling_price, due_date: due });
    if (error) return void toast.error(error.message);
    const next = new Date(s.renewal_date ?? Date.now()); next.setDate(next.getDate() + 30);
    await db.from("subscriptions").update({ renewal_date: next.toISOString().slice(0, 10) }).eq("id", s.id);
    toast.success("تم إصدار الفاتورة وتجديد تاريخ الاستحقاق");
    qc.invalidateQueries();
  };
  return (
    <CrudPage title="الاشتراكات" table="subscriptions" defaults={{ status: "active" }}
      actions={(r) => <Button size="sm" variant="outline" onClick={() => issueInvoice(r)}><FilePlus className="h-4 w-4" /> فاتورة</Button>}
      fields={[
        { key: "customer_id", label: "العميل", type: "ref", ref: { table: "customers", label: "full_name" }, required: true },
        { key: "line_id", label: "الخط", type: "ref", ref: { table: "lines", label: "number" } },
        { key: "package_id", label: "الباقة", type: "ref", ref: { table: "packages", label: "name" }, hideInTable: true },
        { key: "package_name", label: "اسم الباقة" },
        { key: "cost_price", label: "التكلفة", type: "money", hideInTable: true },
        { key: "selling_price", label: "السعر", type: "money" },
        { key: "start_date", label: "البداية", type: "date" },
        { key: "renewal_date", label: "التجديد", type: "date" },
        { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["active", "suspended", "expired", "cancelled"]) },
      ]} />
  );
}
