function TrainingCard({ number, title }) {
  return (
    <a
      href="#"
      className="glass-panel training-card"
      onClick={(event) => event.preventDefault()}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        event.currentTarget.style.setProperty('--mouse-x', `${x}px`)
        event.currentTarget.style.setProperty('--mouse-y', `${y}px`)
      }}
    >
      <div className="card-number">{number}</div>
      <div className="card-title">{title}</div>
      <div className="card-decorator" />
    </a>
  )
}

export default TrainingCard
