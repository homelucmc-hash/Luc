# Source vidéo réelle — contrôle du 22 octobre 2026

**Statut : source réelle absente, remplacement photoréaliste non réalisé.** Le MP4 déjà présent, `assets/espresso-source.mp4`, et les 160 images publiques sont conservés. Le manifeste actuel identifie leur provenance comme `Original continuous Blender Cycles espresso render` : ils ne constituent pas une prise de vue réelle.

## Vérification des trois candidats du pack

Ces URLs viennent de `references/02_ASSETS_ET_VIDEO.md`. Leurs descriptions et résolutions sont des indications du pack ; elles n'ont pas pu être confirmées en visionnant les vidéos.

| Candidat officiel | Résultat du nouvel accès |
| --- | --- |
| https://www.pexels.com/video/brewing-of-coffee-pouring-into-a-cup-4074925/ | Tunnel HTTPS refusé : `403 Forbidden` |
| https://www.pexels.com/video/a-machine-pouring-coffee-in-a-cup-9399042/ | Tunnel HTTPS refusé : `403 Forbidden` |
| https://www.pexels.com/video/fresh-espresso-pouring-from-coffee-machine-35756026/ | Tunnel HTTPS refusé : `403 Forbidden` |
| https://www.pexels.com/fr-fr/license/ | Tunnel HTTPS refusé : `403 Forbidden` |
| https://videos.pexels.com/ — domaine CDN officiel, test de connectivité seulement | Tunnel HTTPS refusé : `403 Forbidden` |

Les requêtes normales Python `urllib.request` GET puis HEAD échouent avec `<urlopen error Tunnel connection failed: 403 Forbidden>`, avant réception d'une réponse HTTP du site. Aucun identifiant, jeton, contournement réseau ou service tiers n'a été utilisé. Aucune URL MP4 n'a été devinée puis présentée comme vérifiée. Aucun téléchargement n'a abouti ; aucun fichier candidat n'a été ajouté.

La licence officielle n'a pas pu être relue dans cet environnement. Les affirmations de licence du pack ne remplacent pas ce contrôle. Il reste donc à vérifier la licence du fichier effectivement retenu et à revoir son contenu. Il n'est pas possible d'affirmer que l'un de ces trois plans montre un niveau de café qui monte.

## Fichier précis à fournir

Ajouter le MP4 **`atelier-coffee/assets/espresso-live-action.mp4`** dans le dépôt, ou joindre le MP4 dans Codex Web afin qu'il puisse être enregistré à cet emplacement. Ne pas renommer ni supprimer le rendu CGI existant pour donner l'impression que sa provenance a changé.

La prise de vue doit respecter ces critères :

- Une extraction d'espresso réelle, dans un seul plan sans coupe ; le flux et la surface du café sont visibles ensemble pendant le remplissage.
- Un extrait utile d'environ 6 à 9 secondes, avec au moins 120 photogrammes différents. Le fichier complet peut être plus long pour permettre de choisir cet extrait.
- Une tasse initialement vide ou peu remplie puis visiblement plus pleine. Le cadrage doit permettre de comparer le niveau ; un bord opaque masquant toute la surface ne convient pas. Une vue légèrement au-dessus du bord, ou une tasse transparente, facilite cette preuve.
- Un cadrage macro stable, la même tasse et le même angle, une lumière chaude directionnelle, le flux et la surface nets. Pas de coupe, fondu, accélération artificielle, image de synthèse, texte ou watermark.
- MP4 H.264, paysage, 1920 × 1080 minimum recommandé ; original 4K bienvenu si disponible. Conserver la cadence d'origine pour l'inspection, puis adapter la cadence WebP après contrôle.
- Fournir également l'URL de la page source, le nom de l'auteur et la licence autorisant l'intégration/modification sur un site commercial. Si la vidéo est filmée par le propriétaire du projet, préciser qu'il détient les droits nécessaires.

La vidéo doit être revue avant toute intégration : un café qui coule ne prouve pas à lui seul un remplissage visible. Les photogrammes à 0, 25, 50, 75 et 100 % doivent montrer une progression réelle dans la même scène.

## Outil corrigé pour préparer la future source

