# Direction artistique — ATELIER COFFEE

## Référence
Voir `references/visuels/01...05.webp` dans l'ordre. Ce sont des **maquettes de l'interface**, générées séparément. Elles ne sont pas des photogrammes consécutifs : l'éclairage, le cadrage, et parfois la tasse ne sont pas identiques d'une image à l'autre. **NE PAS les jouer comme une séquence.**

## Signature esthétique
- Noir profond / espresso (#090706, #1d100b), ambre (#c37a38), crème (#e7ddd0) ; lumière chaude directionnelle sur portefiltre et flux.
- Cadrage macro d'une vraie machine à espresso. Reflets métalliques spéculaires, crema et microbulles, faible profondeur de champ, mouvement filmique mesuré.
- Grand espace négatif à gauche ; le flux et la tasse restent les héros visuels à droite.
- Typographie éditoriale serif de qualité, sans-serif espacée pour la navigation. Header très discret, textes très courts.
- Pas d'affichage de jauge technique/compteur de score, pas de parallaxe arbitraire, pas de fond beige vide, pas de formes low-poly visibles.

## Storyboard scroll continu
Progression `p` entre 0 et 1. La réalité visuelle dépend du mouvement présent dans la source et ne doit pas être inventée par un simple texte.
- 0–0,15 : portefiltre, premières gouttes, tasse à peine visible.
- 0,15–0,38 : écoulement plus continu, reflets caramel, lente découverte du bas de l'image.
- 0,38–0,65 : le flux arrive dans la tasse, surface du café en mouvement.
- 0,65–0,87 : la tasse se remplit, crema et oscillation de surface.
- 0,87–1 : fin de l'écoulement, tasse prête, identité de marque.

**Critère de réalité** : ces étapes doivent être montrées par de VRAIES images successives du même plan, pas par des fichiers d'illustration indépendants. Si la source n'a pas toutes les phases, adapter le storyboard à ce que montre vraiment l'extrait ou produire une autre source ; ne pas simuler une phase absente.

## Layout cible
- Un chapitre principal `100vh` visuel épinglé pendant 4-5 hauteurs de viewport de défilement.
- Canvas 100% de la zone, object-fit cover (option contain au mobile selon cadrage).
- Header 60-80px translucide, contraste garanti.
- Texte de gauche max 35–40% largeur, visible seulement aux phases où il ne masque pas le flux.
- Molette/touch scroll -> progression EXACTE ; retour arrière -> inverse.
- Final : bouton fonctionnel qui pointe vers une vraie section après le chapitre.

## Ce qu'il faut montrer au client
5 captures distinctes + capture écran d'un aller-retour de scroll. Sur chaque capture : objets cohérents, flux qui change, même tasse, même lieu. Aucun autoplay comme substitut.
