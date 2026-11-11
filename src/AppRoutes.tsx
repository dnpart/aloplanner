import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { screens } from './content/screens'
import { AppShell } from './layout/AppShell'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { TodayScreen } from './screens/TodayScreen'

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/today" element={<TodayScreen />} />
          <Route
            path="/plan"
            element={
              <PlaceholderScreen
                title={screens.plan.title}
                lines={screens.plan.placeholder}
                guide={{ character: 'owl', pose: 'bowtie' }}
              />
            }
          />
          <Route
            path="/stream"
            element={
              <PlaceholderScreen
                title={screens.stream.title}
                lines={screens.stream.placeholder}
                guide={{ character: 'fox', pose: 'neutral' }}
              />
            }
          />
          <Route
            path="/work"
            element={
              <PlaceholderScreen
                title={screens.work.title}
                lines={screens.work.placeholder}
                guide={{ character: 'owl', pose: 'neutral' }}
              />
            }
          />
          <Route
            path="/play"
            element={
              <PlaceholderScreen
                title={screens.play.title}
                lines={screens.play.placeholder}
                guide={{ character: 'fox', pose: 'waving' }}
              />
            }
          />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
