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
import { Screen } from '../layout/Screen'
import { dayKey } from '../lib/dates'
import { useSettingsStore } from '../state/settingsStore'
import { BlockList } from './today/BlockList'
import { CurrentBlockCard, NextBlockRow, NothingNowCard } from './today/CurrentBlockCard'
import { DayTimeline } from './today/DayTimeline'
import './today/Today.css'

export function TodayScreen() {
  const now = useNow()
  const settings = useSettingsStore((s) => s.settings)
  const day = dayKey(now)
  const blocks = useBlocksForDay(day)
  const categories = useCategoryMap()
  const current = blocks ? currentBlock(blocks, now) : undefined
  const next = blocks ? nextBlock(blocks, now, current) : undefined

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
        <div className="today">
          <div className="today__main">
            {blocks?.length === 0 && (
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
              blocks && <NothingNowCard />
            )}
            <NextBlockRow block={next} category={next && categories.get(next.categoryId)} />
            <div className="today__list">
              {blocks && (
                <BlockList blocks={blocks} categories={categories} currentId={current?.id} />
              )}
            </div>
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
