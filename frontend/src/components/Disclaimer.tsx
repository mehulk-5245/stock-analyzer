export default function Disclaimer({ text }: { text: string }) {
  return (
    <div style={{
      marginTop: '2rem',
      background: '#1c1406',
      border: '1px solid #78350f',
      borderRadius: 8,
      padding: '0.85rem 1.25rem',
      color: '#fde68a',
      fontSize: '0.82rem',
      lineHeight: 1.5,
    }}>
      ⚠️ {text}
    </div>
  )
}
