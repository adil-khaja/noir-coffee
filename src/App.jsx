import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroVideo from './components/HeroVideo'
import ScrollMarquee from './components/ScrollMarquee'
import ProcessStory from './components/ProcessStory'
import HorizontalMenu from './components/HorizontalMenu'
import FlavorSlider from './components/FlavorSlider'
import SiteFooter from './components/SiteFooter'

// Temporary: the cinematic hero video is standing in for the Three.js
// hero (CoffeeUniverse) while we try it out. CoffeeUniverse and
// CoffeeScene are untouched in src/components — swap the import above
// back to bring either one back.
function App() {
  // Lenis (smooth scrolling) is set up once here, at the app root —
  // deliberately NOT inside HeroVideo. It's a page-wide system meant
  // to outlive any individual section, so a child component must
  // never be the one to create or destroy it.
  useEffect(() => {
    const lenis = new Lenis()

    // Drive Lenis from GSAP's own ticker, rather than a separate
    // requestAnimationFrame loop, so Lenis's smoothing and any
    // GSAP/ScrollTrigger-driven animation (like the hero's scroll
    // timeline) update on the exact same frame instead of drifting
    // out of sync with each other.
    function syncLenisWithGSAP(time) {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(syncLenisWithGSAP)
    gsap.ticker.lagSmoothing(0) // recommended whenever GSAP drives an external raf loop like this

    // Lenis intercepts and smooths scrolling itself, so ScrollTrigger
    // needs to be told explicitly whenever it moves — otherwise
    // scroll-tied animations elsewhere on the page could read a stale
    // scroll position.
    lenis.on('scroll', ScrollTrigger.update)

    return () => {
      gsap.ticker.remove(syncLenisWithGSAP)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <HeroVideo />
      <ScrollMarquee />
      <ProcessStory />
      <HorizontalMenu />
      <FlavorSlider />
      <SiteFooter />
    </>
  )
}

export default App
