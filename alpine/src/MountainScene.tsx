import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './mountain-scene.css'

type LightMode = 'day' | 'golden' | 'night'
type Props = { progress: number; activeRoute: number; reducedMotion?: boolean; lightMode?: LightMode }

const lighting = {
  day: { sky: '#e8f5ff', ground: '#52666b', sun: '#fff9ec', rim: '#a7d5ed', skyIntensity: 2.15, sunIntensity: 3.15, rimIntensity: 1.75, exposure: 1.08, x: -7, y: 12, z: 4 },
  golden: { sky: '#f2cdb9', ground: '#52616d', sun: '#ffbd7c', rim: '#91b9eb', skyIntensity: 1.7, sunIntensity: 3.9, rimIntensity: 1.8, exposure: 1.13, x: -12, y: 5, z: 5 },
  night: { sky: '#8eace0', ground: '#243957', sun: '#b2d5ff', rim: '#6394de', skyIntensity: 1.65, sunIntensity: 2.1, rimIntensity: 2.5, exposure: 1.0, x: 5, y: 11, z: -8 },
} satisfies Record<LightMode, { sky: string; ground: string; sun: string; rim: string; skyIntensity: number; sunIntensity: number; rimIntensity: number; exposure: number; x: number; y: number; z: number }>

const summit = (x: number, z: number) => {
  const peaks = [
    [-3.6, -1.8, 4.7, 2.8, 2.4],
    [0.7, -2.3, 5.7, 3.2, 2.7],
    [4.0, -0.3, 4.0, 2.3, 2.7],
    [-0.7, 1.5, 3.3, 3.0, 2.4],
    [-4.4, 2.1, 2.2, 2.2, 2.0],
  ]
  let height = 0
  for (const [px, pz, h, sx, sz] of peaks) {
    const distance = Math.sqrt(((x - px) / sx) ** 2 + ((z - pz) / sz) ** 2)
    const peak = h * Math.max(0, 1 - distance * 0.54) ** 2.15
    height = Math.max(height, peak)
  }
  const detail = Math.sin(x * 2.6 + z * 1.6) * Math.cos(z * 2.9 - x * 0.7)
  const ridge = Math.abs(Math.sin(x * 1.8 + z * 0.9))
  const edge = Math.max(0, 1 - (x / 8.2) ** 2 - (z / 6.1) ** 2)
  return 0.26 + height * (0.91 + 0.09 * ridge) + detail * 0.11 * Math.min(1, edge * 4)
}

const trails = [
  [[0.7, -2.3], [1.5, -1.7], [2.2, -0.2], [1.1, 0.9], [1.9, 2.2], [0.6, 3.5], [-1.5, 4.4]],
  [[-3.6, -1.8], [-2.6, -0.9], [-3.3, 0.2], [-2.1, 1.5], [-3.2, 2.6], [-2.5, 3.7], [-4.2, 4.2]],
  [[4.0, -0.3], [4.6, 0.6], [3.8, 1.4], [4.7, 2.2], [3.2, 3.0], [2.6, 4.0], [0.6, 4.8]],
]

