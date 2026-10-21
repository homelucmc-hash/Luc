import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Compass, Globe2, Menu, Moon, MountainSnow, Plus, Sun, Sunset, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TripPlanner from './TripPlanner'
import AlpineAtmosphere from './AlpineAtmosphere'
import AlpineDay from './AlpineDay'

const MountainScene = lazy(() => import('./MountainScene'))
gsap.registerPlugin(ScrollTrigger)

const slides = [
  { image: '/images/alpine-hero.jpg', label: 'Le grand blanc', title: <>L’INSTINCT<br />DES SOMMETS.</>, description: 'L’air est plus pur. Les émotions, plus fortes.\nBienvenue à Val Thorens.' },
  { image: '/images/ski.jpg', label: 'L’élan', title: <>LA LIBERTÉ.<br />PLEIN CADRE.</>, description: 'Une première trace. Un grand frisson.\nEt l’envie de recommencer.' },
  { image: '/images/chalet.jpg', label: 'La parenthèse', title: <>PLUS HAUT.<br />PLUS PROCHE.</>, description: 'Loin du quotidien. Tout près de l’essentiel.\nRetrouver le goût des choses simples.' },
]

const routes = [
  { number: '01', name: 'Prendre de la hauteur', altitude: '3 200', label: 'CIME CARON', text: 'Le souffle court. L’horizon sans fin. Au sommet de la Cime Caron, les Alpes s’offrent à vous, à 360 degrés.', metric: '360°', metricLabel: 'de panorama alpin' },
  { number: '02', name: 'Suivre son instinct', altitude: '600', label: 'KILOMÈTRES DE PISTES', text: 'Trois vallées, une infinité de lignes. Des premières courbes aux grandes traversées, trouvez votre propre rythme.', metric: '3', metricLabel: 'vallées reliées skis aux pieds' },
  { number: '03', name: 'Revenir à l’essentiel', altitude: '2 300', label: 'MÈTRES D’ALTITUDE', text: 'Le dernier virage mène au village. Une terrasse au soleil, des joues rougies par le froid. Le bonheur, tout simplement.', metric: '100 %', metricLabel: 'de moments à partager' },
]

