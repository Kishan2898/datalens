import { useMemo, useState } from 'react'
import DataUploader from '../components/DataUploader'
import SummaryCards from '../components/SummaryCards'
import DataOverview from '../components/DataOverview'
import DataCleaner from '../components/DataCleaner'
import DataTable from '../components/DataTable'
import ChartBuilder from '../components/ChartBuilder'
import ErrorBanner from '../components/ErrorBanner'
import EmptyState from '../components/EmptyState'
import { useDatasetReducer } from '../hooks/useDatasetReducer'

const studioTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'charts', label: 'Charts' },
]

function AnalysisStudioPage() {
  const { state, dispatch } = useDatasetReducer()
  const [activeStudioTab, setActiveStudioTab] = useState('overview')

  const workspaceLabel = useMemo(() => {
    if (!state.workingData.length) {
      return 'No dataset loaded yet'
    }

    return `${state.summaryStats.rowCount} rows across ${state.summaryStats.columnCount} columns`
  }, [state.summaryStats.columnCount, state.summaryStats.rowCount, state.workingData.length])

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Analysis studio</p>
            <h3 className="mt-2 font-display text-2xl text-slate-900">Interactive workspace for analysts, operators, and founders</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This keeps the original hackathon magic while placing it inside a product-ready platform shell.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Workspace state</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{workspaceLabel}</p>
          </div>
        </div>
      </section>

      <ErrorBanner
        message={state.errors[0]}
        onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
      />

      <DataUploader dispatch={dispatch} loading={state.loading} uploadState={state.uploadState} />

      {state.workingData.length ? (
        <>
          <SummaryCards summaryStats={state.summaryStats} inferredTypes={state.inferredTypes} />

          <div className="flex flex-wrap gap-3">
            {studioTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStudioTab(tab.id)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  activeStudioTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeStudioTab === 'overview' && (
            <>
              <DataOverview columns={state.columns} inferredTypes={state.inferredTypes} summaryStats={state.summaryStats} />
              <DataTable rows={state.workingData} columns={state.columns} inferredTypes={state.inferredTypes} />
            </>
          )}

          {activeStudioTab === 'cleaning' && (
            <>
              <DataCleaner state={state} dispatch={dispatch} />
              <DataTable rows={state.workingData} columns={state.columns} inferredTypes={state.inferredTypes} />
            </>
          )}

          {activeStudioTab === 'charts' && <ChartBuilder state={state} dispatch={dispatch} />}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default AnalysisStudioPage
