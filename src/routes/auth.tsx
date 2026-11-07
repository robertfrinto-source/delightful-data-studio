import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Signal, ShieldCheck, Gauge, Receipt } from "lucide-react";
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-hero p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 grid-pattern" />
        <Link to="/" className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Signal className="h-5 w-5" /></div>
          <span className="font-display text-2xl font-bold">اشتراكاتي</span>
        </Link>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight">كل اشتراكاتك<br /><span className="text-accent">في مكان واحد</span></h2>
          {[{ i: Gauge, t: "تابع استهلاك الجيجات والدقائق لحظياً" }, { i: Receipt, t: "ادفع فواتيرك وارفع الإيصال أونلاين" }, { i: ShieldCheck, t: "بياناتك محمية ومشفرة" }].map(({ i: I, t }) => (
            <div key={t} className="flex items-center gap-3 opacity-90"><div className="rounded-lg bg-primary-foreground/10 p-2"><I className="h-5 w-5" /></div>{t}</div>
          ))}
        </div>
        <div className="relative text-sm opacity-50">© {new Date().getFullYear()} اشتراكاتي</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold">أهلاً بك 👋</h1>
          <p className="mt-2 text-muted-foreground">سجّل دخولك أو أنشئ حساباً جديداً للمتابعة</p>
          <Tabs defaultValue="in" className="mt-8">
            <TabsList className="grid h-11 w-full grid-cols-2">
              <TabsTrigger value="in">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="up">حساب جديد</TabsTrigger>
            </TabsList>
            <TabsContent value="in" className="space-y-4 pt-6">
              <div className="space-y-2"><Label>البريد الإلكتروني</Label><Input className="h-11" type="email" dir="ltr" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label>كلمة المرور</Label><button type="button" className="text-xs text-primary hover:underline" onClick={reset}>نسيت كلمة المرور؟</button></div>
                <Input className="h-11" type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && signIn()} />
              </div>
              <Button size="lg" className="w-full bg-gradient-primary shadow-elegant" disabled={busy} onClick={signIn}>{busy ? "جارٍ الدخول..." : "دخول"}</Button>
            </TabsContent>
            <TabsContent value="up" className="space-y-4 pt-6">
              <div className="space-y-2"><Label>الاسم الكامل</Label><Input className="h-11" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>البريد الإلكتروني</Label><Input className="h-11" type="email" dir="ltr" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>كلمة المرور</Label><Input className="h-11" type="password" dir="ltr" placeholder="8 أحرف على الأقل" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <p className="rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">استخدم نفس البريد المسجل لدينا ليتم ربط حسابك ببياناتك تلقائياً.</p>
              <Button size="lg" className="w-full bg-gradient-primary shadow-elegant" disabled={busy} onClick={signUp}>إنشاء حساب</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
