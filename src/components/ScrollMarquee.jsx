import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollMarquee.css'

gsap.registerPlugin(ScrollTrigger)

const PHRASE = 'SINGLE ORIGIN — SMALL BATCH — ROASTED WEEKLY — NOIR COFFEE —'
// Repeated a few times per group so the loop never shows a gap on very
// wide viewports; the group is duplicated once more in the markup below
// to make the xPercent: -50 loop seamless.
const REPEATS = 4

// ScrollMarquee: a full-bleed brand statement that drifts at a slow,
// constant pace on its own, then reacts to how the page is actually
// being scrolled — speeding up (and briefly reversing direction) with
// scroll velocity, easing back to its resting pace once scrolling
// settles. This is the scroll-reactive counterpart to a static ticker:
// the motion is a direct readout of the user's own scroll input, not a
// decorative loop playing independently of it.
function ScrollMarquee() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Static band, no loop, no ScrollTrigger — the duplicate group is
    // hidden in CSS under the same media query.
    if (prefersReducedMotion) return undefined

    const baseTween = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: 26,
      ease: 'none',
      repeat: -1,
    })

    // Velocity is scroll pixels/second; dividing it down before
    // clamping is what turns "how fast the page is scrolling" into a
    // reasonable multiplier on the marquee's own base speed rather
    // than a jarring snap.
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const velocityFactor = gsap.utils.clamp(-6, 6, self.getVelocity() / 300)
        gsap.to(baseTween, {
          timeScale: 1 + velocityFactor,
          duration: 0.4,
          overwrite: true,
        })
      },
      onLeave: () => gsap.to(baseTween, { timeScale: 1, duration: 0.6 }),
      onLeaveBack: () => gsap.to(baseTween, { timeScale: 1, duration: 0.6 }),
    })

    return () => {
      trigger.kill()
      baseTween.kill()
    }
  }, [])

  const words = Array.from({ length: REPEATS }, () => PHRASE).join(' ')

  return (
    <section className="scroll-marquee" ref={sectionRef} aria-label={PHRASE}>
      <div className="scroll-marquee__track" ref={trackRef} aria-hidden="true">
        <span className="scroll-marquee__group">{words}</span>
        <span className="scroll-marquee__group">{words}</span>
      </div>
    </section>
  )
}

export default ScrollMarquee
