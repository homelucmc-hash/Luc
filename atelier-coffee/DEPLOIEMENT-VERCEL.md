# ATELIER COFFEE — publier depuis le navigateur

Le site Next.js, ses 160 images desktop et 160 images mobiles, ses polices locales et son animation GSAP sont conservés. Le déploiement ne demande aucune clé API, aucune base de données et aucun logiciel sur votre ordinateur.

## Emplacement dans GitHub

Dépôt connecté : https://github.com/homelucmc-hash/Luc

Le projet est ajouté dans le sous-dossier `atelier-coffee/`. Les fichiers du bot et les autres projets du dépôt sont préservés. La copie source originale du site reste dans l’environnement Codex.

## 1. Enregistrer dans GitHub

Si une pull request a été créée par Codex, l’ouvrir et contrôler que ses changements concernent uniquement `atelier-coffee/`.

Si la branche est publiée sans pull request, ouvrir le dépôt GitHub, cliquer **Compare & pull request** pour la branche `codex/atelier-coffee-vercel`, sélectionner la base **main**, puis cliquer **Create pull request**.

Après revue, cliquer **Merge pull request**, puis **Confirm merge**. Sur **Code**, sélectionner **main** et vérifier que `atelier-coffee/package.json`, `atelier-coffee/vercel.json` et `atelier-coffee/public/espresso-frames/manifest.json` sont présents.

Si la publication par Git était bloquée, l’alternative entièrement navigateur serait le bouton **Create PR / Créer une pull request** de Codex Web, sur ce même dépôt. Il n’est pas nécessaire de télécharger ou téléverser un ZIP dans GitHub.

## 2. Connecter Vercel gratuitement

1. Ouvrir https://vercel.com/signup dans Chrome.
2. Choisir **Continue with GitHub** et se connecter à votre compte GitHub.
3. Choisir le plan personnel **Hobby / Free** pour cette démonstration.
4. Ouvrir https://vercel.com/new, ou **Add New… → Project** dans le tableau de bord.
5. Dans **Import Git Repository**, trouver **homelucmc-hash/Luc** et cliquer **Import**.
6. Si Luc n’apparaît pas, cliquer **Adjust GitHub App Permissions / Configure GitHub App**, autoriser Vercel pour le dépôt **Luc**, puis revenir à l’import.

## 3. Régler le projet avant Deploy

| Réglage | Valeur |
| --- | --- |
| Project Name | `atelier-coffee`, ou un autre nom disponible |
| Root Directory | **Edit → atelier-coffee → Continue** |
| Framework Preset | **Next.js** |
| Install Command | `npm ci`, déjà défini dans `vercel.json` |
| Build Command | `npm run build`, déjà défini dans `vercel.json` |
| Output Directory | **Next.js default**, sans activer d’override |
| Node.js | **22.x**, défini dans `package.json` |
| Environment Variables | Laisser vide |

Ne pas choisir `out` comme Root Directory. Le builder Next.js de Vercel reconnaît `output: 'export'` et publie automatiquement le dossier `out` créé pendant le build. Ne pas imposer `out` comme Output Directory avec le preset Next.js.

Cliquer **Deploy**. Attendre le statut **Ready**, puis cliquer **Visit**. Le lien HTTPS affiché par Vercel est le véritable lien du site ; son nom ne peut pas être garanti avant la création du déploiement.

## 4. Contrôler le vrai lien HTTPS

Dans la page Vercel, copier le domaine réellement attribué depuis **Domains**. Dans Chrome :

1. Ouvrir le site et attendre l’image initiale.
2. Défiler lentement : la première goutte devient un flux ; le niveau est bas vers 50 %, proche du plein vers 75 %, puis le flux s’arrête.
3. S’arrêter : l’image ne doit pas avancer seule.
4. Remonter : le niveau doit redescendre et les mêmes étapes doivent revenir.
5. Tester les cinq boutons de chapitre et le bouton de réduction des mouvements.
6. Tester une fenêtre étroite ou un téléphone : la variante mobile conserve le contrôle par scroll.

Pour contrôler les images, ajouter ces chemins au vrai domaine Vercel :

- `/espresso-frames/manifest.json` : doit indiquer `count: 160`.
- `/espresso-frames/frame-0001.webp` : première goutte.
- `/espresso-frames/frame-0081.webp` : tasse et niveau bas.
- `/espresso-frames/frame-0120.webp` : niveau proche du plein.
- `/espresso-frames/frame-0160.webp` : tasse pleine, flux arrêté.
- `/espresso-frames/mobile/frame-0160.webp` : variante mobile.

L’application est servie à la racine du domaine, même si le code est dans le dossier GitHub `atelier-coffee/`. Ne pas ajouter `/atelier-coffee/` devant ces chemins et ne pas ajouter de rewrite global vers `index.html`.

## Vérifications automatiques préparées

`prebuild` vérifie les fichiers source des deux variantes. `postbuild` compare par SHA-256 tous les fichiers publics avec l’export et vérifie la présence du JavaScript et des polices locales. Un asset absent fait échouer la construction avant publication.

Le lecteur reste dans le navigateur : `useGSAP`, ScrollTrigger `pin` + `scrub`, Canvas et progression 0–1. Aucun serveur 3D ni traitement vidéo ne tourne chez Vercel. Les références, les rendus Blender bruts et les rapports ne sont pas des fichiers publics du site.

## État de la publication

Cette préparation et un build réussi ne prouvent pas qu’un site est déjà publié. Tant que Vercel n’a pas attribué un domaine accessible et que ce domaine n’a pas été contrôlé, la validation distante du scroll et des images reste **à effectuer**.

L’environnement Codex actuel bloque `vercel.com`, `api.vercel.com` et les domaines `vercel.app` testés. Aucun identifiant Vercel n’y est configuré. Cela n’empêche pas l’import et le déploiement depuis votre navigateur, mais empêche l’agent d’annoncer un déploiement distant vérifié depuis cette session.

Le photoréalisme de la source reste perfectible ; l’hébergement HTTPS conserve les images actuelles et leur comportement, sans modifier leur qualité visuelle.

## Sources de configuration

- Next.js, export statique : https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/static-exports.mdx
- Preset Vercel Next.js : https://github.com/vercel/vercel/blob/main/packages/frameworks/src/frameworks.ts
- Builder Vercel : https://github.com/vercel/vercel/blob/main/packages/next/src/index.ts
