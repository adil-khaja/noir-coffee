import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { createPointerFollow, createSceneSequenceTimeline } from './heroAnimations'
import './HeroVideo.css'

// Detects "does this device have a real mouse" rather than just
// "is the screen wide" — this also correctly excludes touch laptops
// and tablets, which can have desktop-sized screens but no cursor.
// Read once on mount; it doesn't need to react to changes mid-session.
function hasFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

// HeroVideo: a three-scene cinematic sequence — brand intro, "The
// Roast Room", "The Pour Bar" — that crossfades through itself as the
// page scrolls. The section is far taller than one viewport (see
// HeroVideo.css); that extra height is the scroll distance the
// sequence plays across, via createSceneSequenceTimeline. Nothing here
// autoplays on its own — it only advances because the user scrolls.
//
// Layered pointer interactions, scene 1 only:
//   - the video drifts subtly with the mouse (parallax)
//   - the CTA pulls subtly toward the mouse within its own bounds (magnetic)
function HeroVideo() {
  const sectionRef = useRef(null)

  const scene1Ref = useRef(null)
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const ctaRef = useRef(null)

  const scene2Ref = useRef(null)
  const scene2ArchRef = useRef(null)

  const scene3Ref = useRef(null)
  const scene3ArchRef = useRef(null)

  // --- VIDEO PLAYBACK ---
  useEffect(() => {
    const video = videoRef.current
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      // Respect the user's OS-level setting: don't autoplay a
      // full-screen looping video. This leaves the first frame showing
      // as a still image instead.
      video.pause()
      return
    }

    // The `autoPlay` attribute below usually starts playback on its
    // own, but some browsers (Safari in particular) can silently
    // block it. Calling play() explicitly is a safe fallback — if
    // it's already playing this is a no-op; if it's still blocked,
    // .catch() swallows the error and the video just shows its first
    // frame instead of throwing an unhandled promise rejection.
    video.play().catch(() => {})
  }, [])

  // --- POINTER INTERACTIONS: video parallax + magnetic CTA (scene 1 only) ---
  // Both need a real mouse, so both are skipped together on touch
  // devices, and both are skipped when reduced motion is requested.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion || !hasFinePointer()) return undefined

    // Scaling the video up slightly first gives it "headroom" so its
    // small mouse-driven shift never reveals an edge/gap at the
    // stage's boundary — the frame stays fully covered.
    gsap.set(videoRef.current, { scale: 1.08, transformOrigin: 'center center' })

    const cleanupVideoParallax = createPointerFollow(videoRef.current, {
      maxOffset: 16,
    })

    // The CTA pulls a few pixels toward the cursor within its own
    // bounds only — a restrained, contained "magnetic" feel, not a
    // page-wide custom cursor.
    const cleanupMagneticCta = createPointerFollow(ctaRef.current, {
      boundsEl: ctaRef.current,
      maxOffset: 6,
      duration: 0.5,
    })

    return () => {
      cleanupVideoParallax()
      cleanupMagneticCta()
    }
  }, [])

  // --- SCROLL-DRIVEN SCENE SEQUENCE ---
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const timeline = createSceneSequenceTimeline(
      {
        section: sectionRef.current,
        scenes: [
          { root: scene1Ref.current, media: stageRef.current },
          // Bigger scale ramp than the default, growing from a small
          // arch low in the frame up past full viewport coverage — by
          // ~1.8x its base width (58vw) it's wider than the viewport
          // itself. The corner shape morphs alongside the scale, from
          // an arched top down to a plain rectangle, so it reads as
          // the arch itself becoming the full image, not just an arch
          // floating at giant size.
          {
            root: scene2Ref.current,
            media: scene2ArchRef.current,
            scale: [0.28, 1.85],
            borderRadius: ['500px 500px 16px 16px', '16px 16px 16px 16px'],
          },
          {
            root: scene3Ref.current,
            media: scene3ArchRef.current,
            scale: [0.28, 1.85],
            borderRadius: ['500px 500px 16px 16px', '16px 16px 16px 16px'],
          },
        ],
      },
      { reducedMotion: prefersReducedMotion },
    )

    return () => {
      // Killing the timeline also kills the ScrollTrigger it created —
      // calling both is just belt-and-suspenders. Only this specific
      // instance is touched, never ScrollTrigger.getAll(), since this
      // component must only clean up what it created.
      timeline?.scrollTrigger?.kill()
      timeline?.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="hero-video">
      {/* Sticky viewport-filling frame: this — not a ScrollTrigger pin
          — is what makes each scene appear to "stay put" while the
          section's own extra height scrolls past underneath it. See
          createSceneSequenceTimeline in heroAnimations.js for why. */}
      <div className="hero-video__frame">
        {/* --- Scene 1: brand intro --- */}
        <div ref={scene1Ref} className="hero-video__scene hero-video__scene--intro">
          {/* The stage is what the scroll-driven scale/zoom targets. It's
              sized to exactly fill the scene and clips (overflow: hidden)
              anything that scales past its edges — that clipping is what
              makes the video read as an art-directed, cropped object
              rather than a plain <video> tag stretching to fit. */}
          <div ref={stageRef} className="hero-video__stage">
            {/* Files in /public are served from the site's root, so
                public/hero-coffee.mp4 is reachable at "/hero-coffee.mp4". */}
            <video
              ref={videoRef}
              className="hero-video__media"
              src="/hero-coffee.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          </div>

          {/* A soft, localized scrim — not a dark filter over the whole
              video. See HeroVideo.css for why. */}
          <div ref={overlayRef} className="hero-video__overlay" />

          <div ref={contentRef} className="hero-video__content">
            <h1 className="hero-video__brand">NOIR COFFEE</h1>
            <p className="hero-video__tagline">Coffee for curious people.</p>
            <button ref={ctaRef} type="button" className="hero-video__cta">
              Explore Menu
              <span className="hero-video__cta-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>

          <div className="hero-video__scroll-indicator" aria-hidden="true">
            <span className="hero-video__scroll-line" />
            <span className="hero-video__scroll-label">Scroll</span>
          </div>
        </div>

        {/* --- Scene 2: The Roast Room ---
            The photo lives inside an arch-shaped frame (overflow:
            hidden + a border-radius big enough to cap into a
            semicircle — see HeroVideo.css). GSAP scales that whole
            frame from a small "keyhole" up past full size, so the
            photo reads as arriving *through* the arch, not just
            fading in behind it. Drop a file in at
            /public/hero-roast-room.jpg and it's picked up automatically
            — no code change needed. */}
        <div
          ref={scene2Ref}
          className="hero-video__scene hero-video__scene--photo hero-video__scene--roast"
        >
          <div ref={scene2ArchRef} className="hero-video__arch">
            <div className="hero-video__arch-media" />
          </div>
          <div className="hero-video__scene-content">
            <h2 className="hero-video__scene-heading">The Roast Room</h2>
            <p className="hero-video__scene-copy">
              Beans are woken up in small batches, every week.
            </p>
          </div>
        </div>

        {/* --- Scene 3: The Pour Bar ---
            Same pattern — drop /public/hero-pour-bar.jpg in when ready. */}
        <div
          ref={scene3Ref}
          className="hero-video__scene hero-video__scene--photo hero-video__scene--pour"
        >
          <div ref={scene3ArchRef} className="hero-video__arch">
            <div className="hero-video__arch-media" />
          </div>
          <div className="hero-video__scene-content">
            <h2 className="hero-video__scene-heading">The Pour Bar</h2>
            <p className="hero-video__scene-copy">Where the day actually starts.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroVideo
