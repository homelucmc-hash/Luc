# Fournir la vraie prise de vue de l'espresso

Le fichier `espresso-source.mp4` déjà présent est un rendu CGI Blender. Il est conservé. La vidéo réelle demandée est encore absente : ne pas présenter les images actuelles comme une prise de vue photoréaliste validée.

## Depuis Codex Web ou GitHub, sans installation locale

1. Joindre le vrai MP4 à la conversation Codex, avec sa page source, son auteur et sa licence, puis demander son enregistrement sous `atelier-coffee/assets/espresso-live-action.mp4`.
2. Autre possibilité : ouvrir le dépôt `homelucmc-hash/Luc` dans GitHub, entrer dans `atelier-coffee/assets`, choisir **Add file → Upload files**, déposer `espresso-live-action.mp4`, puis enregistrer sur la branche de travail. L'interface GitHub limite chaque fichier téléversé à 25 Mio ; pour un original plus lourd, le joindre dans Codex si l'interface le permet ou fournir le téléchargement officiel autorisé.
3. Ajouter la provenance et les droits dans la conversation ou dans un fichier texte voisin. Ne jamais substituer une vidéo distante non vérifiée.

Le MP4 doit montrer un seul plan réel, sans coupe, dans lequel le jet **et le niveau du café dans la tasse** sont visibles. Viser 6 à 9 secondes utiles, un cadrage macro stable et une lumière cinématographique, en paysage 1920×1080 minimum recommandé. Une surface masquée par le bord de la tasse ne permet pas de prouver le remplissage. Fournir suffisamment d'images source : 160 photogrammes sur 8 secondes exigent au moins 20 images/s. La cadence déclarée ne garantit pas que toutes les images soient différentes ; vérifier visuellement.

## Import effectué dans l'environnement Codex

L'utilisateur n'a pas à installer Node.js, FFmpeg ou Python sur son ordinateur. Les commandes suivantes sont exécutées par Codex après inspection du fichier et de ses droits.

Commencer dans une sortie de contrôle, sans remplacer l'animation du site :

```sh
python tools/prepare_sequence.py --input assets/espresso-live-action.mp4 --start 0 --duration 8 --frames 160 --source-kind live-action --source "Description du plan réellement reçu" --provenance "URL source et auteur" --license "Licence à vérifier" --output production/live-action-review/espresso-frames
```

Adapter `--start` et `--duration` après visionnage. Le script produit exactement 160 frames par défaut, avec une cadence calculée `frames / duration`. `--frames` accepte 120 à 9999, conformément aux contrôles du site. L'ancien `--fps` est accepté à la place de `--frames` et déduit le compte de `duration × fps`. La résolution du contrat actuel est fixe : desktop 1280×720 et mobile 800×450. Le ratio d'origine est préservé avec des bandes si nécessaire ; le cadrage final dans le Canvas reste à vérifier sur mobile.

La sortie contient :

- `frame-0001.webp` à `frame-0160.webp` à sa racine ;
- les mêmes indices dans `mobile/` ;
- `poster.webp`, `final.webp` et un manifeste avec nombre, dimensions, provenance déclarée et empreinte SHA-256 de la source.

L'outil refuse une vidéo absente, un extrait dépassant la durée source, une cadence demandée supérieure à la cadence source annoncée, un nombre d'images incomplet ou une image illisible. Les deux variantes viennent des mêmes instants du même plan. Il valide les dimensions de chaque WebP et décode les deux suites avant toute publication. Cela ne certifie ni la licence, ni l'absence de doublons dans la vidéo, ni un niveau qui monte.

`--source-kind` vaut `unknown` par défaut. `live-action` et `cgi` sont des **déclarations de l'importateur**, pas un résultat d'analyse automatique. Les options `--provenance`, `--license` et `--source` enregistrent uniquement les informations fournies ; ne pas inventer une attribution ou des droits pour remplir ces champs.

Après revue des cinq états 0/25/50/75/100 %, de la licence et du cadrage, relancer le même import avec `--output public/espresso-frames`. Le script prépare un dossier temporaire voisin, valide entièrement les fichiers, puis remplace la séquence complète. Il conserve la destination pendant la conversion et restaure l'ancienne si le déplacement final échoue. Ne pas lancer un import pendant un déploiement/build : le remplacement du dossier utilise deux renommages très courts quand une ancienne séquence existe.

Enfin, vérifier dans un vrai navigateur le scroll aller/retour, l'arrêt sur image, les cinq étapes, mobile et réduction des mouvements. Les checks `npm run check:assets` puis `npm run build` vérifient la présence des fichiers et leur export pour Vercel ; ils ne constituent pas une validation visuelle.
