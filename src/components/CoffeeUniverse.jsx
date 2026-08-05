import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './CoffeeUniverse.css'

// How many coffee-bean particles to draw. "Hundreds" per the brief —
// modern GPUs handle this easily because of instancing (see below).
const BEAN_COUNT = 350

// CoffeeUniverse: hundreds of small, warm-toned "coffee bean" particles
// drifting slowly through dark 3D space, with a gentle parallax response
// to the mouse. Plain Three.js only — no GSAP, Lenis, or ScrollTrigger.
function CoffeeUniverse() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current

    // --- SCENE ---
    // The scene is the 3D world every object, light and camera lives in.
    const scene = new THREE.Scene()
    const backgroundColor = 0x0a0806 // near-black with a faint warm tint
    scene.background = new THREE.Color(backgroundColor)

    // Fog makes distant objects fade into the background color instead
    // of popping out sharply — this alone is most of what makes a
    // particle field feel "atmospheric" rather than flat and graphic.
    // FogExp2 grows exponentially with distance, which reads more
    // naturally than a straight linear fade.
    scene.fog = new THREE.FogExp2(backgroundColor, 0.07)

    // --- CAMERA ---
    // PerspectiveCamera: closer objects look bigger, further objects
    // look smaller — this is what sells the "3D space" illusion.
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )
    camera.position.z = 9

    // --- RENDERER ---
    // Draws the scene, as seen through the camera, onto a <canvas> —
    // one frame at a time, many times a second.
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // --- THE COFFEE BEANS (INSTANCED) ---
    // Naively creating 350 separate Mesh objects would mean 350 separate
    // draw calls — slow. Instancing solves this: we describe ONE shape
    // (geometry) and ONE surface (material) just once, then hand the GPU
    // a list of 350 positions/sizes/rotations and it draws that same
    // shape 350 times in a single, fast draw call. This is the standard
    // technique any time you need "hundreds of the same-ish thing".

    // GEOMETRY: the raw shape. A low-detail sphere reads as an organic,
    // faceted "bean" once it's squashed with a non-uniform scale below.
    const beanGeometry = new THREE.SphereGeometry(1, 8, 6)

    // MATERIAL: warm, dark roasted-coffee brown with a bit of roughness
    // so it catches light like a matte bean rather than plastic.
    const beanMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2c1a,
      roughness: 0.65,
      metalness: 0.15,
    })

    // MESH (instanced): geometry + material + "how many copies".
    const beans = new THREE.InstancedMesh(beanGeometry, beanMaterial, BEAN_COUNT)
    scene.add(beans)

    // `dummy` is a throwaway Object3D we reuse just to compute each
    // instance's transform matrix — it's never added to the scene itself.
    const dummy = new THREE.Object3D()

    // Per-bean data we'll need again every frame to animate it (its
    // resting position, how fast it bobs, etc). InstancedMesh only
    // stores a flat list of matrices, not this kind of per-object state,
    // so we keep it ourselves in a plain array.
    const particles = []

    for (let i = 0; i < BEAN_COUNT; i++) {
      // Pick a random direction, then push the bean out from the center
      // by a random distance between 2.2 and 8. This — rather than a
      // uniform random cube — keeps a small "clear" pocket in the very
      // middle of the scene (where hero text will eventually sit) while
      // the beans spread out into a loose, cloud-like shell around it.
      const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      ).normalize()
      const radius = THREE.MathUtils.lerp(2.2, 8, Math.random())
      const basePosition = direction.multiplyScalar(radius)

      // Squaring the random value biases sizes toward the small end, so
      // most beans are small "dust" and only a few stand out large —
      // more natural than every bean being the same size.
      const scale = THREE.MathUtils.lerp(0.06, 0.22, Math.random() ** 2)

      particles.push({
        basePosition,
        scale,
        phase: Math.random() * Math.PI * 2, // offsets each bean's bob so they don't move in sync
        floatSpeed: THREE.MathUtils.lerp(0.2, 0.5, Math.random()),
        floatRange: THREE.MathUtils.lerp(0.1, 0.4, Math.random()),
        spinSpeed: THREE.MathUtils.lerp(0.1, 0.5, Math.random()),
      })

      // Squash the sphere slightly on two axes so it reads as an
      // elongated bean shape instead of a plain ball.
      dummy.position.copy(basePosition)
      dummy.scale.set(scale * 0.7, scale, scale * 0.5)
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      )
      dummy.updateMatrix()
      beans.setMatrixAt(i, dummy.matrix)
    }

    // --- LIGHTING ---
    // A warm-tinted ambient light so even the shadowed side of a bean
    // never goes pure black — and the tint itself adds to the mood.
    const ambientLight = new THREE.AmbientLight(0x3d2416, 1.2)
    scene.add(ambientLight)

    // A warm "key" light from the front-top, like a single overhead bulb.
    const keyLight = new THREE.DirectionalLight(0xffb066, 1)
    keyLight.position.set(4, 5, 6)
    scene.add(keyLight)

    // A soft gold point light near the viewer adds a subtle glow to the
    // beans closest to camera, reinforcing depth.
    const glowLight = new THREE.PointLight(0xc9a24b, 1.2, 20)
    glowLight.position.set(0, 0, 6)
    scene.add(glowLight)

    // --- MOUSE INTERACTION ---
    // We track the mouse position normalized to -1..1, then in the
    // animation loop ease ("lerp") toward it every frame instead of
    // snapping — that easing is what makes it feel smooth and organic.
    const mouseTarget = { x: 0, y: 0 }
    const handleMouseMove = (event) => {
      mouseTarget.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseTarget.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    // --- RESPONSIVE RESIZING ---
    const handleResize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // --- ANIMATION LOOP ---
    // requestAnimationFrame calls `animate` right before each repaint
    // (~60 times a second). Every call we: nudge each bean's float/spin
    // forward, ease the camera and field toward the mouse, then render.
    const timer = new THREE.Timer()
    let currentMouseX = 0
    let currentMouseY = 0
    let animationId

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      timer.update()
      const elapsed = timer.getElapsed()

      // Update every bean's matrix: a gentle vertical bob (sine wave,
      // offset per-bean by `phase` so they don't all bob in unison) plus
      // a slow individual spin. This is what makes the field feel like
      // it's drifting organically rather than sitting frozen.
      for (let i = 0; i < BEAN_COUNT; i++) {
        const p = particles[i]
        dummy.position.set(
          p.basePosition.x,
          p.basePosition.y + Math.sin(elapsed * p.floatSpeed + p.phase) * p.floatRange,
          p.basePosition.z,
        )
        dummy.scale.set(p.scale * 0.7, p.scale, p.scale * 0.5)
        dummy.rotation.set(elapsed * p.spinSpeed, elapsed * p.spinSpeed * 0.7, 0)
        dummy.updateMatrix()
        beans.setMatrixAt(i, dummy.matrix)
      }
      beans.instanceMatrix.needsUpdate = true // tell Three.js the matrices changed

      // Ease our tracked mouse position toward its target (smoothing).
      currentMouseX += (mouseTarget.x - currentMouseX) * 0.04
      currentMouseY += (mouseTarget.y - currentMouseY) * 0.04

      // The whole field slowly rotates on its own, plus tilts subtly
      // toward the mouse — this is the "particle field reacts" part.
      beans.rotation.y = elapsed * 0.03 + currentMouseX * 0.15
      beans.rotation.x = currentMouseY * 0.08

      // The camera also drifts slightly with the mouse (parallax),
      // always looking back at the center — this is the "camera
      // reacts" part, and combined with the field tilt gives a subtle,
      // layered sense of depth rather than a flat reaction.
      camera.position.x = currentMouseX * 1.2
      camera.position.y = -currentMouseY * 0.8
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    // --- CLEANUP ---
    // React runs this when CoffeeUniverse unmounts. Without it, the
    // animation loop and event listeners would keep running forever —
    // a memory leak, even after the component is gone from the page.
    return () => {
      cancelAnimationFrame(animationId)
      timer.dispose()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      // Instancing shares one geometry and one material across every
      // bean, so there's just one of each to dispose — not 350.
      beanGeometry.dispose()
      beanMaterial.dispose()
      renderer.dispose()

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div className="coffee-universe" ref={mountRef} />
}

export default CoffeeUniverse
