import { useReducer } from 'react'
import { buildStatsLite, getCategoricalColumns, getNumericColumns } from '../utils/statsLite'

const getDefaultChartConfig = (columns, inferredTypes) => {
  const numericColumns = getNumericColumns(columns, inferredTypes)
  const categoricalColumns = getCategoricalColumns(columns, inferredTypes)

  return {
    chartType: 'bar',
    xKey: categoricalColumns[0] || columns[0] || '',
    yKey: numericColumns[0] || columns[1] || '',
  }
}

const createDataState = (payload, currentState) => {
  const summaryStats = {
    rowCount: payload.rows.length,
    columnCount: payload.columns.length,
    missingByColumn: payload.missingByColumn,
    numericStats: buildStatsLite(payload.rows, payload.columns, payload.inferredTypes),
  }

  const nextChartConfig = currentState?.selectedChartConfig || getDefaultChartConfig(payload.columns, payload.inferredTypes)
  const numericColumns = getNumericColumns(payload.columns, payload.inferredTypes)
  const categoricalColumns = getCategoricalColumns(payload.columns, payload.inferredTypes)

  return {
    originalData: currentState?.originalData?.length ? currentState.originalData : payload.rows,
    workingData: payload.rows,
    columns: payload.columns,
    inferredTypes: payload.inferredTypes,
    summaryStats,
    selectedChartConfig: {
      chartType: nextChartConfig.chartType || 'bar',
      xKey: payload.columns.includes(nextChartConfig.xKey)
        ? nextChartConfig.xKey
        : categoricalColumns[0] || payload.columns[0] || '',
      yKey: payload.columns.includes(nextChartConfig.yKey)
        ? nextChartConfig.yKey
        : numericColumns[0] || payload.columns[1] || '',
    },
    uploadState: {
      status: 'success',
      source: payload.source,
      fileName: payload.fileName || currentState?.uploadState?.fileName || '',
      message: payload.message || 'Dataset loaded successfully.',
    },
  }
}

const initialState = {
  originalData: [],
  workingData: [],
  columns: [],
  inferredTypes: {},
  selectedTab: 'upload',
  selectedChartConfig: {
    chartType: 'bar',
    xKey: '',
    yKey: '',
  },
  aiInsights: [],
  uploadState: {
    status: 'idle',
    source: null,
    fileName: '',
    message: 'Upload a CSV to start exploring your dataset.',
  },
  summaryStats: {
    rowCount: 0,
    columnCount: 0,
    missingByColumn: {},
    numericStats: {},
  },
  errors: [],
  loading: false,
}

const datasetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        selectedTab: action.payload,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        errors: [action.payload],
        uploadState: {
          ...state.uploadState,
          status: 'error',
          message: action.payload,
        },
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: [],
      }
    case 'LOAD_DATASET':
      return {
        ...state,
        ...createDataState(action.payload, state),
        originalData: action.payload.rows,
        errors: [],
        loading: false,
        selectedTab: 'overview',
      }
    case 'APPLY_TRANSFORM':
      return {
        ...state,
        ...createDataState(action.payload, state),
        errors: [],
        loading: false,
        selectedTab: action.payload.nextTab || state.selectedTab,
      }
    case 'UPDATE_CHART_CONFIG':
      return {
        ...state,
        selectedChartConfig: {
          ...state.selectedChartConfig,
          ...action.payload,
        },
      }
    case 'SET_AI_INSIGHTS':
      return {
        ...state,
        aiInsights: action.payload,
        loading: false,
        selectedTab: 'ai',
      }
    case 'RESET_DATASET':
      return initialState
    default:
      return state
  }
}

export const useDatasetReducer = () => {
  const [state, dispatch] = useReducer(datasetReducer, initialState)
  return { state, dispatch }
}
