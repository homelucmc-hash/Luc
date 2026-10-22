'use client';

import { useCallback, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BrandSections from './BrandSections';
import EspressoSequence, { FRAME_COUNT } from './EspressoSequence';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, useGSAP);

const chapters = [
  { line1: 'THE FIRST', line2: 'DROP', subtitle: 'Precision begins in silence.', name: 'The first drop' },
  { line1: 'THE', line2: 'EXTRACTION', subtitle: 'Nothing rushed. Nothing left to chance.', name: 'The extraction' },
  { line1: 'THE', line2: 'POUR', subtitle: 'Every drop finds its place.', name: 'The pour' },
  { line1: 'THE PERFECT', line2: 'CUP', subtitle: 'A fleeting moment. A lasting impression.', name: 'The perfect cup' },
  { line1: 'ATELIER', line2: 'COFFEE', subtitle: 'PRECISION IN EVERY DROP.', name: 'The reveal' },
];
const boundaries = [.2, .4, .65, .85];
const positions = [0, .25, .5, .75, 1];

function Arrow({ up = false }: { up?: boolean }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d={up ? 'M12 21V3M5 10l7-7 7 7' : 'M3 12h17m-6-6 6 6-6 6'} /></svg>;
}

export default function CoffeeExperience() {
  const story = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef({ value: 0 });
  const draw = useRef<(() => void) | null>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [motion, setMotion] = useState(true);
  const [ready, setReady] = useState(false);

  const onSceneReady = useCallback((requestDraw: () => void) => {
    draw.current = requestDraw;
    requestDraw();
    setReady(true);
  }, []);

  useGSAP(() => {
    if (!story.current || !stage.current) return;
    const panels = [...stage.current.querySelectorAll<HTMLElement>('.story-copy')];
    const buttons = [...stage.current.querySelectorAll<HTMLButtonElement>('.chapter-nav button')];
    const number = stage.current.querySelector('.scene-number');
    let previousChapter = -1;
    const update = () => {
      const value = progress.current.value;
      const index = boundaries.filter(boundary => value >= boundary).length;
      stage.current?.setAttribute('data-progress', value.toFixed(5));
      if (index !== previousChapter) {
        panels.forEach((panel, i) => {
          panel.setAttribute('aria-hidden', String(i !== index));
          panel.querySelectorAll<HTMLAnchorElement>('a').forEach(anchor => { anchor.tabIndex = i === index ? 0 : -1; });
        });
        buttons.forEach((button, i) => {
          button.classList.toggle('is-active', i === index);
          button.setAttribute('aria-pressed', String(i === index));
        });
        if (number) number.textContent = `0${index + 1}`;
        previousChapter = index;
      }
      draw.current?.();
    };
    const media = gsap.matchMedia();
    media.add({ all: 'all', desktop: '(min-width: 761px)', reducedMotion: '(prefers-reduced-motion: reduce)' }, mediaContext => {
      const enabled = motionOverride ?? !mediaContext.conditions?.reducedMotion;
      setMotion(enabled);
      previousChapter = -1;
      gsap.set(panels, { autoAlpha: 0, y: 16 });
      if (!enabled) {
        progress.current.value = 1;
        gsap.set(panels[4], { autoAlpha: 1, y: 0 });
        update();
        return () => { trigger.current = null; };
      }
      progress.current.value = 0;
      gsap.set(panels[0], { autoAlpha: 1, y: 0 });
      const timeline = gsap.timeline({
        onUpdate: update,
        scrollTrigger: {
          id: 'atelier-extraction',
          trigger: story.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 5}`,
          pin: stage.current,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: self => {
            stage.current?.setAttribute('data-scroll-start', String(self.start));
            stage.current?.setAttribute('data-scroll-end', String(self.end));
          },
        },
      });
      timeline.fromTo(progress.current, { value: 0 }, { value: 1, duration: 1, ease: 'none', immediateRender: false }, 0);
      boundaries.forEach((at, index) => {
        timeline.to(panels[index], { autoAlpha: 0, y: -13, duration: .025, ease: 'power1.inOut' }, at - .025);
        timeline.fromTo(panels[index + 1], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .03, ease: 'power1.out' }, at);
      });
      trigger.current = timeline.scrollTrigger ?? null;
      update();
      return () => { trigger.current = null; };
    });
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(true); });
    return () => { disposed = true; trigger.current = null; media.revert(); };
  }, { scope: story, dependencies: [motionOverride], revertOnUpdate: true });

  function jump(index: number) {
    const current = trigger.current;
    if (current) window.scrollTo({ top: current.start + (current.end - current.start) * positions[index], behavior: 'smooth' });
  }

  return <div className="coffee-app">
    <a className="skip-link" href="#story">Aller à la présentation</a>
    <header className="site-header">
      <a href="#process" className="brand-wordmark" aria-label="Atelier Coffee, accueil"><span>ATELIER</span><span>COFFEE</span></a>
      <nav className="desktop-nav" aria-label="Navigation principale"><a href="#process">PROCESS</a><a href="#cafes">OUR COFFEE</a><a href="#story">STORY</a></nav>
      <a className="header-cta" href="#cafes">DISCOVER <Arrow /></a>
    </header>
    <main>
      <section ref={story} id="process" className={`story-shell ${motion ? 'motion-active' : 'motion-reduced'}`} aria-label="L’extraction d’un espresso, contrôlée par votre défilement">
        <div ref={stage} className={`story-stage ${ready ? 'scene-ready' : ''}`} data-testid="coffee-sequence" data-progress="0" data-current-frame="-1" data-frame-count={FRAME_COUNT}>
          <EspressoSequence progress={progress} onReady={onSceneReady} reduced={!motion} />
          <div className="scene-shade" aria-hidden="true" />
          <div className="story-copy-container">
            {chapters.map((chapter, index) => <article className={`story-copy story-copy-${index}`} data-chapter={index} key={chapter.name} aria-hidden={index !== 0}>
              {index === 0 && <p className="eyebrow">SINGLE ORIGIN. SINGULAR CHARACTER.</p>}
              {index === 0 ? <h1>{chapter.line1}<br /><em>{chapter.line2}</em></h1> : <h2>{chapter.line1}<br /><em>{chapter.line2}</em></h2>}
              <p className="scene-subtitle">{chapter.subtitle}</p>
              <a className="text-cta" href={index === 4 ? '#story' : '#cafes'} tabIndex={index === 0 ? 0 : -1}>{index === 4 ? 'DÉCOUVRIR NOTRE UNIVERS' : 'DISCOVER OUR COFFEE'}<Arrow /></a>
            </article>)}
          </div>
          <span className="scene-number" aria-hidden="true">01</span>
          <div className="story-bottom">
            <span className="scroll-cue"><svg viewBox="0 0 16 38" width="16" height="38" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 0v35m-5-5 5 5 5-5" /></svg><span>SCROLL<br />TO EXPLORE</span></span>
            <nav className="chapter-nav" hidden={!motion} aria-label="Les cinq scènes de l’extraction">{chapters.map((chapter, index) => <button key={chapter.name} onClick={() => jump(index)} aria-label={`Scène ${index + 1} : ${chapter.name}`} aria-pressed={index === 0} className={index === 0 ? 'is-active' : ''}>0{index + 1}</button>)}</nav>
            <button className="motion-toggle" aria-pressed={!motion} onClick={() => {
              window.scrollTo({ top: story.current?.offsetTop ?? 0, behavior: 'instant' });
              setMotionOverride(current => !(current ?? motion));
            }}>{motion ? 'Réduire les mouvements' : 'Activer l’expérience'}</button>
          </div>
        </div>
      </section>
      <BrandSections />
    </main>
    <footer className="site-footer">
      <div className="footer-heading"><a href="#process">ATELIER<br /><em>COFFEE</em></a><p>Precision in every drop.</p><a className="back-top" href="#process">BACK TO THE RITUAL <Arrow up /></a></div>
      <div className="footer-meta"><span>© ATELIER COFFEE 2026</span><span>MARQUE FICTIVE · EXPÉRIENCE CRÉATIVE</span><span>TAKE YOUR TIME.</span></div>
    </footer>
  </div>;
}
