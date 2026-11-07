import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: () => (
    <CrudPage title="الإشعارات" table="notifications" fields={[
      { key: "customer_id", label: "العميل", type: "ref", ref: { table: "customers", label: "full_name" }, required: true },
      { key: "title", label: "العنوان", required: true },
      { key: "message", label: "الرسالة", type: "textarea" },
      { key: "created_at", label: "التاريخ", type: "date", hideInForm: true },
    ]} />
  ),
});
