import { NavLink, Outlet } from 'react-router-dom'
import { GuideToast } from '../components/GuideToast'
import { PlanIcon, PlayIcon, StreamIcon, TodayIcon, WorkIcon } from '../components/icons'
import { labels } from '../content/labels'
import { useCameBack } from '../hooks/useCameBack'
import './AppShell.css'

const items = [
  { to: '/today', label: labels.nav.today, Icon: TodayIcon },
  { to: '/plan', label: labels.nav.plan, Icon: PlanIcon },
  { to: '/stream', label: labels.nav.stream, Icon: StreamIcon },
  { to: '/work', label: labels.nav.work, Icon: WorkIcon },
  { to: '/play', label: labels.nav.play, Icon: PlayIcon },
]

/**
 * One navigation element for both screens. CSS moves it from a bottom bar
 * (cover screen) to a left rail (inner screen), so folding and unfolding
 * never remounts the page and no state is lost.
 */
export function AppShell() {
  useCameBack()
  return (
    <div className="shell">
      <nav className="shell__nav" aria-label={labels.mainNav}>
        {items.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className="shell__nav-item">
            <span className="shell__nav-pill">
              <Icon />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="shell__main">
        <Outlet />
      </main>
      <GuideToast />
    </div>
  )
}
