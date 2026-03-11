function HomeView({ active, onSelect }) {
  return (
    <section id="view-home" className={`view ${active ? 'active' : ''}`}>
      <div className="title-group">
        <h1 className="brand-title">Focus Up</h1>
        <div className="brand-subtitle">Cognitive Enhancement Lab</div>
      </div>

      <button className="glass-panel btn-primary" onClick={onSelect}>
        <span>请选择训练项目</span>
      </button>
    </section>
  )
}

export default HomeView
