interface Props { verdict: string; confidence: string; score: number }

const colors: Record<string, { bg: string; text: string }> = {
  'STRONG BUY': { bg: '#064e3b', text: '#6ee7b7' },
  'BUY':        { bg: '#052e16', text: '#86efac' },
  'HOLD / NEUTRAL': { bg: '#1c1917', text: '#d6d3d1' },
  'SELL':       { bg: '#450a0a', text: '#fca5a5' },
  'STRONG SELL':{ bg: '#7f1d1d', text: '#fecaca' },
}

export default function VerdictBadge({ verdict, confidence }: Props) {
  const style = colors[verdict] ?? { bg: '#1f2937', text: '#9ca3af' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{
        background: style.bg,
        color: style.text,
        borderRadius: 6,
        padding: '0.3rem 0.85rem',
        fontWeight: 700,
        fontSize: '0.9rem',
        letterSpacing: '0.03em',
      }}>
        {verdict}
      </span>
      <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Confidence: {confidence}</span>
    </div>
  )
}