const experiences = [
  { id: 'glisse', tag: 'LE GOÛT DU GRAND SKI', name: 'Tracer sa liberté.', image: '/images/ski.jpg', alt: 'Un skieur s’élance dans les airs devant les montagnes enneigées', subtitle: 'Des premiers virages aux grandes échappées.', body: 'Commencez par les pistes de Val Thorens, puis laissez la journée vous emmener vers les autres vallées. Une pause en altitude, une nouvelle ligne, un dernier retour au village : ici, chaque journée trouve son rythme.', ideas: ['Une matinée sur les pistes de Val Thorens', 'Une traversée des 3 Vallées selon votre niveau', 'Une pause face aux sommets'], note: 'Choisissez des pistes adaptées à votre niveau et consultez les conditions d’ouverture auprès de la station.' },
  { id: 'sommets', tag: 'LA BEAUTÉ À L’ÉTAT BRUT', name: 'Changer de perspective.', image: '/images/alpine-hero.jpg', alt: 'Un vaste paysage de sommets et de neige sous le ciel bleu', subtitle: 'Il suffit parfois de regarder un peu plus loin.', body: 'Prenez le temps de monter, de regarder, de ne rien faire d’autre. Le panorama de la Cime Caron, les lumières du matin et l’immensité des Alpes rappellent que les plus beaux souvenirs tiennent à peu de choses.', ideas: ['Le panorama de la Cime Caron à 3 200 m', 'Une balade sur les itinéraires piétons balisés', 'Les dernières lumières sur les sommets'], note: 'L’accès aux remontées et aux sentiers dépend de la météo. Vérifiez les conditions sur le site officiel avant votre sortie.' },
  { id: 'village', tag: 'L’ART DE RALENTIR', name: 'Prolonger l’instant.', image: '/images/chalet.jpg', alt: 'Un chalet de bois dans un paysage hivernal silencieux', subtitle: 'Après les grands espaces, les petits bonheurs.', body: 'Un déjeuner qui s’étire, une parenthèse au spa, le plaisir de se retrouver quand la neige tombe dehors. L’après-ski peut aussi être une invitation à ralentir et à savourer la vie en altitude.', ideas: ['Un déjeuner en terrasse dans le village', 'Une parenthèse bien-être au centre sportif', 'Un dîner savoyard à partager'], note: 'Les photos sont des images d’ambiance. Consultez les établissements de la station pour les disponibilités et les réservations.' },
]

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand ${footer ? 'brand--footer' : ''}`} href="#accueil" aria-label="Val Thorens — retour à l’accueil"><span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 42 40" fill="none"><path d="M3 32 16 7l10 18 5-9 9 16H3Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /><path d="m11.5 16 4.5 7 4.5-7" stroke="currentColor" strokeWidth="2.5" /></svg></span><span className="brand-name">val thorens<span>LIVE UNITED.</span></span></a>
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  return reduced
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const domain = useRef<HTMLElement>(null)
  const detailOrigin = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()
  const [slide, setSlide] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [detail, setDetail] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeRoute, setActiveRoute] = useState(0)
  const [sceneReady, setSceneReady] = useState(false)
  const [lightMode, setLightMode] = useState<'day' | 'golden' | 'night'>('day')
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem('la-haut-carnet') || '[]')
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
    } catch { return [] }
  })

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 40)
      const travel = document.documentElement.scrollHeight - innerHeight
      root.current?.style.setProperty('--reading-progress', String(travel > 0 ? scrollY / travel : 0))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    try { localStorage.setItem('la-haut-carnet', JSON.stringify(saved)) } catch { /* Private browsing can disable storage. */ }
  }, [saved])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSceneReady(true); observer.disconnect() }
    }, { rootMargin: '350px' })
    if (domain.current) observer.observe(domain.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const context = gsap.context(() => {
      if (!reducedMotion) {
        gsap.fromTo('.hero-line span', { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.12, ease: 'power4.out', delay: 0.1 })
        gsap.fromTo('.hero-meta, .hero-description, .hero-actions, .hero-bottom', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, delay: 0.5, ease: 'power3.out' })
        gsap.to('.hero-images', { yPercent: 17, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to('.hero-content', { y: -65, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } })
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
          gsap.fromTo(element, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 89%', once: true } })
        })
        gsap.to('.interlude-image', { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.interlude', start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.to('.outline-word', { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '.experiences', start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.fromTo('.alpine-day', { clipPath: 'inset(5% 5% 5% 5%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.alpine-day', start: 'top 85%', end: 'top 20%', scrub: 0.5 } })
      }
      ScrollTrigger.create({ trigger: domain.current, start: 'top top', end: 'bottom bottom', onUpdate: (self) => {
        setProgress(self.progress)
        setActiveRoute(Math.min(2, Math.floor(self.progress * 3)))
      } })
    }, root)
    const refresh = () => ScrollTrigger.refresh()
    document.fonts.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => { context.revert(); window.removeEventListener('load', refresh) }
  }, [reducedMotion])

  function selectRoute(index: number) {
    if (!domain.current) return
    const top = domain.current.getBoundingClientRect().top + window.scrollY
    const distance = domain.current.offsetHeight - window.innerHeight
    // Cancel an in-flight chapter navigation before starting the next one.
    // The selected chapter remains derived from the actual scroll position.
    window.scrollTo({ top: window.scrollY, behavior: 'instant' })
    window.scrollTo({ top: top + distance * ((index + 0.5) / 3), behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  const route = routes[activeRoute]
  const selectedExperience = detail === null ? null : experiences[detail]
  const navItems = [{ href: '#destination', label: 'L’esprit Val Tho' }, { href: '#domaine', label: 'Le terrain de jeu' }, { href: '#une-journee', label: 'Une journée là-haut' }, { href: '#experiences', label: 'À vivre' }]

  return <div ref={root}>
    <a className="skip-link" href="#destination">Aller au contenu</a>
    <div className="reading-progress" aria-hidden="true" />
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <Brand />
      <nav className="desktop-nav" aria-label="Navigation principale">{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <div className="header-end"><span className="language"><Globe2 size={15} /> FR</span><button className="button button--header" onClick={() => setPlannerOpen(true)}>Imaginer mon séjour <ArrowUpRight size={17} /></button>
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger asChild><button className="mobile-menu-button" aria-label="Ouvrir le menu"><Menu size={25} /></button></Dialog.Trigger>
          <Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="mobile-menu"><Dialog.Title className="sr-only">Explorer Val Thorens</Dialog.Title><Dialog.Description className="sr-only">Navigation et préparation de séjour</Dialog.Description><Dialog.Close className="dialog-close" aria-label="Fermer le menu"><X /></Dialog.Close><span className="eyebrow">L’INSTINCT DES SOMMETS</span><nav>{navItems.map((item, i) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}><span>0{i + 1}</span>{item.label}<ArrowUpRight /></a>)}</nav><button className="button" onClick={() => { setMenuOpen(false); setPlannerOpen(true) }}>Imaginer mon séjour <ArrowUpRight size={18} /></button></Dialog.Content></Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>

    <main>
      <section className={`hero hero--${slide}`} id="accueil" aria-label="Bienvenue à Val Thorens">
        <div className="hero-images">{slides.map((item, i) => <img key={item.image} src={item.image} className={i === slide ? 'is-active' : ''} alt="" fetchPriority={i === 0 ? 'high' : 'auto'} />)}</div>
        <div className="hero-shade" />
        <AlpineAtmosphere reducedMotion={reducedMotion} />
        <div className="hero-topline"><span>UNE AUTRE IDÉE DE L’HIVER</span><span>LES 3 VALLÉES · ALPES FRANÇAISES</span></div>
        <div className="hero-content">
          <p className="eyebrow hero-meta"><span className="red-line" /> VAL THORENS, 2 300 MÈTRES D’AVANCE</p>
          <h1 key={slide} aria-live="polite">{slide === 0 ? <><span className="hero-line"><span>L’INSTINCT</span></span><span className="hero-line"><span>DES SOMMETS.</span></span></> : slides[slide].title}</h1>
          <div className="hero-copy-row"><p className="hero-description">{slides[slide].description}</p><a className="hero-explore" href="#destination"><span>PRENDRE<br />DE LA HAUTEUR</span><span className="round-arrow"><ArrowDown size={20} /></span></a></div>
        </div>
        <div className="altitude-stamp" aria-hidden="true"><span className="stamp-top">PLUS HAUT. PLUS VIVANT.</span><MountainSnow size={38} strokeWidth={1} /><span className="stamp-number">2 300 <small>m</small></span><span className="stamp-bottom">VAL THORENS — FRANCE</span></div>
        <div className="hero-bottom"><a className="scroll-cue" href="#destination"><span className="scroll-line" />DÉFILER POUR S’ÉVADER</a><div className="hero-pagination"><span className="slide-count">0{slide + 1}<span> / 03</span></span><span className="slide-caption">{slides[slide].label}</span><button aria-label="Image précédente" onClick={() => setSlide((slide + 2) % 3)}><ArrowLeft size={18} /></button><button aria-label="Image suivante" onClick={() => setSlide((slide + 1) % 3)}><ArrowRight size={18} /></button></div><span className="hero-coordinate">45°17′53″ N &nbsp; 6°34′50″ E</span></div>
        <div className="hero-progress"><span style={{ width: `${(slide + 1) / 3 * 100}%` }} /></div>
      </section>

      <section className="intro section-pad" id="destination">
        <div className="section-label" data-reveal><span className="section-number">01 /</span><span>IL ÉTAIT UNE FOIS, LÀ-HAUT.</span><span className="tiny-cross">+</span></div>
        <div className="intro-heading" data-reveal><h2>Il y a des endroits.<br />Et il y a <span>là-haut.</span></h2><div className="intro-copy"><p>Un village au-dessus des nuages.<br />Des sommets à perte de vue.<br />Et cette sensation d’être exactement<br />là où l’on doit être.</p><p className="muted">À Val Thorens, on ne vient pas seulement<br className="desktop-break" /> pour le ski. On vient pour se sentir vivant.</p><a className="text-link" href="#domaine">Laissez-vous porter <ArrowDown size={17} /></a></div></div>
        <div className="numbers-row" data-reveal><div><span className="stat-number">2 300<small>m</small></span><span className="stat-label">LA VIE PREND DE LA HAUTEUR</span></div><div><span className="stat-number">600<small>km</small></span><span className="stat-label">DE PISTES DANS LES 3 VALLÉES</span></div><div><span className="stat-number">360<small>°</small></span><span className="stat-label">DE RAISONS DE S’ÉMERVEILLER</span></div><div className="intro-signature"><Compass size={40} strokeWidth={1} /><span>Le cœur en bas.<br />L’esprit là-haut.</span></div></div>
      </section>

      <section className="domain-scroll" id="domaine" ref={domain} aria-label="Exploration du domaine en trois chapitres">
        <div className="domain-sticky" data-light-mode={lightMode}>
          <div className="section-label domain-label"><span className="section-number">02 /</span><span>UN TERRAIN DE JEU SANS LIMITE.</span><a href="#experiences">Passer l’exploration <ArrowDown size={14} /></a></div>
          <div className="domain-heading"><p className="eyebrow">LE DOMAINE, AUTREMENT.</p><h2>Suivez<br />votre <span>nature.</span></h2><p>Un sommet. Mille façons de le vivre.<br />Faites défiler. Prenez le large.</p></div>
          <div className="scene-wrap"><Suspense fallback={<div className="scene-loading"><MountainSnow size={70} strokeWidth={0.6} /><span>Le relief prend forme…</span></div>}>{sceneReady && <MountainScene progress={progress} activeRoute={activeRoute} reducedMotion={reducedMotion} lightMode={lightMode} />}</Suspense></div>
          <div className="scene-light-controls"><span>CHANGEZ LA LUMIÈRE</span><div role="group" aria-label="Ambiance lumineuse du massif">{([{ value: 'day', label: 'Matin', icon: Sun }, { value: 'golden', label: 'Doré', icon: Sunset }, { value: 'night', label: 'Nuit', icon: Moon }] as const).map(({ value, label, icon: Icon }) => <button key={value} aria-label={`Lumière : ${label}`} aria-pressed={lightMode === value} onClick={() => setLightMode(value)}><Icon size={17} strokeWidth={1.2} /><span>{label}</span></button>)}</div></div>
          <div className="scene-compass" aria-hidden="true"><span>N</span><Compass size={46} strokeWidth={0.7} /><span>EXPLORATION 3D</span></div>
          <div className="route-detail" key={activeRoute}><span className="eyebrow"><span className="route-dot" /> {route.label}</span><div className="route-altitude">{route.altitude}<small>{activeRoute === 1 ? 'km' : 'm'}</small></div><p>{route.text}</p><div className="route-metric"><strong>{route.metric}</strong><span>{route.metricLabel}</span></div></div>
          <div className="domain-bottom"><div className="route-tabs" role="group" aria-label="Choisir un chapitre de l’exploration">{routes.map((item, index) => <button key={item.number} aria-pressed={activeRoute === index} className={activeRoute === index ? 'is-active' : ''} onClick={() => selectRoute(index)}><span>{item.number}</span>{item.name}<ArrowUpRight size={16} /></button>)}</div><span className="scene-note">INTERPRÉTATION ARTISTIQUE DU MASSIF · ITINÉRAIRES ILLUSTRATIFS</span></div>
          <div className="domain-progress" aria-hidden="true"><span style={{ transform: `scaleY(${progress})` }} /></div>
        </div>
      </section>

      <AlpineDay />

      <section className="experiences section-pad" id="experiences">
        <div className="outline-word" aria-hidden="true">LIBRE PAR NATURE.</div>
        <div className="section-label" data-reveal><span className="section-number">04 /</span><span>CES INSTANTS QUI RESTENT.</span><span className="tiny-cross">+</span></div>
        <div className="experience-heading" data-reveal><h2>À chacun<br />son <span>altitude.</span></h2><div><p>Se dépasser. Contempler. Ne rien faire.<br />Il n’y a pas de bonne façon de vivre<br />la montagne. Il y a la vôtre.</p><span className="handwritten">Et c’est ça, l’essentiel.</span></div></div>
        <div className="experience-grid">{experiences.map((experience, index) => <article className={`experience-card experience-card--${index}`} key={experience.id} data-reveal><button className="experience-image-button" onClick={() => setDetail(index)} aria-label={`Découvrir : ${experience.name}`}><div className="experience-photo"><img src={experience.image} alt={experience.alt} loading="lazy" width="800" height="1100" /><span className="experience-index">0{index + 1}</span><span className="image-discover"><Plus size={24} strokeWidth={1.3} /></span></div></button><div className="experience-caption"><span className="eyebrow">{experience.tag}</span><button onClick={() => setDetail(index)}><h3>{experience.name}</h3><ArrowUpRight size={24} strokeWidth={1.5} /></button></div></article>)}</div>
        <div className="experience-footnote"><span>LA MONTAGNE N’A PAS QU’UN SEUL VISAGE.</span><span>VOTRE PROCHAINE HISTOIRE COMMENCE ICI. <ArrowDown size={15} /></span></div>
      </section>

      <section className="interlude" aria-label="Une invitation à ralentir"><img className="interlude-image" src="/images/alpine-hero.jpg" alt="La lumière traverse les nuages au-dessus d’une étendue de neige" loading="lazy" /><div className="interlude-shade" /><div className="interlude-text" data-reveal><span className="eyebrow">FERMEZ LES YEUX. VOUS Y ÊTES PRESQUE.</span><h2>MOINS DE BRUIT.<br /><span>PLUS DE VIE.</span></h2><p>Il y a des sensations qu’aucun écran ne remplace.</p></div><span className="interlude-mark" aria-hidden="true">VT / 2300</span></section>

      <section className="invitation section-pad" id="sejour"><div className="invitation-top" data-reveal><span className="eyebrow"><span className="route-dot" /> LA SUITE S’ÉCRIT LÀ-HAUT.</span><span className="eyebrow">VOUS + LA MONTAGNE</span></div><div className="invitation-main" data-reveal><h2>On se retrouve<br /><span>au sommet ?</span></h2><button className="invitation-button" onClick={() => setPlannerOpen(true)} aria-label="Imaginer mon séjour à Val Thorens"><ArrowUpRight size={48} strokeWidth={1.2} /></button></div><div className="invitation-bottom" data-reveal><p>Quelques jours pour changer d’air.<br />Des souvenirs pour longtemps.</p><button className="text-link" onClick={() => setPlannerOpen(true)}>Imaginer mon séjour <ArrowUpRight size={19} /></button></div></section>
    </main>

    <footer className="site-footer"><div className="footer-top"><Brand footer /><p>L’ALTITUDE NOUS RASSEMBLE.</p><a href="#accueil" className="back-top">RETOUR AU SOMMET <ArrowUpRight size={18} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} LÀ-HAUT — CONCEPT ÉDITORIAL INDÉPENDANT</span><span>PHOTOGRAPHIES D’AMBIANCE · SITE NON OFFICIEL</span><a href="https://www.valthorens.com/" target="_blank" rel="noreferrer">Le site officiel de Val Thorens <ArrowUpRight size={13} /></a></div></footer>

    <TripPlanner open={plannerOpen} onOpenChange={setPlannerOpen} />
    <Dialog.Root open={detail !== null} onOpenChange={(open) => { if (!open) setDetail(null) }}><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="experience-dialog" onOpenAutoFocus={() => { detailOrigin.current = document.activeElement as HTMLElement | null }} onCloseAutoFocus={(event) => { event.preventDefault(); if (detailOrigin.current?.isConnected) detailOrigin.current.focus() }}>{selectedExperience && <><Dialog.Close className="dialog-close" aria-label="Fermer l’expérience"><X size={21} /></Dialog.Close><img className="detail-image" src={selectedExperience.image} alt={selectedExperience.alt} /><div className="detail-body"><span className="eyebrow">{selectedExperience.tag}</span><Dialog.Title>{selectedExperience.name}</Dialog.Title><Dialog.Description>{selectedExperience.subtitle}</Dialog.Description><p>{selectedExperience.body}</p><ul>{selectedExperience.ideas.map((idea) => <li key={idea}><ArrowUpRight size={16} />{idea}</li>)}</ul><p className="detail-note">{selectedExperience.note}</p><div className="detail-actions"><button className="button" onClick={() => { setDetail(null); setPlannerOpen(true) }}>Imaginer mon séjour <ArrowUpRight size={17} /></button><button className={`save-button ${saved.includes(selectedExperience.id) ? 'is-saved' : ''}`} aria-pressed={saved.includes(selectedExperience.id)} onClick={() => setSaved((items) => items.includes(selectedExperience.id) ? items.filter((id) => id !== selectedExperience.id) : [...items, selectedExperience.id])}>{saved.includes(selectedExperience.id) ? <Check size={17} /> : <Plus size={17} />}{saved.includes(selectedExperience.id) ? 'Idée enregistrée' : 'Garder cette idée'}</button></div></div></>}</Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>
}
