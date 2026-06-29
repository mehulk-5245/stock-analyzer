import { useState } from 'react'

interface FormData {
  age: string
  monthly_income: string
  monthly_expenses: string
  goal: string
  goal_years: string
  risk_appetite: string
}

interface Props {
  onSubmit: (data: FormData) => void
  loading: boolean
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 8,
  padding: '0.65rem 0.9rem',
  color: '#f3f4f6',
  fontSize: '0.95rem',
  outline: 'none',
  marginTop: '0.35rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.1rem',
}

export default function PlannerForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormData>({
    age: '',
    monthly_income: '',
    monthly_expenses: '',
    goal: '',
    goal_years: '10',
    risk_appetite: 'moderate',
  })

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const valid = form.age && form.monthly_income && form.monthly_expenses && form.goal && form.goal_years

  return (
    <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, padding: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
        <div>
          <label style={labelStyle}>Your Age</label>
          <input type="number" placeholder="e.g. 30" value={form.age} onChange={set('age')} min={18} max={75} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Monthly Income (₹)</label>
          <input type="number" placeholder="e.g. 100000" value={form.monthly_income} onChange={set('monthly_income')} min={0} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Monthly Expenses (₹)</label>
          <input type="number" placeholder="e.g. 60000" value={form.monthly_expenses} onChange={set('monthly_expenses')} min={0} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Goal Horizon (years)</label>
          <input type="number" placeholder="e.g. 20" value={form.goal_years} onChange={set('goal_years')} min={1} max={40} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Risk Appetite</label>
          <select value={form.risk_appetite} onChange={set('risk_appetite')} style={{ ...inputStyle, marginTop: '0.35rem' }}>
            <option value="conservative">Conservative (FDs, PPF, Debt funds)</option>
            <option value="moderate">Moderate (Balanced — Index + Debt)</option>
            <option value="aggressive">Aggressive (Heavy equity, small-cap)</option>
          </select>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Your Financial Goal</label>
          <input
            type="text"
            placeholder="e.g. Retire at 60 with ₹5 Crore, Buy house in 5 years, Child education fund"
            value={form.goal}
            onChange={set('goal')}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
      </div>
      <button
        onClick={() => onSubmit(form)}
        disabled={!valid || loading}
        style={{
          marginTop: '1.25rem',
          background: loading ? '#374151' : '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '0.75rem 2rem',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: !valid || loading ? 'not-allowed' : 'pointer',
          opacity: !valid || loading ? 0.6 : 1,
          width: '100%',
        }}
      >
        {loading ? 'Analyzing your finances…' : 'Build My Investment Strategy'}
      </button>
    </div>
  )
}
