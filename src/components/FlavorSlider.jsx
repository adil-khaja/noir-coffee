import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import './FlavorSlider.css'

gsap.registerPlugin(Draggable, InertiaPlugin)

const NOTES = [
  { index: '01', name: 'Citrus', desc: 'Bright bergamot and lemon peel' },
  { index: '02', name: 'Cocoa', desc: 'Dark chocolate, low and round' },
  { index: '03', name: 'Caramel', desc: 'Toasted sugar, long finish' },
  { index: '04', name: 'Stone Fruit', desc: 'Ripe apricot, soft acidity' },
  { index: '05', name: 'Toasted Nut', desc: 'Hazelnut, warm and dry' },
]

// FlavorSlider: a draggable, inertia-throwable track (mouse, touch, or
// trackpad) that always settles on a card boundary, plus arrow/dot
// controls that animate to the same positions. Both input paths go
// through one `goTo(index)` function, so drag-driven and click-driven
// navigation can never disagree about which card is "current."
function FlavorSlider() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const draggableRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  // Read once, lazily, so the reduced-motion layout (native scroll-snap
  // instead of Draggable transforms) is correct on the very first
  // render — no post-mount flash of the wrong mode.
  const [dragDisabled] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  // Distance between two consecutive cards' left edges — measuring
  // this directly (rather than assuming a fixed px width) keeps the
  // slider correct at every breakpoint, since card width is set in CSS.
  function getStep() {
    const track = trackRef.current
    const first = track.children[0]
    const second = track.children[1]
    return second
      ? second.offsetLeft - first.offsetLeft
      : first.offsetWidth
  }

  function goTo(index) {
    const clamped = gsap.utils.clamp(0, NOTES.length - 1, index)
    const step = getStep()
    setCurrentIndex(clamped)

    // Reduced motion: the track isn't transform-driven at all (see
    // FlavorSlider.css) — jump the native scroll position instead of
    // tweening it.
    if (dragDisabled) {
      viewportRef.current.scrollTo({ left: clamped * step, behavior: 'auto' })
      return
    }

    gsap.to(trackRef.current, {
      x: -clamped * step,
      duration: 0.6,
      ease: 'power3.out',
      onComplete: () => draggableRef.current?.update(),
    })
  }

  useEffect(() => {
    // Reduced motion: no drag/inertia at all — CSS scroll-snap on the
    // viewport (see FlavorSlider.css) is the entire interaction.
    if (dragDisabled) return undefined

    const [instance] = Draggable.create(trackRef.current, {
      type: 'x',
      bounds: viewportRef.current,
      inertia: true,
      edgeResistance: 0.8,
      snap: {
        x: (value) => Math.round(value / getStep()) * getStep(),
      },
      onDrag: updateActiveFromPosition,
      onThrowUpdate: updateActiveFromPosition,
    })
    draggableRef.current = instance

    function updateActiveFromPosition() {
      const step = getStep()
      const nearest = gsap.utils.clamp(
        0,
        NOTES.length - 1,
        Math.round(-this.x / step),
      )
      setCurrentIndex((prev) => (prev === nearest ? prev : nearest))
    }

    const handleResize = () => instance.applyBounds(viewportRef.current)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      instance.kill()
    }
    // dragDisabled is set once via lazy useState init and never changes
    // after mount, so this effect still only ever runs once in practice.
  }, [dragDisabled])

  const current = NOTES[currentIndex]

  return (
    <section className="flavor-slider">
      <div className="flavor-slider__intro">
        <p className="flavor-slider__label">Tasting Notes</p>
        <h2 className="flavor-slider__heading">
          Every cup, <span>read out loud.</span>
        </h2>
      </div>

      <div className="flavor-slider__viewport" ref={viewportRef}>
        <div
          className={
            'flavor-slider__track' +
            (dragDisabled ? ' flavor-slider__track--static' : '')
          }
          ref={trackRef}
        >
          {NOTES.map((note) => (
            <article className="flavor-slider__card" key={note.index}>
              <span className="flavor-slider__index">{note.index}</span>
              <h3 className="flavor-slider__name">{note.name}</h3>
              <p className="flavor-slider__desc">{note.desc}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="flavor-slider__controls">
        <button
          type="button"
          className="flavor-slider__arrow"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          aria-label="Previous flavor note"
        >
          ←
        </button>

        <div className="flavor-slider__dots">
          {NOTES.map((note, i) => (
            <button
              key={note.index}
              type="button"
              className={
                'flavor-slider__dot' +
                (i === currentIndex ? ' flavor-slider__dot--active' : '')
              }
              onClick={() => goTo(i)}
              aria-label={`Go to ${note.name}`}
              aria-current={i === currentIndex}
            />
          ))}
        </div>

        <button
          type="button"
          className="flavor-slider__arrow"
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === NOTES.length - 1}
          aria-label="Next flavor note"
        >
          →
        </button>

        <p className="flavor-slider__count" aria-hidden="true">
          {current.index} — {NOTES.length.toString().padStart(2, '0')}
        </p>
      </div>
    </section>
  )
}

export default FlavorSlider
