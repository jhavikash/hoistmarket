import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, ChevronRight, Calculator, Zap, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// ── PILLAR ARTICLE CONTENT ──────────────────────────────────────────

const PILLAR_ARTICLES: Record<string, {
  title: string; excerpt: string; category: string; reading_time: number;
  seo_keywords: string[]; schema_type: string; content: string; published_at: string;
}> = {
  'asme-b30-vs-iso-vs-fem-lifting-standards': {
    title: 'International Lifting Standards: Comparing ASME B30 vs ISO vs FEM for Global Projects',
    excerpt: 'A definitive comparison of the three dominant crane safety standard frameworks for EPC managers across GCC, India, and international projects.',
    category: 'Standards',
    reading_time: 14,
    seo_keywords: ['crane safety standards', 'ASME B30.2', 'FEM crane classification', 'lifting equipment compliance', 'ISO crane standards'],
    schema_type: 'TechnicalArticle',
    published_at: '2026-03-07',
    content: `
## Why Lifting Standards Matter on Global Projects

When an EPC contractor deploys a crane manufactured in Germany (FEM-classified) on a Saudi Aramco project (ASME-mandated), operated by NCCCO-certified personnel working under LOLER — which standard governs the lift plan?

This is not academic. Incorrect application of safety factors from one standard to equipment rated under another has caused structural failures and fatalities. For EPC managers working across jurisdictions, a working knowledge of ASME B30, FEM 1.001, and ISO harmonisation is essential.

## The Three Dominant Frameworks

### ASME B30 Series (USA / GCC Projects)

The American Society of Mechanical Engineers B30 series is the dominant framework across North America, the GCC (particularly on US-linked EPC projects), and increasingly Southeast Asia.

Key volumes for lifting professionals:

- **B30.2** — Overhead and gantry cranes (top running bridge, single or multiple girder)
- **B30.4** — Portal, tower, and pillar jib cranes
- **B30.5** — Mobile and locomotive cranes
- **B30.9** — Slings (wire rope, chain, synthetic webbing, metal mesh)
- **B30.20** — Below-the-hook lifting devices
- **B30.26** — Rigging hardware (shackles, hooks, links, rings)

ASME B30 is performance-based: it specifies *what* the equipment must achieve and how inspections must be conducted, but does not mandate specific design calculations. This creates flexibility for OEMs but demands qualified personnel to interpret requirements correctly.

### FEM 1.001 (European OEMs — Konecranes, Demag, Stahl, GH Cranes)

FEM 1.001 is the classification standard used by European crane manufacturers. It provides a detailed duty classification system:

**Mechanism Groups M1–M8:** Based on number of load cycles and utilisation factor
**Crane Groups A1–A8:** Based on total operating hours and load spectrum class

The FEM system is more prescriptive than ASME — it directly informs structural and mechanical design parameters including:
- Wire rope selection and safety factors
- Brake design torque
- Motor duty class
- Structural fatigue life

### ISO Standards

ISO's lifting-related standards (ISO 4301, 4302, 8686 series) are harmonised with FEM for European applications. ISO 4306 provides the definitive crane terminology standard referenced by both ASME and FEM frameworks. Since the Machinery Directive harmonisation, EN 13001 and EN 13000 have largely replaced standalone FEM references for new CE-marked equipment.

## Master Comparison Table

| Parameter | ASME B30 (USA/GCC) | FEM 1.001 (Europe/India OEM) | ISO / EN 13001 |
|-----------|-------------------|------------------------------|----------------|
| **Classification System** | Heavy/Standard/Service duty | Groups A1–A8 + M1–M8 | Aligned with FEM |
| **Hoist Safety Factor (SWL)** | Min 3.5:1 (wire rope) | Zp factor, design-dependent | Zm / Zp per ISO 8686 |
| **Hook Safety Factor** | 4:1 on proof load | Per DIN 15400 / EN 1677 | EN 1677 series |
| **Wire Rope Safety Factor** | 3.5:1 on min breaking force | Minimum breaking force calculation | ISO 2408 reference |
| **Design Life Basis** | Hours/cycles per volume | Group life per FEM table | ISO 4301 cycle classes |
| **Wind Load Method** | Wind pressure maps (site-specific) | FEM wind zones 1–4 | ISO 4302 |
| **Dynamic Load Factors** | φ₁ stated per application | φ₁–φ₆ comprehensive system | ISO 8686 φ system |
| **Inspection Regime** | Frequent / Periodic / Annual | Manufacturer specification | EN 13155 / national law |
| **Operator Certification** | NCCCO (USA), state-specific | CPCS / LEEA (UK), national schemes | No single ISO certification |
| **Primary Jurisdictions** | USA, Canada, GCC (US projects) | EU, UK, India (OEM spec) | EU harmonised |

## The GCC Complexity: Which Standard Applies?

For EPC managers in Saudi Arabia, UAE, and Qatar, the answer depends on contract structure:

- **Saudi Aramco projects:** Typically mandate ASME B30 compliance as baseline, irrespective of equipment origin
- **ADNOC projects (UAE):** Mix of ASME and EN standards depending on project vintage
- **Qatar Energy (QE) projects:** Generally ASME B30 baseline with EN acceptance where equivalency is demonstrated

When European-manufactured cranes (FEM-classified) are delivered to GCC sites, the practical reconciliation approach used by experienced lifting engineers:

1. Identify where the two standard systems apply to the same parameter
2. Apply the more conservative safety factor where they differ
3. Verify the local regulatory requirement (national decree, OSHA equivalent) as the minimum floor
4. Document the reconciliation in the Lifting Plan / LLTR (Lifting Load Technical Review)

### India-Specific Considerations

India's **IS 3177** (overhead cranes) and **IS 807** (design and erection) are broadly aligned with FEM classifications, reflecting the historical influence of European OEMs in India's heavy industry sector. However, ASME is increasingly specified on oil & gas projects involving US EPC contractors or international financing.

The Bureau of Indian Standards (BIS) is progressively aligning IS standards with ISO harmonised versions. For new process plants, specifiers should confirm which edition of IS 3177 is referenced and whether the project client mandates FEM, ASME, or IS compliance.

## Safety Factor Reconciliation: Worked Example

A 50-tonne overhead crane is specified to FEM Group A5 (Heavy Duty) with a German manufacturer. The same crane is to be installed on a Saudi Aramco facility where ASME B30.2 governs.

**FEM A5 wire rope safety factor:** Minimum 5:1 (to min breaking force), per design class
**ASME B30.2 wire rope safety factor:** 3.5:1 minimum

In this case, FEM is more conservative. The ASME requirement is met by a margin. The reconciliation note in the LLTR would state: *"Hoist wire rope selected to FEM A5 requirement (5:1 SFL); ASME B30.2 minimum of 3.5:1 is satisfied. FEM governs."*

## Key Takeaways for Specification Writers

1. **Always state which standard governs** in your crane specification. Never assume the OEM will default to the appropriate one.

2. **FEM group designations (A5, M5) are not directly interchangeable** with ASME duty categories without formal engineering reconciliation.

3. **Where standards conflict, the more conservative requirement governs** — and this decision must be documented in the project lifting plan.

4. **For offshore applications**, DNVGL-ST-0378 and applicable Shell DEP specifications add further requirements that supersede both onshore ASME and FEM in several areas.

5. **LOLER 1998 (UK)** applies to all lifting operations conducted by UK-registered companies globally, regardless of the equipment's country of origin or the project's host country standards.
    `,
  },
  'eot-crane-total-cost-ownership-tco-guide': {
    title: 'Total Cost of Ownership in EOT Cranes: Why Initial Price is 40% of the Story',
    excerpt: 'A procurement deep-dive for plant engineers and procurement heads. Maintenance, spare parts, downtime, and 15-year lifecycle ROI analysis.',
    category: 'Procurement',
    reading_time: 12,
    seo_keywords: ['EOT crane maintenance cost', 'hoist spare parts lifecycle', 'industrial crane ROI', 'overhead crane TCO', 'crane procurement guide'],
    schema_type: 'TechnicalArticle',
    published_at: '2026-03-03',
    content: `
## The Price Trap

A plant procurement manager at a Gujarat steel plant selects an EOT crane on the basis of lowest capital cost. Three years later, that crane accounts for more unplanned downtime than all other equipment combined. Spare parts lead time from the European manufacturer is 14 weeks. The local service agent has no trained technicians within 500km.

The total cost incurred over five years exceeds the price of a domestically-sourced crane with full service infrastructure by a factor of 2.3.

This is not a hypothetical. It reflects a documented pattern across Indian, GCC, and African industrial facilities.

**The initial purchase price of an overhead crane typically represents 35–45% of its total 15-year cost of ownership.** The procurement professional who optimises for purchase price alone is optimising for the wrong variable.

## The TCO Framework for EOT Cranes

| Cost Category | % of 15-Year TCO | Key Variables | Procurement Lever |
|---------------|-----------------|---------------|-------------------|
| Capital Cost | 38–44% | Specification quality, sourcing region, duty class | Competitive tendering; TCO clause in RFQ |
| Installation & Commissioning | 4–7% | Site complexity, structural work, electrical supply | Include in scope; verify civil drawings early |
| Planned Maintenance | 12–18% | Maintenance intervals, labour rates, parts pricing | Service agreement at purchase; local parts stocking |
| Unplanned Downtime Costs | 8–15% | MTBF, parts availability, technician response time | Vendor service SLA; spare parts consignment stock |
| Spare Parts (Planned) | 9–14% | Hoist drum, brake pads, hoist rope, control cards | First-year parts package in purchase order |
| Energy Costs | 5–9% | VFD inverter drives, running hours, load factor | Specify energy class; VFD as standard fitment |
| Inspection & Certification | 2–4% | Statutory inspection frequency, NDT costs | Build into maintenance budget; third-party schedule |
| Major Overhaul (Year 10–12) | 6–10% | Hoist unit rebuild, structural inspection, rope replacement | Provision in capex; negotiate overhaul rights |
| **Total** | **100%** | | |

## The Hoist Rope: The Most Underestimated Line Item

Wire rope replacement is the single most frequent significant maintenance expense for overhead cranes in heavy industrial applications.

A 50t double-girder EOT crane running at FEM A5 (heavy duty) will require hoist rope replacement every **18–36 months** depending on load utilisation and maintenance discipline.

Typical costs for a 50t hoist rope change:

- Wire rope (IWRC, seale construction, 32mm): **₹85,000–1,40,000**
- Replacement labour (including reeving and load test): **₹25,000–45,000**
- Downtime for a steel melt shop (at ₹50,000/hour): **₹2,00,000–5,00,000**

The rope itself is often the smallest component of the total rope-change event cost. Procurement teams that focus on rope price while ignoring hoist maintenance accessibility and local stocking arrangements are optimising for the wrong variable.

## The Spare Parts Trap

European-manufactured hoists typically carry a **2–4 year parts availability guarantee** at purchase. After this period, parts must be ordered direct from the OEM — often with 8–14 week lead times from Germany or Finland.

Indian-manufactured hoists from established suppliers (Indef, Sereco, HCE) carry parts stocked domestically with **3–5 day delivery** nationally.

For a process-critical crane — one whose failure stops production — the difference between a 5-day and a 12-week parts lead time is not a procurement consideration. It is a **risk management consideration** that belongs in a different budget category entirely.

## 15-Year Total Cost Comparison: Worked Example

| Parameter | Option A: Lowest Bid | Option B: TCO-Evaluated |
|-----------|---------------------|------------------------|
| Purchase Price (50t EOT) | ₹38,00,000 | ₹47,00,000 |
| Installation & Commissioning | ₹2,80,000 | ₹3,20,000 |
| Planned Maintenance (15 years) | ₹24,00,000 | ₹19,00,000 |
| Unplanned Downtime (estimated, 15yr) | ₹18,00,000 | ₹6,00,000 |
| Parts & Rope (15 years) | ₹14,00,000 | ₹11,00,000 |
| Major Overhaul (Year 12) | ₹9,00,000 | ₹7,00,000 |
| **15-Year Total Cost of Ownership** | **₹1,05,80,000** | **₹93,20,000** |
| **Net Saving** | | **₹12,60,000 (11.9%)** |

Option B saves ₹12,60,000 (11.9%) over 15 years **despite a ₹9,00,000 higher purchase price**.

## Practical Recommendations for Procurement Specifications

1. **Include a Total Cost of Ownership clause** in your RFQ, requiring vendors to provide 10-year maintenance cost estimates and parts availability commitments.

2. **Specify FEM duty group clearly.** An underspecified crane running above its rated duty group will fail earlier and cost significantly more than a properly specified unit.

3. **Require a spare parts first-year package** as part of the purchase order, including: hoist rope, brake pad set, drum end bearings, limit switch components, and control spare cards for any PLC-based system.

4. **Request MTBF data** from the vendor for the same model in similar applications. Reputable OEMs will provide this.

5. **Evaluate local service infrastructure** — not vendor claims, but verifiable technician headcount and training records within 200km of your facility.

6. **Negotiate overhaul rights and pricing** at time of purchase. Agreeing on Year-10 overhaul pricing at contract stage provides cost certainty and avoids vendor price leverage when the crane is no longer under warranty.
    `,
  },
  'india-west-africa-lifting-market-2026': {
    title: 'The State of Heavy Lifting 2026: Why India and West Africa Are Decoupling from Global Downturns',
    excerpt: 'PM Gati Shakti and West African port expansion are driving counter-cyclical demand for lifting equipment in emerging markets.',
    category: 'Market Intelligence',
    reading_time: 11,
    seo_keywords: ['India infrastructure growth 2026', 'PM Gati Shakti cranes', 'West Africa port expansion lifting equipment', 'heavy lift market 2026'],
    schema_type: 'TechnicalArticle',
    published_at: '2026-03-14',
    content: `
## The Counter-Cyclical Story

Global lifting equipment OEMs reported softening in European and North American construction markets through late 2025 and into 2026. Order books at several major tower crane manufacturers show year-on-year declines of 12–18%.

Yet the same companies are reporting record backlogs from India and accelerating enquiries from West Africa.

This decoupling — where emerging market demand is not just holding steady but actively growing while developed markets contract — represents the most significant structural shift in the global lifting industry since the Gulf construction boom of 2008–2012.

## India: PM Gati Shakti and the Crane Multiplier Effect

The National Master Plan for Multi-Modal Connectivity — PM Gati Shakti — represents a Rs. 100 lakh crore infrastructure investment commitment covering roads, railways, ports, airports, logistics hubs, power, and energy. For the lifting equipment industry, this translates to an extraordinary sustained demand signal across multiple equipment categories simultaneously.

### Where the Crane Demand Is Coming From

| Sector | Programme | Equipment Demand | Programme Timeline |
|--------|-----------|-----------------|-------------------|
| Railways | Dedicated Freight Corridors | EOT cranes for maintenance depots; mobile cranes for viaduct construction | 2025–2030 |
| Ports | Sagarmala Phase III | Ship-to-shore cranes, RTG, stacker-reclaimers at 12 major ports | 2025–2029 |
| Energy | Renewable expansion + thermal additions | Tower cranes for wind turbine erection; EOTs for plants | Ongoing |
| Manufacturing | PLI Scheme (13 priority sectors) | Industrial EOT cranes for factories; jib cranes for assembly | 2025–2028 |
| Semiconductor / Defence | New industrial corridors (Delhi-Mumbai, Chennai-Bengaluru) | Process cranes (cleanroom spec); heavy-duty EOTs | 2026–2031 |

### The Supply-Side Bottleneck Creates Opportunity

Indian EOT crane manufacturers are running at near-full capacity. Lead times for 50t+ overhead cranes from domestic manufacturers have stretched from 16 weeks (2022 norm) to **28–36 weeks in early 2026**.

This creates a clear window for:
- **Imported cranes** from Europe and China to fill the gap on short-notice projects
- **Rental markets** to absorb projects that cannot wait for new equipment delivery
- **Used equipment dealers** serving budget-constrained contractors

For rental operators with the right inventory and a strong regional presence, the demand tailwind is significant and durable through at least 2028.

## West Africa: The Port Expansion Wave

West African port expansion is being driven by a convergence of factors rarely seen simultaneously: Chinese infrastructure financing under the Belt and Road Initiative, US and European near-shoring of African supply chains, and domestic extraction industry growth in Ghana (bauxite, gold), Nigeria (LNG expansion), and Guinea (iron ore).

### Key Projects Driving Lifting Equipment Demand

**Tema Port Expansion, Ghana**
Phase 2 ship-to-shore crane procurement is in tender stage. Six post-Panamax STS units planned; stacker-reclaimer and reachstacker additions in scope. Programme: 2026–2028.

**Lekki Deep Sea Port, Nigeria**
Operational since 2023. Phase 2 RTG additions and maintenance infrastructure now in planning. Operator APM Terminals has confirmed equipment procurement is underway.

**Port of Monrovia, Liberia**
USAID-supported berth rehabilitation programme includes lifting equipment modernisation component. Opportunity for mid-capacity mobile crane supply and maintenance contracts.

**Abidjan Port Expansion, Ivory Coast**
Container terminal capacity doubling; crane erection programme confirmed for 2026–2027. French and Chinese contractors in competition.

**Dakar Port (Dakarnave), Senegal**
New container terminal coming online. Ship-to-shore and reachstacker procurement timeline confirmed for late 2026.

### Challenges: What OEMs Must Address

West Africa's infrastructure boom creates genuine opportunity but requires OEM and rental operators to address:

- **Parts supply chain:** Establish regional parts depots, not just sales offices. A crane with an 8-week European parts lead time is not suitable for a 24/7 port operation in Lagos.
- **Technical training:** Invest in training local technicians, not just international service tours. Sustainable service revenue requires local competency.
- **Credit and payment terms:** Extended credit terms and local financing partnerships are often the deciding factor for West African operators.

## The OEM Strategy Implication

For equipment manufacturers like Liebherr, Konecranes, Cargotec, and XCMG, the strategic implication is clear: market share battles in Europe and North America are being fought over a flat or shrinking pie.

In India and West Africa, the pie is growing at **12–18% annually** by most credible estimates.

Companies that establish service networks, spare parts availability, and trained local dealer relationships in these markets before 2027 will have a structural advantage that cannot be bought after the market matures.

**The first-mover advantage in B2B industrial distribution is real, durable, and large.**
    `,
  },
}

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerComponentClient<Database>({ cookies })
  const article = PILLAR_ARTICLES[params.slug]
  if (!article) {
    const { data } = await supabase.from('articles').select('title, excerpt, seo_keywords').eq('slug', params.slug).single()
    if (!data) return { title: 'Article Not Found' }
    return {
      title: data.title,
      description: data.excerpt || '',
      keywords: data.seo_keywords,
    }
  }
  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.seo_keywords,
    openGraph: { title: article.title, description: article.excerpt, type: 'article' },
  }
}

