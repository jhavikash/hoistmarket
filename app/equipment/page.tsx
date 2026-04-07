import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Equipment Hub — Crane & Hoist Technical Specifications | HoistMarket',
  description:
    'Technical specifications for lifting equipment: EOT cranes, mobile cranes, hoists, rigging gear. FEM duty classification comparison, ASME B30 standards, load capacities.',
}

const EQUIPMENT_CATEGORIES = [
  {
    id: 'overhead-cranes',
    icon: '🏗️',
    name: 'Overhead / EOT Cranes',
    specs: [
      { label: 'Capacity Range', value: '0.5t – 800t' },
      { label: 'Span', value: 'Up to 35m' },
      { label: 'Standard', value: 'FEM / ASME / IS 3177' },
    ],
    types: ['Single Girder EOT', 'Double Girder EOT', 'Gantry Crane', 'Semi-Gantry', 'Monorail', 'Underslung', 'Jib Crane', 'Portal Crane'],
    desc: 'Bridge cranes, gantry cranes, monorail and underslung systems for industrial facilities. Duty classifications FEM A1–A8 covering workshops to continuous steel plant operations.',
  },
  {
    id: 'hoists',
    icon: '⚙️',
    name: 'Hoists & Winches',
    specs: [
      { label: 'Capacity Range', value: '0.1t – 200t' },
      { label: 'Lift Height', value: 'Up to 200m' },
      { label: 'Duty Class', value: 'M1 – M8' },
    ],
    types: ['Electric Chain Hoist', 'Wire Rope Hoist', 'Air/Pneumatic Hoist', 'Manual Chain Block', 'Lever Hoist', 'Capstan Winch', 'Subsea Winch'],
    desc: 'Electric chain hoists, wire rope hoists, pneumatic hoists, and winches for lifting and pulling. Selection governed by FEM mechanism group M1–M8 and operating hours.',
  },
  {
    id: 'mobile-cranes',
    icon: '🚧',
    name: 'Mobile Cranes',
    specs: [
      { label: 'Capacity Range', value: '10t – 1,600t' },
      { label: 'Boom Length', value: 'Up to 120m' },
      { label: 'Standard', value: 'ASME B30.5 / EN 13000' },
    ],
    types: ['All-Terrain Crane', 'Rough Terrain', 'Crawler Crane', 'Truck Crane', 'Pick & Carry', 'City Crane', 'Mini Crawler', 'Superlift'],
    desc: 'All-terrain, rough terrain, crawler, and truck cranes for project and industrial lifting. Load chart reading, outrigger ground bearing, and site access planning are critical for safe operation.',
  },
  {
    id: 'rigging',
    icon: '🔗',
    name: 'Rigging & Lifting Gear',
    specs: [
      { label: 'WLL Range', value: '0.25t – 1,000t' },
      { label: 'Standard', value: 'ASME B30.9 / EN 818' },
      { label: 'Inspection', value: 'Per EN 10264' },
    ],
    types: ['Wire Rope Sling', 'Chain Sling', 'Webbing Sling', 'Round Sling', 'Dee Shackle', 'Bow Shackle', 'Hooks', 'Spreader Beam', 'Lifting Beam', 'Below-Hook Devices'],
    desc: 'Wire rope slings, chain slings, synthetic webbing, shackles, hooks, and below-hook lifting devices. WLL reduction factors, inspection intervals, and rejection criteria per ASME B30.9 and EN 818.',
  },
  {
    id: 'material-handling',
    icon: '📦',
    name: 'Material Handling',
    specs: [
      { label: 'Throughput', value: 'Up to 20,000 t/h' },
      { label: 'Belt Runs', value: 'Up to 5km' },
      { label: 'Standard', value: 'CEMA / ISO 5048' },
    ],
    types: ['Belt Conveyor', 'Bucket Elevator', 'Stacker', 'Reclaimer', 'Shiploader', 'Grab Crane', 'Pneumatic Conveyor', 'Roller Conveyor'],
    desc: 'Conveyors, stackers, reclaimers, bucket elevators, and bulk handling systems for ports, power plants, and process industries. Throughput calculations and system integration.',
  },
  {
    id: 'offshore',
    icon: '⛽',
    name: 'Offshore & Marine Cranes',
    specs: [
      { label: 'Capacity', value: 'Up to 5,000t' },
      { label: 'Water Depth', value: 'Up to 3,000m' },
      { label: 'Standard', value: 'DNVGL-ST-0378' },
    ],
    types: ['Pedestal Crane', 'Knuckle Boom Crane', 'Lattice Boom', 'Subsea Frame', 'AHC Crane', 'Gangway', 'Pipe Lay Crane'],
    desc: 'Pedestal cranes, knuckle boom cranes, subsea lifting systems, and heave-compensated equipment for offshore platforms, FPSOs, and marine construction vessels.',
  },
  {
    id: 'tower-cranes',
    icon: '🏙️',
    name: 'Tower Cranes',
    specs: [
      { label: 'Max Radius', value: 'Up to 80m' },
      { label: 'Tip Load', value: 'Up to 25t at tip' },
      { label: 'Standard', value: 'EN 14439 / ASME B30.3' },
    ],
    types: ['Hammerhead', 'Luffing Jib', 'Self-Erecting', 'Flat Top', 'Saddle Jib', 'Topless / Flat Top'],
    desc: 'Luffing jib, hammerhead, flat top, and self-erecting tower cranes for construction and infrastructure. Anchoring systems, mast climbing procedures, and safe working load tables.',
  },
  {
    id: 'load-testing',
    icon: '🔬',
    name: 'Load Testing & Inspection',
    specs: [
      { label: 'Proof Load', value: '100% – 125% WLL' },
      { label: 'NDT Methods', value: 'MPI / UT / RT / PT' },
      { label: 'Standard', value: 'BS EN 1677 / ASME' },
    ],
    types: ['Proof Load Test', 'Dynamic Load Test', 'MPI', 'Ultrasonic Testing', 'Radiographic', 'Visual Inspection', 'Rope NDT', 'CASS Testing'],
    desc: 'NDT methods, proof load testing, dynamic load testing, and inspection protocols for in-service and commissioning testing. Statutory requirements vary by jurisdiction.',
  },
]

