const topMissingColumns = (missingByColumn = {}) =>
  Object.entries(missingByColumn)
    .filter(([, details]) => details.count > 0)
    .sort((left, right) => right[1].count - left[1].count)
    .slice(0, 3)
    .map(([column, details]) => `${column} (${details.count} missing, ${details.percentage}%)`)

const topNumericMetric = (numericStats = {}) => {
  const [column, stats] = Object.entries(numericStats)[0] || []

  if (!column || !stats) {
    return null
  }

  return `${column} averages ${stats.mean}, with a range from ${stats.min} to ${stats.max}.`
}

export const generateInsights = ({ intent, question = '', context = {} }) => {
  const missingColumns = topMissingColumns(context.missingByColumn)
  const numericColumns = Object.entries(context.inferredTypes || {})
    .filter(([, type]) => type === 'number')
    .map(([column]) => column)
  const categoricalColumns = Object.entries(context.inferredTypes || {})
    .filter(([, type]) => type === 'string' || type === 'boolean' || type === 'date')
    .map(([column]) => column)
  const metricStory = topNumericMetric(context.numericStats)
  const timestamp = new Date().toISOString()

  const summary = {
    id: `summary-${Date.now()}`,
    title: 'Executive Summary',
    body: `This dataset contains ${context.rowCount || 0} rows and ${context.columnCount || 0} columns. It is best suited for self-serve analytics because it combines ${numericColumns.length} measurable fields with ${categoricalColumns.length} descriptive dimensions.${metricStory ? ` ${metricStory}` : ''}`,
    accent: 'sky',
    timestamp,
  }

  const quality = {
    id: `quality-${Date.now()}`,
    title: 'Quality Review',
    body: missingColumns.length
      ? `The biggest quality risks are ${missingColumns.join(', ')}. For production-grade reporting, prioritize cleanup on these columns before pushing insights to customer-facing dashboards.`
      : 'The dataset looks clean enough for fast exploration. That reduces onboarding friction and makes a stronger case for product-led usage.',
    accent: 'amber',
    timestamp,
  }

  const chart = {
    id: `chart-${Date.now()}`,
    title: 'Visualization Advice',
    body: `Use ${context.chartConfig?.chartType || 'a bar chart'} with ${context.chartConfig?.xKey || categoricalColumns[0] || 'a category field'} on the X-axis and ${context.chartConfig?.yKey || numericColumns[0] || 'a numeric metric'} on the Y-axis to produce a chart that executives can scan quickly.`,
    accent: 'emerald',
    timestamp,
  }

  const custom = {
    id: `custom-${Date.now()}`,
    title: 'Custom Answer',
    body: question
      ? `For the question "${question}", I would start with ${numericColumns[0] || categoricalColumns[0] || 'the most important business column'} and pair it with a simple visualization so the answer is easy to trust.`
      : 'Ask a more specific business question to get a tighter decision-oriented answer.',
    accent: 'violet',
    timestamp,
  }

  if (intent === 'issues') {
    return [quality, summary, chart]
  }

  if (intent === 'charts') {
    return [chart, summary, quality]
  }

  if (intent === 'patterns') {
    return [
      {
        id: `patterns-${Date.now()}`,
        title: 'Pattern Detection',
        body: metricStory
          ? `The strongest numeric pattern so far is this: ${metricStory} That gives you a credible starting point for variance, outlier, or concentration analysis.`
          : 'This dataset appears more descriptive than quantitative, so pattern detection should focus on category distribution and quality hotspots.',
        accent: 'violet',
        timestamp,
      },
      summary,
      quality,
    ]
  }

  if (intent === 'question') {
    return [custom, summary, quality]
  }

  return [summary, quality, chart]
}

export const generateChatAnswer = ({ question = '', context = {}, history = [] }) => {
  const numericColumns = Object.entries(context.inferredTypes || {})
    .filter(([, type]) => type === 'number')
    .map(([column]) => column)
  const categoricalColumns = Object.entries(context.inferredTypes || {})
    .filter(([, type]) => type === 'string' || type === 'boolean' || type === 'date')
    .map(([column]) => column)
  const missingColumns = topMissingColumns(context.missingByColumn)
  const metricStory = topNumericMetric(context.numericStats)
  const normalizedQuestion = question.toLowerCase()

  let answer = `Based on the current dataset, I would start with ${numericColumns[0] || categoricalColumns[0] || 'the strongest available column'} because it is the clearest place to build a trustworthy answer.`

  if (normalizedQuestion.includes('missing') || normalizedQuestion.includes('null') || normalizedQuestion.includes('clean')) {
    answer = missingColumns.length
      ? `The main cleanup concern is ${missingColumns.join(', ')}. I would address those columns first because they are the most likely to distort charting and summary logic.`
      : 'I do not see a major missing-value problem right now, so this dataset is in a good state for charting and AI explanation.'
  } else if (normalizedQuestion.includes('chart') || normalizedQuestion.includes('visual') || normalizedQuestion.includes('graph')) {
    answer = `The safest visual choice is ${context.chartConfig?.chartType || 'a bar chart'} using ${context.chartConfig?.xKey || categoricalColumns[0] || 'a category field'} against ${context.chartConfig?.yKey || numericColumns[0] || 'a numeric metric'}. That gives the clearest business story quickly.`
  } else if (normalizedQuestion.includes('trend') || normalizedQuestion.includes('pattern') || normalizedQuestion.includes('insight')) {
    answer = metricStory
      ? `A strong pattern I can see is this: ${metricStory} That is a good starting point for discussing spread, performance gaps, or outliers.`
      : 'This dataset looks more descriptive than numeric, so the strongest trends will likely come from category distribution and concentration rather than numeric spread.'
  } else if (normalizedQuestion.includes('column') || normalizedQuestion.includes('type')) {
    answer = `The dataset currently has ${context.columnCount || 0} columns. Numeric fields include ${numericColumns.join(', ') || 'none'}, while categorical fields include ${categoricalColumns.join(', ') || 'none'}.`
  } else if (history.length > 2) {
    answer = `Using the follow-up context from this conversation, I would keep the focus on ${numericColumns[0] || categoricalColumns[0] || 'the most useful field'} and turn the result into a clean chart plus a short executive summary.`
  }

  return {
    id: `chat-${Date.now()}`,
    role: 'assistant',
    content: answer,
    timestamp: new Date().toISOString(),
  }
}
