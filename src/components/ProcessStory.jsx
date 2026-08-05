import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ProcessStory.css'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    index: '01',
    title: 'Grow',
    copy: 'High-altitude farms, hand-picked at peak ripeness — one harvest, once a year.',
  },
  {
    index: '02',
    title: 'Roast',
    copy: 'Small batches, roasted in-house every week, tuned to each lot by ear and by smell.',
  },
  {
    index: '03',
    title: 'Grind',
    copy: 'Ground to order, seconds before extraction — never earlier, never in bulk.',
  },
  {
    index: '04',
    title: 'Pour',
    copy: 'Brewed with intent. One cup, fully present, handed to you still warm.',
  },
]

// ProcessStory: the copy (numeral, title, description) stays pinned in
// a sticky left column while four story beats scroll past on the
// right. Which beat is "active" and how far the reader is through the
// whole story are both read directly off one ScrollTrigger's scroll
// progress — the sticky copy and the progress line are two views onto
// the same number, not independently timed animations.
function ProcessStory() {
  const sectionRef = useRef(null)
  const progressFillRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // The sticky column itself is plain CSS (position: sticky) and
    // still works without JS. Only the progress line and the
    // scroll-synced active step are skipped here.
    if (prefersReducedMotion) return undefined

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.set(progressFillRef.current, { scaleY: self.progress })

        const next = Math.min(
          STEPS.length - 1,
          Math.floor(self.progress * STEPS.length),
        )
        setActiveIndex((prev) => (prev === next ? prev : next))
      },
    })

    return () => trigger.kill()
  }, [])

  const active = STEPS[activeIndex]

  return (
    <section className="process-story" id="process" ref={sectionRef}>
      <div className="process-story__sticky">
        <div className="process-story__progress" aria-hidden="true">
          <span
            className="process-story__progress-fill"
            ref={progressFillRef}
          />
        </div>

        <p className="process-story__label">From Bean to Cup</p>
        <p className="process-story__number">{active.index}</p>
        <h2 className="process-story__title">{active.title}</h2>
        <p className="process-story__copy">{active.copy}</p>
      </div>

      <div className="process-story__steps">
        {STEPS.map((step, i) => (
          <div
            key={step.index}
            className={
              'process-story__step' +
              (i === activeIndex ? ' process-story__step--active' : '')
            }
          >
            <span className="process-story__step-ghost" aria-hidden="true">
              {step.index}
            </span>
            <span className="process-story__step-title">{step.title}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProcessStory
