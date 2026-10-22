# ATELIER COFFEE — prise de vue réelle intégrée, 23 octobre 2026

La vidéo fournie sur GitHub a été récupérée, inspectée puis convertie avec l’importeur existant. Le rendu CGI public a été remplacé **après** vérification des jets et de la montée du niveau. Le même moteur Canvas/GSAP contrôle maintenant les vrais photogrammes.

## Source et conversion

- Source : `assets/espresso-live-action.mp4`, renommée sans modifier son contenu depuis le fichier GitHub `15157920_3840_2160_24fps (1).mp4`, commit `10c051d` sur `main`.
- Original : H.264, 3840 × 2160, 24 images/s, 542 images, 22,583333 s. [Provenance et empreinte SHA-256](source-provenance.json).
- Extrait retenu : 0 à 22,5 s. Les premières secondes montrent la tasse vide ; à 22 s les jets sont arrêtés. Un extrait de huit secondes aurait perdu une partie importante du remplissage.
- Sortie : **160 WebP desktop 1280 × 720 et 160 WebP mobile 800 × 450**, poster initial, image finale et manifeste complet. Poids des deux variantes et posters : 26,56 Mio ; seule la variante utile est chargée dans le navigateur.
- Conversion en staging sous `production/live-action-review/espresso-frames`, revue des cinq images, puis même import vers `public/espresso-frames`. Toutes les images ont été comptées, leurs dimensions vérifiées et les deux suites décodées par l’importeur avant remplacement.
- Les 160 fichiers de chaque variante ont des empreintes distinctes. Les posters correspondent exactement au premier et au dernier photogramme. [Contrôles d’import](import-validation.json).

Le MP4 source et les fichiers Blender ne sont pas envoyés aux visiteurs. L’ancien CGI reste archivé sous `assets/espresso-source.mp4` et `production/` ; il n’est plus utilisé par la séquence publique. Aucun liquide généré, morphing ou nouvelle forme 3D n’a été ajouté.

## Preuves dans le navigateur

[Vidéo du défilement réel à la molette, aller et retour](browser/scroll-forward-reverse.mp4) · [version WebM](browser/scroll-forward-reverse.webm).

Ces captures proviennent de Chromium sur le dernier export de production, pas des maquettes du pack ni du lecteur vidéo source :

| Scroll | Index dessiné, base 0 | Instant source approximatif | Observation et capture | Retour |
| --- | --- | --- | --- | --- |
| 0 % | 0 | 0 s | [Tasse vide](browser/desktop-000.png) | [0 %](browser/desktop-reverse-000.png) |
| 25 % | 40 | 5,63 s | [Deux jets, début de remplissage](browser/desktop-025.png) | [25 %](browser/desktop-reverse-025.png) |
| 50 % | 80 | 11,25 s | [Surface et crema visibles](browser/desktop-050.png) | [50 %](browser/desktop-reverse-050.png) |
| 75 % | 119 | 16,73 s | [Niveau plus haut, jets actifs](browser/desktop-075.png) | [75 %](browser/desktop-reverse-075.png) |
| 100 % | 159 | 22,36 s | [Jets arrêtés, espresso dans la tasse](browser/desktop-100.png) | Début du retour |

[Mobile à 0 %](browser/mobile-390-000.png) · [mobile à 50 %](browser/mobile-390-050.png) · [mobile à 100 %](browser/mobile-390-100.png) · [mode réduit mobile](browser/reduced-motion-mobile.png) · [activation explicite à 50 %](browser/reduced-explicit-activation-050.png).

Les cinq images desktop et les captures mobile ont été ouvertes et examinées. La montée du niveau et la formation de la crema sont visibles dans le même plan. La tasse finale contient un petit espresso et reste partiellement remplie : ce plan ne montre pas un remplissage jusqu’au bord. La lumière reste celle d’un café clair, avec une machine et son décor visibles ; elle ne reproduit pas la lumière de studio noire des références initiales. [Revue indépendante de la source](source-review/visual-source-review.md).

## Contrôles réalisés

**Recette complète réussie**, `passed: true`, aucun test omis : [rapport Chromium](browser/browser-report.json), [mesures vidéo](browser/video-report.json), [chargement lent](browser/slow-network-report.json).

- Desktop 1440 × 900, mobile simulé 390 × 844 et tablette 768 × 1024 : cinq étapes, puis retour. Les indices et les empreintes des pixels échantillonnés du Canvas reviennent aux mêmes valeurs.
- Molette réellement enregistrée, pauses sans avance automatique ni dessin permanent. La progression reste `round(progress × 159)` ; la cadence d’échantillonnage de la source n’est pas une lecture automatique du film.
- Timeline GSAP avec `pin` et `scrub: true` conservée, un seul pin après activation ou changement de largeur, caches décodés bornés à 32 images desktop et 24 mobile.
- Cadrage mobile recentré de 68 % à 52 % pour garder ensemble les deux jets et la surface. Poster et Canvas utilisent le même cadrage. Le titre initial a été déplacé sous la tasse sur mobile ; l’ombre du titre desktop a été ajustée pour la source plus claire.
- Préférence système respectée, image finale réelle en mode réduit, un seul photogramme chargé avant activation, bouton de 50 px visible et activation au clavier. Choix explicite conservé pendant les changements de préférence.
- Chargement lent séparé : 160 images récupérées, au maximum quatre requêtes simultanées, image valide conservée pendant l’attente. Les captures et la vidéo principales utilisent les vrais fichiers sans interception.
- Aucune erreur JavaScript, console ou réponse HTTP d’erreur dans la recette finale. Les annulations normales lors des changements de variante sont identifiées séparément.
- TypeScript, build Next.js et vérification de séquence réussis. Les **327 fichiers publics** sont identiques à l’export, dont tous les photogrammes, les posters et le manifeste ; JavaScript et polices locaux présents.

La comparaison de retour utilise un échantillonnage du Canvas à 48 × 27, pas une comparaison exhaustive de tous ses pixels. Les tailles mobiles sont testées par émulation Chromium ; ces contrôles ne mesurent pas tous les téléphones physiques.

## Publication

Les changements restent limités à `atelier-coffee/`. Le dépôt reste `homelucmc-hash/Luc`, Root Directory Vercel `atelier-coffee`, Framework Preset **Next.js**. Les anciens rapports `correction/` et `validation/` sont conservés comme historique CGI.

L’accès au domaine Vercel fourni reste refusé par le tunnel du proxy Codex (`403 Forbidden`), avant toute réponse de l’application. **La version hébergée n’est donc pas validée ici.** Après fusion de cette intégration sur `main`, ouvrir le nouveau déploiement **Ready → Visit** dans Vercel ; une ancienne URL de déploiement peut conserver l’ancienne version.
