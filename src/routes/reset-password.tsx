import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "إعادة تعيين كلمة المرور" }, { name: "description", content: "تعيين كلمة مرور جديدة" }, { property: "og:title", content: "إعادة تعيين كلمة المرور" }, { property: "og:description", content: "تعيين كلمة مرور جديدة" }] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const nav = useNavigate();
  const save = async () => {
    if (pw.length < 8) return void toast.error("8 أحرف على الأقل");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return void toast.error(error.message);
    toast.success("تم تحديث كلمة المرور");
    nav({ to: "/dashboard" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero p-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-8">
        <h1 className="text-xl font-bold">كلمة مرور جديدة</h1>
        <Input type="password" dir="ltr" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button className="w-full" onClick={save}>حفظ</Button>
      </div>
    </div>
  );
}
