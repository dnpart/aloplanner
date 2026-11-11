import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Guide } from '../components/Guide'
import { SettingsIcon } from '../components/icons'
import { labels } from '../content/labels'
import { greeting } from '../content/screens'
import { todayCopy } from '../content/today'
import { currentBlock, nextBlock } from '../db/blocks'
import { useBlocksForDay, useCategoryMap } from '../hooks/useData'
import { useNow } from '../hooks/useNow'
import { overwhelmCopy } from '../content/overwhelm'
import { encourage } from '../messages/encourage'
import { useCalm } from '../state/calmStore'
import { Screen } from '../layout/Screen'
import { dayKey } from '../lib/dates'
import { useSettingsStore } from '../state/settingsStore'
import { BlockList } from './today/BlockList'
import { CurrentBlockCard, NextBlockRow, NothingNowCard } from './today/CurrentBlockCard'
import { DayTimeline } from './today/DayTimeline'
import { CalmMessage, OneNextStepCard } from './today/CalmView'
import { HealthCard } from './today/HealthCard'
import { InboxLink } from './today/InboxLink'
import { TopThreeCard } from './today/TopThreeCard'
import './today/Today.css'

export function TodayScreen() {
  const now = useNow()
  const settings = useSettingsStore((s) => s.settings)
  const day = dayKey(now)
  const blocks = useBlocksForDay(day)
  const categories = useCategoryMap()
  const current = blocks ? currentBlock(blocks, now) : undefined
  const next = blocks ? nextBlock(blocks, now, current) : undefined
  const calm = useCalm((s) => s.calm)
  const enterCalm = async () => {
    const shown = await encourage('overwhelm', { display: 'none' })
    useCalm.getState().enter(shown)
  }

  return (
    <Screen
      title={greeting(now.getHours(), settings?.displayName ?? '')}
      subtitle={format(now, 'EEE, MMM d · h:mm a')}
      trailing={
        <Link to="/settings" className="icon-btn" aria-label={labels.settings}>
          <SettingsIcon />
        </Link>
      }
    >
      <div className="today-wrap">
        <div className={`today${calm ? ' is-calm' : ''}`}>
          <div className="today__main">
            {calm ? (
              <CalmMessage />
            ) : (
              <button
                type="button"
                className="btn btn-quiet too-much"
                onClick={() => void enterCalm()}
              >
                {overwhelmCopy.button}
              </button>
            )}
            {!calm && blocks?.length === 0 && (
              <Guide
                character="owl"
                pose="happy"
                message={todayCopy.emptyGuide.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              />
            )}
            {current && settings ? (
              <CurrentBlockCard
                block={current}
                category={categories.get(current.categoryId)}
                now={now}
                checkInMinutes={settings.checkInMinutes}
                extensionsPerBlock={settings.extensionsPerBlock}
              />
            ) : (
              blocks && !calm && <NothingNowCard />
            )}
            {calm ? (
              <OneNextStepCard day={day} current={current} next={next} />
            ) : (
              <>
                <TopThreeCard day={day} />
                <HealthCard day={day} hour={now.getHours()} waterGoal={settings?.waterGoal ?? 8} />
                <NextBlockRow block={next} category={next && categories.get(next.categoryId)} />
                <InboxLink />
                <div className="today__list">
                  {blocks && (
                    <BlockList blocks={blocks} categories={categories} currentId={current?.id} />
                  )}
                </div>
              </>
            )}
          </div>
          <div className="today__timeline">
            {blocks && (
              <DayTimeline
                day={day}
                blocks={blocks}
                categories={categories}
                now={now}
                currentId={current?.id}
              />
            )}
          </div>
        </div>
      </div>
    </Screen>
  )
}
