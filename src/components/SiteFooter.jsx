import { useEffect, useRef } from 'react'
import { createPointerFollow } from './heroAnimations'
import './SiteFooter.css'

// SiteFooter: the page's closing statement and its one remaining CTA.
// Reuses the same magnetic-pull interaction the hero's CTA uses (see
// heroAnimations.js) rather than inventing a second hover treatment —
// one small piece of "the site has a physical, tactile feel to its
// buttons" language, not two competing ones.
function SiteFooter() {
  const ctaRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) return undefined

    const hasFinePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches
    if (!hasFinePointer) return undefined

    return createPointerFollow(ctaRef.current, {
      boundsEl: ctaRef.current,
      maxOffset: 8,
      duration: 0.5,
    })
  }, [])

  return (
    <footer className="site-footer">
      <div className="site-footer__content">
        <p className="site-footer__label">Visit Us</p>
        <h2 className="site-footer__heading">
          Good coffee, made worth the trip.
        </h2>
        <button ref={ctaRef} type="button" className="site-footer__cta">
          Find a Café
          <span className="site-footer__cta-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      <div className="site-footer__bar">
        <span className="site-footer__brand">NOIR COFFEE</span>
        <nav className="site-footer__nav" aria-label="Footer">
          <a href="#menu">Menu</a>
          <a href="#process">Process</a>
        </nav>
      </div>
    </footer>
  )
}

export default SiteFooter
