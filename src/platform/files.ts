/**
 * Saving files. The web version triggers a download; the Android app
 * will swap in a native save/share later.
 */
export function saveTextFile(fileName: string, text: string, mimeType = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
