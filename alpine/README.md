# Là-haut — Val Thorens

Site d’inspiration indépendant, en français, consacré à l’imaginaire de Val Thorens. Direction artistique éditoriale : blanc glacier, noir minéral, rouge vermillon, photographies plein cadre et typographies locales.

## Démarrer

Node.js 22 ou ultérieur et npm sont requis.

```bash
cd /workspace/Luc/alpine
npm ci
npm run dev
```

Vite écoute sur le port 5173 et sur toutes les interfaces. Aucun secret ni service tiers n’est requis pour le site.

```bash
npm run build        # Vérification TypeScript + bundle de production dans dist/
npm run preview      # Servir le bundle de production
npm test            # Parcours navigateur sur ordinateur et téléphone
```

Les tests utilisent Chromium installé sur la machine. Si `/usr/bin/chromium` est absent, installer le navigateur avec `npx playwright install chromium`.

Pour créer une édition autonome qui s’ouvre sans serveur :

```bash
npm run export:html
```

Le fichier `artifacts/val-thorens.html` contient le JavaScript, les styles, les images et les polices intégrés. Téléchargez-le puis ouvrez-le dans un navigateur moderne. Cette édition locale ne crée pas d’adresse publique.

## Expérience

- Photographie d’ouverture en trois vues, transitions et parallaxe.
- Neige en profondeur et mouvement subtil au pointeur, suspendus hors écran.
- Massif Three.js et itinéraires illustratifs ; caméra et chapitres pilotés par le défilement natif.
- Trois ambiances lumineuses interactives : matin, heure dorée et nuit.
- Une journée alpine en quatre tableaux photographiques, de 08:30 à 20:00.
- Affichage adaptatif, commandes de chapitres et lien pour passer l’exploration.
- Fiches d’expériences, idées conservées localement dans le navigateur.
- Carnet de séjour selon les dates, le groupe et trois états d’esprit. Il propose des idées et renvoie vers le site officiel ; il n’effectue aucune réservation.
- Navigation et fenêtres accessibles au clavier, gestion du focus et préférence de mouvement réduit. Illustration de secours si WebGL est indisponible.

## Repères techniques

React, TypeScript, Vite, Tailwind CSS, GSAP ScrollTrigger, Three.js, Radix Dialog et Lucide. Les couleurs et composants reposent sur des variables CSS sémantiques. Three.js est dans un chunk séparé. Les styles de la scène et du carnet sont isolés.

Les compétences UI/UX Pro Max, UI Styling, Brand et Design System installées dans le dépôt ont guidé la conception. 21st CLI est installé dans l’environnement, mais sa connexion n’étant pas disponible, aucun composant de ce service n’est revendiqué ou requis.

## Images et limites

Photographies d’ambiance téléchargées depuis Unsplash :

- `alpine-hero.jpg` : https://images.unsplash.com/photo-1418985991508-e47386d96a71
- `ski.jpg` : https://images.unsplash.com/photo-1551524559-8af4e6624178
- `chalet.jpg` : https://images.unsplash.com/photo-1517299321609-52687d1bc55a
- `night-summit.jpg` : https://images.unsplash.com/photo-1519681393784-d120267933ba

Polices Google Fonts Barlow Condensed, DM Sans et Manrope, conservées localement pour éviter des requêtes externes à l’exécution. Sources : https://fonts.google.com/.

Le terrain 3D est une création procédurale artistique, pas un plan des pistes. Les photographies illustrent une ambiance et ne constituent pas un reportage géolocalisé. Le site n’affiche pas de données météo ou d’ouverture en direct. Les accès et prestations se vérifient auprès de la station.

Ce projet reste dans `alpine/` et ne modifie pas le bot Python situé à la racine du dépôt.
