import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Wifi, Phone, ArrowLeft, Check, Signal, MousePointerClick, ClipboardList, Gauge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmtMoney } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "باقات الإنترنت والخطوط — اشترك الآن" },
      { name: "description", content: "تصفح باقات الإنترنت والدقائق واطلب اشتراكك أونلاين في دقائق." },
      { property: "og:title", content: "باقات الإنترنت والخطوط — اشترك الآن" },
      { property: "og:description", content: "تصفح الباقات واطلب اشتراكك أونلاين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Pkg = { id: string; name: string; provider: string; service_type: string; gb: number | null; minutes: number | null; selling_price: number; duration_days: number; description: string | null };

function Index() {
  const { data: packages = [] } = useQuery({
    queryKey: ["public-packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("id,name,provider,service_type,gb,minutes,selling_price,duration_days,description").eq("status", "active").eq("is_public", true).order("selling_price");
      if (error) throw error;
      return data as Pkg[];
    },
  });
  const [chosen, setChosen] = useState<Pkg | null>(null);

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 grid-pattern" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="flex items-center gap-2 font-display text-xl font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Signal className="h-4 w-4" /></span>اشتراكاتي</span>
          <Button asChild variant="secondary" size="sm"><Link to="/auth">تسجيل الدخول</Link></Button>
        </nav>
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-14 text-center">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-4xl font-bold leading-tight md:text-6xl">
            إنترنت أسرع، <span className="text-accent">إدارة أسهل</span>
          </h1>
          <p className="animate-in fade-in duration-1000 mx-auto mt-5 max-w-xl text-lg opacity-80">
            اختر باقتك واطلب اشتراكك أونلاين، وتابع استهلاكك وفواتيرك من حسابك.
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <a href="#packages">تصفح الباقات <ArrowLeft className="h-4 w-4" /></a>
          </Button>
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-primary-foreground/15 pt-8">
            {[["أونلاين", "طلب الاشتراك"], ["24/7", "متابعة الاستهلاك"], ["آمن", "دفع ورفع الإيصالات"]].map(([v, l]) => (
              <div key={l}><div className="font-display text-2xl font-bold text-accent">{v}</div><div className="mt-1 text-xs opacity-70">{l}</div></div>
            ))}
          </div>
        </div>
      </header>

      <section id="packages" className="relative mx-auto -mt-12 max-w-6xl px-6 pb-24">
        {packages.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground shadow-elegant">لا توجد باقات متاحة حالياً.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="flex flex-col rounded-2xl border bg-card p-6 shadow-elegant">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{p.provider}</span>
                  {p.service_type === "internet" ? <Wifi className="h-5 w-5 text-primary" /> : <Phone className="h-5 w-5 text-primary" />}
                </div>
                <h3 className="mt-4 text-xl font-bold">{p.name}</h3>
                <div className="mt-2 text-3xl font-bold text-primary">{fmtMoney(p.selling_price)}</div>
                <div className="text-sm text-muted-foreground">لمدة {p.duration_days} يوم</div>
                <ul className="mt-4 space-y-2 text-sm">
                  {!!p.gb && <li className="flex gap-2"><Check className="h-4 w-4 text-success" /> {p.gb} جيجا</li>}
                  {!!p.minutes && <li className="flex gap-2"><Check className="h-4 w-4 text-success" /> {p.minutes} دقيقة</li>}
                  {p.description && <li className="text-muted-foreground">{p.description}</li>}
                </ul>
                <Button className="mt-6 bg-gradient-primary" onClick={() => setChosen(p)}>اطلب الاشتراك</Button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
      <section className="border-y bg-card py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">كيف تشترك؟</h2>
          <p className="mt-2 text-center text-muted-foreground">ثلاث خطوات بسيطة وخطك يكون جاهز</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[{ i: MousePointerClick, t: "اختر الباقة", d: "قارن بين الباقات واختر الأنسب لاستخدامك." }, { i: ClipboardList, t: "أرسل طلبك", d: "املأ بياناتك وسنراجع الطلب فوراً." }, { i: Gauge, t: "تابع من حسابك", d: "استهلاكك وفواتيرك ومدفوعاتك في مكان واحد." }].map(({ i: I, t, d }, n) => (
              <div key={t} className="relative rounded-2xl border bg-background p-6">
                <span className="absolute left-5 top-5 font-display text-4xl font-bold text-primary/10">0{n + 1}</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><I className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-bold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="py-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} اشتراكاتي — جميع الحقوق محفوظة</footer>
      <RegisterDialog pkg={chosen} onClose={() => setChosen(null)} />
    </div>
  );
}

function RegisterDialog({ pkg, onClose }: { pkg: Pkg | null; onClose: () => void }) {
  const [f, setF] = useState({ full_name: "", phone: "", alt_phone: "", email: "", national_id: "", governorate: "", address: "" });
  const m = useMutation({
    mutationFn: async () => {
      if (!f.full_name.trim() || !/^0\d{9,10}$/.test(f.phone.trim())) throw new Error("يرجى إدخال الاسم ورقم هاتف صحيح");
      const { error } = await supabase.from("registration_requests").insert({ ...f, package_id: pkg!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("تم استلام طلبك، سنتواصل معك قريباً"); onClose(); setF({ full_name: "", phone: "", alt_phone: "", email: "", national_id: "", governorate: "", address: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const fields: [keyof typeof f, string][] = [["full_name", "الاسم الكامل"], ["phone", "رقم الهاتف"], ["alt_phone", "رقم بديل"], ["email", "البريد الإلكتروني"], ["national_id", "الرقم القومي"], ["governorate", "المحافظة"]];
  return (
    <Dialog open={!!pkg} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>طلب اشتراك: {pkg?.name}</DialogTitle></DialogHeader>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
          {fields.map(([k, l]) => (
            <div key={k} className="space-y-1"><Label>{l}</Label><Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
          ))}
          <div className="space-y-1 sm:col-span-2"><Label>العنوان</Label><Textarea value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
          <Button type="submit" disabled={m.isPending} className="sm:col-span-2">إرسال الطلب</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
