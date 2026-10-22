# Installation du pack ATELIER COFFEE

Le pack `atelier_coffee_PACK_CODEX_3D_SCROLL.zip` est installé à la racine du projet. Ce document conserve le constat de son installation initiale ; la réalisation qui a suivi est décrite dans `README.md` et son rapport de validation.

## Contenu installé

- Skill local : `.agents/skills/atelier-scroll/SKILL.md`.
- Règles du pack fusionnées dans `AGENTS.md`, en conservant les règles Next.js.
- Brief, procédure de préparation des assets et recette dans `references/`.
- Cinq WebP de référence dans `references/visuels/`.
- Outils Python dans `tools/` et emplacement source `assets/`.
- Lecteur Canvas, CSS et exemple de test dans `reference-code/`.
- Emplacement des futures images dans `public/espresso-frames/`.

Les exemples sont exclus de la compilation applicative dans `tsconfig.json` : leur test Playwright exige une dépendance facultative absente. Le lecteur actuel n’a pas été remplacé par le démonstrateur. Le contenu de `src/` a été comparé à la sauvegarde et reste identique.

## Vérifications réalisées à l’installation

- Intégrité des 19 fichiers du pack vérifiée par SHA-256 ; `AGENTS.md` est fusionné.
- Syntaxe des deux outils Python vérifiée.
- Aide CLI de `prepare_sequence.py` vérifiée.
- `npm run typecheck` : réussi.
- `npm run build` : réussi.

Sauvegarde préalable : `/workspace/ATELIER-COFFEE-avant-pack-2026-10-22.zip`, archive vérifiée. Inventaire : `production/pack-installation.json`.

## État de l’animation à l’installation initiale

Le ZIP ne contient aucune vidéo ni séquence continue prête. `python tools/verify_sequence.py` signale donc normalement l’absence de `public/espresso-frames/manifest.json`. Aucun faux manifeste ni photogramme de remplacement n’a été créé. Les essais Blender présents dans `production/` ne constituent pas encore une séquence livrable.

- Source vidéo continue dans `assets/espresso-source.mp4` : non réalisée.
- Séquence complète d’au moins 120 images : non réalisée.
- Validation du versement et du remplissage au défilement aller/retour : non réalisée.
- Captures navigateur 0/25/50/75/100 % de cette séquence : non réalisées.

La réussite de ce premier build validait uniquement l’intégration technique du pack. Les skills GSAP officiels ont depuis été récupérés dans `.agents/skills/`, et le lecteur applicatif a été refondu. Les constats ci-dessus sont historiques : consulter le rapport de validation pour le résultat de la séquence produite ensuite.

## Réalisation après l’installation

La source originale est maintenant disponible dans `production/atelier-espresso.blend` et `assets/espresso-source.mp4`. Les 160 WebP desktop et 160 mobile sont complets. La recette Chromium aller/retour, pause, responsive, mouvement réduit et réseau ralenti a réussi ; ses captures et sa vidéo sont dans [le rapport de validation](reports/validation/README.md).