const SPEC_COMPARE_ROWS = [
  { label: 'FEM Duty Group', vals: ['A1', 'A3', 'A5', 'A7'], best: 3 },
  { label: 'Mechanism Group', vals: ['M1', 'M3', 'M5', 'M7'], best: 3 },
  { label: 'Daily Operating Hours', vals: ['< 2 hrs', '2–4 hrs', '4–8 hrs', '16–24 hrs'], best: 3 },
  { label: 'Design Life (hrs)', vals: ['800', '3,200', '12,500', '50,000'], best: 3 },
  { label: 'Wire Rope Safety Factor', vals: ['3.5:1', '3.5:1', '4:1', '4:1'], best: 2 },
  { label: 'Motor Duty Class', vals: ['S2-30min', 'S3-25%', 'S3-40%', 'S4-60%'], best: 3 },
  { label: 'Fatigue Group', vals: ['E1', 'E3', 'E5', 'E7'], best: 3 },
  { label: 'Typical Industry', vals: ['Workshop', 'Warehouse', 'Heavy Industry', 'Steel / Mining'], best: 3 },
  { label: 'Annual Inspections', vals: ['1/year', '2/year', '2/year', '4/year'], best: 3 },
]

const SPEC_COLS = ['FEM 1Am (Light)', 'FEM 2M (Medium)', 'FEM 3M (Heavy)', 'FEM 4M (Very Heavy)']

