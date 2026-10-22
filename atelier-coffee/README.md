# ATELIER COFFEE — Precision in every drop

Expérience éditoriale sombre autour de l’extraction d’un espresso. Le défilement contrôle une séquence originale de 160 rendus 3D : le flux apparaît, la tasse se révèle, le café monte puis le versement s’arrête. Remonter parcourt exactement les mêmes images en sens inverse.

Pour publier uniquement depuis Chrome, suivre [le guide GitHub → Vercel](DEPLOIEMENT-VERCEL.md). Dans le dépôt `homelucmc-hash/Luc`, choisir **Root Directory : `atelier-coffee`** lors de l’import Vercel. Aucun terminal sur votre ordinateur n’est nécessaire.

## Lancer le projet

Node.js 20.9+ et npm sont nécessaires. Aucun logiciel 3D, compte externe ou clé API n’est requis pour afficher le site.

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
| 0–20 % | Porte-filtre en macro et premières gouttes |
| 20–40 % | Établissement du flux |
| 40–65 % | Révélation de la tasse et montée du café |
| 65–85 % | Crema et tasse proche du plein |
| 85–100 % | Arrêt du flux et composition finale |

Le poster est présent dans le HTML initial. Le lecteur Canvas conserve sa dernière image valide pendant un chargement. Quatre requêtes au maximum chargent les WebP, avec priorité à l’image demandée. Les fichiers comprimés sont mis en cache progressivement ; les images décodées sont limitées à 32 sur ordinateur et 24 sur mobile. La variante mobile mesure 800 px de large, contre 1280 px sur ordinateur. Le dessin utilise un seul RAF à la demande, sans boucle permanente.

Le mode de réduction des mouvements charge uniquement l’image finale, sans longue scène épinglée. Le choix du système est respecté par défaut ; le bouton permet de le modifier. Les chapitres et les profils de dégustation sont utilisables au clavier.

## GSAP officiel

Les skills officiels React, ScrollTrigger, performance, core et timeline sont conservés, avec leur licence MIT, dans `.agents/skills/`. Le skill du pack `atelier-scroll` et les instructions précédentes ont été préservés. La provenance et le commit figurent dans `.agents/skills/GSAP-SOURCES.md`.

Les pratiques appliquées sont détaillées dans `AGENTS.md` : `useGSAP`, scope React, `revertOnUpdate`, `gsap.matchMedia`, nettoyage des animations et ressources, rafraîchissement après les polices, cache borné et contrôle direct par le scroll. La page documentaire gsap.com était bloquée par le proxy cloud ; le dépôt officiel GitHub a pu être consulté.

## Fichiers utiles

- `src/components/CoffeeExperience.tsx` : timeline, pin, chapitres et préférence de mouvement.
- `src/components/EspressoSequence.tsx` : Canvas, chargement, cache et nettoyage.
- `src/components/BrandSections.tsx` : contenu éditorial et onglets de dégustation.
- `public/espresso-frames/` : série desktop, sous-dossier `mobile/`, posters et manifeste.
- `production/atelier-espresso.blend` : scène source avec texture embarquée.
- `assets/espresso-source.mp4` : export de contrôle de la séquence originale, 160 images à 20 fps, huit secondes.
- `scripts/render-coffee.py` et `scripts/encode-sequence.py` : production des images.
- `production/frame-metadata.json` : état du café, du flux et de la caméra par image.
- `production/encoding.json` : résolutions et poids des assets.
- [Rapport de validation](reports/validation/README.md) : résultats, cinq captures desktop/mobile et vidéo de défilement réel.

## Vérifications

```sh
npm run check:assets
npm run verify:sequence
npm run typecheck
npm run build
```

Le build refuse une séquence manquante ou incomplète. La recette Chromium a également réussi : cinq positions, retour aux mêmes pixels, pause sans dessin supplémentaire, mobile 390 px et tablette 768 px, changements de largeur, clavier, réduction des mouvements et chargement ralenti. Voir le rapport pour les preuves et les limites de ces contrôles.

Le harness est reproductible avec une installation existante de Playwright et Chromium :

```sh
BASE_URL=http://localhost:3000 node scripts/check-browser.cjs
```

Les variables `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE` et `FFMPEG_EXECUTABLE` permettent d’utiliser des outils déjà installés. Ces outils de recette ne sont pas des dépendances du site.

## Reproduire les images (facultatif)

Blender 4.3.2, FFmpeg et le CLI Intel Open Image Denoise 2.3.3 sont nécessaires uniquement pour recréer les assets. Le débruiteur officiel est disponible sur https://github.com/RenderKit/oidn/releases (licence Apache-2.0).

```sh
blender --background --factory-startup --python scripts/render-coffee.py -- --frames all --width 1280 --samples 10 --threads 5 --crema-exposure -1.5 --output production/final-renders --save-blend
python scripts/encode-sequence.py --input production/final-renders --oidn /chemin/vers/oidnDenoise
```

Le rendu CPU est long. L’encodeur accepte `--watch` pendant que Blender produit les PNG. Les rendus bruts, logs et essais rejetés ne sont pas nécessaires à l’exécution du site et ne font pas partie des assets livrés au navigateur. Voir `production/README.md` pour les détails reproductibles.

## Origine et limites

La scène, les modèles, matériaux, éclairages et mouvements ont été créés pour ce projet. La crema utilise une texture originale assistée par génération d’image. Les deux photos éditoriales sont également générées pour cette démonstration ; les provenances sont conservées dans `production/`.

Les cinq références fournies restent séparées dans `references/` et servent de direction artistique. Elles ne sont pas utilisées comme photogrammes. La séquence est un rendu CGI continu, avec une surface liquide et un flux déterministes ; ce n’est pas une simulation hydrodynamique ni une scène 3D manipulable dans le navigateur. Le débruitage atténue certains détails fins de la crema. Le résultat n’est pas présenté comme une prise de vue réelle.

ATELIER COFFEE et ses profils de dégustation sont fictifs. Le site est une démonstration sans achat ni envoi de données.
