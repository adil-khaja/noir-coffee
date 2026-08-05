import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './CoffeeScene.css'

// CoffeeScene: a full-screen, slowly rotating 3D coffee cup built from
// plain Three.js (no helper libraries). It sets everything up when the
// component mounts and tears it all down when it unmounts, so it's safe
// to drop this component in and out of a page.
function CoffeeScene() {
  // A ref to the empty <div> we render below. Three.js needs a real DOM
  // element to attach its <canvas> to, and refs are how React hands us
  // direct access to that element.
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current

    // --- SCENE ---
    // The scene is the 3D "world": a container that holds every object,
    // light and camera we're about to create. Nothing is visible until
    // it's added to the scene.
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a) // dark, minimal backdrop

    // --- CAMERA ---
    // A PerspectiveCamera renders the way our eyes see: things further
    // away appear smaller. Arguments: field of view (degrees), aspect
    // ratio (width/height), and the near/far clipping distances (objects
    // outside that range simply aren't drawn).
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0.3, 5)

    // --- RENDERER ---
    // The renderer is the engine that actually draws the scene, as seen
    // through the camera, onto a <canvas> element — repeatedly, one frame
    // at a time.
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // --- BUILDING THE CUP ---
    // A Group is just a container for multiple meshes that should move
    // together — rotating the group rotates everything inside it as one.
    const cup = new THREE.Group()

    // GEOMETRY describes an object's raw shape (its vertices).
    // MATERIAL describes how its surface looks (color, roughness, shine).
    // MESH is what you actually add to the scene: geometry + material.

    // Cup body — a cylinder, slightly narrower at the base than the rim.
    const bodyGeometry = new THREE.CylinderGeometry(1, 0.8, 1.6, 32)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x6f4e37, // warm ceramic brown
      roughness: 0.5,
      metalness: 0.1,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    cup.add(body)

    // Coffee surface — a thin, dark, glossier disc sitting inside the rim.
    const coffeeGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.05, 32)
    const coffeeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b1810, // dark roast
      roughness: 0.2, // lower roughness = more of a liquid sheen
      metalness: 0.3,
    })
    const coffeeSurface = new THREE.Mesh(coffeeGeometry, coffeeMaterial)
    coffeeSurface.position.y = 0.8
    cup.add(coffeeSurface)

    // Handle — a torus (donut shape), rotated upright and moved to the side.
    const handleGeometry = new THREE.TorusGeometry(0.4, 0.1, 16, 32)
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x6f4e37,
      roughness: 0.5,
      metalness: 0.1,
    })
    const handle = new THREE.Mesh(handleGeometry, handleMaterial)
    handle.rotation.z = Math.PI / 2
    handle.position.set(1.1, 0, 0)
    cup.add(handle)

    scene.add(cup)

    // --- LIGHTING ---
    // Ambient light has no direction or source — it lifts the whole scene
    // evenly so shadowed areas aren't pure black.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // A directional "key" light acts like a strong light source far away
    // (think sunlight through a café window) — warm-toned, from the front.
    const keyLight = new THREE.DirectionalLight(0xffe0b3, 1.2)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)

    // A soft point light from the opposite side fills in the shadowed
    // side of the cup so it doesn't look flat.
    const fillLight = new THREE.PointLight(0xc9a24b, 0.6)
    fillLight.position.set(-3, -1, 2)
    scene.add(fillLight)

    // --- MOUSE INTERACTION ---
    // We record the mouse position normalized to a -1..1 range, then in
    // the animation loop we ease ("lerp") toward it each frame instead of
    // snapping straight there — that easing is what makes the tilt feel
    // subtle rather than jittery.
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
    // requestAnimationFrame asks the browser to call `animate` right
    // before the next repaint (~60 times per second). Each call we nudge
    // the rotation forward slightly and re-render — many tiny nudges in a
    // row is what reads as smooth, continuous motion.
    let autoRotation = 0
    let currentMouseX = 0
    let currentMouseY = 0
    let animationId

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      autoRotation += 0.004 // slow, constant spin

      // Ease the current tilt toward the mouse target (smoothing factor).
      currentMouseX += (mouseTarget.x - currentMouseX) * 0.05
      currentMouseY += (mouseTarget.y - currentMouseY) * 0.05

      cup.rotation.y = autoRotation + currentMouseX * 0.3
      cup.rotation.x = currentMouseY * 0.15

      renderer.render(scene, camera)
    }
    animate()

    // --- CLEANUP ---
    // React calls this when CoffeeScene unmounts. Without it, the
    // animation loop and event listeners would keep running forever
    // (a memory leak), even after the component is gone.
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      bodyGeometry.dispose()
      bodyMaterial.dispose()
      coffeeGeometry.dispose()
      coffeeMaterial.dispose()
      handleGeometry.dispose()
      handleMaterial.dispose()
      renderer.dispose()

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div className="coffee-scene" ref={mountRef} />
}

export default CoffeeScene
