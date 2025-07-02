import { saveAs } from 'file-saver'

// 用于下载图片
export function downloadImage(url?: string, filename?: string) {
  if (!url) {
    return
  }

  saveAs(url, filename)
}
