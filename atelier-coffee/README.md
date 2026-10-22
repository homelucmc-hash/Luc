# ATELIER COFFEE — Le temps d’un espresso

Le défilement contrôle 160 photogrammes issus d’une vraie prise de vue d’extraction d’espresso. La tasse commence vide, les deux jets apparaissent, le niveau et la crema montent, puis les jets s’arrêtent. Remonter parcourt les mêmes images en sens inverse. La tasse finale contient un espresso ; elle n’est pas remplie jusqu’au bord.

La source fournie sur GitHub sous le nom `15157920_3840_2160_24fps (1).mp4` est conservée sans réencodage sous `assets/espresso-live-action.mp4` : 4K, 24 images/s, 22,58 secondes. L’extrait utilisé va de 0 à 22,5 secondes. Le rendu CGI public a été remplacé après revue du flux et du niveau ; son ancien MP4 et sa scène Blender restent archivés. Voir [la validation de cette intégration](reports/live-action/README.md). Les rapports `correction/` et `validation/` décrivent les versions CGI précédentes.

Pour publier uniquement depuis Chrome, suivre [le guide GitHub → Vercel](DEPLOIEMENT-VERCEL.md). Dans le dépôt `homelucmc-hash/Luc`, choisir **Root Directory : `atelier-coffee`** lors de l’import Vercel. Aucun terminal sur votre ordinateur n’est nécessaire.

## Lancer le projet

Dans l’environnement de développement, utiliser Node.js 22 et npm. Aucun logiciel 3D, compte externe ou clé API n’est requis pour afficher le site. Pour l’utilisateur du site publié, Chrome et son URL HTTPS suffisent.

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:3000. Pour servir la version statique optimisée :

```sh
npm run typecheck
npm run build
npm run start
```

`next build` produit `out/`. `npm run start` sert ce dossier sur le port 3000 ; la variable `PORT` permet d’en choisir un autre. Le site doit être servi en HTTP : il n’existe plus d’export HTML contenant des images en base64.

## Animation et chargement

Une timeline GSAP unique utilise ScrollTrigger avec `pin` et `scrub: true`. Sa progression 0–1 choisit `round(progress × 159)`. La scène reste épinglée pendant cinq hauteurs d’écran. Aucun minuteur ni autoplay ne fait avancer le café.

| Progression | Composition |
| --- | --- |
| 0 % | Tasse vide, becs visibles |
| 25 % | Deux jets, début de remplissage |
| 50 % | Surface et crema visibles, niveau plus haut |
| 75 % | Extraction continue, niveau qui progresse |
| 100 % | Jets arrêtés, espresso avec crema dans la tasse |

Le poster est présent dans le HTML initial. Le lecteur Canvas conserve sa dernière image valide pendant un chargement. Quatre requêtes au maximum chargent les WebP, avec priorité à l’image demandée. Les fichiers comprimés sont mis en cache progressivement ; les images décodées sont limitées à 32 sur ordinateur et 24 sur mobile. La variante mobile mesure 800 px de large, contre 1280 px sur ordinateur. Le dessin utilise un seul RAF à la demande, sans boucle permanente.

Sans demande de réduction des mouvements, la séquence animée est active dès l’ouverture : aucun bouton d’activation n’est nécessaire. Le mode de réduction des mouvements affiche uniquement l’image finale, sans scène épinglée. Un message explique ce choix et un bouton contrasté « Activer l’expérience » permet de l’activer explicitement, au clavier comme à la souris. Le choix explicite reste prioritaire lors des changements de largeur et de préférence système dans la page ; il n’est pas conservé après un rechargement.

Le film occupe tout l’écran. Seuls le titre initial et la signature finale l’accompagnent ; aucun texte ne recouvre les étapes intermédiaires. La navigation et la présentation de l’atelier sont volontairement réduites.

## GSAP officiel

Les skills officiels React, ScrollTrigger, performance, core et timeline sont conservés, avec leur licence MIT, dans `.agents/skills/`. Le skill du pack `atelier-scroll` et les instructions précédentes ont été préservés. La provenance et le commit figurent dans `.agents/skills/GSAP-SOURCES.md`.

