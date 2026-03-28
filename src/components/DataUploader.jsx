import { useMemo, useRef, useState } from 'react'
import { parseCsvText, parseSpreadsheetFile } from '../utils/parser'
import { buildDatasetSummary } from '../utils/inferTypes'
import { sampleDataset } from '../data/sampleData'

const ACCEPTED_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '',
]

const DataUploader = ({ dispatch, loading, uploadState }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [pastedText, setPastedText] = useState('')
  const fileInputRef = useRef(null)

  const helperText = useMemo(() => {
    if (loading) {
      return 'Parsing your dataset and preparing a preview.'
    }

    return uploadState.message
  }, [loading, uploadState.message])

  const loadDataset = async (loader) => {
    dispatch({ type: 'CLEAR_ERROR' })
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const dataset = await loader()
      dispatch({
        type: 'LOAD_DATASET',
        payload: {
          ...dataset,
          message: `Dataset ready from ${dataset.source === 'file' ? 'file upload' : dataset.source === 'paste' ? 'pasted text' : 'sample data'}.`,
        },
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Unable to load dataset.' })
    }
  }

  const handleFile = async (file) => {
    if (!file) {
      return
    }

    const lowerFileName = file.name.toLowerCase()
    const isAccepted =
      ACCEPTED_TYPES.includes(file.type) ||
      lowerFileName.endsWith('.csv') ||
      lowerFileName.endsWith('.xlsx') ||
      lowerFileName.endsWith('.xls')

    if (!isAccepted) {
      dispatch({ type: 'SET_ERROR', payload: 'Please upload a valid CSV or Excel file.' })
      return
    }

    await loadDataset(async () => {
      const dataset = await parseSpreadsheetFile(file)
      return {
        ...dataset,
        fileName: file.name,
      }
    })
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    setIsDragging(false)

    const [file] = Array.from(event.dataTransfer.files || [])
    await handleFile(file)
  }

  const handlePasteImport = async () => {
    if (!pastedText.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Paste CSV or TSV text before importing.' })
      return
    }

    await loadDataset(async () => parseCsvText(pastedText))
  }

  const handleSampleLoad = async () => {
    await loadDataset(async () => buildDatasetSummary(sampleDataset, 'sample'))
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Dataset intake</p>
            <h3 className="mt-2 font-display text-2xl text-slate-900">Upload, drop, or paste a dataset</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Supports CSV and Excel uploads with simple validation, clear feedback, and an instant preview once parsing succeeds.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSampleLoad}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            Load Sample Dataset
          </button>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-6 rounded-[28px] border border-dashed p-8 text-center transition ${
            isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-slate-50/70'
          }`}
        >
          <div className="mx-auto max-w-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
              XLS
            </div>
            <h4 className="mt-5 text-xl font-semibold text-slate-900">Drop your dataset here</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Supports header-based CSV, XLSX, and XLS files. DataLens reads the first sheet, validates structure, and prepares a clean preview.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Choose File
              </button>
              <p className="text-sm text-slate-400">or drag and drop straight from your desktop</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => handleFile(event.target.files?.[0])}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Status</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Upload feedback</h3>
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">{helperText}</p>
          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-800">
            Demo tip: load a sample or customer CSV, show the overview and charts, then finish with the AI Analyst tab to explain the story.
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Source</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{uploadState.source || 'Waiting for input'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">File</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-800">{uploadState.fileName || 'No file selected yet'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Paste data</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Import raw CSV or TSV text</h3>
          <textarea
            value={pastedText}
            onChange={(event) => setPastedText(event.target.value)}
            placeholder="customer,revenue,region&#10;Acme,12000,North America&#10;Orbit,9800,Europe"
            className="mt-4 h-44 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={handlePasteImport}
            className="mt-4 w-full rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Import Pasted Data
          </button>
        </div>
      </div>
    </section>
  )
}

export default DataUploader
