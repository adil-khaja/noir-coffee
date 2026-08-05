import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './HorizontalMenu.css'

gsap.registerPlugin(ScrollTrigger)

const CARDS = [
  {
    index: '01',
    name: 'Batch Filter',
    note: 'Light, floral, brewed by the pot',
    tone: 'soft',
  },
  {
    index: '02',
    name: 'Cortado',
    note: 'Equal parts espresso and steamed milk',
    tone: 'electric',
  },
  {
    index: '03',
    name: 'Cold Brew',
    note: 'Steeped eighteen hours, served over ice',
    tone: 'soft',
  },
  {
    index: '04',
    name: 'Affogato',
    note: 'Espresso poured over vanilla, right at the table',
    tone: 'orange',
  },
  {
    index: '05',
    name: 'The Noir',
    note: 'Our signature — double espresso, orange oil',
    tone: 'electric',
  },
]

// HorizontalMenu: the section pins in place and the card track travels
// horizontally as the page scrolls vertically — one axis of input
// (scroll) driving a different axis of motion (translateX), scrubbed
// 1:1 rather than played as a fixed-duration animation. The "01 — 05"
// counter reads off the exact same scroll progress that drives the
// track, so the two never fall out of sync.
function HorizontalMenu() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // On reduced motion the section falls back to a plain horizontally
    // scrollable strip (see the CSS) — no pin, no scrub.
    if (prefersReducedMotion) return undefined

    const track = trackRef.current

    const tween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => '+=' + (track.scrollWidth - window.innerWidth),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.round(self.progress * (CARDS.length - 1))
          setActiveIndex((prev) => (prev === next ? prev : next))
        },
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section className="horizontal-menu" id="menu" ref={sectionRef}>
      <div className="horizontal-menu__frame">
        <div className="horizontal-menu__header">
          <p className="horizontal-menu__label">The Menu</p>
          <p className="horizontal-menu__counter" aria-hidden="true">
            <span className="horizontal-menu__counter-active">
              {CARDS[activeIndex].index}
            </span>
            {' — '}
            {CARDS.length.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="horizontal-menu__track" ref={trackRef}>
          {CARDS.map((card) => (
            <article className="horizontal-menu__card" key={card.index}>
              <span
                className={`horizontal-menu__mark horizontal-menu__mark--${card.tone}`}
                aria-hidden="true"
              />
              <span className="horizontal-menu__index">{card.index}</span>
              <h3 className="horizontal-menu__name">{card.name}</h3>
              <p className="horizontal-menu__note">{card.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HorizontalMenu
