const Sidebar = ({ tabs, selectedTab, onSelect, hasData }) => {
  return (
    <aside className="flex h-full flex-col justify-between rounded-[28px] border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur">
      <div>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-500">DataLens</p>
          <h1 className="mt-3 font-display text-2xl text-slate-900">No-code data analysis for everyone.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Upload a CSV, understand your dataset, prepare quick cleaning actions, and generate presentation-ready charts.
          </p>
        </div>

        <nav className="space-y-3">
          {tabs.map((tab) => {
            const disabled = !hasData && tab.id !== 'upload'

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !disabled && onSelect(tab.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  selectedTab === tab.id
                    ? 'border-sky-500 bg-sky-50 text-slate-900'
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{tab.label}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    {tab.id === 'ai' ? 'Next' : 'Live'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{tab.description}</p>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Hackathon focus</p>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          Phase 2 is about showing useful product depth without overengineering: overview, cleanup, and visualization in one smooth flow.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
