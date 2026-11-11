import { useState } from 'react'
import { settingsCopy } from '../../content/settings'
import { notificationPermission, requestNotificationPermission } from '../../platform/notify'

const copy = settingsCopy.notifications

export function NotificationsSection() {
  const [permission, setPermission] = useState(notificationPermission)

  return (
    <section className="card stack" aria-labelledby="notifications-heading">
      <h2 id="notifications-heading">{copy.heading}</h2>
      <p>{copy.intro}</p>
      <p aria-live="polite">{copy.status[permission]}</p>
      {permission === 'default' && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => setPermission(await requestNotificationPermission())}
        >
          {copy.turnOn}
        </button>
      )}
      <p className="secondary">{copy.webLimit}</p>
    </section>
  )
}
