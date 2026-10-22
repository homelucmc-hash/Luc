<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:atelier-coffee-production-pack -->

# Instructions permanentes pour Codex — ATELIER COFFEE

Objectif : vraie expérience cinématographique *scroll-driven* d'un espresso. La qualité est jugée par des **preuves visibles**, pas par un build réussi.

## Ordre de priorité
1. Une animation réelle et réversible où un café coule et une tasse se remplit progressivement pendant le scroll.
2. Un seul plan visuellement cohérent et crédible : portefiltre, flux, tasse, crema, éclairage premium. Les 5 maquettes `references/visuels/` **ne sont PAS des images consécutives animables**.
3. L'animation fonctionne dans un navigateur avec la molette ET en sens inverse.
4. Une interface éditoriale sombre, sobre, chaleureuse, sans apparence de template générique.
5. Accessibilité et performance, puis détails cosmétiques.

## Interdictions
- Ne jamais simuler le café qui se verse par un changement de textes, un fondu entre les 5 maquettes, un cylindre marron, une image fixe ou un effet autoplay.
- Ne jamais affirmer que le café se verse si aucun fichier source vidéo ou aucune séquence d'images continues n'est disponible.
- Ne pas intégrer de liens d'assets distants non vérifiés ni incorporer des images base64 dans le code ou les messages.
- Ne pas déclarer "terminé" parce que `npm run build` passe.
- Ne pas modifier les autres projets hors de ce dossier.

## Procédure obligatoire
Lire dans l'ordre :
1. `references/01_BRIEF_VISUEL.md`
2. `references/02_ASSETS_ET_VIDEO.md`
3. `references/03_TESTS_OBLIGATOIRES.md`
4. `reference-code/CoffeeScrollSequence.tsx` et son CSS (code technique de référence, pas un design final)
5. `references/visuels/` (références esthétiques uniquement)

Faire ensuite :
- Inventorier les assets présents sous `public/espresso-frames/`.
- Si les frames sont absentes, acquérir/produire **une source vidéo continue autorisée**, sélectionner un extrait où le versement évolue réellement, puis exécuter `python tools/prepare_sequence.py --input chemin/vers/video.mp4 --start 0 --duration 8` (ajuster start/duration à la bonne action). Si acquisition impossible, expliquer l'impasse plutôt que masquer l'absence d'animation.
- Utiliser GSAP ScrollTrigger, `pin` + `scrub`, dessiner les frames dans un Canvas ; défilement et défilement inverse doivent piloter le même index.
- Ne retravailler la typographie et le layout **qu'après** la preuve du versement.
- Tester 0, 25, 50, 75, 100 % du défilement, puis 75, 50, 25, 0 %. Produire de vraies captures et, si possible, une courte capture d'écran de la molette.
- Vérifier les erreurs console et les requêtes de frames manquantes ; tester responsive.

Dans le compte rendu final, fournir : nom/chemin de la source animée, nombre de frames, preuve du comportement scroll aller/retour, captures aux 5 positions, résultat des tests et limites réelles. Si un point manque, signaler "non réalisé" sans ambiguïté.

<!-- END:atelier-coffee-production-pack -->

## GSAP officiel — React, ScrollTrigger et performance

Source : https://github.com/greensock/gsap-skills, commit `aed9cfd3277740755f6bfc1155c7aa645403b760`.
Les fichiers originaux et leur licence MIT sont conservés dans `.agents/skills/gsap-{react,scrolltrigger,performance,core,timeline}/`.
Lire les skills pertinents avant de modifier l’animation. Le skill local `atelier-scroll` reste applicable.

- Dans React/Next.js, utiliser `useGSAP` de `@gsap/react`, une ref `scope`, et `revertOnUpdate: true` lorsque des dépendances reconstruisent la séquence. Lancer les animations dans le cycle de vie client, pas pendant le rendu serveur.
- Enregistrer les plugins une seule fois. Créer une timeline principale et attacher ScrollTrigger à cette timeline, pas aux tweens enfants.
- Conserver pour le café une progression 0–1 avec `ease: "none"`, `scrub: true`, puis `round(progress * (frameCount - 1))`. Aucun autoplay, snap ou rattrapage temporel ne doit remplacer le contrôle exact demandé.
- Épingler le wrapper et animer uniquement ses descendants. Ne pas animer le transform ou les dimensions du nœud épinglé. Garder le pin-spacer pour la transition vers la suite de la page.
- Utiliser `gsap.matchMedia()` pour le responsive et `prefers-reduced-motion`, puis `mm.revert()` au nettoyage. Ne pas imbriquer un `gsap.context()` supplémentaire dans son handler. Conserver la préférence système par défaut et un éventuel choix explicite de l’utilisateur.
- Préférer les transforms (`x`, `y`, `scale`) et `autoAlpha` aux propriétés de mise en page. Limiter `will-change` aux éléments réellement animés. Réutiliser la timeline au lieu de créer des tweens à chaque pixel.
- Appeler `ScrollTrigger.refresh()` après un changement réel de géométrie, par exemple après les polices. Le redimensionnement est déjà géré par ScrollTrigger ; ne pas rafraîchir à chaque frame.
- Utiliser `contextSafe` pour les callbacks différés qui créent des objets GSAP. Retirer également les listeners natifs et protéger les continuations asynchrones après démontage.
- Conserver un cache de photogrammes décodés borné, une priorité à l’image demandée, un seul RAF de dessin, et le nettoyage des requêtes, observateurs et ImageBitmap.
- Tester les effets en Strict Mode : pas de pin-spacer ou de ScrollTrigger dupliqué après remontage, changement de largeur ou changement du mode de mouvement.
- Les checks TypeScript/build ne prouvent pas le versement. Vérifier les photogrammes réellement dessinés, les captures 0/25/50/75/100 %, l’arrêt et le retour arrière dans un navigateur réel.