export default function EquipmentPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <div className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Equipment Hub</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Lifting Equipment<br/>
              <span className="text-orange-500">Technical Reference</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Specifications, configurations, applicable standards, and duty classifications for every major 
              lifting and material handling equipment category.
            </p>
          </div>
        </div>

        {/* EQUIPMENT CATEGORIES */}
        <section className="py-8">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
              {EQUIPMENT_CATEGORIES.map(cat => (
                <a key={cat.id} href={`#${cat.id}`} className="bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 rounded-lg p-3 text-center transition-all group">
                  <div className="text-2xl mb-1.5">{cat.icon}</div>
                  <div className="text-xs font-semibold text-slate-700 group-hover:text-orange-600 leading-tight">{cat.name}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY DETAIL SECTIONS */}
        {EQUIPMENT_CATEGORIES.map((cat, idx) => (
          <section
            key={cat.id}
            id={cat.id}
            className={`py-14 border-t border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
          >
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-10">
                {/* LEFT: Identity + Specs */}
                <div>
                  <div className="text-5xl mb-4">{cat.icon}</div>
                  <h2 className="text-2xl font-extrabold text-navy-900 mb-4">{cat.name}</h2>
                  <div className="space-y-px mb-5">
                    {cat.specs.map(spec => (
                      <div key={spec.label} className="flex justify-between items-center bg-navy-900 px-4 py-3">
                        <span className="text-xs font-bold tracking-wider uppercase text-slate-400">{spec.label}</span>
                        <span className="font-bold text-white text-sm">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.types.map(t => (
                      <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 font-medium">{t}</span>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Description + CTA */}
                <div className="lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-600 leading-relaxed text-base mb-6">{cat.desc}</p>
                    <div className="flex gap-3 flex-wrap">
                      <Link href={`/knowledge-base`} className="btn-ghost btn-sm">
                        View Technical Guides <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link href="/contact" className="btn-primary btn-sm">
                        <Zap className="w-3.5 h-3.5" /> Request Quote
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* SPEC COMPARE TOOL */}
        <section className="py-16 bg-navy-950">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-2">Interactive Tool</div>
              <h2 className="text-3xl font-bold text-white mb-2">EOT Crane Duty Classification Comparison</h2>
              <p className="text-slate-400">Side-by-side FEM duty group comparison for specification writing</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-navy-700">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="bg-navy-800 text-white px-5 py-4 text-left text-xs font-bold tracking-wider uppercase border-r border-navy-700 w-48">
                      Parameter
                    </th>
                    {SPEC_COLS.map((col, i) => (
                      <th
                        key={col}
                        className={`px-5 py-4 text-left text-xs font-bold tracking-wider uppercase border-r border-navy-700 last:border-r-0 ${
                          i === 3 ? 'bg-orange-500 text-white' : 'bg-navy-800 text-white'
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_COMPARE_ROWS.map((row, ri) => (
                    <tr key={row.label} className={ri % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800/50'}>
                      <td className="px-5 py-3.5 font-semibold text-white border-r border-navy-700 text-sm">
                        {row.label}
                      </td>
                      {row.vals.map((val, vi) => (
                        <td
                          key={vi}
                          className={`px-5 py-3.5 border-r border-navy-700 last:border-r-0 text-sm font-mono ${
                            row.best === vi
                              ? 'text-orange-400 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          {val}
                          {row.best === vi && <span className="ml-2 text-xs text-orange-400">✓</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              Based on FEM 1.001 (4th Edition). Consult the full standard for design calculations. 
              <Link href="/knowledge-base/crane-duty-classification-fem-asme" className="text-orange-400 hover:underline ml-1">Read the full guide →</Link>
            </p>
          </div>
        </section>

        {/* STANDARDS REFERENCE */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Standards Reference</div>
              <h2 className="text-3xl font-bold text-navy-900">Key Standards by Equipment Type</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-900">
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-wider uppercase text-white border-r border-navy-800">Equipment</th>
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-wider uppercase text-white border-r border-navy-800">US / ASME</th>
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-wider uppercase text-white border-r border-navy-800">European / EN</th>
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-wider uppercase text-white border-r border-navy-800">India / IS</th>
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-wider uppercase text-white">Offshore / Special</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Overhead / EOT Crane', 'ASME B30.2', 'EN 15011 / FEM 1.001', 'IS 3177 / IS 807', 'DNVGL (offshore EOT)'],
                    ['Mobile Crane', 'ASME B30.5', 'EN 13000', 'IS 4573', 'API 2C (offshore)'],
                    ['Wire Rope Slings', 'ASME B30.9', 'EN 12385 / EN 818', 'IS 2266', 'DNVGL-ST-E271'],
                    ['Chain Slings', 'ASME B30.9', 'EN 818-4', 'IS 3109', '—'],
                    ['Hooks', 'ASME B30.10', 'EN 1677', 'IS 5749', '—'],
                    ['Shackles', 'ASME B30.26', 'EN 13889', 'IS 6224', '—'],
                    ['Tower Crane', 'ASME B30.3', 'EN 14439 / FEM 1.001', '—', '—'],
                    ['Offshore Crane', 'API 2C', 'EN 13852', '—', 'DNVGL-ST-0378'],
                  ].map(([eq, asme, en, is_, special]) => (
                    <tr key={eq} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-navy-900">{eq}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-orange-600 font-semibold">{asme}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-blue-600 font-semibold">{en}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-green-600 font-semibold">{is_}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{special}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
