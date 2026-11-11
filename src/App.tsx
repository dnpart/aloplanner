import { useEffect } from 'react'
import { AppRoutes } from './AppRoutes'
import { StarField } from './components/StarField'
import { requestPersistentStorage } from './db/db'
import { useSettingsStore } from './state/settingsStore'

export function App() {
  const settings = useSettingsStore((s) => s.settings)
  const load = useSettingsStore((s) => s.load)

  useEffect(() => {
    void load()
    void requestPersistentStorage()
  }, [load])

  const textScale = settings?.textScale ?? 1
  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(textScale))
  }, [textScale])

  return (
    <>
      <StarField />
      {settings && <AppRoutes />}
    </>
  )
}
