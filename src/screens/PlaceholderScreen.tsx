import { Guide, type GuideProps } from '../components/Guide'
import { Screen } from '../layout/Screen'

type Props = {
  title: string
  lines: readonly string[]
  guide: Pick<GuideProps, 'character' | 'pose'>
}

/** Stand-in for sections that later phases build out. */
export function PlaceholderScreen({ title, lines, guide }: Props) {
  return (
    <Screen title={title}>
      <Guide
        {...(guide as GuideProps)}
        message={lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      />
    </Screen>
  )
}
