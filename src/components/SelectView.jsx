import TrainingCard from './TrainingCard'

const items = [
  { number: '.01', title: '舒尔特表' },
  { number: '.02', title: 'Stroop训练' },
  { number: '.03', title: '1-back加减法' },
  { number: '.04', title: '序列工作记忆训练' },
]

function SelectView({ active, onBack }) {
  return (
    <section id="view-select" className={`view ${active ? 'active' : ''}`}>
      <div className="header-actions">
        <button className="btn-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          返回首页
        </button>
      </div>

      <div className="grid-container">
        {items.map((item) => (
          <TrainingCard key={item.number} number={item.number} title={item.title} />
        ))}
      </div>
    </section>
  )
}

export default SelectView
