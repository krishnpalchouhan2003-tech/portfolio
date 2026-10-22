import { ReactLenis } from 'lenis/react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import OddsTicker from './components/OddsTicker'
import Manifesto from './components/Manifesto'
import Projects from './components/Projects'
import SlotSkills from './components/SlotSkills'
import Roulette from './components/Roulette'
import HouseGames from './components/HouseGames'
import BetSlip from './components/BetSlip'
import PlayFab from './components/PlayFab'

export default function App() {
  const reduce = useReducedMotion()
  const page = (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero />
        <OddsTicker />
        <Manifesto />
        <Projects />
        <SlotSkills />
        <Roulette />
        <HouseGames />
        <BetSlip />
      </main>
      <PlayFab />
    </MotionConfig>
  )
  // Smooth scroll only for people who haven't asked for less motion
  return reduce ? page : <ReactLenis root options={{ lerp: 0.09, anchors: true }}>{page}</ReactLenis>
}
