# Recette visuelle de la séquence réelle

Recette exécutée sur l’export de production, dans Chromium, à 1440 × 900 et 390 × 844 ; contrôle responsive supplémentaire à 768 px. Les anciennes preuves dans `reports/correction/` ont été conservées.

## Source et version examinées

- Vidéo fournie : `assets/espresso-live-action.mp4`, extrait 0–22,5 s.
- Séquence : 160 WebP desktop 1280 × 720 et 160 WebP mobiles 800 × 450, plus les deux posters.
- Provenance déclarée dans le manifeste : prise de vues réelle fournie par l’utilisateur. Auteur et licence non renseignés.
- SHA256 du manifeste testé : `d4596febdd4a539ff2000d3e0ae9bb7c75749150ca345d614f3bf99373e8987a`.

## Cinq positions réellement ouvertes et examinées

| Défilement | Index, base 0 | Observation dans la capture desktop |
| --- | --- | --- |
| 0 % | 0 | Tasse vide, porte-filtre visible, pas encore de jets continus. Le titre à gauche reste lisible sans masquer le bec ni l’intérieur de la tasse. |
| 25 % | 40 | Deux filets de café atteignent le fond ; premier niveau et crema visibles. |
| 50 % | 80 | Jets maintenus, surface plus étendue et niveau plus haut qu’au début. |
| 75 % | 119 | Niveau encore plus haut, crema et microbulles visibles, jets toujours présents. |
| 100 % | 159 | Jets arrêtés, espresso et crema dans la tasse. La tasse reste partiellement remplie. |

Les images correspondent au même plan continu : même tasse, même machine et même environnement. Le retour aux quatre positions 75/50/25/0 % restitue les indices 119/80/40/0 et les mêmes empreintes d’échantillons Canvas de 48 × 27 pixels. Les captures de retour sont également enregistrées.

Les captures mobiles `mobile-390-000.png`, `mobile-390-050.png` et `reduced-motion-mobile.png`, ainsi que `reduced-motion.png`, ont été ouvertes. Le cadrage mobile conserve les deux jets et la surface du café. Le titre initial se trouve sous la tasse ; il ne masque pas les becs ou le niveau. Le header reste lisible devant les reflets. En mode réduit, la signature et la carte d’activation ne se chevauchent pas ; le bouton clair de 50 px reste entièrement dans le viewport.

## Preuves fonctionnelles

`browser-report.json` indique `passed: true`.

- Sans réduction système : animation immédiatement disponible et un seul pin.
- Avec réduction système : image finale fixe, aucun pin, une seule frame chargée, explication et activation clavier explicite fonctionnelles.
- Changements système sans choix explicite, choix explicites persistants pendant la page, redimensionnements et sens inverse vérifiés.
- Pauses : même image et aucun redessin continu.
- Caches décodés bornés à 32 images desktop et 24 mobiles.
- Connexion lente simulée : 160 images chargées, quatre requêtes simultanées au maximum, aucune image vide dans 678 échantillons.
- Aucune erreur JavaScript, console, requête échouée ou réponse HTTP d’erreur sur l’export testé.

La capture vidéo `scroll-forward-reverse.mp4` enregistre une vraie molette aller/retour et les pauses : 17,60 s, H.264, 1440 × 900. Ses 167 échantillons contiennent 88 indices distincts ; aucun écart entre image demandée et dessinée n’a été observé dans ces échantillons. La vidéo est encodée à 25 i/s ; cela ne mesure pas une cadence garantie sur les appareils des visiteurs.

## Limites

Le remplissage est réel et visible, mais la tasse ne se remplit pas jusqu’au bord. La source montre un décor de café et une lumière ambiante claire ; cette intégration ne transforme pas le tournage en publicité de studio sombre. Les droits commerciaux restent à renseigner. Ce rapport valide l’export de production examiné ; il ne constitue pas une validation d’un déploiement Vercel.
