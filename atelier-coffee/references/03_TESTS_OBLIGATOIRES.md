# Recette qualité obligatoire : NE PAS DIRE « fini » si un point échoue

## Fonctionnel
- [ ] Une suite **réelle** d'au moins 120 photogrammes cohérents est présente ; les cinq images mockup ne comptent pas.
- [ ] Aucun fichier `frame-xxxx.webp` n'est absent (HTTP 404) ; le manifeste correspond aux fichiers.
- [ ] Scroll de 0 à 100% change l'image visible au minimum à 25, 50, 75%.
- [ ] Le niveau du liquide monte effectivement dans l'image, pas juste les mots ou un overlay.
- [ ] Arrêt du scroll -> le plan s'arrête. Retour arrière -> la scène se rembobine de façon cohérente.
- [ ] Aucune lecture automatique de la séquence pendant le scroll.
- [ ] La scène reste épinglée et remplit correctement le viewport jusqu'à la fin.
- [ ] Le bouton final fonctionne et mène à une section réelle.

## Visuel
- [ ] Capture 0 / 25 / 50 / 75 / 100% du **navigateur réel** (pas de maquette réutilisée).
- [ ] Même machine, même tasse et même cadrage général entre les étapes ; continuité du mouvement.
- [ ] Fluide, aucun flicker écran noir et aucun saut de chargement.
- [ ] Sombres nuances, photoréalisme et luminosité inspirés des références ; aucun cylindre marron artificiel.
- [ ] Tester en desktop 1440×900 et mobile 390×844.

## Technique
- [ ] `npm run build` et vérification TypeScript passent (adapter aux scripts disponibles).
- [ ] Zéro erreur JavaScript console, zéro image 404, pas de contenu cassé.
- [ ] Mémoire raisonnable, débit de chargement progressif, le scroll n'inonde pas les requêtes.
- [ ] `prefers-reduced-motion` propose une image fixe alternative avec contenu accessible.

## Preuve automatique conseillée
Avec Playwright, naviguer au début / quart / moitié / trois-quarts / fin puis revenir, capturer des screenshots. Lire `data-current-frame` sur l'élément `[data-testid="coffee-sequence"]` et vérifier que son nombre croît puis décroît. Cela vérifie la programmation ; une revue VISUELLE des screenshots est indispensable pour prouver le versement.

## Rapport final attendu
- Source vidéo/rendu employée : ______
- Durée utile / nombre de frames : ______
- Résultat des 5 positions + retour arrière : ______
- Screenshots navigateur produits : ______
- Points non réalisés : ______

Toute lacune doit rester explicitement marquée « non réalisé » : pas de revendications de test non effectué.
