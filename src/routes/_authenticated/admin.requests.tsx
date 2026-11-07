import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudPage, STATUS_OPTS, db, type Row } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/requests")({ component: Page });

export const KINDS = [{ value: "change_package", label: "تغيير باقة" }, { value: "extra", label: "إضافة جيجات/دقائق" }, { value: "suspend", label: "إيقاف خط" }, { value: "new_line", label: "خط جديد" }];

function Page() {
  const qc = useQueryClient();
  const decide = async (r: Row, approve: boolean) => {
    const response = prompt("رد الإدارة (اختياري)") ?? "";
    if (approve && r.line_id) {
      if (r.kind === "change_package" && r.requested_package_id) {
        const { data: p } = await db.from("packages").select("*").eq("id", r.requested_package_id).single();
        await db.from("lines").update({ package_id: p.id, gb_total: p.gb, minutes_total: p.minutes }).eq("id", r.line_id);
        await db.from("subscriptions").update({ package_id: p.id, package_name: p.name, selling_price: p.selling_price, cost_price: p.cost_price }).eq("line_id", r.line_id).eq("status", "active");
      }
      if (r.kind === "suspend") {
        await db.from("lines").update({ status: "suspended" }).eq("id", r.line_id);
        await db.from("subscriptions").update({ status: "suspended" }).eq("line_id", r.line_id);
      }
    }
    const { error } = await db.from("requests").update({ status: approve ? "approved" : "rejected", admin_response: response, processed_at: new Date().toISOString() }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await db.from("notifications").insert({ customer_id: r.customer_id, title: approve ? "تم قبول طلبك" : "تم رفض طلبك", message: response });
    toast.success("تم"); qc.invalidateQueries();
  };
  return (
    <CrudPage title="طلبات العملاء" table="requests" canCreate={false}
      actions={(r) => r.status === "pending" && <>
        <Button size="icon" variant="ghost" onClick={() => decide(r, true)}><Check className="h-4 w-4 text-success" /></Button>
        <Button size="icon" variant="ghost" onClick={() => decide(r, false)}><X className="h-4 w-4 text-destructive" /></Button>
      </>}
      fields={[
        { key: "customer_id", label: "العميل", type: "ref", ref: { table: "customers", label: "full_name" } },
        { key: "kind", label: "النوع", type: "select", options: KINDS },
        { key: "line_id", label: "الخط", type: "ref", ref: { table: "lines", label: "number" } },
        { key: "requested_package_id", label: "الباقة المطلوبة", type: "ref", ref: { table: "packages", label: "name" } },
        { key: "details", label: "التفاصيل", type: "textarea" },
        { key: "created_at", label: "التاريخ", type: "date", hideInForm: true },
        { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["pending", "approved", "rejected"]) },
        { key: "admin_response", label: "الرد", type: "textarea", hideInTable: true },
      ]} />
  );
}
