import type { Indicators } from '../types'

const rsiColor = (v: number) => v < 30 ? 'var(--green)' : v > 70 ? 'var(--red)' : 'var(--text)'
const stochColor = (v: number) => v < 20 ? 'var(--green)' : v > 80 ? 'var(--red)' : 'var(--text)'
const macdColor = (v: number) => v > 0 ? 'var(--green)' : 'var(--red)'

interface Row { label: string; value: string; color?: string; hint?: string }

export default function IndicatorTable({ ind }: { ind: Indicators }) {
  const rows: Row[] = [
    { label: 'RSI (14)', value: String(ind.rsi), color: rsiColor(ind.rsi), hint: ind.rsi < 30 ? 'Oversold' : ind.rsi > 70 ? 'Overbought' : 'Neutral' },
    { label: 'MACD', value: String(ind.macd), color: macdColor(ind.macd) },
    { label: 'MACD Signal', value: String(ind.macd_signal) },
    { label: 'MACD Histogram', value: String(ind.macd_histogram), color: macdColor(ind.macd_histogram) },
    { label: 'EMA 20', value: `₹${ind.ema20.toLocaleString('en-IN')}` },
    { label: 'EMA 50', value: `₹${ind.ema50.toLocaleString('en-IN')}` },
    { label: 'EMA 200', value: `₹${ind.ema200.toLocaleString('en-IN')}` },
    { label: 'BB Upper', value: `₹${ind.bb_upper.toLocaleString('en-IN')}` },
    { label: 'BB Mid', value: `₹${ind.bb_mid.toLocaleString('en-IN')}` },
    { label: 'BB Lower', value: `₹${ind.bb_lower.toLocaleString('en-IN')}` },
    { label: 'Stoch %K', value: String(ind.stoch_k), color: stochColor(ind.stoch_k) },
    { label: 'Stoch %D', value: String(ind.stoch_d), color: stochColor(ind.stoch_d) },
    { label: 'ATR (14)', value: `₹${ind.atr.toLocaleString('en-IN')}` },
    { label: 'Volume Ratio', value: `${ind.volume_ratio}x`, color: ind.volume_ratio > 1.5 ? 'var(--yellow)' : 'var(--text)', hint: ind.volume_ratio > 1.5 ? 'High' : ind.volume_ratio < 0.5 ? 'Low' : undefined },
  ]

  return (
    <div>
      <h4 style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
        Technical Indicators
      </h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
        <tbody>
          {rows.map(row => (
            <tr key={row.label} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.35rem 0', color: 'var(--muted)' }}>{row.label}</td>
              <td style={{ padding: '0.35rem 0', textAlign: 'right', color: row.color ?? 'var(--text)', fontWeight: 600 }}>
                {row.value}
                {row.hint && <span style={{ marginLeft: 6, fontSize: '0.75rem', opacity: 0.75 }}>({row.hint})</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
