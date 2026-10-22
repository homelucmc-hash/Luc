# Revue des captures réelles — correction du 22 octobre 2026

Les captures proviennent de Chromium à 1440 × 900, sur l’export de production du projet corrigé. Les cinq images desktop ont été ouvertes et examinées ; ce ne sont pas les maquettes du pack.

| Défilement | Index, base 0 | Observation visible |
| --- | --- | --- |
| 0 % | 0 | Macro du porte-filtre et première goutte. Petit titre à gauche ; tasse encore hors champ. |
| 25 % | 40 | Flux continu sous le porte-filtre. Tasse encore hors champ ; pas de texte de chapitre devant le flux. |
| 50 % | 80 | Flux jusqu’à la tasse ; surface du café nettement sous le bord. |
| 75 % | 119 | Même tasse, surface plus haute, flux encore présent. |
| 100 % | 159 | Flux arrêté, tasse remplie, signature discrète à gauche. |

La progression du liquide est représentée dans les images de la séquence existante. Le retour aux mêmes positions restitue le même index et la même empreinte d’un échantillon du Canvas réduit à 48 × 27 pixels. Cela valide le contrôle de la séquence par le défilement, pas l’existence d’une prise de vues réelle.

Le mode de réduction affiche l’image finale et une carte lisible en bas à gauche expliquant la préférence système. Son bouton clair « Activer l’expérience » mesure 50 px de haut. Après activation explicite, le défilement fonctionne même si le système demande toujours de réduire les mouvements.

## Revue mobile et corrections de lisibilité

Les captures `mobile-390-050.png`, `mobile-390-100.png`, `reduced-motion.png` et `editorial-section.png` ont également été ouvertes avec `view_image`. Sur mobile à 390 px, le recadrage coupe l’anse et le côté droit de la tasse, mais conserve le jet et la montée du niveau lisibles. Les contrôles du bas ne recouvrent pas la surface du café. La carte d’activation du mode réduit est clairement visible dans la capture desktop examinée.

La première série de captures révèle un contraste trop faible du lien « L’atelier » mobile sur le métal brillant, vers x325–368 / y26–38. Une partie du mot-marque rencontre aussi un reflet clair. Le dégradé du header a été assombri sous les liens et s’efface à son bord inférieur. Les contrôles du bas, trop petits à 10 px sur mobile, sont passés à 12 px sur desktop et mobile, puis 11 px sous 360 px, sans ajouter d’éléments à l’interface.

Après le rebuild final, toute la recette a été exécutée à nouveau et les captures ont été remplacées. Les cinq captures desktop finales, `mobile-390-050.png` et `reduced-motion-mobile.png` ont été ouvertes et examinées. Le dégradé sombre maintient les liens du header lisibles devant le métal clair ; les contrôles du bas sont désormais à 12 px sur desktop et à 390 px. Le bouton d’activation mesure toujours 50 px, reste entièrement dans le viewport et possède son explication accessible. Aucun débordement horizontal n’a été détecté à 390 ou 768 px. La section éditoriale visible est plus courte et calme ; sa capture ne montre pas toute la section ni le footer.

## Résultat de la recette finale

`browser/browser-report.json` indique `passed: true`. Les positions 0/25/50/75/100 % affichent respectivement les indices 0/40/80/119/159 ; les quatre positions en retour ont les mêmes indices et empreintes Canvas échantillonnées que l’aller. Les pauses n’entraînent aucun redessin. La préférence système change aussi correctement sans choix explicite : `no-preference → reduce → no-preference` donne `image 0/pin unique → image 159/sans pin → image 0/pin unique`. Un choix explicite d’activation ou de réduction reste respecté lors des changements système ultérieurs.

La vidéo de contrôle finale `browser/scroll-forward-reverse.mp4` dure 18,12 s, en H.264 à 1440 × 900. Elle enregistre une vraie molette aller/retour, avec des pauses. Ses 168 échantillons mesurés contiennent 91 indices distincts, sans écart entre image demandée et dessinée dans ces échantillons ; cette mesure ne garantit pas une cadence matérielle identique sur tous les appareils. Le cache décodé reste borné à 32 images desktop et 24 mobile. Le test de connexion lente charge les 160 images desktop avec au plus quatre requêtes simultanées et sans image vide parmi ses 333 échantillons. Aucune erreur JavaScript, console, requête échouée ou réponse HTTP d’erreur n’a été relevée sur l’export testé.

## Limite visuelle déterminante

**Le remplacement par une vidéo réelle est non réalisé.** Les 160 images conservées proviennent du rendu Blender existant, exporté dans `assets/espresso-source.mp4`. Le flux est trop uniforme et la crema trop lisse pour revendiquer le photoréalisme demandé. Ni la simplification de l’interface ni les tests de défilement ne corrigent cette limite de source.

Il manque `assets/espresso-live-action.mp4` : un plan continu filmé, sans coupe, montrant à la fois le flux et un niveau de liquide qui monte visiblement dans la tasse. Les refus du proxy concernant les sources candidates sont documentés dans `real-source-access.md`.

## Site publié

L’ouverture normale dans Chromium de `https://cafe-qs2yhnbvb-d7-13b5.vercel.app/#story` échoue avant toute réponse HTTP avec `ERR_TUNNEL_CONNECTION_FAILED`. Le site publié n’a donc pas pu être examiné visuellement depuis cet environnement. Ce refus ne prouve pas une panne de Vercel. Voir `published-site.json`.
