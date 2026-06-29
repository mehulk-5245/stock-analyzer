import type { TimeframeAnalysis } from '../types'
import IndicatorTable from './IndicatorTable'
import LevelsPanel from './LevelsPanel'
import SignalsList from './SignalsList'
import VerdictBadge from './VerdictBadge'

export default function TimeframeCard({ data }: { data: TimeframeAnalysis }) {
  if (data.error) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
        <h3 style={{ color: 'var(--muted)' }}>{data.timeframe}</h3>
        <p style={{ color: 'var(--red)', marginTop: 8 }}>{data.error}</p>
      </div>
    )
  }

  const changeColor = data.price_change_pct >= 0 ? 'var(--green)' : 'var(--red)'
  const sign = data.price_change_pct >= 0 ? '+' : ''

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        background: 'var(--surface2)',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{data.timeframe}</span>
          <span style={{ color: changeColor, fontWeight: 600 }}>
            {sign}{data.price_change_pct}%
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{data.candles} candles</span>
        </div>
        <VerdictBadge verdict={data.verdict} confidence={data.confidence} score={data.score} />
      </div>

      <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <IndicatorTable ind={data.indicators} />
        <LevelsPanel levels={data.levels} />
        <SignalsList signals={data.signals} />
      </div>
    </div>
  )
}
