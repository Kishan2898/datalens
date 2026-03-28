import { useRef } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_TYPES } from '../constants/chartTypes'
import { downloadChartAsImage } from '../utils/exportUtils'
import { getCategoricalColumns, getNumericColumns } from '../utils/statsLite'

const CHART_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6']

const buildAggregateData = (rows, xKey, yKey) => {
  const grouped = rows.reduce((accumulator, row) => {
    const bucket = String(row[xKey] || 'Unknown')
    const numericValue = Number(row[yKey])
    const safeValue = Number.isNaN(numericValue) ? 0 : numericValue
    accumulator[bucket] = (accumulator[bucket] || 0) + safeValue
    return accumulator
  }, {})

  return Object.entries(grouped)
    .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }))
    .slice(0, 12)
}

const buildScatterData = (rows, xKey, yKey) =>
  rows
    .map((row) => ({ x: Number(row[xKey]), y: Number(row[yKey]) }))
    .filter((point) => !Number.isNaN(point.x) && !Number.isNaN(point.y))
    .slice(0, 60)

const ChartBuilder = ({ state, dispatch }) => {
  const chartContainerRef = useRef(null)
  const numericColumns = getNumericColumns(state.columns, state.inferredTypes)
  const categoricalColumns = getCategoricalColumns(state.columns, state.inferredTypes)
  const { chartType, xKey, yKey } = state.selectedChartConfig

  const xOptions = chartType === 'scatter' ? numericColumns : state.columns
  const yOptions = numericColumns
  const chartData = chartType === 'scatter' ? buildScatterData(state.workingData, xKey, yKey) : buildAggregateData(state.workingData, xKey, yKey)

  const recommendation = chartType === 'scatter'
    ? 'Scatter plots work best when both axes are numeric and you want to show correlation.'
    : chartType === 'pie'
      ? 'Pie charts are strongest when categories are limited and the story is about composition.'
      : chartType === 'line'
        ? 'Line charts shine when the X-axis has a meaningful order like dates or stages.'
        : 'Bar charts are the safest judge-friendly default for comparing categories.'

  const updateChart = (patch) => dispatch({ type: 'UPDATE_CHART_CONFIG', payload: patch })

  const handleDownloadChart = async () => {
    await downloadChartAsImage(
      chartContainerRef.current,
      `datalens-${chartType || 'chart'}.png`,
    )
  }

  const renderChart = () => {
    if (!xKey || !yKey || !chartData.length) {
      return (
        <div className="flex h-full min-h-[360px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-center text-sm leading-6 text-slate-500">
          Select a valid chart type and compatible columns to generate a visualization.
        </div>
      )
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie data={chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={110} innerRadius={58} paddingAngle={3}>
              {chartData.map((entry, index) => (
                <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" dataKey="x" name={xKey} tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis type="number" dataKey="y" name={yKey} tick={{ fill: '#475569', fontSize: 12 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={chartData} fill="#8b5cf6" />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Chart builder</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Build visuals without writing chart code</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Choose a chart type, map your columns, and let DataLens generate a presentation-friendly visual instantly.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Chart type</label>
              <select
                value={chartType}
                onChange={(event) => updateChart({ chartType: event.target.value, xKey: xOptions[0] || '', yKey: yOptions[0] || '' })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:bg-white"
              >
                {CHART_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">X-axis / category</label>
              <select
                value={xKey}
                onChange={(event) => updateChart({ xKey: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:bg-white"
              >
                {xOptions.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Y-axis / metric</label>
              <select
                value={yKey}
                onChange={(event) => updateChart({ yKey: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:bg-white"
              >
                {yOptions.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Smart guidance</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Quick chart recommendation</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">{recommendation}</p>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            Suggested categorical columns: {categoricalColumns.length ? categoricalColumns.join(', ') : 'None found'}
            <br />
            Suggested numeric columns: {numericColumns.length ? numericColumns.join(', ') : 'None found'}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Visualization preview</p>
            <h3 className="mt-2 font-display text-2xl text-slate-900">Responsive chart canvas</h3>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-400">Built with Recharts for fast, stable demos</p>
            <button
              type="button"
              onClick={handleDownloadChart}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Download Chart
            </button>
          </div>
        </div>

        <div ref={chartContainerRef} className="mt-6 h-[360px]">{renderChart()}</div>
      </div>
    </section>
  )
}

export default ChartBuilder
