import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, STATUS_OPTS } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  component: () => (
    <CrudPage title="الفواتير" table="invoices" defaults={{ status: "unpaid", amount_paid: 0 }} fields={[
      { key: "customer_id", label: "العميل", type: "ref", ref: { table: "customers", label: "full_name" }, required: true },
      { key: "billing_period", label: "الفترة" },
      { key: "amount", label: "المبلغ", type: "money", required: true },
      { key: "amount_paid", label: "المدفوع", type: "money" },
      { key: "due_date", label: "الاستحقاق", type: "date" },
      { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["unpaid", "partial", "paid", "cancelled"]) },
    ]} />
  ),
});
