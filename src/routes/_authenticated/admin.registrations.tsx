import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudPage, STATUS_OPTS, db, type Row } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/registrations")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const accept = async (r: Row) => {
    const { data: c, error } = await db.from("customers").insert({
      full_name: r.full_name, phone: r.phone, alt_phone: r.alt_phone, email: r.email, national_id: r.national_id,
      governorate: r.governorate, address: r.address, segment: r.segment,
    }).select().single();
    if (error) return toast.error(error.message);
    if (r.package_id) {
      const { data: p } = await db.from("packages").select("*").eq("id", r.package_id).single();
      if (p) {
        const renewal = new Date(Date.now() + p.duration_days * 864e5).toISOString().slice(0, 10);
        await db.from("subscriptions").insert({ customer_id: c.id, package_id: p.id, package_name: p.name, cost_price: p.cost_price, selling_price: p.selling_price, renewal_date: renewal });
      }
    }
    await db.from("registration_requests").update({ status: "approved", processed_at: new Date().toISOString() }).eq("id", r.id);
    toast.success("تم قبول الطلب وإنشاء العميل"); qc.invalidateQueries();
  };
  const reject = async (r: Row) => {
    const note = prompt("سبب الرفض") ?? "";
    await db.from("registration_requests").update({ status: "rejected", admin_note: note, processed_at: new Date().toISOString() }).eq("id", r.id);
    qc.invalidateQueries();
  };
  return (
    <CrudPage title="طلبات الاشتراك الجديدة" table="registration_requests" canCreate={false}
      actions={(r) => r.status === "pending" && <>
        <Button size="sm" variant="outline" onClick={() => accept(r)}><Check className="h-4 w-4 text-success" /> قبول</Button>
        <Button size="icon" variant="ghost" onClick={() => reject(r)}><X className="h-4 w-4 text-destructive" /></Button>
      </>}
      fields={[
        { key: "full_name", label: "الاسم" },
        { key: "phone", label: "الهاتف" },
        { key: "email", label: "البريد", hideInTable: true },
        { key: "governorate", label: "المحافظة" },
        { key: "national_id", label: "الرقم القومي", hideInTable: true },
        { key: "address", label: "العنوان", type: "textarea", hideInTable: true },
        { key: "package_id", label: "الباقة", type: "ref", ref: { table: "packages", label: "name" } },
        { key: "created_at", label: "التاريخ", type: "date", hideInForm: true },
        { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["pending", "approved", "rejected"]) },
        { key: "admin_note", label: "ملاحظة", type: "textarea", hideInTable: true },
      ]} />
  );
}
