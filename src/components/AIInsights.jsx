import { useMemo, useState } from 'react'
import { buildPromptPreview } from '../utils/aiPromptBuilder'
import { copyInsightsToClipboard, exportRowsToCsv } from '../utils/exportUtils'

const accentClasses = {
  sky: 'border-sky-200 bg-sky-50 text-sky-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  violet: 'border-violet-200 bg-violet-50 text-violet-800',
  slate: 'border-slate-200 bg-slate-50 text-slate-800',
}

const starterQuestions = [
  'What is the most important thing in this dataset?',
  'How should I explain this data to a client?',
  'What should I clean before analysis?',
  'Which chart should I present first?',
]

const AIInsights = ({ state, dispatch, onGenerateInsights, onAskAssistant }) => {
  const [question, setQuestion] = useState('')
  const [copied, setCopied] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: 'Ask me anything about your dataset, cleaning steps, chart choices, or what story to present.',
      timestamp: new Date().toISOString(),
    },
  ])

  const promptPreview = useMemo(
    () => buildPromptPreview(question || 'Summarize my dataset', state),
    [question, state],
  )

  const runInsight = async (intent) => {
    if (onGenerateInsights) {
      await onGenerateInsights({ intent, question })
      return
    }

    dispatch({ type: 'SET_ERROR', payload: 'AI service is not connected yet.' })
  }

  const handleSendChat = async (presetQuestion) => {
    const nextQuestion = (presetQuestion || chatInput).trim()

    if (!nextQuestion || !onAskAssistant) {
      return
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: nextQuestion,
      timestamp: new Date().toISOString(),
    }

    const nextHistory = [...chatMessages, userMessage]
    setChatMessages(nextHistory)
    setChatInput('')

    const response = await onAskAssistant({
      question: nextQuestion,
      history: nextHistory,
    })

    setChatMessages((current) => [...current, response])
  }

  const handleCopyInsights = async () => {
    const success = await copyInsightsToClipboard(state.aiInsights)
    if (success) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  const handleExportCsv = () => {
    const baseName = state.uploadState.fileName
      ? state.uploadState.fileName.replace(/\.csv$/i, '')
      : 'datalens-cleaned-data'

    exportRowsToCsv(state.workingData, `${baseName}-cleaned.csv`)
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">AI assistant</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Ask broader questions about the dataset</h3>
          <div className="mt-5 space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                  message.role === 'assistant'
                    ? 'bg-white text-slate-700'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {starterQuestions.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => handleSendChat(starter)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                {starter}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask the assistant anything about your dataset"
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => handleSendChat()}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Send
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">AI analyst</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Ask DataLens to explain the dataset like an analytics assistant</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This phase uses a polished mock AI mode so the demo still feels intelligent and trustworthy even without a live API dependency.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => runInsight('summary')} className="rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
              Summarize My Dataset
            </button>
            <button type="button" onClick={() => runInsight('issues')} className="rounded-2xl bg-slate-100 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-200">
              What Issues Do You Notice?
            </button>
            <button type="button" onClick={() => runInsight('charts')} className="rounded-2xl bg-sky-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-sky-600">
              What Chart Should I Use?
            </button>
            <button type="button" onClick={() => runInsight('patterns')} className="rounded-2xl bg-emerald-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-emerald-600">
              What Trends Stand Out?
            </button>
          </div>

          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Custom question</label>
            <div className="mt-2 flex flex-col gap-3 md:flex-row">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question about my dataset"
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => runInsight('question')}
                className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
              >
                Ask AI
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Export</p>
              <h3 className="mt-2 font-display text-2xl text-slate-900">Wrap up the workflow</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Demo-ready
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={handleExportCsv} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              Export Cleaned CSV
            </button>
            <button type="button" onClick={handleCopyInsights} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              {copied ? 'Insights Copied' : 'Copy AI Summary'}
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Prompt preview</p>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-200">{promptPreview}</pre>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Insight cards</p>
            <h3 className="mt-2 font-display text-2xl text-slate-900">Narrative outputs for a startup-style AI experience</h3>
          </div>
          <p className="text-sm text-slate-400">Grounded in upload stats, cleanup signals, and chart context</p>
        </div>

        <div className="mt-6 space-y-4">
          {state.aiInsights.length ? (
            state.aiInsights.map((insight) => (
              <article key={insight.id} className={`rounded-[24px] border p-5 ${accentClasses[insight.accent] || accentClasses.slate}`}>
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-xl">{insight.title}</h4>
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] opacity-70">{insight.timestamp}</span>
                </div>
                <p className="mt-3 text-sm leading-7">{insight.body}</p>
              </article>
            ))
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-center text-sm leading-7 text-slate-500">
              Run one of the AI actions to generate analyst-style insights for your current dataset.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AIInsights
