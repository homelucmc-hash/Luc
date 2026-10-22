"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./CoffeeScrollSequence.module.css";

gsap.registerPlugin(ScrollTrigger);

type Manifest = { count: number; ext: string };

const copy = [
  ["THE FIRST", "DROP"],
  ["THE", "EXTRACTION"],
  ["THE", "POUR"],
  ["THE PERFECT", "CUP"],
  ["ATELIER", "COFFEE"],
];

/**
 * DEMONSTRATEUR TECHNIQUE de lecture frame-par-frame liée au scroll.
 * Ce composant ne fabrique PAS les images. Exige /public/espresso-frames/manifest.json
 * et de vrais fichiers frame-0001.webp ... produits depuis UNE source continue.
 * L'apparence finale doit être raffinée par Codex selon references/01_BRIEF_VISUEL.md.
 */
export default function CoffeeScrollSequence() {
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let disposed = false;
    let tween: gsap.core.Tween | undefined;
    let currentFrame = -1;
    let targetFrame = 0;
    let count = 0;
    let ext = "webp";
    const cache = new Map<number, HTMLImageElement>();
    const pending = new Map<number, Promise<void>>();
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      setError("Canvas 2D indisponible sur ce navigateur.");
      return;
    }

    const url = (i: number) => `/espresso-frames/frame-${String(i + 1).padStart(4, "0")}.${ext}`;

    const paint = (i: number) => {
      const img = cache.get(i);
      if (!img || disposed || !img.naturalWidth || !img.naturalHeight) return;
      const w = canvas.width;
      const h = canvas.height;
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      context.clearRect(0, 0, w, h);
      context.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      currentFrame = i;
      stage.dataset.currentFrame = String(i);
    };

    const load = (i: number): Promise<void> => {
      if (i < 0 || i >= count || disposed || cache.has(i)) return Promise.resolve();
      const existing = pending.get(i);
      if (existing) return existing;
      const job = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          cache.set(i, img);
          if (i === targetFrame) paint(i);
          resolve();
        };
        img.onerror = () => reject(new Error(`Image manquante ou illisible : ${url(i)}`));
        img.src = url(i);
      }).finally(() => pending.delete(i));
      pending.set(i, job);
      return job;
    };

    const safelyLoad = (i: number) => {
      void load(i).catch((e: unknown) => {
        if (!disposed) setError(e instanceof Error ? e.message : String(e));
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      if (currentFrame >= 0) paint(currentFrame);
    };

    const start = async () => {
      try {
        const response = await fetch("/espresso-frames/manifest.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`Manifeste introuvable (HTTP ${response.status}). Ajoute de VRAIS photogrammes.`);
        const manifest = (await response.json()) as Manifest;
        if (!Number.isInteger(manifest.count) || manifest.count < 120 || !["webp", "jpg", "jpeg", "png"].includes(manifest.ext)) {
          throw new Error("Séquence invalide : au moins 120 images successives et extension correcte requises.");
        }
        if (disposed) return;
        count = manifest.count;
        ext = manifest.ext;
        stage.dataset.frameCount = String(count);
        resize();
        await load(0);
        if (disposed) return;
        paint(0);

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) return; // Image fixe accessible : pas d'animation forcée.

        const playhead = { frame: 0 };
        tween = gsap.to(playhead, {
          frame: count - 1,
          ease: "none",
          onUpdate() {
            if (disposed) return;
            targetFrame = Math.round(playhead.frame);
            stage.dataset.targetFrame = String(targetFrame);
            const p = targetFrame / Math.max(1, count - 1);
            const index = Math.min(4, Math.floor(p * 5));
            setPhase((previous) => (previous === index ? previous : index));
            if (cache.has(targetFrame)) paint(targetFrame);
            else safelyLoad(targetFrame);
            for (let d = -3; d <= 8; d++) {
              if (d !== 0) safelyLoad(targetFrame + d);
            }
          },
          scrollTrigger: {
            trigger: stage,
            pin: true,
            start: "top top",
            end: () => `+=${window.innerHeight * 4}`,
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        ScrollTrigger.refresh();
      } catch (e: unknown) {
        if (!disposed) setError(e instanceof Error ? e.message : String(e));
      }
    };

    window.addEventListener("resize", resize);
    void start();
    return () => {
      disposed = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <section ref={stageRef} className={styles.stage} data-testid="coffee-sequence" data-current-frame="-1" aria-label="Expérience de l'extraction d'un espresso au défilement">
        <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label="Le café se verse dans une tasse à mesure du défilement" />
        <div className={styles.shade} aria-hidden="true" />
        <header className={styles.header}>
          <a href="#top" className={styles.wordmark}>ATELIER <em>COFFEE</em></a>
          <nav aria-label="Navigation principale"><a href="#our-coffee">OUR COFFEE</a><a href="#story">STORY</a></nav>
        </header>
        <div className={styles.copy}>
          <p className={styles.kicker}>SINGLE ORIGIN / A HIGHER STANDARD</p>
          <h1>{copy[phase][0]}<br /><em>{copy[phase][1]}</em></h1>
          <p className={styles.subtitle}>Precision in every drop.</p>
        </div>
        <p className={styles.scrollHint}>SCROLL TO EXPLORE ↓</p>
        {error && <div className={styles.error} role="alert">Assets manquants : {error}</div>}
      </section>
      <section id="our-coffee" className={styles.after}>
        <p>THE RITUAL</p><h2>A better beginning.</h2><a href="#story">Discover our story →</a>
      </section>
      <section id="story" className={styles.after}><h2>ATELIER COFFEE</h2><p>Crafted with precision.</p></section>
    </>
  );
}
