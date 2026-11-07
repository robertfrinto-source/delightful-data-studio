import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = !!roles?.some((r) => r.role === "admin");
      return { user, isAdmin };
    },
  });
}

export const fmtMoney = (n: number | null | undefined) =>
  `${Number(n ?? 0).toLocaleString("ar-EG")} ج.م`;
export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("ar-EG") : "—";

export const STATUS_AR: Record<string, string> = {
  active: "نشط", inactive: "غير نشط", suspended: "موقوف", expired: "منتهي", pending: "قيد المراجعة",
  approved: "مقبول", rejected: "مرفوض", verified: "مؤكد", paid: "مدفوعة", unpaid: "غير مدفوعة",
  partial: "مدفوعة جزئياً", available: "متاح", allocated: "مخصص", locked: "مقفول", cancelled: "ملغي",
};
