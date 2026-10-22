'use client';

import { useCallback, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BrandSections from './BrandSections';
import EspressoSequence, { FRAME_COUNT } from './EspressoSequence';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CoffeeExperience() {
  const story = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef({ value: 0 });
  const draw = useRef<(() => void) | null>(null);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [motion, setMotion] = useState(true);
  const [systemReduced, setSystemReduced] = useState(false);
  const [ready, setReady] = useState(false);

  const onSceneReady = useCallback((requestDraw: () => void) => {
    draw.current = requestDraw;
    requestDraw();
    setReady(true);
  }, []);

  useGSAP(() => {
    if (!story.current || !stage.current) return;
    const panels = [...stage.current.querySelectorAll<HTMLElement>('.story-copy')];
    const update = () => {
      const value = progress.current.value;
      stage.current?.setAttribute('data-progress', value.toFixed(5));
      panels[0]?.setAttribute('aria-hidden', String(value >= .18));
      panels[1]?.setAttribute('aria-hidden', String(value < .85));
      draw.current?.();
    };
    const media = gsap.matchMedia();
    media.add({ all: 'all', desktop: '(min-width: 761px)', reducedMotion: '(prefers-reduced-motion: reduce)' }, mediaContext => {
      const prefersReduction = Boolean(mediaContext.conditions?.reducedMotion);
      // Follow the system until the visitor explicitly chooses a mode. A resize or
      // later system preference change must not undo that explicit choice.
      const enabled = motionOverride ?? !prefersReduction;
      setSystemReduced(prefersReduction);
      setMotion(enabled);
      stage.current?.setAttribute('data-motion-mode', enabled ? 'animated' : 'reduced');
      stage.current?.setAttribute('data-motion-preference', motionOverride === null ? 'system' : 'explicit');
      gsap.set(panels, { autoAlpha: 0, y: 16 });
      if (!enabled) {
        progress.current.value = 1;
        stage.current?.removeAttribute('data-scroll-start');
        stage.current?.removeAttribute('data-scroll-end');
        gsap.set(panels[1], { autoAlpha: 1, y: 0 });
        update();
        return;
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
      // The middle of the extraction is left entirely to the image. Only these
      // two quiet captions animate; the pinned wrapper itself never transforms.
      timeline.to(panels[0], { autoAlpha: 0, y: -8, duration: .06, ease: 'power1.inOut' }, .12);
      timeline.fromTo(panels[1], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .06, ease: 'power1.out' }, .85);
      update();
    });
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(true); });
    return () => { disposed = true; media.revert(); };
  }, { scope: story, dependencies: [motionOverride], revertOnUpdate: true });

  function chooseMotion(enabled: boolean) {
    window.scrollTo({ top: story.current?.offsetTop ?? 0, behavior: 'instant' });
    setMotionOverride(enabled);
  }

  return <div className="coffee-app">
    <a className="skip-link" href="#story">Aller à la présentation</a>
    <header className="site-header">
      <a href="#process" className="brand-wordmark" aria-label="Atelier Coffee, accueil"><span>ATELIER</span><span>COFFEE</span></a>
      <a className="header-link" href="#story">L’atelier</a>
    </header>
    <main>
      <section ref={story} id="process" className={`story-shell ${motion ? 'motion-active' : 'motion-reduced'}`} aria-label="L’extraction d’un espresso, contrôlée par votre défilement">
        <div ref={stage} className={`story-stage ${ready ? 'scene-ready' : ''}`} data-testid="coffee-sequence" data-progress="0" data-current-frame="-1" data-frame-count={FRAME_COUNT}>
          <EspressoSequence progress={progress} onReady={onSceneReady} reduced={!motion} />
          <div className="scene-shade" aria-hidden="true" />
          <div className="story-copy-container">
            <article className="story-copy story-copy-0" data-chapter="0">
              <h1 className="experience-heading">Le temps<br />d’un <em>espresso.</em></h1>
            </article>
            <article className="story-copy story-copy-4" data-chapter="4" aria-hidden="true">
              <p className="experience-final">ATELIER COFFEE</p>
            </article>
          </div>
          <div className="experience-controls">
            {motion && <span className="scroll-cue"><span aria-hidden="true">↓</span> Défiler pour extraire</span>}
            <div className="experience-control-group">
              <p id="experience-motion-status" className="experience-status" role="status">
                {!motion && (systemReduced && motionOverride === null
                  ? 'Votre préférence système réduit les mouvements. Le film reste fixe.'
                  : 'Les mouvements sont réduits. Le film reste fixe.')}
              </p>
              <button className={motion ? 'motion-toggle' : 'experience-activate'}
                aria-describedby={!motion ? 'experience-motion-status' : undefined}
                onClick={() => chooseMotion(!motion)}>
                {motion ? 'Réduire les mouvements' : 'Activer l’expérience'}
              </button>
            </div>
          </div>
        </div>
      </section>
      <BrandSections />
    </main>
    <footer className="site-footer">
      <a className="footer-wordmark" href="#process">ATELIER COFFEE</a>
      <p>Étude d’un rituel · 2026</p>
    </footer>
  </div>;
}
