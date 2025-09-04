import { saveAs } from 'file-saver'

// 用于下载图片
export function downloadImage(url?: string, filename?: string) {
  if (!url) {
    return
  }
  saveAs(url, filename)
}

export function formattedSize(size?: number) {
  if (!size) return '-'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + 'MB'
  return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
}
