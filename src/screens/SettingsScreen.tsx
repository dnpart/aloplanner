import { Link } from 'react-router-dom'
import { BackIcon } from '../components/icons'
import { labels } from '../content/labels'
import { screens } from '../content/screens'
import { Screen } from '../layout/Screen'

export function SettingsScreen() {
  return (
    <Screen
      title={screens.settings.title}
      leading={
        <Link to="/today" className="icon-btn" aria-label={labels.back}>
          <BackIcon />
        </Link>
      }
    >
      {null}
    </Screen>
  )
}
