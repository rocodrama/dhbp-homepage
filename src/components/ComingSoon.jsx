export default function ComingSoon({ title, description }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-gray)' }}>
      <img src="/images/mascot.png" alt="" style={{ width: 80, marginBottom: 12 }} />
      <h2 style={{ color: 'var(--color-text-dark)', marginBottom: 8 }}>{title}</h2>
      <p>{description}</p>
      <p style={{ fontSize: 12 }}>곧 만들어질 예정이에요.</p>
    </div>
  )
}
