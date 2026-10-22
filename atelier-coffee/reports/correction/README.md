# ATELIER COFFEE — correction et preuves, 22 octobre 2026

**Activation et interface corrigées. Remplacement par une vraie vidéo : non réalisé. Validation visuelle du site publié : non réalisée.** Le projet et ses 160 images desktop / 160 images mobile sont conservés. Toutes les modifications du dépôt concernent uniquement `atelier-coffee/`.

## Ce qui fonctionne et a été vérifié

Le code précédent utilisait volontairement l’image finale sans ScrollTrigger si `prefers-reduced-motion: reduce` était actif. Cela explique ce comportement dans le code ; la préférence effective de votre navigateur sur Vercel n’a pas pu être observée depuis Codex.

- Sans réduction demandée : le contrôle par scroll démarre immédiatement, sans activation préalable.
- Avec réduction : image finale fixe, aucun pin, un seul photogramme chargé, message explicatif et bouton clair de 50 px « Activer l’expérience ».
- L’activation au clavier fonctionne même si la préférence système reste réduite. Le choix explicite résiste aux changements système et de largeur dans la page. Un rechargement revient à la préférence système.
- Le film occupe tout l’écran. Les cinq grands textes, les boutons de chapitre et les profils de dégustation ont été retirés. Un titre initial, une signature finale et une courte section éditoriale restent.
- La timeline unique conserve `useGSAP`, `matchMedia`, `revertOnUpdate`, `pin`, `scrub: true` et une progression linéaire. Le moteur Canvas et ses caches bornés sont conservés.

## Démonstration réelle sur le build de production

[Vidéo MP4 du défilement à la molette, aller et retour](browser/scroll-forward-reverse.mp4) · [version WebM](browser/scroll-forward-reverse.webm).

Les images suivantes sont des captures du navigateur, après le dernier build et les corrections de contraste. Elles montrent **le rendu CGI provisoire conservé**, pas une nouvelle prise de vue réelle.

| Scroll | Index dessiné, base 0 | Capture desktop | Retour arrière |
| --- | --- | --- | --- |
| 0 % | 0 | [Début](browser/desktop-000.png) | [Retour à 0 %](browser/desktop-reverse-000.png) |
| 25 % | 40 | [Flux](browser/desktop-025.png) | [Retour à 25 %](browser/desktop-reverse-025.png) |
| 50 % | 80 | [Niveau bas visible](browser/desktop-050.png) | [Retour à 50 %](browser/desktop-reverse-050.png) |
| 75 % | 119 | [Niveau plus haut](browser/desktop-075.png) | [Retour à 75 %](browser/desktop-reverse-075.png) |
| 100 % | 159 | [Tasse remplie, flux arrêté](browser/desktop-100.png) | Point de départ du retour |

[Mobile à 50 %](browser/mobile-390-050.png) · [mobile à 100 %](browser/mobile-390-100.png) · [réduction desktop](browser/reduced-motion.png) · [réduction mobile](browser/reduced-motion-mobile.png) · [activation explicite à 50 %](browser/reduced-explicit-activation-050.png).

La revue des captures confirme la montée représentée du niveau entre 50 et 75 %, puis l’arrêt du flux. Le liquide reste trop uniforme et la crema trop lisse pour revendiquer le rendu photoréaliste demandé. Voir [la revue visuelle](visual-review.md).

## Résultats techniques

Recette finale Chromium terminée avec `passed: true`, sans test omis : [rapport complet](browser/browser-report.json). Test effectué sur l’export de production servi dans l’environnement Codex ; l’utilisateur n’a aucun serveur local à lancer.

- Cinq positions desktop 1440 × 900, cinq positions à 390 × 844 et 768 × 1024 ; aller/retour et redimensionnements.
- Images différentes en avançant ; empreintes des pixels échantillonnés du Canvas identiques au retour. Cet échantillonnage ne constitue pas une comparaison exhaustive de chaque pixel.
- Molette réelle enregistrée dans la vidéo ; pauses sans changement d’image ni nouveau dessin. Ce contrôle ne certifie pas 60 images/s sur tous les appareils.
- Un pin unique, cache décodé limité à 32 images desktop / 24 mobile, absence de débordement horizontal aux largeurs testées.
- Préférence système modifiée pendant la session, avec et sans choix explicite ; activation clavier et mobile.
- Chargement ralenti séparé : 160 fichiers récupérés, quatre requêtes simultanées maximum, aucun Canvas vide observé. Les captures et la vidéo principales utilisent les fichiers réels, sans interception des images.
- Aucune erreur JavaScript, console ou HTTP dans la recette finale. Les requêtes annulées lors d’un changement de variante sont distinguées des échecs.
- TypeScript et build Next.js réussis avec Node 22. L’export contient les 327 fichiers publics identiques aux sources, dont les 320 photogrammes ; les polices et le JavaScript sont présents.

L’ancien `scripts/check-browser.cjs` redirige vers la recette actuelle `scripts/check-correction-browser.cjs` pour éviter d’utiliser des sélecteurs de l’ancienne interface.

## Source réelle manquante et import prêt

La source actuellement utilisée est `assets/espresso-source.mp4` : export Blender de huit secondes, 160 images à 20 images/s. Les trois candidats Pexels du pack et leur CDN officiel restent bloqués par le proxy. Aucun MP4 réel n’a été récupéré, visionné ou validé.

Le fichier attendu est **`atelier-coffee/assets/espresso-live-action.mp4`** : un plan filmé continu montrant ensemble le flux et un niveau qui monte dans la tasse, idéalement 1080p ou 4K, avec environ huit secondes utiles. Fournir aussi la provenance et les droits. [Guide pour l’ajouter depuis Codex Web ou GitHub](../../assets/README-LIVE-ACTION.md).

`tools/prepare_sequence.py` prépare désormais les deux résolutions, les posters et le manifeste en staging, puis remplace après validation complète, avec restauration si l’installation échoue. Neuf contrôles techniques ont réussi sur une copie du CGI dans `/tmp`, sans modifier les images publiques : [rapport d’import](import-report.json). Cela prépare l’intégration future ; aucune source réelle n’a été importée. [Détails de l’accès aux sources](real-source-access.md).

## Vercel

Le lien fourni est `https://cafe-qs2yhnbvb-d7-13b5.vercel.app/#story`. Les accès HTTP et la navigation normale dans Chromium échouent dans le tunnel du proxy, avant toute réponse du site. Il n’a donc pas été possible de vérifier le scroll ou les fichiers publiés. Cela ne prouve pas une panne de Vercel : [preuve d’accès](published-site.json).

Après fusion de la correction sur `main`, choisir le nouveau déploiement **Ready → Visit** dans Vercel. Une ancienne URL de déploiement peut conserver l’ancienne version. Retirer `#story` ou cliquer le mot-marque pour commencer au début du film. [Guide de publication](../../DEPLOIEMENT-VERCEL.md).
