import { getPool } from '../db/pool.js'

const demoDatasets = [
  {
    id: 'ds_sales_001',
    name: 'Global Sales Performance',
    owner: 'Revenue Ops',
    description: 'Quarterly pipeline, region revenue, and rep performance metrics for leadership reviews.',
    rows: '18.2K',
    columns: 14,
    storage: '3.8 MB',
    status: 'active',
    lastSync: '2 hours ago',
  },
  {
    id: 'ds_customer_002',
    name: 'Customer Retention Cohorts',
    owner: 'Growth Team',
    description: 'Retention, churn, and expansion revenue dataset used for AI-assisted lifecycle analysis.',
    rows: '9.6K',
    columns: 11,
    storage: '2.1 MB',
    status: 'processing',
    lastSync: '12 minutes ago',
  },
  {
    id: 'ds_market_003',
    name: 'Market Research Signals',
    owner: 'Product Strategy',
    description: 'Survey exports and segmentation attributes for go-to-market insight generation.',
    rows: '4.3K',
    columns: 22,
    storage: '1.4 MB',
    status: 'active',
    lastSync: 'Yesterday',
  },
]

export const listDatasets = async (user) => {
  const pool = getPool()

  if (!pool) {
    return demoDatasets
  }

  const result = await pool.query(`
    SELECT
      datasets.id,
      datasets.name,
      users.full_name AS owner,
      datasets.description,
      datasets.row_count,
      datasets.column_count,
      datasets.storage_label AS storage,
      datasets.status,
      datasets.last_sync
    FROM datasets
    JOIN users ON users.id = datasets.uploaded_by_user_id
    WHERE uploaded_by_user_id = $1
    ORDER BY datasets.last_sync DESC
  `, [user.id])

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    owner: row.owner,
    description: row.description,
    rows: row.row_count,
    columns: row.column_count,
    storage: row.storage,
    status: row.status,
    lastSync: row.last_sync,
  }))
}

export const buildDashboardOverview = async (user) => ({
  metrics: [
    { label: 'Active workspaces', value: 12, note: 'Teams currently analyzing datasets this week' },
    { label: 'Monthly recurring revenue', prefix: '$', value: '4.8K', note: 'Target SaaS trajectory for paid analytics plans' },
    { label: 'Datasets analyzed', value: '31.4K', note: 'Total files processed through DataLens workflows' },
    { label: 'AI insight satisfaction', value: 94, suffix: '%', note: 'Target benchmark for assistant usefulness' },
  ],
  story: {
    headline: `Welcome back, ${user?.fullName || 'operator'}. DataLens turns spreadsheet chaos into a guided analytics experience for non-technical teams.`,
    body: 'The commercial version combines dataset uploads, quality checks, chart generation, and AI explanations inside one workspace. That means founders, students, operators, and researchers can move from raw CSVs to confident decisions without relying on analysts for every question.',
    highlights: [
      {
        title: 'Faster activation',
        body: 'New users can upload a CSV and reach a meaningful chart or AI answer within minutes.',
      },
      {
        title: 'Clear monetization path',
        body: 'Free analysis can convert into paid AI credits, workspace storage, exports, and collaboration plans.',
      },
    ],
  },
  roadmap: [
    { title: 'Authentication and workspaces', status: 'Next', body: 'Introduce accounts, ownership, and saved projects.' },
    { title: 'Persistent storage pipeline', status: 'Planned', body: 'Store uploaded files and cleaned artifacts in durable cloud storage.' },
    { title: 'Paid AI copilots', status: 'Planned', body: 'Meter insight generation, summary reports, and analyst chat features.' },
  ],
})