function makeTerrain() {
  const positions: number[] = []
  const indices: number[] = []
  const rings = 44
  const segments = 164
  for (let ring = 0; ring <= rings; ring++) {
    const radius = Math.max(0.001, ring / rings)
    for (let segment = 0; segment < segments; segment++) {
      const angle = (segment / segments) * Math.PI * 2
      const border = 1 + 0.035 * Math.sin(angle * 7) + 0.028 * Math.cos(angle * 11)
      const x = Math.cos(angle) * 8.2 * radius * border
      const z = Math.sin(angle) * 6.1 * radius * border
      const falloff = THREE.MathUtils.smoothstep(radius, 0.82, 1)
      positions.push(x, summit(x, z) * (1 - falloff * 0.38), z)
      if (ring < rings) {
        const a = ring * segments + segment
        const b = ring * segments + ((segment + 1) % segments)
        const c = a + segments
        const d = b + segments
        indices.push(a, b, c, b, d, c)
      }
    }
  }
  const indexed = new THREE.BufferGeometry()
  indexed.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  indexed.setIndex(indices)
  indexed.computeVertexNormals()
  const geometry = indexed.toNonIndexed()
  indexed.dispose()
  geometry.computeVertexNormals()
  const attribute = geometry.getAttribute('position')
  const colors = new Float32Array(attribute.count * 3)
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const faceNormal = new THREE.Vector3()
  const color = new THREE.Color()
  for (let i = 0; i < attribute.count; i += 3) {
    a.fromBufferAttribute(attribute, i)
    b.fromBufferAttribute(attribute, i + 1)
    c.fromBufferAttribute(attribute, i + 2)
    faceNormal.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize()
    const slope = Math.abs(faceNormal.y)
    const elevation = (a.y + b.y + c.y) / 3
    const rock = slope < 0.55 && elevation > 1.5
    const shade = 0.89 + Math.sin(a.x * 15 + a.z * 9) * 0.055
    color.set(rock ? '#73828a' : elevation > 3 ? '#f5f6f1' : '#cfdee0')
    color.multiplyScalar(shade)
    for (let vertex = 0; vertex < 3; vertex++) color.toArray(colors, (i + vertex) * 3)
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

export default function MountainScene({ progress, activeRoute, reducedMotion = false, lightMode = 'day' }: Props) {
  const mount = useRef<HTMLDivElement>(null)
  const values = useRef({ progress, activeRoute, reducedMotion, lightMode })
  values.current = { progress, activeRoute, reducedMotion, lightMode }
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const host = mount.current
    if (!host) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      setFallback(true)
      host.dataset.renderer = 'fallback'
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)
    host.dataset.renderer = 'webgl'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    const group = new THREE.Group()
    scene.add(group)
    const hemisphere = new THREE.HemisphereLight('#e8f5ff', '#52666b', 2.15)
    scene.add(hemisphere)
    const light = new THREE.DirectionalLight('#fff9ec', 3.15)
    light.position.set(-7, 12, 3)
    scene.add(light)
    const rim = new THREE.DirectionalLight('#a7d5ed', 1.75)
    rim.position.set(6, 5, -7)
    scene.add(rim)

    const terrain = new THREE.Mesh(makeTerrain(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0.015, flatShading: true, side: THREE.DoubleSide }))
    group.add(terrain)

    // A dark rock shelf makes the terrain read as a floating physical model.
    const shelf = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.94, 0.48, 164, 1), new THREE.MeshStandardMaterial({ color: '#293a42', roughness: 1, flatShading: true }))
    shelf.scale.set(8.05, 1, 5.95)
    shelf.position.y = -0.02
    group.add(shelf)

    const contourMaterial = new THREE.LineBasicMaterial({ color: '#8da2a7', transparent: true, opacity: 0.14 })
    for (let ring = 0; ring < 4; ring++) {
      const ellipse = new THREE.EllipseCurve(0, 0, 8.7 + ring * 0.56, 6.5 + ring * 0.45, 0, 2 * Math.PI, false, 0)
      const points = ellipse.getPoints(164).map(p => new THREE.Vector3(p.x, -0.32 - ring * 0.05, p.y))
      group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), contourMaterial))
    }

    // A single small point cloud gives the illuminated model a sense of scale.
    // Positions are deterministic; no texture, postprocessing or extra draw pass.
    const snowCount = window.matchMedia('(max-width: 600px)').matches ? 55 : 130
    const snowPositions = new Float32Array(snowCount * 3)
    for (let i = 0; i < snowCount; i++) {
      const seed = Math.sin(i * 127.1 + 311.7) * 43758.5453
      const x = (seed - Math.floor(seed)) * 20 - 10
      const seedZ = Math.sin(i * 269.5 + 183.3) * 43758.5453
      const z = (seedZ - Math.floor(seedZ)) * 14 - 7
      const seedY = Math.sin(i * 419.2 + 719.1) * 43758.5453
      snowPositions.set([x, summit(x, z) + 0.5 + (seedY - Math.floor(seedY)) * 2.6, z], i * 3)
    }
    const snowGeometry = new THREE.BufferGeometry()
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3))
    const snowMaterial = new THREE.PointsMaterial({ color: '#eaf5ff', size: 0.028, transparent: true, opacity: 0.42, depthWrite: false, sizeAttenuation: true })
    const snow = new THREE.Points(snowGeometry, snowMaterial)
    group.add(snow)

    const trailMaterials: THREE.MeshBasicMaterial[] = []
    const markers: THREE.Mesh[] = []
    trails.forEach((coordinates, index) => {
      const control = coordinates.map(([x, z]) => new THREE.Vector3(x, 0, z))
      const route = new THREE.CatmullRomCurve3(control)
      const surfacePoints = route.getPoints(170).map(p => new THREE.Vector3(p.x, summit(p.x, p.z) + 0.085, p.z))
      const surfaceRoute = new THREE.CatmullRomCurve3(surfacePoints)
      const material = new THREE.MeshBasicMaterial({ color: index === 0 ? '#fd6247' : '#edf5f3', transparent: true, opacity: index === 0 ? 1 : 0.22, depthTest: true })
      trailMaterials.push(material)
      const tube = new THREE.Mesh(new THREE.TubeGeometry(surfaceRoute, 170, 0.035, 6, false), material)
      group.add(tube)
      const first = surfacePoints[0]
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 12), new THREE.MeshBasicMaterial({ color: '#ff634b' }))
      marker.position.copy(first)
      group.add(marker)
      markers.push(marker)

      const pole = new THREE.BufferGeometry().setFromPoints([first, first.clone().add(new THREE.Vector3(0, 0.85, 0))])
      group.add(new THREE.Line(pole, new THREE.LineBasicMaterial({ color: '#e5eee9', transparent: true, opacity: 0.65 })))
      const endpoint = new THREE.Mesh(new THREE.RingGeometry(0.10, 0.14, 24), material)
      endpoint.position.copy(surfacePoints[surfacePoints.length - 1])
      endpoint.rotation.x = -Math.PI / 2
      group.add(endpoint)
    })

    const pointer = new THREE.Vector2()
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const bounds = host.getBoundingClientRect()
      pointer.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)
    }
    const reset = () => pointer.set(0, 0)
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', reset)
    let width = 1
    const resize = () => {
      const bounds = host.getBoundingClientRect()
      width = bounds.width
      renderer.setSize(bounds.width, bounds.height)
      camera.aspect = bounds.width / bounds.height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()
    let frame = 0
    let angle = 0.22
    let selected = -1
    let visible = true
    let previousTime = 0
    let elapsed = 0
    const palette = { sky: new THREE.Color(), ground: new THREE.Color(), sun: new THREE.Color(), rim: new THREE.Color() }
    const lightPosition = new THREE.Vector3()
    const documentVisibility = () => { previousTime = 0 }
    document.addEventListener('visibilitychange', documentVisibility)
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { rootMargin: '100px' })
    visibility.observe(host)
    const render = (time = 0) => {
      frame = requestAnimationFrame(render)
      if (!visible || document.hidden) { previousTime = 0; return }
      const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60
      previousTime = time
      const { progress: rawProgress, activeRoute: active, reducedMotion: reduce, lightMode: mode } = values.current
      const p = THREE.MathUtils.clamp(rawProgress, 0, 1)
      const factor = reduce ? 1 : 1 - Math.exp(-dt * 3.0)
      const preset = lighting[mode]
      hemisphere.color.lerp(palette.sky.set(preset.sky), factor)
      hemisphere.groundColor.lerp(palette.ground.set(preset.ground), factor)
      light.color.lerp(palette.sun.set(preset.sun), factor)
      rim.color.lerp(palette.rim.set(preset.rim), factor)
      hemisphere.intensity = THREE.MathUtils.lerp(hemisphere.intensity, preset.skyIntensity, factor)
      light.intensity = THREE.MathUtils.lerp(light.intensity, preset.sunIntensity, factor)
      rim.intensity = THREE.MathUtils.lerp(rim.intensity, preset.rimIntensity, factor)
      renderer.toneMappingExposure = THREE.MathUtils.lerp(renderer.toneMappingExposure, preset.exposure, factor)
      light.position.lerp(lightPosition.set(preset.x, preset.y, preset.z), factor)
      snowMaterial.opacity = THREE.MathUtils.lerp(snowMaterial.opacity, mode === 'night' ? 0.57 : 0.32, factor)
      const target = reduce ? 0.22 : 0.08 + p * 0.65 + pointer.x * 0.065
      angle += (target - angle) * (reduce ? 1 : 1 - Math.exp(-dt * 2.8))
      const distance = (width < 550 ? 28.5 : 23.3) - (reduce ? 0 : Math.sin(p * Math.PI) * 1.2)
      camera.position.set(Math.sin(angle) * distance, 13.4 + (reduce ? 0 : pointer.y * 0.45 + Math.sin(p * Math.PI) * 0.45), Math.cos(angle) * distance)
      camera.lookAt(0, 1.25, 0)
      group.rotation.z = -0.035
      if (!reduce) {
        elapsed += dt
        snow.position.x = Math.sin(elapsed * 0.11) * 0.14
        snow.position.y = Math.sin(elapsed * 0.23) * 0.09
      } else snow.position.set(0, 0, 0)
      if (active !== selected) {
        trailMaterials.forEach((material, index) => {
          material.color.set(index === active ? '#ff6248' : '#edf5f3')
          material.opacity = index === active ? 1 : 0.22
          markers[index].visible = index === active
        })
        selected = active
      }
      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', documentVisibility)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', reset)
      scene.traverse(object => {
        const mesh = object as THREE.Mesh
        mesh.geometry?.dispose()
        if (Array.isArray(mesh.material)) mesh.material.forEach(material => material.dispose())
        else mesh.material?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="mountain-scene" data-light-mode={lightMode} ref={mount} role="img" aria-label="Massif alpin en trois dimensions et itinéraires de ski">
    {fallback && <svg className="mountain-fallback" viewBox="0 0 800 550" aria-hidden="true"><defs><linearGradient id="snow" x2="0.8" y2="1"><stop stopColor="#f5f5ee"/><stop offset="1" stopColor="#8399a3"/></linearGradient></defs><path fill="url(#snow)" d="M40 410 200 160 280 240 410 70 530 245 610 150 760 420 400 510Z"/><path fill="#465b66" d="m410 70 30 265 90-90-54-77 4 61Z"/><path fill="none" stroke="#ff6248" strokeWidth="4" d="M410 100C390 160 490 200 440 260S340 330 390 370 330 425 250 440"/></svg>}
  </div>
}
