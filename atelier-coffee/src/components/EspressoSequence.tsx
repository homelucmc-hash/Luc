'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import sequence from '../../public/espresso-frames/manifest.json';

export const FRAME_COUNT = sequence.count;
type Drawable = ImageBitmap | HTMLImageElement;
type Task = { index: number; resolve: (blob: Blob) => void; reject: (error: Error) => void };

/** No clock drives this player: one scroll value selects one original rendered frame. */
export default function EspressoSequence({ progress, onReady, reduced }: {
  progress: RefObject<{ value: number }>;
  onReady: (draw: () => void) => void;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [variant, setVariant] = useState<'desktop' | 'mobile' | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const choose = () => setVariant(query.matches ? 'mobile' : 'desktop');
    choose();
    query.addEventListener('change', choose);
    return () => query.removeEventListener('change', choose);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context || !variant) return;
    let disposed = false;
    let raf = 0;
    let target = 0;
    let lastDrawn = -1;
    let active = 0;
    let firstDraw = false;
    let hasFailure = false;
    let viewportWidth = canvas.clientWidth;
    let viewportHeight = canvas.clientHeight;
    const mobile = variant === 'mobile';
    const source = variant;
    const maxDecoded = mobile ? 24 : 32;
    const blobs = new Map<number, Blob>();
    const decoded = new Map<number, Drawable>();
    const decoding = new Map<number, Promise<Drawable>>();
    const fetching = new Map<number, Promise<Blob>>();
    const controllers = new Set<AbortController>();
    const queue: Task[] = [];
    const clamp = (index: number) => Math.max(0, Math.min(FRAME_COUNT - 1, index));
    const url = (index: number) => `/espresso-frames/${mobile ? 'mobile/' : ''}frame-${String(index + 1).padStart(4, '0')}.webp`;

    function pump() {
      if (disposed) return;
      while (active < 4 && queue.length) {
        const task = queue.shift()!;
        const controller = new AbortController();
        controllers.add(controller);
        active++;
        fetch(url(task.index), { signal: controller.signal, cache: 'default' })
          .then(response => {
            if (!response.ok) throw new Error(`Frame ${task.index}: ${response.status}`);
            return response.blob();
          })
          .then(blob => { blobs.set(task.index, blob); task.resolve(blob); })
          .catch(task.reject)
          .finally(() => { controllers.delete(controller); active--; pump(); });
      }
    }

    function load(index: number, urgent = false): Promise<Blob> {
      index = clamp(index);
      const blob = blobs.get(index);
      if (blob) return Promise.resolve(blob);
      const pending = fetching.get(index);
      if (pending) {
        if (urgent) {
          const queuedIndex = queue.findIndex(task => task.index === index);
          if (queuedIndex > 0) queue.unshift(queue.splice(queuedIndex, 1)[0]);
        }
        return pending;
      }
      const promise = new Promise<Blob>((resolve, reject) => {
        const task = { index, resolve, reject };
        if (urgent) queue.unshift(task); else queue.push(task);
      });
      fetching.set(index, promise);
      promise.catch(() => { fetching.delete(index); });
      pump();
      return promise;
    }

    function disposeImage(image: Drawable) {
      if ('close' in image) image.close();
    }

    function trim() {
      if (decoded.size <= maxDecoded) return;
      const distant = [...decoded.keys()].filter(index => index !== lastDrawn)
        .sort((a, b) => Math.abs(b - target) - Math.abs(a - target));
      while (decoded.size > maxDecoded && distant.length) {
        const index = distant.shift()!;
        disposeImage(decoded.get(index)!);
        decoded.delete(index);
      }
    }

    async function decode(index: number, urgent = false): Promise<Drawable> {
      index = clamp(index);
      const cached = decoded.get(index);
      if (cached) return cached;
      const pending = decoding.get(index);
      if (pending) {
        if (urgent) load(index, true).catch(() => {});
        return pending;
      }
      const work = (async () => {
        const blob = await load(index, urgent);
        let image: Drawable;
        if (typeof createImageBitmap === 'function') image = await createImageBitmap(blob);
        else {
          const imageUrl = URL.createObjectURL(blob);
          try {
            const element = new Image();
            element.src = imageUrl;
            await element.decode();
            image = element;
          } finally { URL.revokeObjectURL(imageUrl); }
        }
        if (disposed) { disposeImage(image); throw new Error('Disposed'); }
        decoded.set(index, image);
        trim();
        return image;
      })();
      decoding.set(index, work);
      work.finally(() => decoding.delete(index)).catch(() => {});
      return work;
    }

    function paint(index: number, force = false) {
      if (disposed || (!force && index === lastDrawn)) return;
      const image = decoded.get(index);
      if (!image) return;
      const width = viewportWidth;
      const height = viewportHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
      const pixelWidth = Math.round(width * ratio);
      const pixelHeight = Math.round(height * ratio);
      if (canvas!.width !== pixelWidth || canvas!.height !== pixelHeight) {
        canvas!.width = pixelWidth;
        canvas!.height = pixelHeight;
      }
      const scale = Math.max(pixelWidth / image.width, pixelHeight / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      // On portrait screens, retain the extraction axis rather than the empty left margin.
      const focus = window.innerWidth <= 760 ? .68 : .5;
      const x = (pixelWidth - drawWidth) * focus;
      const y = (pixelHeight - drawHeight) * .5;
      context!.drawImage(image, x, y, drawWidth, drawHeight);
      lastDrawn = index;
      canvas!.dataset.frame = String(index);
      canvas!.dataset.progress = (index / (FRAME_COUNT - 1)).toFixed(5);
      canvas!.dataset.variant = source;
      canvas!.dataset.decodedCount = String(decoded.size);
      const stage = canvas!.closest('.story-stage');
      stage?.setAttribute('data-current-frame', String(index));
      if (hasFailure && index === target) {
        hasFailure = false;
        setFailed(false);
      }
      if (!firstDraw) {
        firstDraw = true;
        setReady(true);
        setFailed(false);
        onReady(schedule);
      }
    }

    function draw() {
      raf = 0;
      if (disposed) return;
      target = clamp(Math.round(progress.current.value * (FRAME_COUNT - 1)));
      canvas!.dataset.requestedFrame = String(target);
      canvas!.closest('.story-stage')?.setAttribute('data-target-frame', String(target));
      if (decoded.has(target)) paint(target);
      else {
        // Keep a successfully decoded frame on screen while fetching the exact target.
        const nearest = [...decoded.keys()].sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];
        if (nearest !== undefined) paint(nearest);
        const requested = target;
        decode(requested, true).then(() => schedule()).catch(() => {
          if (!disposed && target === requested) { hasFailure = true; setFailed(true); }
        });
      }
      if (!reduced) {
        for (const offset of [-1, 1, -2, 2, -3, 3]) {
          const neighbor = clamp(target + offset);
          if (!decoded.has(neighbor)) decode(neighbor).catch(() => {});
        }
      }
    }

    function schedule() { if (!disposed && !raf) raf = requestAnimationFrame(draw); }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect) { viewportWidth = rect.width; viewportHeight = rect.height; }
      if (lastDrawn >= 0) paint(lastDrawn, true);
      schedule();
    });
    observer.observe(canvas);
    schedule();
    // The beginning arrives first. Remaining compressed assets are cached progressively;
    // decoded images remain bounded independently from this small encoded cache.
    const preload = reduced ? null : window.setTimeout(() => {
      const order = [...Array.from({ length: 16 }, (_, i) => i),
        ...Array.from({ length: Math.ceil(FRAME_COUNT / 8) }, (_, i) => clamp(i * 8)),
        ...Array.from({ length: FRAME_COUNT }, (_, i) => i)];
      for (const index of new Set(order)) load(index).catch(() => {});
    }, 250);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (preload !== null) clearTimeout(preload);
      observer.disconnect();
      for (const controller of controllers) controller.abort();
      for (const task of queue) task.reject(new Error('Disposed'));
      queue.length = 0;
      for (const image of decoded.values()) disposeImage(image);
      decoded.clear();
      blobs.clear();
    };
  }, [progress, onReady, retry, variant, reduced]);

  return <div className={`sequence-canvas-wrapper ${ready ? 'is-ready' : ''}`}>
    {/* The initial frame is server-rendered; it never waits for WebGL or a scene chunk. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="sequence-poster" src={reduced ? '/espresso-frames/final.webp' : '/espresso-frames/poster.webp'}
      alt="Extraction d’un espresso sous un porte-filtre, éclairage ambré sur fond noir."
      width={sequence.width} height={sequence.height} fetchPriority="high" decoding="async" />
    <canvas ref={canvasRef} data-frame-count={FRAME_COUNT} data-frame="-1" role="img"
      aria-label="Extraction d’un espresso : le défilement contrôle le flux et le remplissage de la tasse." />
    {failed && <div className="sequence-error" role="status"><p>L’expérience n’a pas pu être chargée.</p><button onClick={() => { setFailed(false); setRetry(value => value + 1); }}>Réessayer</button></div>}
  </div>;
}
