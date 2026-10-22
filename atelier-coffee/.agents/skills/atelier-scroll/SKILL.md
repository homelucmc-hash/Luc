---
name: atelier-scroll
description: Réaliser et tester une animation cinéma de versement de café pilotée image par image par le scroll dans ATELIER COFFEE. À invoquer lors de toute refonte scroll/animation du projet.
---

Utiliser en priorité les documents `AGENTS.md`, `references/01_BRIEF_VISUEL.md`, `references/02_ASSETS_ET_VIDEO.md` et `references/03_TESTS_OBLIGATOIRES.md`.

1. Vérifier d'abord qu'une séquence d'images successives provient d'une seule animation cohérente. Si non, obtenir/produire la vidéo ou le rendu préalable ; ne jamais utiliser les maquettes comme animation.
2. Utiliser GSAP ScrollTrigger `scrub` et `pin` pour piloter une progression 0–1 sans autoplay. Dessiner les photogrammes dans Canvas, respecter reduced motion.
3. Implémenter le rendu avec `reference-code/CoffeeScrollSequence.tsx` comme exemple technique de base, à adapter et améliorer selon le projet.
4. Ne déclarer la fonctionnalité réalisée qu'après avoir testé une traversée complète puis inverse avec des captures du navigateur.
5. Signaler honnêtement les assets ou tests manquants.
