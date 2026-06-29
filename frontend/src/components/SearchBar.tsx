import { useState } from 'react'

interface Props {
  onSearch: (company: string) => void
  loading: boolean
}

const EXAMPLES = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'WIPRO', 'SBIN', 'ITC', 'BAJFINANCE']

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')

  const submit = () => {
    const v = value.trim()
    if (v) onSearch(v)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Enter NSE/BSE ticker or company name (e.g. RELIANCE, TCS, INFY)"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          disabled={loading}
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            color: 'var(--text)',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !value.trim() ? 0.6 : 1,
          }}
        >
          Analyze
        </button>
      </div>
      <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => { setValue(ex); onSearch(ex) }}
            disabled={loading}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '0.2rem 0.75rem',
              color: 'var(--muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
