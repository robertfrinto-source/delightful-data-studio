import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, STATUS_OPTS } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/lines")({
  component: () => (
    <CrudPage title="الخطوط" table="lines" defaults={{ status: "active", line_type: "main" }} fields={[
      { key: "number", label: "الرقم", required: true },
      { key: "customer_id", label: "العميل", type: "ref", ref: { table: "customers", label: "full_name" } },
      { key: "line_type", label: "النوع", type: "select", options: [{ value: "main", label: "رئيسي" }, { value: "sub", label: "فرعي" }] },
      { key: "parent_line_id", label: "الخط الرئيسي", type: "ref", ref: { table: "lines", label: "number" }, hideInTable: true },
      { key: "provider", label: "الشركة" },
      { key: "package_id", label: "الباقة", type: "ref", ref: { table: "packages", label: "name" } },
      { key: "gb_total", label: "جيجا كلي", type: "number" },
      { key: "gb_used", label: "جيجا مستهلك", type: "number" },
      { key: "minutes_total", label: "دقائق كلي", type: "number", hideInTable: true },
      { key: "minutes_used", label: "دقائق مستهلكة", type: "number", hideInTable: true },
      { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["active", "suspended", "inactive"]) },
      { key: "notes", label: "ملاحظات", type: "textarea", hideInTable: true },
    ]} />
  ),
});
