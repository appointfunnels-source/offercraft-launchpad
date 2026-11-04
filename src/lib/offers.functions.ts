import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "gpt-6-luna";

const RULES = `Writing rules (strict):
- Never use dashes of any kind (no em dash, en dash, or hyphen used as punctuation). Use commas or full stops instead.
- Never write placeholders or template variables like {{name}}, [Company], <city>. Always write finished, concrete copy.
- When a case study or result is needed, invent a realistic named company in this niche with concrete numbers and timeframes.
- Focus on the product's actual results, not vague "helping people" statements.
- Return only valid JSON.`;

function clean<T>(v: T): T {
  return JSON.parse(
    JSON.stringify(v)
      .replace(/\s*[\u2014\u2013]\s*/g, ", ")
      .replace(/ - /g, ", ")
      .replace(/\{\{[^}]*\}\}/g, ""),
  );
}

async function ask(prompt: string) {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) throw new Error("OpenAI key is not configured");
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      instructions: `You are a world class offer creator trained on Alex Hormozi's $100M Offers. ${RULES}`,
      input: prompt,
      text: { format: { type: "json_object" } },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`OpenAI failed [${res.status}]: ${body}`);
    throw new Error(`AI request failed [${res.status}]: ${body.slice(0, 300)}`);
  }
  const json: any = await res.json();
  const text =
    json.output_text ??
    json.output?.flatMap((o: any) => o.content ?? []).find((c: any) => c.type === "output_text")?.text;
  return clean(JSON.parse(text));
}

const Input = z.object({
  niche: z.string().min(2).max(200),
  product: z.string().min(2).max(500),
  details: z.string().max(1500).optional().default(""),
});

export type Offer = {
  id: string;
  type: string;
  name: string;
  headline: string;
  promise: string;
  guarantee: string;
  pricing: string;
  mechanism: string;
  bonuses: string[];
  caseStudy?: { company: string; before: string; after: string; result: string };
  sms: string;
};

export const generateOffers = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const out = await ask(`Niche: ${data.niche}
Product or service: ${data.product}
Extra factors: ${data.details || "none"}

Create 4 offers as JSON: {"offers":[...]} with exactly these types in order:
1. "Results Based Risk Free Fee" (Hormozi recommended, client pays only on results). This offer MUST be built on four pillars, each stated plainly inside its fields:
   a. Specific Result: a measurable outcome the client cares about (e.g. 30+ qualified appointments, $50k per month recovered revenue). Put it in "promise".
   b. Defined Timeframe: make it time bound, 60 to 90 days. Speed sells. Put it in "promise".
   c. Clear Mechanism: the unique system that produces the result (e.g. AI automation plus targeted outbound plus follow up engine). Explain how it produces the result. Put it in "mechanism".
   d. Risk Reversal: remove all hesitation, keep working until the client sees results or work for free. Put it in "guarantee".
2. "Fire One Guy" (replace the cost of one employee, show the salary math)
3. "Case Study" (offer to work at a discount or free in exchange for a case study, include a full invented case study)
4. "Simple Offer" (one clear sentence offer, plain and direct)
Each offer object: {"id":"slug","type":"...","name":"catchy offer name","headline":"...","promise":"specific measurable result with timeframe","mechanism":"the unique system and how it produces the result","guarantee":"...","pricing":"...","bonuses":["3 bonuses"],"caseStudy":{"company":"invented company name","before":"...","after":"...","result":"numbers"},"sms":"cold SMS pitch"}.
The SMS must stay simple and short, but it must include one or two concrete details from the offer, like the specific result number and the timeframe. No vague claims. Under 400 characters.
Every offer must include caseStudy with an invented company and real looking numbers.`);
    return out as { offers: Offer[] };
  });

export const generateAssets = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    Input.extend({ offer: z.string().min(10).max(6000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const out = await ask(`Niche: ${data.niche}
Product: ${data.product}
Chosen offer: ${data.offer}

Build the full go to market kit as JSON:
{"insights":{"companyName":"invented company in this niche that sells this","overview":"...","idealClient":"...","painPoints":["5"],"desires":["4"],"marketSize":"...","whyNow":"..."},
"landingPage":{"brand":"same companyName","heroHeadline":"...","heroSub":"...","cta":"...","benefits":[{"title":"...","text":"..."}x3],"steps":[{"title":"...","text":"..."}x3],"testimonials":[{"name":"...","role":"...","quote":"..."}x2],"guarantee":"...","finalCta":"..."},
"email":{"subject":"...","preview":"...","body":"full cold email with line breaks, signed by a real sounding name"},
"metaAds":[{"angle":"...","hook":"...","primaryText":"...","headline":"...","cta":"...","visual":"description of the creative image"}x3],
"bios":{"instagram":"under 150 chars","facebook":"2 to 3 sentences"},
"coldCall":{"openers":["4 openers"],"script":[{"step":"Intro","line":"..."}, ...6 to 8 steps],"objections":[{"objection":"...","response":"..."}x4],"close":"..."}}`);
    return out as any;
  });
