import type { Levels } from '../types'

const r = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function LevelsPanel({ levels }: { levels: Levels }) {
  return (
    <div>
      <h4 style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
        Key Price Levels
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Resistance */}
        {[...levels.resistance].reverse().map((v, i) => (
          <LevelRow key={`r${i}`} label={`Resistance ${levels.resistance.length - i}`} value={r(v)} color="var(--red)" bar />
        ))}

        {/* Current */}
        <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Current Price</span>
          <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{r(levels.current_price)}</span>
        </div>

        {/* Support */}
        {levels.support.map((v, i) => (
          <LevelRow key={`s${i}`} label={`Support ${i + 1}`} value={r(v)} color="var(--green)" bar />
        ))}

        <div style={{ marginTop: '0.5rem', height: 1, background: 'var(--border)' }} />

        <LevelRow label="Stop Loss" value={r(levels.stop_loss)} color="var(--red)" bold />
        <LevelRow label="Target 1 (1.5× ATR)" value={r(levels.target_1)} color="var(--green)" />
        <LevelRow label="Target 2 (3× ATR)"   value={r(levels.target_2)} color="var(--green)" />
        <LevelRow label="Target 3 (4.5× ATR)" value={r(levels.target_3)} color="var(--green)" />
      </div>
    </div>
  )
}

function LevelRow({ label, value, color, bold, bar }: {
  label: string; value: string; color: string; bold?: boolean; bar?: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.88rem',
      padding: bar ? '0.25rem 0' : '0.2rem 0',
      borderLeft: bar ? `3px solid ${color}` : undefined,
      paddingLeft: bar ? '0.5rem' : undefined,
    }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  )
}
