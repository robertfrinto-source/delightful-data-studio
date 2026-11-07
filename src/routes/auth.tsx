import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — نظام الاشتراكات" },
      { name: "description", content: "سجّل دخولك لمتابعة اشتراكاتك وفواتيرك." },
      { property: "og:title", content: "تسجيل الدخول — نظام الاشتراكات" },
      { property: "og:description", content: "سجّل دخولك لمتابعة اشتراكاتك." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return void toast.error("بيانات الدخول غير صحيحة");
    nav({ to: "/dashboard" });
  };
  const signUp = async () => {
    if (password.length < 8) return void toast.error("كلمة المرور 8 أحرف على الأقل");
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } } });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("تم إنشاء الحساب. راجع بريدك لتأكيد الحساب.");
  };
  const reset = async () => {
    if (!email) return void toast.error("اكتب بريدك أولاً");
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
    toast.success("أرسلنا رابط إعادة التعيين إلى بريدك");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-elegant">
        <Link to="/" className="font-display text-2xl font-bold text-primary">اشتراكاتي</Link>
        <Tabs defaultValue="in" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="in">دخول</TabsTrigger>
            <TabsTrigger value="up">حساب جديد</TabsTrigger>
          </TabsList>
          <TabsContent value="in" className="space-y-4 pt-4">
            <div className="space-y-1"><Label>البريد الإلكتروني</Label><Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1"><Label>كلمة المرور</Label><Input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button className="w-full" disabled={busy} onClick={signIn}>دخول</Button>
            <button className="text-sm text-muted-foreground underline" onClick={reset}>نسيت كلمة المرور؟</button>
          </TabsContent>
          <TabsContent value="up" className="space-y-4 pt-4">
            <div className="space-y-1"><Label>الاسم</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1"><Label>البريد الإلكتروني</Label><Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1"><Label>كلمة المرور</Label><Input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <p className="text-xs text-muted-foreground">استخدم نفس البريد المسجل لدينا ليتم ربط حسابك ببياناتك تلقائياً.</p>
            <Button className="w-full" disabled={busy} onClick={signUp}>إنشاء حساب</Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
