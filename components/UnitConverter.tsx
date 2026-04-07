'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'

type ConvTab = 'weight' | 'length' | 'pressure' | 'duty'

interface ConvField {
  id: string
  label: string
  from: string
  to: string
  factor: number
  toFixed: number
}

const CONVERSIONS: Record<string, ConvField[]> = {
  weight: [
    { id: 'mt_st', label: 'Metric Tons → US Short Tons', from: 'Metric t', to: 'US Short Tons', factor: 1.10231, toFixed: 3 },
    { id: 'mt_lt', label: 'Metric Tons → Long Tons', from: 'Metric t', to: 'Long Tons', factor: 0.984207, toFixed: 3 },
    { id: 'kg_lb', label: 'Kilograms → Pounds', from: 'kg', to: 'lbs', factor: 2.20462, toFixed: 2 },
    { id: 'kn_tf', label: 'Kilonewtons → Metric Tons Force', from: 'kN', to: 'Metric t', factor: 0.10197, toFixed: 3 },
  ],
  length: [
    { id: 'm_ft', label: 'Metres → Feet', from: 'm', to: 'ft', factor: 3.28084, toFixed: 3 },
    { id: 'mm_in', label: 'Millimetres → Inches', from: 'mm', to: 'in', factor: 0.0393701, toFixed: 4 },
    { id: 'mm_ft', label: 'Millimetres → Feet', from: 'mm', to: 'ft', factor: 0.00328084, toFixed: 5 },
    { id: 'ft_m', label: 'Feet → Metres', from: 'ft', to: 'm', factor: 0.3048, toFixed: 4 },
  ],
  pressure: [
    { id: 'kpa_psi', label: 'kN/m² → PSI', from: 'kN/m²', to: 'psi', factor: 0.14504, toFixed: 3 },
    { id: 'mpa_psi', label: 'MPa → PSI', from: 'MPa', to: 'psi', factor: 145.038, toFixed: 2 },
    { id: 'bar_psi', label: 'Bar → PSI', from: 'Bar', to: 'psi', factor: 14.5038, toFixed: 2 },
    { id: 'mpa_kpa', label: 'MPa → kN/m²', from: 'MPa', to: 'kN/m²', factor: 1000, toFixed: 1 },
  ],
}

const FEM_DUTY_TABLE = [
  { group: 'A1', hours: '<800', ops: '<2h/day', example: 'Workshop / maintenance crane', color: 'bg-green-50 text-green-800 border-green-200' },
  { group: 'A3', hours: '800–3,200', ops: '2–4h/day', example: 'General warehouse / light industry', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { group: 'A5', hours: '3,200–12,500', ops: '4–8h/day', example: 'Steel / paper / heavy process', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { group: 'A7', hours: '>12,500', ops: '16–24h/day', example: '24/7 continuous process plant', color: 'bg-red-50 text-red-800 border-red-200' },
]

export default function UnitConverter() {
  const [tab, setTab] = useState<ConvTab>('weight')
  const [values, setValues] = useState<Record<string, string>>({})
  const [dcHours, setDcHours] = useState('')
  const [dcDays, setDcDays] = useState('')

  const handleInput = (id: string, factor: number, toFixed: number, val: string) => {
    setValues(prev => ({
      ...prev,
      [id]: val,
      [`${id}_out`]: val ? (parseFloat(val) * factor).toFixed(toFixed) : '',
    }))
  }

  const totalHours = parseFloat(dcHours) * parseFloat(dcDays)
  const dutGroup = !totalHours ? null
    : totalHours < 800 ? FEM_DUTY_TABLE[0]
    : totalHours < 3200 ? FEM_DUTY_TABLE[1]
    : totalHours < 12500 ? FEM_DUTY_TABLE[2]
    : FEM_DUTY_TABLE[3]

  const TABS: { id: ConvTab; label: string }[] = [
    { id: 'weight', label: 'Weight' },
    { id: 'length', label: 'Length' },
    { id: 'pressure', label: 'Pressure' },
    { id: 'duty', label: 'Duty Cycle' },
  ]

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-navy-900 border-b border-navy-800">
        <Calculator className="w-4 h-4 text-orange-400" />
        <h4 className="text-white font-bold text-sm">Engineering Calculators</h4>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${
              tab === t.id
                ? 'bg-white text-orange-600 border-b-2 border-orange-500'
                : 'bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Duty Cycle Calculator */}
        {tab === 'duty' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter operating pattern to estimate FEM crane duty group
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Hours / Day
                </label>
                <input
                  type="number"
                  value={dcHours}
                  onChange={e => setDcHours(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Days / Year
                </label>
                <input
                  type="number"
                  value={dcDays}
                  onChange={e => setDcDays(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {dutGroup && (
              <div className={`rounded-lg border p-3 ${dutGroup.color}`}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                  Estimated FEM Duty Group
                </div>
                <div className="text-2xl font-extrabold mb-0.5">{dutGroup.group}</div>
                <div className="text-xs font-semibold">{totalHours.toFixed(0)} hrs/year · {dutGroup.ops}</div>
                <div className="text-xs mt-1 opacity-70">{dutGroup.example}</div>
              </div>
            )}

            <div className="mt-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference Table</p>
              <div className="space-y-1">
                {FEM_DUTY_TABLE.map(row => (
                  <div
                    key={row.group}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded border ${row.color} ${
                      dutGroup?.group === row.group ? 'ring-2 ring-offset-1 ring-orange-400' : ''
                    }`}
                  >
                    <span className="font-bold">{row.group}</span>
                    <span className="opacity-70">{row.ops}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Unit Converters */}
        {tab !== 'duty' && (
          <div className="space-y-3">
            {CONVERSIONS[tab]?.map(conv => (
              <div key={conv.id}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {conv.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={values[conv.id] || ''}
                    onChange={e => handleInput(conv.id, conv.factor, conv.toFixed, e.target.value)}
                    placeholder={conv.from}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-slate-400 text-xs font-bold flex-shrink-0">→</span>
                  <input
                    type="text"
                    value={values[`${conv.id}_out`] || ''}
                    readOnly
                    placeholder={conv.to}
                    className="flex-1 px-3 py-2 text-sm border border-slate-100 rounded bg-slate-50 text-orange-600 font-mono font-semibold cursor-default"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => setValues({})}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors w-full text-center pt-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
