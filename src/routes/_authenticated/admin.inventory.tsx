import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, STATUS_OPTS } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  component: () => (
    <CrudPage title="مخزون الأرقام" table="inventory_numbers" defaults={{ status: "available", kind: "primary" }} fields={[
      { key: "number", label: "الرقم", required: true },
      { key: "company", label: "الشركة", required: true },
      { key: "kind", label: "النوع", type: "select", options: [{ value: "primary", label: "رئيسي" }, { value: "subsidiary", label: "فرعي" }, { value: "search", label: "بحث" }] },
      { key: "gb_quota", label: "حصة الجيجا", type: "number" },
      { key: "minutes_quota", label: "حصة الدقائق", type: "number" },
      { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["available", "allocated", "locked"]) },
      { key: "notes", label: "ملاحظات", type: "textarea", hideInTable: true },
    ]} />
  ),
});
