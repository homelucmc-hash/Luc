Le site ATELIER COFFEE était conservé en dehors du dépôt GitHub, ce qui empêchait son import direct dans Vercel. Cette modification ajoute le projet complet dans `atelier-coffee/`, conserve l’animation GSAP et les 160 photogrammes de chaque résolution, puis prépare le déploiement Next.js depuis GitHub.

La configuration utilise Node.js22, `npm ci` et `npm run build`. Le contrôle préalable vérifie la séquence, et le contrôle après build compare tous les assets publics à l’export. Dans Vercel, sélectionner `atelier-coffee` comme Root Directory, le preset Next.js et l’Output Directory par défaut. Aucun secret ni service backend n’est nécessaire.

Validation : installation propre depuis le lockfile, contrôle des images et de l’export, TypeScript/build, vérification navigateur de la séquence, du retour arrière, des pauses et du responsive. Le guide `DEPLOIEMENT-VERCEL.md` décrit les clics GitHub/Vercel. Le déploiement et sa validation HTTPS restent à effectuer après connexion du compte Vercel ; aucun lien public n’est déclaré comme créé.

Les sources de l’animation et les références restent disponibles ; les rendus bruts, dépendances locales et caches ne sont pas ajoutés. Les autres projets du dépôt ne sont pas modifiés. La qualité photoréaliste de la source reste perfectible, comme indiqué dans la revue visuelle.
