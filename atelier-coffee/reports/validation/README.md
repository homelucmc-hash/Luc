# ATELIER COFFEE — Validation du 22 octobre 2026

La recette complète a réussi sur la version de production. Les captures proviennent du vrai lecteur Canvas et des fichiers définitifs ; aucune image de référence n’a remplacé les photogrammes.

[Galerie et vidéo](index.html) · [Vidéo MP4 réelle de la molette](scroll-forward-reverse.mp4) · [Enregistrement WebM original](scroll-forward-reverse.webm) · [Revue visuelle](REVUE-VISUELLE.md) · [Résultats détaillés](browser-report.json)

## Source et séquence

- Source éditable : [atelier-espresso.blend](../../production/atelier-espresso.blend), texture embarquée et [script de rendu](../../scripts/render-coffee.py).
- Export de contrôle : [espresso-source.mp4](../../assets/espresso-source.mp4), 160 images, 1280 × 720, 20 fps, huit secondes. Ce fichier provient du rendu original et n’est pas lu automatiquement dans le site.
- Assets du lecteur : 160 WebP desktop 1280 × 720 et 160 WebP mobile 800 × 450, numérotation de 0001 à 0160.
- Poids : 5 464 902 octets desktop, 2 749 688 octets mobile, hors posters.
- Les 160 PNG intermédiaires et les 320 WebP ont été vérifiés ; tous les WebP ont été décodés. [Rapport source et SHA-256](../../production/source-validation.json).

## Cinq positions réelles

| Scroll | Index du lecteur / fichier | Observation | Capture |
| --- | --- | --- | --- |
| 0 % | 0 / frame-0001.webp | Première goutte, cadrage macro | [ordinateur](desktop-000.png) · [mobile](mobile-390-000.png) |
| 25 % | 40 / frame-0041.webp | Flux établi | [ordinateur](desktop-025.png) · [mobile](mobile-390-025.png) |
| 50 % | 80 / frame-0081.webp | Tasse révélée, niveau bas | [ordinateur](desktop-050.png) · [mobile](mobile-390-050.png) |
| 75 % | 119 / frame-0120.webp | Niveau proche du plein | [ordinateur](desktop-075.png) · [mobile](mobile-390-075.png) |
| 100 % | 159 / frame-0160.webp | Tasse pleine, flux arrêté | [ordinateur](desktop-100.png) · [mobile](mobile-390-100.png) |

Le retour à 75, 50, 25 et 0 % retrouve les mêmes index et les mêmes empreintes du Canvas échantillonné à 48 × 27. Les images montrent un niveau plus bas à 50 % qu’à 75 % ; le flux est absent au final. La vidéo utilise de vrais événements `mouse.wheel` dans les deux sens, avec une pause mesurée au milieu.

## Contrôles réussis

| Contrôle | Résultat |
| --- | --- |
| GSAP ScrollTrigger | `pin`, `scrub: true`, progression directe, cinq hauteurs d’écran |
| Défilement inverse | Même fichier et même cadrage aux positions contrôlées |
| Pause | Aucun nouveau `drawImage` à 0 et 50 % ; pause vidéo de 1,5 seconde stable |
| Responsive | 1440 × 900, mobile émulé 390 × 844, tablette 768 × 1024 ; aucun débordement horizontal |
| Redimensionnement | Variante mobile puis desktop correcte, un seul pin conservé |
| Cache décodé | Bornes de 24 images mobile et 32 desktop respectées |
| Chapitres et CTA | Les cinq boutons visent les bons index ; le CTA final rejoint la présentation |
| Clavier | Profils avec flèches/Home/End, ARIA, tabulation et focus vérifiés |
| Mouvement réduit | Scène finale sans pin, une seule frame téléchargée ; réactivation explicite possible |
| Réseau simulé | 160 images reçues, quatre requêtes simultanées maximum, poster et dernière image valides pendant l’attente |
| Console et réseau | Aucune erreur JavaScript, erreur console, réponse HTTP manquante ou requête échouée dans la recette finale |
| Démarrage développement | HMR, Canvas initial, pin et 160 réponses d’images HTTP 200 sur `127.0.0.1` |
| Construction | `check:assets`, `verify:sequence`, `typecheck` et `build` réussis |

L’essai réseau ajoute 300 ms de latence et limite chaque requête à 160 KiB/s, avec un délai de 1,4 seconde sur la première image. Il utilise les vrais fichiers et une interception limitée au délai de réponse. Les parcours normaux et la vidéo ne remplacent ni n’interceptent les images.

Premier Canvas dessiné dans la recette locale : 725 ms. Cette mesure dépend de cette machine et ne constitue pas une garantie de débit ou de fréquence d’affichage sur d’autres appareils.

## GSAP et instructions

Les cinq skills officiels et leurs licences MIT sont présents dans `.agents/skills/`. Commit officiel : `aed9cfd3277740755f6bfc1155c7aa645403b760`. La page gsap.com était bloquée par le proxy ; le dépôt officiel GitHub a été consulté. [Provenance](../../.agents/skills/GSAP-SOURCES.md).

`AGENTS.md` conserve les instructions Next.js et le texte original du pack, puis ajoute les pratiques GSAP. Les 18 autres fichiers du pack et les dix fichiers GSAP copiés correspondent à leurs empreintes originales. [Contrôle d’intégrité](../../production/instructions-validation.json).

Les pratiques sont appliquées au code : `useGSAP`, scope React, `revertOnUpdate`, `gsap.matchMedia`, nettoyage, animation des descendants du pin, rafraîchissement après les polices, un RAF à la demande et cache borné.

## Accès à l’aperçu interactif

Le vrai site est servi en HTTP sur le port 3000 de cet environnement. Aucune URL HTTPS externe n’a pu être vérifiée : Cloudflare Quick Tunnel, Localtunnel et localhost.run sont bloqués par le proxy. Le navigateur de l’environnement bloque aussi les fichiers locaux `file://`. Aucun export doubleclic non testé n’est présenté comme validé. [Rapport d’accès](preview-access.json).

L’archive statique fonctionne avec Node.js, sans installer de dépendances : dézipper, ouvrir le dossier `atelier-coffee-site`, lancer `node scripts/serve.mjs`, puis ouvrir `http://localhost:3000` sur la machine qui exécute ce serveur. Cette procédure ne constitue pas un lien public accessible au port cloud.

## Limites réelles

La séquence est un rendu CGI original précalculé, avec surface et flux déterministes. Ce n’est pas une prise de vue réelle ni une simulation hydrodynamique. Le débruitage d’un rendu CPU à dix échantillons atténue les microbulles ; la crema conserve un aspect de synthèse et la vapeur est discrète. Le niveau de détail reste inférieur à une production photo/3D de haute résolution.

Les cinq maquettes sont uniquement des références artistiques. Leurs pixels ne sont pas utilisés comme animation. Les photos éditoriales et la texture de crema sont générées pour cette démonstration, avec provenances dans `production/`.

La recette utilise Chromium, avec émulation mobile et tablette. Safari, Firefox et les appareils physiques n’ont pas été testés. Aucune validation commerciale, de paiement ou de déploiement public n’est revendiquée.

## Reproduire la recette

Après `npm run build` et `npm run start`, avec Playwright, Chromium et un encodeur vidéo existants :

```sh
BASE_URL=http://localhost:3000 node scripts/check-browser.cjs
```

Voir les variables optionnelles en tête du script. [Build](build-checks.json), [démarrage dev](dev-boot.json), [vidéo et trace](video-report.json), [revue éditoriale](editorial-review.json).
