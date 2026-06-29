import type { AnalysisResult } from '../types'

const fmt = (n: number | null, prefix = '') =>
  n == null ? 'N/A' : `${prefix}${n.toLocaleString('en-IN')}`

const fmtCr = (n: number | null) => {
  if (n == null) return 'N/A'
  const cr = n / 1e7
  return cr >= 100000 ? `₹${(cr / 100000).toFixed(2)}L Cr` : `₹${cr.toFixed(0)} Cr`
}

export default function CompanyHeader({ result }: { result: AnalysisResult }) {
  const { company, symbol, exchange, sector, industry, market_cap, pe_ratio, week52_high, week52_low } = result
  const currentPrice = result.analysis[0]?.levels?.current_price

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      marginTop: '2rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{company}</h2>
          <p style={{ color: 'var(--muted)', marginTop: 2 }}>{symbol} · {exchange} · {sector} · {industry}</p>
        </div>
        {currentPrice && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--green)' }}>
              ₹{currentPrice.toLocaleString('en-IN')}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Current Price</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
        {[
          ['Market Cap', fmtCr(market_cap)],
          ['P/E Ratio', fmt(pe_ratio)],
          ['52W High', fmt(week52_high, '₹')],
          ['52W Low', fmt(week52_low, '₹')],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: 2 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
