import { buildInsightContext } from './aiPromptBuilder'

const topNumericStat = (numericStats = {}) => {
  const [column, stats] = Object.entries(numericStats)[0] || []

  if (!column || !stats) {
    return null
  }

  return `${column} averages ${stats.mean}, with values ranging from ${stats.min} to ${stats.max}.`
}

const buildSummaryResponse = (state) => {
  const context = buildInsightContext(state)
  const statLine = topNumericStat(state.summaryStats.numericStats)

  return {
    title: 'Dataset Summary',
    body: `This dataset has ${context.rowCount} rows and ${context.columnCount} columns, imported from ${context.uploadSource}. The structure looks strongest around ${context.numericColumns.length} numeric fields and ${context.categoricalColumns.length} descriptive fields, which is a good foundation for quick business analysis.${statLine ? ` ${statLine}` : ''}`,
    accent: 'sky',
  }
}

const buildIssueResponse = (state) => {
  const context = buildInsightContext(state)

  return {
    title: 'Quality Signals',
    body: context.missingColumns.length
      ? `The main issue is incomplete data in ${context.missingColumns.join(', ')}. For a cleaner demo story, removing missing rows or renaming unclear headers will improve trust before charting.`
      : 'The dataset appears clean at a first-pass level. That means the strongest next step is moving quickly into charting and narrative insights rather than spending time on cleanup.',
    accent: 'amber',
  }
}

const buildChartResponse = (state) => {
  const context = buildInsightContext(state)
  const { chartType, xKey, yKey } = context.chartConfig

  return {
    title: 'Best Chart Direction',
    body: chartType && xKey && yKey
      ? `The current ${chartType} setup is a strong demo choice because it uses ${xKey} as the comparison axis and ${yKey} as the main metric. If you want the safest judge-friendly visual, lead with a bar chart that compares one categorical field against one numeric measure.`
      : 'Use a bar chart first if you want the clearest demo narrative. It is the easiest format for judges to read quickly and it makes value differences feel obvious.',
    accent: 'emerald',
  }
}

const buildPatternResponse = (state) => {
  const statLine = topNumericStat(state.summaryStats.numericStats)

  return {
    title: 'Trends & Patterns',
    body: statLine
      ? `A useful pattern to highlight is the spread in your numeric metrics. ${statLine} That gives you an immediate story about concentration, outliers, or uneven performance across categories.`
      : 'This dataset leans more descriptive than numeric, so the strongest pattern story may come from category distribution, missing value concentration, or date-based sequencing.',
    accent: 'violet',
  }
}

const buildQuestionResponse = (question, state) => {
  const context = buildInsightContext(state)
  const normalized = question.toLowerCase()

  let body = `Based on the current dataset, I would focus on ${context.numericColumns[0] || context.categoricalColumns[0] || 'the main columns'} first because it is likely to produce the clearest business story.`

  if (normalized.includes('missing') || normalized.includes('clean')) {
    body = context.missingColumns.length
      ? `The dataset still shows cleanup opportunities in ${context.missingColumns.join(', ')}. If this is a live demo, I would apply the quick cleaning actions first and then regenerate the chart to show a stronger before-and-after story.`
      : 'The dataset already looks clean enough for a polished demo. I would skip heavy cleanup and spend the time showing insights and visualization instead.'
  } else if (normalized.includes('chart') || normalized.includes('visual')) {
    body = `For this dataset, I recommend a bar chart or line chart first. Use ${context.chartConfig.xKey || context.categoricalColumns[0] || 'a category column'} on the X-axis and ${context.chartConfig.yKey || context.numericColumns[0] || 'a numeric metric'} on the Y-axis to create a chart that reads quickly in a presentation.`
  } else if (normalized.includes('trend') || normalized.includes('pattern')) {
    body = buildPatternResponse(state).body
  }

  return {
    title: 'Custom Analysis',
    body,
    accent: 'slate',
  }
}

export const generateMockInsights = (intent, state, question = '') => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const cards = [
    buildSummaryResponse(state),
    buildIssueResponse(state),
    buildChartResponse(state),
  ]

  if (intent === 'patterns') {
    cards.unshift(buildPatternResponse(state))
  }

  if (intent === 'question') {
    cards.unshift(buildQuestionResponse(question, state))
  }

  if (intent === 'summary') {
    cards.unshift(buildSummaryResponse(state))
  }

  if (intent === 'issues') {
    cards.unshift(buildIssueResponse(state))
  }

  if (intent === 'charts') {
    cards.unshift(buildChartResponse(state))
  }

  return cards.slice(0, 3).map((card, index) => ({
    ...card,
    id: `${intent}-${index}-${Date.now()}`,
    timestamp,
  }))
}
