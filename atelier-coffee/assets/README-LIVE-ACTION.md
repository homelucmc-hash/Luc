# La prise de vue réelle de l'espresso

## Source reçue et conservée

La vidéo réelle est présente dans `assets/espresso-live-action.mp4`. Elle a été ajoutée par l'utilisateur au dépôt `homelucmc-hash/Luc`, sur `main`, dans le commit [10c051da0f62ee06641ec502a400f906a9431af2](https://github.com/homelucmc-hash/Luc/commit/10c051da0f62ee06641ec502a400f906a9431af2), sous le nom `atelier-coffee/assets/15157920_3840_2160_24fps (1).mp4`. Son renommage n'a pas modifié la vidéo.

Métadonnées vérifiées par `ffprobe` : H.264, 3840×2160, 24 images/s, 542 images, 22,583333 secondes, 21 782 560 octets. Son empreinte SHA-256 est :

```text
086af25554b55c493b097e3daebcadf3319fbbe682ff4b2839cde0ee4407d6f6
```

Le plan réel a été revu avant l'import par l'agent principal et le contrôle de direction artistique : flux de café, montée du niveau dans la tasse et arrêt des jets vers la fin du plan. Le fichier reçu fournit désormais la matière de l'animation, sans générer de nouveaux objets 3D.

L'auteur du tournage et la licence n'ont pas été renseignés. Le nom du compte qui a téléversé le fichier ne constitue pas une attribution de la vidéo. Aucune licence Pexels ou autre n'est supposée. Ces informations restent ouvertes dans `reports/live-action/source-provenance.json` ; l'intégration demandée par l'utilisateur a été réalisée avec le fichier qu'il a fourni.

L'ancienne vidéo Blender `assets/espresso-source.mp4` est conservée comme archive CGI. Les rapports antérieurs sur l'absence de vidéo réelle restent des documents historiques.

## Extrait importé pour le scroll

L'extrait de 0 à 22,5 secondes a été converti en **160 photogrammes** par variante. La cadence de l'échantillonnage vaut `160 / 22.5`, soit environ 7,111 images/s de la vidéo source ; le navigateur sélectionne le photogramme exact selon le scroll, sans lecture automatique du MP4.

`public/espresso-frames/` contient maintenant :

- 160 WebP desktop 1280×720, `frame-0001.webp` à `frame-0160.webp` ;
- 160 WebP mobile 800×450, dans `mobile/`, avec les mêmes indices et instants ;
- `poster.webp`, `final.webp` et le manifeste complet avec dimensions, description et empreinte de la source.

Ces 322 WebP représentent 27 851 508 octets, soit environ 26,56 Mio. Les fichiers du site sont locaux et pourront être exportés avec le projet sur Vercel. Ce constat ne déclare pas à lui seul un déploiement distant réussi.

## Reproduire l'import dans Codex

Aucune installation locale n'est nécessaire pour l'utilisateur. Depuis `atelier-coffee/`, Codex peut d'abord générer une sortie de contrôle :

```sh
python tools/prepare_sequence.py --input assets/espresso-live-action.mp4 --start 0 --duration 22.5 --frames 160 --source-kind live-action --source "Plan réel fourni par l’utilisateur : extraction d’un espresso, tasse vide puis montée du niveau et fin des jets." --provenance "GitHub homelucmc-hash/Luc, main commit 10c051da0f62ee06641ec502a400f906a9431af2 ; auteur et licence non renseignés." --output production/live-action-review/espresso-frames
```

La même commande avec `--output public/espresso-frames` publie la séquence locale après la revue visuelle. L'outil prépare un dossier temporaire, valide le nombre, les dimensions et le décodage des deux variantes, puis remplace la destination complète. La destination reste intacte pendant la conversion et une restauration est prévue si son déplacement final échoue. Éviter d'exécuter un import pendant un build/déploiement.

Le script accepte 120 à 9999 frames et conserve le ratio d'origine. `--source-kind live-action` enregistre la provenance déclarée ; il n'établit ni les droits ni la qualité de l'image. Les cinq états à 0/25/50/75/100 %, le retour arrière, le cadrage mobile et la réduction des mouvements doivent être contrôlés dans un navigateur. Les rapports de navigateur constituent cette preuve séparée ; un build réussi ne la remplace pas.
