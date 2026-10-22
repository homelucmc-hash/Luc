# Assets nécessaires : sans eux, impossible d'obtenir une vraie animation photoréaliste

## La règle
Les cinq illustrations WebP de `references/visuels` sont un *moodboard*. Elles montrent des interfaces et contiennent du texte incrusté. Elles ne peuvent pas devenir un versement réaliste par interpolation : les objets/angles changent.

## Option A (plus rapide) : extrait vidéo réel libre d'usage
Exemples de sources vidéo (vérifier le plan, la durée utile, la licence et le rendu AVANT intégration) :
- https://www.pexels.com/video/brewing-of-coffee-pouring-into-a-cup-4074925/ — paysage 1920×1080, 37s, extraction dans tasse céramique.
- https://www.pexels.com/video/a-machine-pouring-coffee-in-a-cup-9399042/ — paysage 1920×1080, 14s, café dans une tasse foncée.
- https://www.pexels.com/video/fresh-espresso-pouring-from-coffee-machine-35756026/ — paysage 3840×2160, 22s.

Pexels indique une licence gratuite autorisant modification et utilisation sous conditions : https://www.pexels.com/fr-fr/license/ ; ne jamais sous-entendre qu'une marque apparaissant dans une vidéo cautionne ATELIER COFFEE. Privilégier un plan sans logos, sans personnes identifiables et de haute qualité.

Procédure :
1. Visionner la vidéo et repérer **un plan continu** sans coupe, où l'on voit du liquide et de préférence la tasse se remplir.
2. Télécharger légalement le MP4 dans `assets/espresso-source.mp4` (hors dossier public final).
3. Déterminer `start` et `duration` de l'extrait utile (idéalement 6 à 9 secondes).
4. Convertir : `python tools/prepare_sequence.py --input assets/espresso-source.mp4 --start 5 --duration 7 --fps 24 --width 1600` (valeurs à adapter après visionnage).
5. Le script écrit des WebP numérotés et `public/espresso-frames/manifest.json`.
6. Lier la progression du scroll à l'index exact d'image : `round(progress * (frameCount - 1))`.
7. Vérifier une continuité de scène et la progression réelle du liquide ; sélectionner une autre vidéo sinon.

ATTENTION : une vidéo de café qui coule ne signifie pas forcément qu'on voit le niveau monter. Si l'objectif exact n'est pas couvert, ne pas prétendre le contraire. Trouver un autre plan ou utiliser l'option B.

## Option B (meilleur contrôle visuel) : rendu 3D prémonté
Utiliser Blender avec une scène complète (modèles et textures de qualité), caméra fixe / mouvement subtil, éclairage cinématographique, liquide et crema animés. Exporter des images numérotées (PNG/EXR) avec tous les états intermédiaires ; convertir en WebP. Les modèles et textures doivent avoir une licence adaptée. Ce travail est un vrai projet 3D : il ne devient pas photoréaliste simplement en ajoutant Three.js.

## Option C : preuve technique provisoire
Si aucun asset réaliste n'est disponible, créer un test isolé avec visuels de développement et vérifier le lien scroll-frame ; marquer explicitement « prototype technique, non livrable », puis remplacer par une véritable séquence.

## Assets attendus
`public/espresso-frames/frame-0001.webp` jusqu'à `frame-XXXX.webp` et `manifest.json` tel que `{ "count": 168, "ext": "webp" }` ; nombre d'images à ajuster. Pour de bonnes performances, environ 144–216 images haute qualité optimisées ; mesurer le poids réel et ajuster résolution/qualité selon mobile.
