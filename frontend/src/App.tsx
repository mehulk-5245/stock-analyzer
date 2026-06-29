import { useState } from 'react'
import type { AnalysisResult } from './types'
import SearchBar from './components/SearchBar'
import CompanyHeader from './components/CompanyHeader'
import TimeframeCard from './components/TimeframeCard'
import Disclaimer from './components/Disclaimer'
import PlannerPage from './pages/PlannerPage'

type Tab = 'analyzer' | 'planner'

export default function App() {
  const [tab, setTab] = useState<Tab>('analyzer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleSearch = async (company: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`/api/analyze?company=${encodeURIComponent(company)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#6366f1', letterSpacing: '-0.5px' }}>
          📈 Indian Market Intelligence
        </h1>
        <p style={{ color: '#9ca3af', marginTop: '0.4rem' }}>
          BSE / NSE Technical Analysis · Personal Investment Planner
        </p>
      </header>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid #374151', paddingBottom: '0' }}>
        {([['analyzer', '📊 Stock Analyzer'], ['planner', '💰 Investment Planner']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
              color: tab === t ? '#6366f1' : '#9ca3af',
              padding: '0.6rem 1.2rem',
              fontWeight: tab === t ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'analyzer' && (
        <>
          <SearchBar onSearch={handleSearch} loading={loading} />
          {error && (
            <div style={{ background: '#3f0e0e', border: '1px solid #ef4444', borderRadius: 8, padding: '1rem 1.25rem', color: '#fca5a5', marginTop: '1.5rem' }}>
              {error}
            </div>
          )}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: '#9ca3af' }}>
              <p>Fetching market data and running analysis…</p>
            </div>
          )}
          {result && !loading && (
            <>
              <CompanyHeader result={result} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                {result.analysis.map(tf => (
                  <TimeframeCard key={tf.timeframe} data={tf} />
                ))}
              </div>
              <Disclaimer text={result.disclaimer} />
            </>
          )}
        </>
      )}

      {tab === 'planner' && <PlannerPage />}
    </div>
  )
}
