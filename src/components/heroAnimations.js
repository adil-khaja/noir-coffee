import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registering a GSAP plugin must happen before it's used. Doing it here,
// at module scope (not inside a component/effect), guarantees it runs
// the instant this file is first imported — before any component that
// depends on it has a chance to mount.
gsap.registerPlugin(ScrollTrigger)

// Shared tuning so the hero's different pointer interactions (video
// parallax, magnetic CTA) read as one coherent system instead of two
// separately-tuned effects.
const DEFAULT_FOLLOW_EASE = 'power3'
const DEFAULT_FOLLOW_DURATION = 1.2 // seconds of "catch-up" lag

/**
 * Makes `el` drift a few pixels toward the pointer, using GSAP's
 * quickTo for smooth, eased interpolation (not a snap-to-position).
 *
 * Used two ways in this project:
 * - no `boundsEl` — normalizes against the whole window. This is the
 *   hero video's background parallax: 0 at screen center, up to
 *   `maxOffset` as the cursor nears any edge.
 * - `boundsEl` set to the element itself — normalizes against that
 *   element's own box instead, producing a "magnetic" pull confined
 *   entirely to it (used for the CTA button).
 *
 * @returns {() => void} cleanup — removes its own listeners and kills
 *   the tweens it created. Call this on unmount.
 */
export function createPointerFollow(
  el,
  {
    boundsEl,
    maxOffset = 16,
    duration = DEFAULT_FOLLOW_DURATION,
    ease = DEFAULT_FOLLOW_EASE,
  } = {},
) {
  const moveX = gsap.quickTo(el, 'x', { duration, ease })
  const moveY = gsap.quickTo(el, 'y', { duration, ease })

  const handleMove = (event) => {
    let normalizedX
    let normalizedY

    if (boundsEl) {
      const rect = boundsEl.getBoundingClientRect()
      normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1
    } else {
      normalizedX = (event.clientX / window.innerWidth) * 2 - 1
      normalizedY = (event.clientY / window.innerHeight) * 2 - 1
    }

    moveX(normalizedX * maxOffset)
    moveY(normalizedY * maxOffset)
  }

  const handleLeave = () => {
    moveX(0)
    moveY(0)
  }

  const listenTarget = boundsEl || window
  listenTarget.addEventListener('mousemove', handleMove)
  if (boundsEl) {
    // Only the bounded case (the button) needs a "spring back" on
    // leave — the window-bound case just keeps tracking the cursor.
    boundsEl.addEventListener('mouseleave', handleLeave)
  }

  return () => {
    listenTarget.removeEventListener('mousemove', handleMove)
    if (boundsEl) {
      boundsEl.removeEventListener('mouseleave', handleLeave)
    }
    gsap.killTweensOf(el)
  }
}

/**
 * Builds the hero's multi-scene sequence: `scenes` fade into and out
 * of each other — each one holding, then crossfading to the next —
 * while the whole sequence is scrubbed 1:1 to scroll position through
 * `section`. Each scene's own background also drifts into a slow,
 * continuous zoom while it's the one in view.
 *
 * Deliberately NOT pinned. `section` is simply made much taller than
 * one viewport in CSS (see HeroVideo.css) — that height difference
 * *is* the scroll distance the crossfades play across — and each
 * scene visually "stays in place" while scrolled past because it's
 * `position: sticky` in CSS, not because ScrollTrigger is pinning
 * anything. No pin-spacer, no pin-related jank on mobile.
 *
 * @param {{section: Element, scenes: {root: Element, media?: Element}[]}} args
 *   `scenes` in the order they should play, first to last.
 * @returns the GSAP timeline (which owns the ScrollTrigger it
 *   created) so the caller can kill it on cleanup, or `null` if it
 *   declined to build one at all (reduced motion).
 */
export function createSceneSequenceTimeline(
  { section, scenes },
  { reducedMotion = false } = {},
) {
  if (reducedMotion || scenes.length === 0) return null

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1, // ties progress to scroll position, with 1s of smoothing lag
    },
  })

  // The section's scroll distance is divided into one equal segment
  // per scene; each scene crossfades in/out over a window centered on
  // its segment boundary, so consecutive scenes overlap rather than
  // hard-cutting.
  const SEGMENT = 100 / scenes.length
  const CROSSFADE = Math.min(14, SEGMENT * 0.4)

  scenes.forEach((scene, i) => {
    const segmentStart = i * SEGMENT
    const segmentEnd = (i + 1) * SEGMENT
    const isFirst = i === 0
    const isLast = i === scenes.length - 1

    if (isFirst) {
      gsap.set(scene.root, { opacity: 1 })
    } else {
      tl.fromTo(
        scene.root,
        { opacity: 0 },
        { opacity: 1, ease: 'power1.inOut', duration: CROSSFADE },
        segmentStart - CROSSFADE / 2,
      )
    }

    if (!isLast) {
      tl.to(
        scene.root,
        { opacity: 0, ease: 'power1.inOut', duration: CROSSFADE },
        segmentEnd - CROSSFADE / 2,
      )
    }

    // A continuous scale ramp for exactly as long as this scene is the
    // one in play (its crossfade-in through its crossfade-out) — ease:
    // 'none' because scrub itself is what supplies the smoothing; a
    // second ease on top would fight it. Defaults to a subtle zoom
    // (video/full-bleed scenes); a scene can pass its own [from, to]
    // for a bigger ramp — e.g. a small panel growing up to full size
    // as its photo is revealed.
    if (scene.media) {
      const [fromScale, toScale] = scene.scale || [1, 1.08]
      const mediaDuration = segmentEnd - segmentStart + CROSSFADE
      const mediaStart = segmentStart - CROSSFADE / 2

      tl.fromTo(
        scene.media,
        { scale: fromScale },
        { scale: toScale, ease: 'none', duration: mediaDuration },
        mediaStart,
      )

      // Optional: the panel's own corner shape morphs alongside the
      // scale — e.g. starting arched (a tall rounded top) and
      // straightening into a plain rectangle as it grows past the
      // viewport's edges, so it reads as "the arch becomes the full
      // image" rather than an arch just floating at giant size.
      if (scene.borderRadius) {
        const [fromRadius, toRadius] = scene.borderRadius
        tl.fromTo(
          scene.media,
          { borderRadius: fromRadius },
          { borderRadius: toRadius, ease: 'none', duration: mediaDuration },
          mediaStart,
        )
      }
    }
  })

  return tl
}
