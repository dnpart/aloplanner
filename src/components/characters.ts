import foxHappy from '../assets/characters/fox-happy.svg'
import foxQueen from '../assets/characters/fox-queen.svg'
import foxSleepy from '../assets/characters/fox-sleepy.svg'
import foxWaving from '../assets/characters/fox-waving.svg'
import fox from '../assets/characters/fox.svg'
import owlBowtie from '../assets/characters/owl-bowtie.svg'
import owlHappy from '../assets/characters/owl-happy.svg'
import owlSleepy from '../assets/characters/owl-sleepy.svg'
import owl from '../assets/characters/owl.svg'
import { characterAlt } from '../content/characters'

/** Owl = teacher (time checks, tips, planning). */
export type OwlPose = keyof typeof characterAlt.owl
/** Fox = cheerleader (wins, nudges, wind-down). */
export type FoxPose = keyof typeof characterAlt.fox
export type Character = 'owl' | 'fox'

export const characterArt: {
  owl: Record<OwlPose, string>
  fox: Record<FoxPose, string>
} = {
  owl: { neutral: owl, happy: owlHappy, sleepy: owlSleepy, bowtie: owlBowtie },
  fox: { neutral: fox, happy: foxHappy, waving: foxWaving, sleepy: foxSleepy, queen: foxQueen },
}
