import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage, STATUS_OPTS, db, type Row } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/payments")({ component: Page });

const METHODS = [{ value: "cash", label: "نقدي" }, { value: "vodafone_cash", label: "فودافون كاش" }, { value: "instapay", label: "إنستاباي" }, { value: "bank", label: "تحويل بنكي" }];

function Page() {
  const qc = useQueryClient();
  const setStatus = async (r: Row, status: string) => {
    const { error } = await db.from("payments").update({ status }).eq("id", r.id);
    if (error) return void toast.error(error.message);
    await db.from("notifications").insert({ customer_id: r.customer_id, title: status === "verified" ? "تم تأكيد دفعتك" : "تم رفض دفعتك", message: `مبلغ ${r.amount} ج.م` });
    toast.success("تم التحديث"); qc.invalidateQueries();
  };
  const openReceipt = async (path: string) => {
    const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 300);
    if (data) window.open(data.signedUrl, "_blank");
  };
  return (
    <CrudPage title="المدفوعات" table="payments" defaults={{ status: "verified", method: "cash" }}
      actions={(r) => (
        <>
          {r.receipt_path && <Button size="icon" variant="ghost" onClick={() => openReceipt(r.receipt_path)}><Paperclip className="h-4 w-4" /></Button>}
          {r.status === "pending" && <>
            <Button size="icon" variant="ghost" onClick={() => setStatus(r, "verified")}><Check className="h-4 w-4 text-success" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setStatus(r, "rejected")}><X className="h-4 w-4 text-destructive" /></Button>
          </>}
        </>
      )}
      fields={[
        { key: "customer_id", label: "العميل", type: "ref", ref: { table: "customers", label: "full_name" }, required: true },
        { key: "invoice_id", label: "الفاتورة", type: "ref", ref: { table: "invoices", label: "billing_period" } },
        { key: "amount", label: "المبلغ", type: "money", required: true },
        { key: "method", label: "الطريقة", type: "select", options: METHODS },
        { key: "reference", label: "رقم العملية" },
        { key: "created_at", label: "التاريخ", type: "date", hideInForm: true },
        { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["pending", "verified", "rejected"]) },
        { key: "admin_notes", label: "ملاحظات", type: "textarea", hideInTable: true },
      ]} />
  );
}
