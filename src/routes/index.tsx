import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateOffers, generateAssets, type Offer } from "@/lib/offers.functions";
import { Loader2, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Offer Builder | Consult Funnels" },
      { name: "description", content: "Generate Hormozi style slam offers plus landing page, email, SMS, ads, bios and cold call scripts for any niche." },
      { property: "og:title", content: "Offer Builder | Consult Funnels" },
      { property: "og:description", content: "Grand slam offers and a full go to market kit for any niche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }}
      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
    >
      {ok ? <Check className="size-3" /> : <Copy className="size-3" />} Copy
    </button>
  );
}

function Card({ title, icon, children, copy }: { title: string; icon: string; children: ReactNode; copy?: string }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">{icon} {title}</h3>
        {copy && <CopyBtn text={copy} />}
      </div>
      {children}
    </section>
  );
}

function Index() {
  const offersFn = useServerFn(generateOffers);
  const assetsFn = useServerFn(generateAssets);
  const [form, setForm] = useState({ niche: "", product: "", details: "" });
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [selected, setSelected] = useState<Offer | null>(null);
  const [kit, setKit] = useState<any>(null);
  const [loading, setLoading] = useState<"" | "offers" | "kit">("");
  const [err, setErr] = useState("");

  async function makeOffers() {
    setErr(""); setLoading("offers"); setOffers(null); setSelected(null); setKit(null);
    try { setOffers((await offersFn({ data: form })).offers); }
    catch (e: any) { setErr(e.message); } finally { setLoading(""); }
  }
  async function pick(o: Offer) {
    setSelected(o); setKit(null); setErr(""); setLoading("kit");
    try { setKit(await assetsFn({ data: { ...form, offer: JSON.stringify(o) } })); }
    catch (e: any) { setErr(e.message); } finally { setLoading(""); }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <div className="grid size-9 place-items-center rounded-full bg-primary font-bold text-primary-foreground">O</div>
          <span className="font-display text-lg font-bold">Offer Builder</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-5 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Build a <span className="text-primary">grand slam offer</span></h1>
          <p className="mt-3 text-muted-foreground">Pick a niche and product. Get offers, then the full kit to sell it.</p>
        </div>

        <section className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4">
          <input className="w-full rounded-xl border border-input bg-background px-4 py-3" placeholder="Niche, e.g. UK Ready Mix Concrete Suppliers"
            value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
          <input className="w-full rounded-xl border border-input bg-background px-4 py-3" placeholder="Your product or service, e.g. AI receptionist that books delivery slots"
            value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
          <textarea rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-3" placeholder="Extra factors: price range, results you get, target market, location..."
            value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
          <div className="text-center">
            <button disabled={!form.niche || !form.product || !!loading} onClick={makeOffers}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {loading === "offers" && <Loader2 className="size-4 animate-spin" />} Generate offers
            </button>
          </div>
        </section>

        {err && <p className="rounded-xl bg-destructive/10 p-4 text-destructive">{err}</p>}

        {offers && (
          <>
            <h2 className="text-3xl font-bold">Your offers: <span className="text-primary">{form.niche}</span></h2>
            <div className="grid gap-5 md:grid-cols-2">
              {offers.map((o) => (
                <div key={o.id} className={`flex flex-col rounded-3xl border bg-card p-6 ${selected?.id === o.id ? "border-primary ring-2 ring-primary" : "border-border"}`}>
                  <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">{o.type}</span>
                  <h3 className="mt-3 text-xl font-bold">{o.name}</h3>
                  <p className="mt-2 font-medium">{o.headline}</p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li><b className="text-foreground">Promise:</b> {o.promise}</li>
                    {o.mechanism && <li><b className="text-foreground">How it works:</b> {o.mechanism}</li>}
                    <li><b className="text-foreground">Guarantee:</b> {o.guarantee}</li>
                    <li><b className="text-foreground">Pricing:</b> {o.pricing}</li>
                    <li><b className="text-foreground">Bonuses:</b> {o.bonuses?.join(", ")}</li>
                  </ul>
                  {o.caseStudy && (
                    <div className="mt-4 rounded-2xl bg-muted p-4 text-sm">
                      <p className="font-semibold">📊 Case study: {o.caseStudy.company}</p>
                      <p className="mt-1"><b>Before:</b> {o.caseStudy.before}</p>
                      <p><b>After:</b> {o.caseStudy.after}</p>
                      <p className="text-primary font-semibold">{o.caseStudy.result}</p>
                    </div>
                  )}
                  <div className="mt-4 rounded-2xl border border-dashed border-border p-3 text-sm">
                    <div className="mb-1 flex justify-between"><b>💬 SMS</b><CopyBtn text={o.sms} /></div>{o.sms}
                  </div>
                  <button onClick={() => pick(o)} disabled={!!loading}
                    className="mt-5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {loading === "kit" && selected?.id === o.id ? "Building kit..." : "Go ahead with this offer"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {loading === "kit" && <p className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Building landing page, copy and scripts...</p>}

        {kit && selected && <Kit kit={kit} offer={selected} />}
      </main>
    </div>
  );
}

function Kit({ kit, offer }: { kit: any; offer: Offer }) {
  const { insights: i, landingPage: lp, email, metaAds, bios, coldCall: cc } = kit;
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Full kit: <span className="text-primary">{offer.name}</span></h2>

      <Card title={`Company insights: ${i.companyName}`} icon="🏢">
        <p>{i.overview}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
          <div><b>Ideal client</b><p className="text-muted-foreground">{i.idealClient}</p></div>
          <div><b>Market</b><p className="text-muted-foreground">{i.marketSize}</p></div>
          <div><b>Pain points</b><ul className="list-disc pl-5 text-muted-foreground">{i.painPoints?.map((p: string) => <li key={p}>{p}</li>)}</ul></div>
          <div><b>Desires</b><ul className="list-disc pl-5 text-muted-foreground">{i.desires?.map((p: string) => <li key={p}>{p}</li>)}</ul></div>
        </div>
        <p className="mt-4 text-sm"><b>Why now:</b> {i.whyNow}</p>
      </Card>

      <Card title="Landing page" icon="🖥️">
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="font-display font-bold">{lp.brand}</span>
            <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">{lp.cta}</span>
          </div>
          <div className="bg-accent px-6 py-14 text-center">
            <h4 className="mx-auto max-w-2xl text-3xl font-bold">{lp.heroHeadline}</h4>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{lp.heroSub}</p>
            <span className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{lp.cta}</span>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-3">
            {lp.benefits?.map((b: any) => <div key={b.title} className="rounded-xl bg-muted p-4"><b>{b.title}</b><p className="text-sm text-muted-foreground">{b.text}</p></div>)}
          </div>
          <div className="px-6 pb-6">
            <h5 className="mb-3 text-lg font-bold">How it works</h5>
            <div className="grid gap-4 md:grid-cols-3">
              {lp.steps?.map((s: any, n: number) => <div key={s.title}><span className="text-primary font-bold">0{n + 1}</span> <b>{s.title}</b><p className="text-sm text-muted-foreground">{s.text}</p></div>)}
            </div>
          </div>
          <div className="grid gap-4 bg-muted p-6 md:grid-cols-2">
            {lp.testimonials?.map((t: any) => <blockquote key={t.name} className="rounded-xl bg-card p-4 text-sm">"{t.quote}"<footer className="mt-2 font-semibold">{t.name}, {t.role}</footer></blockquote>)}
          </div>
          <div className="p-8 text-center">
            <p className="font-semibold">🛡️ {lp.guarantee}</p>
            <span className="mt-4 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{lp.finalCta}</span>
          </div>
        </div>
      </Card>

      <Card title="Email copy" icon="📧" copy={`Subject: ${email.subject}\n\n${email.body}`}>
        <p><b>Subject:</b> {email.subject}</p>
        <p className="text-sm text-muted-foreground">Preview: {email.preview}</p>
        <p className="mt-4 whitespace-pre-line">{email.body}</p>
      </Card>

      <Card title="Meta ads creatives" icon="📣">
        <div className="grid gap-4 md:grid-cols-3">
          {metaAds?.map((a: any, n: number) => (
            <div key={n} className="overflow-hidden rounded-2xl border border-border">
              <div className="px-4 py-3 text-sm whitespace-pre-line">{a.primaryText}</div>
              <div className="grid aspect-square place-items-center bg-primary p-5 text-center">
                <p className="font-display text-2xl font-bold text-primary-foreground">{a.hook}</p>
              </div>
              <div className="flex items-center justify-between gap-2 bg-muted px-4 py-3">
                <b className="text-sm">{a.headline}</b>
                <span className="shrink-0 rounded-md bg-card px-3 py-1 text-xs font-semibold">{a.cta}</span>
              </div>
              <p className="px-4 py-3 text-xs text-muted-foreground"><b>Angle:</b> {a.angle}<br /><b>Visual:</b> {a.visual}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Instagram and Facebook bios" icon="📱">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-muted p-4"><div className="mb-2 flex justify-between"><b>Instagram</b><CopyBtn text={bios.instagram} /></div><p className="whitespace-pre-line">{bios.instagram}</p></div>
          <div className="rounded-2xl bg-muted p-4"><div className="mb-2 flex justify-between"><b>Facebook</b><CopyBtn text={bios.facebook} /></div><p>{bios.facebook}</p></div>
        </div>
      </Card>

      <Card title="Cold calling script" icon="📞">
        <b>Openers</b>
        <ul className="mb-5 mt-2 space-y-2">{cc.openers?.map((o: string) => <li key={o} className="rounded-xl bg-muted p-3 text-sm">{o}</li>)}</ul>
        <b>Script</b>
        <ol className="mb-5 mt-2 space-y-3">{cc.script?.map((s: any, n: number) => <li key={n} className="text-sm"><span className="font-semibold text-primary">{s.step}:</span> {s.line}</li>)}</ol>
        <b>Objections</b>
        <div className="mt-2 space-y-3">{cc.objections?.map((o: any) => <div key={o.objection} className="rounded-xl border border-border p-3 text-sm"><p className="font-semibold">"{o.objection}"</p><p className="text-muted-foreground">{o.response}</p></div>)}</div>
        <p className="mt-5 text-sm"><b>Close:</b> {cc.close}</p>
      </Card>
    </div>
  );
}
