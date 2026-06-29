const icon = (s: string) => {
  const l = s.toLowerCase()
  if (l.includes('bullish') || l.includes('oversold') || l.includes('bounce')) return '🟢'
  if (l.includes('bearish') || l.includes('overbought') || l.includes('pullback')) return '🔴'
  if (l.includes('surge') || l.includes('high volume')) return '🟡'
  if (l.includes('low volume') || l.includes('weak')) return '⚪'
  return '🔵'
}

export default function SignalsList({ signals }: { signals: string[] }) {
  return (
    <div>
      <h4 style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
        Signal Breakdown
      </h4>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {signals.map((s, i) => (
          <li key={i} style={{ fontSize: '0.86rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0 }}>{icon(s)}</span>
            <span style={{ color: 'var(--text)', lineHeight: 1.4 }}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