Les pratiques appliquées sont détaillées dans `AGENTS.md` : `useGSAP`, scope React, `revertOnUpdate`, `gsap.matchMedia`, nettoyage des animations et ressources, rafraîchissement après les polices, cache borné et contrôle direct par le scroll. La page documentaire gsap.com était bloquée par le proxy cloud ; le dépôt officiel GitHub a pu être consulté.

## Fichiers utiles

- `src/components/CoffeeExperience.tsx` : timeline, pin, légendes et préférence de mouvement.
- `src/components/EspressoSequence.tsx` : Canvas, chargement, cache et nettoyage.
- `src/components/BrandSections.tsx` : courte présentation éditoriale.
- `public/espresso-frames/` : série desktop, sous-dossier `mobile/`, posters et manifeste.
- `assets/espresso-live-action.mp4` : prise de vue 4K fournie par l’utilisateur, utilisée par le site.
- `tools/prepare_sequence.py` : importeur WebP desktop/mobile avec staging et restauration en cas d’échec.
- `production/atelier-espresso.blend`, `assets/espresso-source.mp4`, les scripts de rendu et anciens fichiers de production : archives CGI, non utilisés par l’animation actuelle.
- [Rapport de prise de vue réelle](reports/live-action/README.md) : preuves actuelles et limites.
- [Ancien rapport de correction](reports/correction/README.md) : interface et mode de mouvement, sur la version CGI précédente.
- [Ancien rapport de validation](reports/validation/README.md) : version précédente, conservée pour comparaison.

## Vérifications

```sh
npm run check:assets
npm run verify:sequence
npm run typecheck
npm run build
```

Le build refuse une séquence manquante ou incomplète. La recette Chromium contrôle les cinq positions, le retour aux mêmes pixels échantillonnés, la pause sans dessin supplémentaire, les changements de largeur, le clavier, la réduction des mouvements et le chargement ralenti. Les résultats figurent dans le rapport `live-action/` ; un build réussi ne prouve pas la qualité visuelle.

Le harness est reproductible avec une installation existante de Playwright et Chromium :

```sh
BASE_URL=http://localhost:3000 node scripts/check-correction-browser.cjs
```

Les variables `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE` et `FFMPEG_EXECUTABLE` permettent d’utiliser des outils déjà installés. Ces outils de recette ne sont pas des dépendances du site.

## Réimporter la prise de vue

Ces commandes sont destinées à l’environnement de développement Codex. Aucun logiciel n’est nécessaire sur l’ordinateur de l’utilisateur du site. L’importeur existant nécessite FFmpeg et ffprobe ; il produit les 160 images desktop 1280×720, les 160 images mobile 800×450, les deux posters et le manifeste complet avant tout remplacement.

```sh
python tools/prepare_sequence.py --input assets/espresso-live-action.mp4 --start 0 --duration 22.5 --frames 160 --source-kind live-action --output production/live-action-review/espresso-frames
```

Vérifier les cinq états et le cadrage, puis viser `--output public/espresso-frames` pour remplacer la séquence entière. Renseigner aussi la provenance réellement connue avec `--source` et `--provenance`. Voir [le guide de source et d’import](assets/README-LIVE-ACTION.md). Le MP4 n’est pas téléchargé par les visiteurs : le site utilise uniquement les WebP locaux.

## Origine et limites

La vidéo a été fournie dans le dépôt par l’utilisateur ; son nom d’origine, son commit GitHub et son empreinte sont conservés dans `reports/live-action/source-provenance.json` et dans le manifeste. Aucun auteur ni licence externe n’a été inventé. La photo éditoriale qui suit le film reste une image générée de la démonstration précédente ; sa provenance est conservée dans `production/`.

Les cinq références fournies restent séparées dans `references/` et servent de direction artistique. Elles ne sont pas utilisées comme photogrammes. La vidéo montre un vrai café dans une lumière naturelle claire, avec un décor de machine visible. Elle n’a pas la lumière de studio noire des références initiales ; aucune synthèse de liquide ni interpolation générative n’a été ajoutée.

ATELIER COFFEE est une marque fictive. Le site est une démonstration sans achat ni envoi de données.
