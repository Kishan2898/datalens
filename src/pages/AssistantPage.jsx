import { useMemo, useState } from 'react'
import AIInsights from '../components/AIInsights'
import DataUploader from '../components/DataUploader'
import SummaryCards from '../components/SummaryCards'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import { useDatasetReducer } from '../hooks/useDatasetReducer'
import { requestAIChat, requestAIInsights } from '../api/platformApi'
import { generateMockInsights } from '../utils/mockAI'

function AssistantPage() {
  const { state, dispatch } = useDatasetReducer()
  const [backendMode, setBackendMode] = useState('api')

  const integrationNote = useMemo(() => {
    if (!state.workingData.length) {
      return 'Load a dataset to let the assistant ground its responses in your data.'
    }

    return `Assistant grounded on ${state.summaryStats.rowCount} rows and ${state.summaryStats.columnCount} columns.`
  }, [state.summaryStats.columnCount, state.summaryStats.rowCount, state.workingData.length])

  const handleGenerateInsights = async ({ intent, question }) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    const payload = {
      intent,
      question,
      context: {
        rowCount: state.summaryStats.rowCount,
        columnCount: state.summaryStats.columnCount,
        missingByColumn: state.summaryStats.missingByColumn,
        inferredTypes: state.inferredTypes,
        chartConfig: state.selectedChartConfig,
        numericStats: state.summaryStats.numericStats,
      },
    }

    try {
      const response = await requestAIInsights(payload)
      setBackendMode(response.mode || 'api')
      dispatch({
        type: 'SET_AI_INSIGHTS',
        payload: response.insights,
      })
    } catch (error) {
      setBackendMode('fallback')
      dispatch({
        type: 'SET_AI_INSIGHTS',
        payload: generateMockInsights(intent, state, question),
      })
    }
  }

  const handleAskAssistant = async ({ question, history }) => {
    const payload = {
      question,
      history,
      context: {
        rowCount: state.summaryStats.rowCount,
        columnCount: state.summaryStats.columnCount,
        missingByColumn: state.summaryStats.missingByColumn,
        inferredTypes: state.inferredTypes,
        chartConfig: state.selectedChartConfig,
        numericStats: state.summaryStats.numericStats,
      },
    }

    try {
      const response = await requestAIChat(payload)
      setBackendMode(response.mode || 'api')
      return response.message
    } catch (error) {
      setBackendMode('fallback')
      return {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: `I can still help in fallback mode. Based on the current dataset, start with ${state.columns[0] || 'the strongest column'} and ask a more specific question about trends, missing values, or chart choice.`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">AI workspace</p>
            <h3 className="mt-2 font-display text-2xl text-slate-900">Server-backed assistant layer for monetizable analytics workflows</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{integrationNote}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Insight engine</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{backendMode === 'api' ? 'Express API' : 'Frontend fallback'}</p>
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
          <AIInsights
            state={state}
            dispatch={dispatch}
            onGenerateInsights={handleGenerateInsights}
            onAskAssistant={handleAskAssistant}
          />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default AssistantPage
