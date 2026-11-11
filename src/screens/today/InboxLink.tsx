import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { ChevronIcon } from '../../components/icons'
import { brainDumpCopy as copy } from '../../content/brainDump'
import { listInbox } from '../../db/brainDump'

/** Shows on Today only when there's something to sort. */
export function InboxLink() {
  const count = useLiveQuery(async () => (await listInbox()).length, []) ?? 0
  if (count === 0) return null
  return (
    <Link to="/inbox" className="card inbox-link">
      <span>{copy.todayLink(count)}</span>
      <ChevronIcon />
    </Link>
  )
}
