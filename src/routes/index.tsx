import { createFileRoute } from "@tanstack/react-router";
import { useState, type CSSProperties, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateOffers, generateAssets, type Offer } from "@/lib/offers.functions";
import { Loader2, Copy, Check, Palette } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Offer Builder | Consult Funnels" },
      { name: "description", content: "Generate Hormozi style slam offers plus a full website, email, SMS, ads, bios and cold call scripts for any niche." },
      { property: "og:title", content: "Offer Builder | Consult Funnels" },
      { property: "og:description", content: "Grand slam offers and a full go to market kit for any niche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Theme = { name: string; swatch: string; vars: Record<string, string> };

const THEMES: Theme[] = [
  {
    name: "Emerald",
    swatch: "oklch(0.48 0.13 155)",
    vars: {
      "--primary": "oklch(0.48 0.13 155)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.94 0.04 155)",
      "--accent-foreground": "oklch(0.22 0.05 155)",
    },
  },
  {
    name: "Royal Blue",
    swatch: "oklch(0.5 0.16 255)",
    vars: {
      "--primary": "oklch(0.5 0.16 255)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.94 0.04 255)",
      "--accent-foreground": "oklch(0.25 0.08 255)",
    },
  },
  {
    name: "Violet",
    swatch: "oklch(0.5 0.18 300)",
    vars: {
      "--primary": "oklch(0.5 0.18 300)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.94 0.04 300)",
      "--accent-foreground": "oklch(0.28 0.1 300)",
    },
  },
  {
    name: "Sunset",
    swatch: "oklch(0.58 0.19 45)",
    vars: {
      "--primary": "oklch(0.58 0.19 45)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.95 0.05 45)",
      "--accent-foreground": "oklch(0.3 0.08 45)",
    },
  },
  {
    name: "Crimson",
    swatch: "oklch(0.52 0.2 25)",
    vars: {
      "--primary": "oklch(0.52 0.2 25)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.94 0.04 25)",
      "--accent-foreground": "oklch(0.28 0.08 25)",
    },
  },
  {
    name: "Midnight",
    swatch: "oklch(0.3 0.06 255)",
    vars: {
      "--primary": "oklch(0.3 0.06 255)",
      "--primary-foreground": "oklch(0.98 0.01 255)",
      "--accent": "oklch(0.93 0.02 255)",
      "--accent-foreground": "oklch(0.3 0.06 255)",
    },
  },
];

function themeVars(theme: Theme): CSSProperties {
  return theme.vars as CSSProperties;
}

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

function ThemePicker({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold"><Palette className="size-4" /> Website and ads colour</span>
      {THEMES.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t)}
          title={t.name}
          className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${theme.name === t.name ? "border-foreground ring-2 ring-foreground/30" : "border-border"}`}
          style={{ backgroundColor: t.swatch }}
        />
      ))}
      <span className="text-sm text-muted-foreground">{theme.name}</span>
    </div>
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
  const [theme, setTheme] = useState<Theme>(THEMES[0]!);

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

        {loading === "kit" && <p className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Building website, copy and scripts...</p>}

        {kit && selected && <Kit kit={kit} offer={selected} theme={theme} setTheme={setTheme} />}
      </main>
    </div>
  );
}

function Kit({ kit, offer, theme, setTheme }: { kit: any; offer: Offer; theme: Theme; setTheme: (t: Theme) => void }) {
  const { insights: i, website: w, email, metaAds, bios, coldCall: cc } = kit;
  const tv = themeVars(theme);
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Full kit: <span className="text-primary">{offer.name}</span></h2>

      <ThemePicker theme={theme} setTheme={setTheme} />

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

      <Card title="Full website" icon="🖥️">
        <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-border" style={tv}>
          {/* Nav */}
          <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
            <span className="font-display font-bold">{w.brand}</span>
            <nav className="hidden gap-4 text-xs font-medium text-muted-foreground md:flex">
              <a href="#w-services" className="hover:text-foreground">Services</a>
              <a href="#w-about" className="hover:text-foreground">About</a>
              <a href="#w-results" className="hover:text-foreground">Results</a>
              <a href="#w-faq" className="hover:text-foreground">FAQ</a>
            </nav>
            <a href="#w-contact" className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">{w.cta}</a>
          </div>

          {/* Hero */}
          <div className="bg-accent px-6 py-16 text-center">
            <h4 className="mx-auto max-w-2xl text-3xl font-bold">{w.heroHeadline}</h4>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{w.heroSub}</p>
            <span className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{w.cta}</span>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 gap-4 border-y border-border bg-card p-6 text-center md:grid-cols-4">
            {w.stats?.map((s: any) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Services */}
          <div id="w-services" className="scroll-mt-16 p-6">
            <h5 className="mb-4 text-lg font-bold">What we do</h5>
            <div className="grid gap-4 md:grid-cols-3">
              {w.services?.map((s: any) => <div key={s.title} className="rounded-xl bg-muted p-4"><b>{s.title}</b><p className="text-sm text-muted-foreground">{s.text}</p></div>)}
            </div>
          </div>

          {/* About */}
          <div id="w-about" className="scroll-mt-16 grid gap-6 bg-muted p-6 md:grid-cols-2">
            <div>
              <h5 className="text-lg font-bold">{w.about?.title}</h5>
              <p className="mt-2 text-sm text-muted-foreground">{w.about?.text}</p>
            </div>
            <ul className="space-y-2 text-sm">
              {w.about?.points?.map((p: string) => (
                <li key={p} className="flex items-start gap-2"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">✓</span>{p}</li>
              ))}
            </ul>
          </div>

          {/* Process */}
          <div className="p-6">
            <h5 className="mb-4 text-lg font-bold">How it works</h5>
            <div className="grid gap-4 md:grid-cols-4">
              {w.steps?.map((s: any, n: number) => <div key={s.title}><span className="text-primary font-bold">0{n + 1}</span> <b>{s.title}</b><p className="text-sm text-muted-foreground">{s.text}</p></div>)}
            </div>
          </div>

          {/* Results */}
          <div id="w-results" className="scroll-mt-16 bg-accent p-6">
            <h5 className="mb-4 text-lg font-bold">Results our clients get</h5>
            <div className="grid gap-4 md:grid-cols-3">
              {w.testimonials?.map((t: any) => <blockquote key={t.name} className="rounded-xl bg-card p-4 text-sm">"{t.quote}"<footer className="mt-2 font-semibold">{t.name}, {t.role}</footer></blockquote>)}
            </div>
          </div>

          {/* FAQ */}
          <div id="w-faq" className="scroll-mt-16 p-6">
            <h5 className="mb-4 text-lg font-bold">Questions people ask</h5>
            <div className="space-y-3">
              {w.faq?.map((f: any) => (
                <div key={f.q} className="rounded-xl border border-border p-4 text-sm">
                  <p className="font-semibold">{f.q}</p>
                  <p className="mt-1 text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div id="w-contact" className="scroll-mt-16 p-10 text-center">
            <h5 className="mx-auto max-w-xl text-2xl font-bold">{w.finalHeadline}</h5>
            <p className="mt-3 font-semibold">🛡️ {w.guarantee}</p>
            <span className="mt-5 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground">{w.finalCta}</span>
          </div>

          {/* Footer */}
          <footer className="border-t border-border bg-muted px-6 py-6 text-center text-xs text-muted-foreground">
            <p className="font-display text-sm font-bold text-foreground">{w.brand}</p>
            <p className="mt-1">{w.tagline}</p>
            <p className="mt-2">{w.footer}</p>
          </footer>
        </div>
      </Card>

      <Card title="Email copy" icon="📧" copy={`Subject: ${email.subject}\n\n${email.body}`}>
        <p><b>Subject:</b> {email.subject}</p>
        <p className="text-sm text-muted-foreground">Preview: {email.preview}</p>
        <p className="mt-4 whitespace-pre-line">{email.body}</p>
      </Card>

      <Card title="Meta ads creatives" icon="📣">
        <div className="grid gap-4 md:grid-cols-3" style={tv}>
          {metaAds?.map((a: any, n: number) => (
            <div key={n} className="overflow-hidden rounded-2xl border border-border bg-card">
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
