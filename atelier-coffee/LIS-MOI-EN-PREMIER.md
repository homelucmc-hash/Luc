# PACK DE PRODUCTION — ATELIER COFFEE

Ce dossier est destiné à être **copié dans la racine du projet actuel** Next.js avant de demander à Codex de recommencer.
Il contient une charte, des procédures, un skill local Codex, 5 références compressées et un moteur d'animation de référence. Ce n'est pas un site fini : il n'y a **pas de séquence vidéo réelle** dans le ZIP.

## 1. Installation
1. Sauvegarder le projet actuel (Git commit ou copie).
2. Dézipper ce pack puis copier tout son contenu dans la **racine** du projet Next.js (`package.json` doit être dans le même répertoire que `AGENTS.md`). Si `AGENTS.md` existe, fusionner ses règles au lieu de l'écraser.
3. Garder intacte la structure `.agents/skills/atelier-scroll/SKILL.md` ; Codex découvrira les skills du dépôt.
4. Vérifier que `references/visuels` contient 5 WebP.
5. Ne pas lancer en boucle d'énormes envois Base64 vers Codex : lui donner les CHEMINS de fichiers.

## 2. Optionnel : skill officiel GSAP
Dans le terminal à la racine du projet (Node nécessaire) :
`npx skills add https://github.com/greensock/gsap-skills`
Cela permet à Codex d'avoir des consignes spécialisées GSAP (scrolltrigger, React, performance). Redémarrer Codex si nécessaire.
Il ne crée PAS les assets vidéo et ne garantit pas à lui seul le rendu.

## 3. Source réelle du café
Le pack contient 5 MAQUETTES (moodboard). Pour l'animation, il faut une vraie vidéo/rendu **continue** dans `assets/espresso-source.mp4`.
Pistes vérifiées au moment de la création du pack :
- https://www.pexels.com/video/brewing-of-coffee-pouring-into-a-cup-4074925/
- https://www.pexels.com/video/a-machine-pouring-coffee-in-a-cup-9399042/
Examiner le clip : il doit montrer visiblement une tasse qui se remplit. Si le plan n'existe pas, chercher mieux / produire un rendu 3D ; ne pas inventer.

Puis exemple (remplacer start et duration selon la vidéo) :
`python tools/prepare_sequence.py --input assets/espresso-source.mp4 --start 0 --duration 8 --fps 24 --width 1600`
`python tools/verify_sequence.py`

## 4. Texte court à envoyer à Codex

> Reprends le projet ATELIER COFFEE. Lis entièrement `AGENTS.md`, `references/01_BRIEF_VISUEL.md`, `references/02_ASSETS_ET_VIDEO.md`, `references/03_TESTS_OBLIGATOIRES.md` et le skill `.agents/skills/atelier-scroll/SKILL.md`. Utilise `reference-code/CoffeeScrollSequence.tsx` comme référence technique, à adapter à la structure Next.js actuelle. La priorité est une VRAIE séquence de café qui coule pendant que je scrolle, image par image, dans les deux sens. Les 5 WebP sont des moodboards et NON des photogrammes. Si la source vidéo manque, trouve/propose une source réaliste autorisée, ou indique précisément ce qu'il faut fournir, sans inventer d'animation. Produis une séquence d'au moins 120 frames, synchronise-la au scroll avec GSAP ScrollTrigger, teste dans un navigateur et montre des screenshots aux cinq positions. Ne dis pas que c'est terminé sans preuve réelle. Fais d'abord le moteur et la vérification de l'animation, puis seulement la finition premium du design.

## 5. Scripts utiles
- `npm install gsap`
- `npm run dev`
- `python tools/verify_sequence.py`
- Si Playwright est disponible dans le projet, reprendre `reference-code/tests/coffee-scroll.spec.ts` et le lancer avec `npx playwright test` (peut nécessiter config de baseURL et serveur web).

## 6. Pourquoi cette méthode devrait améliorer le résultat
- `AGENTS.md` garde les règles du projet visibles.
- Skill local : méthode spécialisée pour ce site.
- Vidéo/rendu continu : fournit les vraies images successives manquantes.
- Code de référence : décrit une implémentation concrète `Canvas + GSAP + pin + scrub`.
- Tests : refusent un faux résultat simplement parce que le build fonctionne.

**Limite honnête :** une séquence extraite d'un simple stock vidéo peut marcher parfaitement au scroll tout en ayant un rendu moins haut de gamme que les 5 maquettes. Pour un résultat identique aux maquettes, il faudra produire une séquence 3D/vidéo cinématique spécialement conçue avec le même cadrage et le même éclairage.