// Simple markdown-to-HTML renderer
function renderMarkdown(content: string): string {
  return content
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^\| (.*) \|$/gm, (line) => {
      if (line.includes('---')) return ''
      const cells = line.split('|').slice(1, -1).map(c => c.trim())
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>'
    })
    .replace(/(\<tr\>.*\<\/tr\>\n?)+/g, (block) => {
      const rows = block.trim().split('\n').filter(r => r.trim())
      if (rows.length === 0) return ''
      const header = rows[0].replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>')
      const body = rows.slice(1)
      return `<table><thead>${header}</thead><tbody>${body.join('')}</tbody></table>`
    })
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (block) => `<ul>${block}</ul>`)
    .replace(/^\d+\. (.*)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[htulop])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
}

export default async function ArticlePage({ params }: Props) {
  const supabase = createServerComponentClient<Database>({ cookies })
  let article = PILLAR_ARTICLES[params.slug]

  if (!article) {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single()
    if (!data) notFound()
    article = data as any
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': article.schema_type || 'TechnicalArticle',
    headline: article.title,
    description: article.excerpt,
    keywords: article.seo_keywords?.join(', '),
    author: { '@type': 'Organization', name: 'HoistMarket', url: 'https://hoistmarket.com' },
    publisher: { '@type': 'Organization', name: 'HoistMarket', url: 'https://hoistmarket.com' },
    datePublished: article.published_at,
    about: { '@type': 'Thing', name: 'Lifting Equipment' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://hoistmarket.com/knowledge-base/${params.slug}` },
  }

  const relatedArticles = Object.entries(PILLAR_ARTICLES)
    .filter(([slug]) => slug !== params.slug)
    .slice(0, 3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />
      <main>
        {/* Article Hero */}
        <section className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="flex items-center gap-2 mb-5">
              <Link href="/" className="text-slate-500 hover:text-orange-400 text-xs font-medium transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <Link href="/knowledge-base" className="text-slate-500 hover:text-orange-400 text-xs font-medium transition-colors">Knowledge Base</Link>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300 text-xs font-medium">{article.category}</span>
            </nav>
            <div className="max-w-3xl">
              <span className="badge badge-new text-xs mb-4 inline-block">{article.category}</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
                {article.title}
              </h1>
              <p className="text-slate-400 text-base leading-relaxed mb-6">{article.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {article.reading_time} min read</span>
                <span>HoistMarket Editorial</span>
                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 bg-white">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Content */}
              <div className="lg:col-span-2">
                <div
                  className="prose-hoist max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                />

                {/* SEO Keywords */}
                <div className="mt-10 p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">Related Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {article.seo_keywords?.map((kw: string) => (
                      <span key={kw} className="badge badge-free text-xs">{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex items-center gap-3 flex-wrap">
                  <Link href="/knowledge-base" className="btn-secondary btn-sm">← Back to Knowledge Base</Link>
                  <button className="btn-primary btn-sm">
                    <Zap className="w-4 h-4" /> Request Equipment Quote
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 lg:sticky lg:top-24">
                {/* CTA */}
                <div className="bg-navy-900 rounded-xl p-6 text-center">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">Need this equipment?</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">Get quotes from verified suppliers across India, GCC &amp; West Africa</p>
                  <button className="btn-primary btn-sm w-full justify-center">Request a Quote →</button>
                </div>

                {/* Unit Converter Widget */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-4 h-4 text-orange-500" />
                    <h3 className="font-bold text-navy-900 text-sm">Unit Converter</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1.5">Metric Tons → US Short Tons</p>
                      <div className="flex items-center gap-2">
                        <input id="mt-input" type="number" placeholder="Metric t" className="input text-sm py-2" onChange={(e) => {
                          const v = parseFloat(e.target.value)
                          const out = document.getElementById('mt-output') as HTMLInputElement
                          if (out) out.value = isNaN(v) ? '' : (v * 1.10231).toFixed(3)
                        }} />
                        <span className="text-xs text-slate-400">→</span>
                        <input id="mt-output" type="number" readOnly placeholder="US tons" className="input text-sm py-2 bg-slate-50" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1.5">kg → lbs</p>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="kg" className="input text-sm py-2" onChange={(e) => {
                          const v = parseFloat(e.target.value)
                          const inputs = document.querySelectorAll('.kg-out') as NodeListOf<HTMLInputElement>
                          if (inputs[0]) inputs[0].value = isNaN(v) ? '' : (v * 2.20462).toFixed(2)
                        }} />
                        <span className="text-xs text-slate-400">→</span>
                        <input className="input text-sm py-2 bg-slate-50 kg-out" type="number" readOnly placeholder="lbs" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sponsored */}
                <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-5 border border-white/5 relative">
                  <span className="absolute top-2.5 right-3 text-[9px] text-white/25 font-bold tracking-widest">SPONSORED</span>
                  <div className="text-2xl mb-2">🏗️</div>
                  <h4 className="text-white font-bold text-sm mb-2">Konecranes India</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3">Certified service partner network for EOT cranes across India.</p>
                  <button className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Related Articles */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="font-bold text-navy-900 text-sm mb-4">Related Articles</h3>
                  <div className="space-y-3">
                    {relatedArticles.map(([slug, rel]) => (
                      <Link key={slug} href={`/knowledge-base/${slug}`} className="block group">
                        <div className="text-xs text-orange-500 font-semibold mb-0.5">{rel.category}</div>
                        <div className="text-sm font-semibold text-navy-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
