import { Link } from 'react-router-dom'
import { BackIcon } from '../components/icons'
import { labels } from '../content/labels'
import { screens } from '../content/screens'
import { Screen } from '../layout/Screen'
import { BackupSection } from './settings/BackupSection'
import { DetailsSection } from './settings/DetailsSection'
import { MessagesSection } from './settings/MessagesSection'
import { NotificationsSection } from './settings/NotificationsSection'

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
      <DetailsSection />
      <MessagesSection />
      <NotificationsSection />
      <BackupSection />
    </Screen>
  )
}
