import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, STATUS_OPTS } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/admin/packages")({
  component: () => (
    <CrudPage title="الباقات" table="packages" defaults={{ status: "active", is_public: true, service_type: "internet", duration_days: 30 }} fields={[
      { key: "name", label: "اسم الباقة", required: true },
      { key: "provider", label: "الشركة", required: true },
      { key: "service_type", label: "النوع", type: "select", options: [{ value: "internet", label: "إنترنت" }, { value: "mobile", label: "موبايل" }, { value: "mixed", label: "مختلط" }] },
      { key: "gb", label: "جيجا", type: "number" },
      { key: "minutes", label: "دقائق", type: "number" },
      { key: "cost_price", label: "سعر التكلفة", type: "money" },
      { key: "selling_price", label: "سعر البيع", type: "money", required: true },
      { key: "duration_days", label: "المدة (يوم)", type: "number" },
      { key: "status", label: "الحالة", type: "status", options: STATUS_OPTS(["active", "inactive"]) },
      { key: "is_public", label: "ظاهرة للعامة", type: "select", options: [{ value: "true", label: "نعم" }, { value: "false", label: "لا" }], hideInTable: true },
      { key: "description", label: "الوصف", type: "textarea", hideInTable: true },
    ]} />
  ),
});
