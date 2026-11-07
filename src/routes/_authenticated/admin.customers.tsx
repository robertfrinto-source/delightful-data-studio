import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, STATUS_OPTS } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: () => (
    <CrudPage title="العملاء" table="customers" defaults={{ status: "active" }} fields={[
      { key: "full_name", label: "الاسم", required: true },
      { key: "phone", label: "الهاتف", required: true },
      { key: "alt_phone", label: "هاتف بديل", hideInTable: true },
      { key: "email", label: "البريد" },
      { key: "national_id", label: "الرقم القومي", hideInTable: true },
      { key: "governorate", label: "المحافظة" },
      { key: "segment", label: "الشريحة", hideInTable: true },
      { key: "address", label: "العنوان", type: "textarea", hideInTable: true },
      { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["active", "suspended", "inactive"]) },
      { key: "user_id", label: "حساب مرتبط", hideInForm: true, hideInTable: true },
      { key: "notes", label: "ملاحظات", type: "textarea", hideInTable: true },
    ]} />
  ),
});
