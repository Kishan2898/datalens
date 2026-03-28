const escapeCsvValue = (value) => {
  const safeValue = String(value ?? '')

  if (safeValue.includes(',') || safeValue.includes('"') || safeValue.includes('\n')) {
    return `"${safeValue.replace(/"/g, '""')}"`
  }

  return safeValue
}

export const exportRowsToCsv = (rows, fileName = 'datalens-cleaned-data.csv') => {
  if (!rows.length) {
    return false
  }

  const columns = Object.keys(rows[0])
  const csv = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => escapeCsvValue(row[column])).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}

export const copyInsightsToClipboard = async (insights) => {
  if (!insights.length || !navigator?.clipboard) {
    return false
  }

  const text = insights.map((insight) => `${insight.title}\n${insight.body}`).join('\n\n')
  await navigator.clipboard.writeText(text)
  return true
}

export const downloadChartAsImage = async (containerElement, fileName = 'datalens-chart.png') => {
  if (!containerElement) {
    return false
  }

  const svgElement = containerElement.querySelector('svg')

  if (!svgElement) {
    return false
  }

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const image = new Image()
  image.crossOrigin = 'anonymous'

  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width || 1200
      canvas.height = image.height || 700
      const context = canvas.getContext('2d')

      if (!context) {
        URL.revokeObjectURL(url)
        resolve(false)
        return
      }

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)

      canvas.toBlob((blob) => {
        if (!blob) {
          URL.revokeObjectURL(url)
          resolve(false)
          return
        }

        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        URL.revokeObjectURL(url)
        resolve(true)
      }, 'image/png')
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }

    image.src = url
  })
}
