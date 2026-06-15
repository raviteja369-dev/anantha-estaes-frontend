import { jsPDF } from 'jspdf'

export async function exportStageImage(stageRef, format = 'png') {
  if (!stageRef?.current) return null
  const stage = stageRef.current
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const pixelRatio = 2
  const uri = stage.toDataURL({ mimeType: mime, pixelRatio, quality: 1 })
  return uri
}

export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

export async function exportStagePdf(stageRef, title = 'Site Layout') {
  const dataUrl = await exportStageImage(stageRef, 'png')
  if (!dataUrl) return
  const stage = stageRef.current
  const w = stage.width()
  const h = stage.height()
  const pdf = new jsPDF({
    orientation: w > h ? 'landscape' : 'portrait',
    unit: 'px',
    format: [w, h],
  })
  pdf.setFontSize(16)
  pdf.text(title, 20, 24)
  pdf.addImage(dataUrl, 'PNG', 0, 40, w, h - 40)
  pdf.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}
