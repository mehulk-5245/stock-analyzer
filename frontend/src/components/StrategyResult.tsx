import type { StrategyResult } from '../types'

const cr = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

const COLORS = [
  '#6366f1','#10b981','#f59e0b','#3b82f6','#ef4444',
  '#8b5cf6','#06b6d4','#84cc16','#f97316','#ec4899',
]

export default function StrategyResultView({ result }: { result: StrategyResult }) {
  const { profile, emergency_fund, allocation_pct, monthly_amounts, instruments, corpus_projection, tax_savings, key_rules, disclaimer } = result
  const assets = Object.keys(allocation_pct)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>

      {/* Profile Summary */}
      <Section title="Your Financial Snapshot">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {[
            ['Age', `${profile.age} yrs`],
            ['Monthly Income', inr(profile.monthly_income)],
            ['Monthly Expenses', inr(profile.monthly_expenses)],
            ['Monthly Surplus', inr(profile.monthly_surplus)],
            ['Savings Rate', `${profile.savings_rate_pct}%`],
            ['Investable / mo', inr(profile.investable_monthly)],
            ['Goal Horizon', `${profile.goal_years} years`],
            ['Yrs to Retire', `${profile.years_to_retire} yrs`],
            ['Risk Profile', profile.risk_appetite.charAt(0).toUpperCase() + profile.risk_appetite.slice(1)],
          ].map(([k, v]) => (
            <StatBox key={k} label={k as string} value={v as string} />
          ))}
        </div>
        <div style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', background: '#1f2937', borderRadius: 8, color: '#c7d2fe', fontStyle: 'italic' }}>
          🎯 Goal: {profile.goal}
        </div>
      </Section>

      {/* Emergency Fund */}
      <Section title="Step 1 — Build Emergency Fund First">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <StatBox label="Target (6 months expenses)" value={cr(emergency_fund.target)} color="#f59e0b" />
          <StatBox label="Monthly Contribution" value={inr(emergency_fund.monthly_contribution)} color="#f59e0b" />
          <StatBox label="Months to Build" value={`${emergency_fund.months_to_build} months`} color="#f59e0b" />
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.6rem' }}>
          📍 Where: {emergency_fund.where}
        </p>
      </Section>

      {/* Allocation */}
      <Section title="Step 2 — Asset Allocation">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Donut chart (CSS-based) */}
          <DonutChart allocation={allocation_pct} colors={COLORS} />
          {/* Allocation table */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: '#9ca3af', padding: '0.3rem 0', fontWeight: 500 }}>Asset</th>
                  <th style={{ textAlign: 'right', color: '#9ca3af', padding: '0.3rem 0', fontWeight: 500 }}>%</th>
                  <th style={{ textAlign: 'right', color: '#9ca3af', padding: '0.3rem 0', fontWeight: 500 }}>Monthly SIP</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, i) => (
                  <tr key={asset} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                      {asset}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: COLORS[i % COLORS.length] }}>{allocation_pct[asset]}%</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{inr(monthly_amounts[asset])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Instruments */}
      <Section title="Step 3 — Recommended Instruments">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {assets.filter(a => instruments[a]).map((asset, i) => (
            <div key={asset} style={{ background: '#1f2937', borderRadius: 8, padding: '0.85rem 1rem', borderLeft: `3px solid ${COLORS[i % COLORS.length]}` }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: COLORS[i % COLORS.length] }}>{asset}</div>
              {instruments[asset].map((inst, j) => (
                <div key={j} style={{ fontSize: '0.83rem', color: '#d1d5db', padding: '0.15rem 0' }}>• {inst}</div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* Corpus Projection */}
      <Section title="Step 4 — Corpus Projection">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <StatBox label="Monthly SIP Total" value={inr(corpus_projection.investable_monthly)} color="#10b981" />
          <StatBox label="Projected at 10 Years" value={cr(corpus_projection.total_10yr)} color="#10b981" />
          <StatBox label={`Projected at ${profile.goal_years} Years`} value={cr(corpus_projection.total_goal_yrs)} color="#6366f1" />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              {['Asset', 'Monthly SIP', 'CAGR', '10yr Corpus', `${profile.goal_years}yr Corpus`].map((h, hi) => (
                <th key={h} style={{ textAlign: hi === 0 ? 'left' : 'right', color: '#9ca3af', padding: '0.4rem 0.5rem', fontWeight: 500 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(corpus_projection.breakdown).map(([asset, cb], i) => (
              <tr key={asset} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '0.4rem 0.5rem', color: COLORS[i % COLORS.length], fontWeight: 500 }}>{asset}</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>{inr(cb.monthly_sip)}</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem', color: '#10b981' }}>{cb.assumed_cagr_pct}%</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>{cr(cb.corpus_10yr)}</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem', color: '#6366f1', fontWeight: 600 }}>{cr(cb.corpus_goal_yrs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Tax Savings */}
      <Section title="Tax Optimisation">
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tax_savings.map((t, i) => (
            <li key={i} style={{ fontSize: '0.88rem', color: '#d1d5db', display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span> {t}
            </li>
          ))}
        </ul>
      </Section>

      {/* Key Rules */}
      <Section title="Strategy Principles Applied">
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {key_rules.map((r, i) => (
            <li key={i} style={{ fontSize: '0.86rem', color: '#d1d5db', display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: '#6366f1', flexShrink: 0 }}>▸</span> {r}
            </li>
          ))}
        </ul>
      </Section>

      {/* Disclaimer */}
      <div style={{ background: '#1c1406', border: '1px solid #78350f', borderRadius: 8, padding: '0.85rem 1.25rem', color: '#fde68a', fontSize: '0.82rem', lineHeight: 1.5 }}>
        ⚠️ {disclaimer}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: '#1f2937', borderBottom: '1px solid #374151', padding: '0.75rem 1.25rem', fontWeight: 700, fontSize: '0.95rem' }}>
        {title}
      </div>
      <div style={{ padding: '1.1rem 1.25rem' }}>{children}</div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#1f2937', borderRadius: 8, padding: '0.7rem 0.9rem' }}>
      <div style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ color: color ?? '#f3f4f6', fontWeight: 700, fontSize: '1.05rem', marginTop: '0.2rem' }}>{value}</div>
    </div>
  )
}

function DonutChart({ allocation, colors }: { allocation: Record<string, number>; colors: string[] }) {
  const entries = Object.entries(allocation)
  const total = entries.reduce((s, [, v]) => s + v, 0)
  let cumulative = 0
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 60
  const innerR = 36

  const slices = entries.map(([label, val], i) => {
    const pct = val / total
    const startAngle = (cumulative / 100) * 360 - 90
    const endAngle = ((cumulative + val) / 100) * 360 - 90
    cumulative += val
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)
    const largeArc = pct > 0.5 ? 1 : 0
    const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
    return { d, color: colors[i % colors.length], label, val }
  })

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity={0.9}>
            <title>{s.label}: {s.val}%</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={innerR} fill="#111827" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#f3f4f6" fontSize="10" fontWeight="bold">Allocation</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize="9">Diversified</text>
      </svg>
    </div>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
