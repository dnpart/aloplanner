import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Guide } from '../components/Guide'
import { SettingsIcon } from '../components/icons'
import { labels } from '../content/labels'
import { greeting, screens } from '../content/screens'
import { useNow } from '../hooks/useNow'
import { Screen } from '../layout/Screen'
import { useSettingsStore } from '../state/settingsStore'

export function TodayScreen() {
  const now = useNow()
  const name = useSettingsStore((s) => s.settings?.displayName ?? '')

  return (
    <Screen
      title={greeting(now.getHours(), name)}
      subtitle={format(now, 'EEE, MMM d · h:mm a')}
      trailing={
        <Link to="/settings" className="icon-btn" aria-label={labels.settings}>
          <SettingsIcon />
        </Link>
      }
    >
      <Guide
        character="fox"
        pose="happy"
        message={screens.today.placeholder.map((line) => (
          <p key={line}>{line}</p>
        ))}
      />
    </Screen>
  )
}
