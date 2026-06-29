import { useState } from 'react'
import PlannerForm from '../components/PlannerForm'
import StrategyResultView from '../components/StrategyResult'
import type { StrategyResult } from '../types'

export default function PlannerPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StrategyResult | null>(null)

  const handleSubmit = async (form: { age: string; monthly_income: string; monthly_expenses: string; goal: string; goal_years: string; risk_appetite: string }) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: Number(form.age),
          monthly_income: Number(form.monthly_income),
          monthly_expenses: Number(form.monthly_expenses),
          goal: form.goal,
          goal_years: Number(form.goal_years),
          risk_appetite: form.risk_appetite,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Strategy generation failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f3f4f6' }}>
          💰 Personal Investment Planner
        </h2>
        <p style={{ color: '#9ca3af', marginTop: '0.3rem', fontSize: '0.9rem' }}>
          Enter your income, expenses and goal — get a data-backed diversified investment strategy with real instruments, SIP amounts and projected corpus.
        </p>
      </div>

      <PlannerForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div style={{ background: '#3f0e0e', border: '1px solid #ef4444', borderRadius: 8, padding: '1rem 1.25rem', color: '#fca5a5', marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#9ca3af' }}>
          <p>Building your personalised strategy…</p>
        </div>
      )}

      {result && !loading && <StrategyResultView result={result} />}
    </div>
  )
}