`tools/prepare_sequence.py` a été corrigé après ce contrôle d'accès. Il prépare maintenant **la séquence complète** dans un dossier temporaire voisin de la destination : 160 frames desktop 1280×720, les mêmes 160 instants en mobile 800×450, `poster.webp`, `final.webp` et un manifeste avec dimensions/provenance. Le nombre exact est paramétrable entre 120 et 9999 ; la cadence vaut `frames / duration`. Il conserve le ratio de la vidéo, avec bandes éventuelles.

Une source absente, un extrait dépassant sa durée ou une cadence cible dépassant celle annoncée par la vidéo est refusé avant création du dossier de sortie. Une conversion en échec laisse la destination intacte. Tous les WebP sont comptés, leurs dimensions contrôlées et les deux suites décodées avant remplacement. Le déplacement final garde une sauvegarde et restaure l'ancienne destination si l'installation échoue. Ne pas exécuter l'import pendant un build/déploiement, car deux renommages sont nécessaires lorsqu'une ancienne séquence existe.

Ces commandes sont destinées à Codex après réception et inspection du MP4, sans installation sur l'ordinateur de l'utilisateur. Une seule conversion génère les deux variantes en dehors du site actuel :

```sh
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames:format=duration,size -of json assets/espresso-live-action.mp4
python tools/prepare_sequence.py --input assets/espresso-live-action.mp4 --start 0 --duration 8 --frames 160 --source-kind live-action --output production/live-action-review/espresso-frames
```

`--start 0 --duration 8` est un exemple à ajuster au plan réellement reçu, jamais une sélection validée. Une source de moins de huit secondes ne permet pas cet extrait. `--source-kind live-action` enregistre une déclaration de l'importateur, pas une validation automatique. Le défaut est `unknown` ; les options `--source`, `--provenance` et `--license` permettent d'enregistrer les informations réellement fournies. La cadence annoncée ne prouve pas l'absence d'images répétées dans l'original.

Après contrôle des cinq étapes et des droits, la même commande peut viser `--output public/espresso-frames` pour remplacer toute la séquence de manière cohérente. Les deux variantes doivent être revues ; ne pas conserver des images CGI dans une variante présentée comme réelle. Guide de dépôt via navigateur : `assets/README-LIVE-ACTION.md`.

**Aucune de ces commandes n'a été exécutée avec une source réelle**, car `assets/espresso-live-action.mp4` est absent. Le test technique décrit ci-dessous utilise explicitement le CGI et reste dans `/tmp`.

## Validation technique de l'import, distincte du photoréalisme

Neuf contrôles ont passé. Rapport détaillé de la session : `/tmp/atelier-coffee-import-56doczb1/test-report.json` ; sortie CGI de test : `/tmp/atelier-coffee-import-56doczb1/complete`.

1. Source absente refusée sans création du dossier parent de sortie.
2. Extrait de neuf secondes refusé pour une source de huit secondes.
3. Cadence cible supérieure aux 20 images/s déclarées refusée.
4. Nombre inférieur aux 120 frames exigées par l'application refusé.
5. Import CGI avec les 160 frames par défaut : exactement 320 WebP de séquence et deux posters, dimensions correctes, manifeste `sourceKind: cgi`, 4,15 Mio avec une qualité réduite à 45 pour ce test. Conversion et validation en 14,02 secondes.
6. Échec simulé de l'encodeur : destination antérieure identique octet par octet, aucun staging résiduel.
7. Script réel `scripts/check-assets.mjs`, copié sans modification dans une fixture `/tmp` : sortie générée acceptée.
8. Échec simulé du renommage final : ancienne destination restaurée.
9. Valeurs par défaut vérifiées : 160 frames et provenance `unknown`.

Les empreintes SHA-256 des fichiers `public/espresso-frames` avant/après ce test sont identiques. Aucun MP4 ni photogramme public n'a été remplacé. Ces contrôles ne prouvent pas un rendu photoréaliste ni un vrai remplissage.

## Contrôle du fichier conservé

`ffprobe assets/espresso-source.mp4` : H.264, 1280 × 720, 20 images/s, 160 images, durée 8,000 s, 1 950 564 octets. La source déclarée dans `public/espresso-frames/manifest.json` est Blender Cycles. Aucun fichier d'animation public n'a été modifié par cette recherche.
