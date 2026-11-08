/* Recettes maison pour deux personnes. Huile, sel et poivre sont les bases du placard. */
(() => {
  const pantrySuggestions = [
    ['tomates','Tomates','Légumes','🍅'], ['courgette','Courgette','Légumes','🥒'],
    ['carotte','Carottes','Légumes','🥕'], ['oignon','Oignon','Légumes','🧅'],
    ['ail','Ail','Légumes','🧄'], ['pommes-de-terre','Pommes de terre','Légumes','🥔'],
    ['epinards','Épinards','Légumes','🥬'], ['brocoli','Brocoli','Légumes','🥦'],
    ['poivron','Poivron','Légumes','🫑'], ['champignons','Champignons','Légumes','🍄'],
    ['salade','Salade','Légumes','🥬'], ['concombre','Concombre','Légumes','🥒'],
    ['citron','Citron','Légumes','🍋'], ['patate-douce','Patate douce','Légumes','🍠'],
    ['aubergine','Aubergine','Légumes','🍆'], ['petits-pois','Petits pois','Légumes','🫛'],
    ['oeufs','Œufs','Frais','🥚'], ['creme','Crème fraîche','Frais','🥛'],
    ['lait','Lait','Frais','🥛'], ['fromage','Fromage râpé','Frais','🧀'],
    ['chevre','Fromage de chèvre','Frais','🧀'], ['feta','Feta','Frais','🧀'],
    ['mozzarella','Mozzarella','Frais','🧀'], ['yaourt','Yaourt nature','Frais','🥛'],
    ['beurre','Beurre','Frais','🧈'], ['poulet','Poulet','Frais','🍗'],
    ['jambon','Jambon','Frais','🥓'], ['tofu','Tofu','Frais','◻️'],
    ['pates','Pâtes','Épicerie','🍝'], ['riz','Riz','Épicerie','🍚'],
    ['semoule','Semoule','Épicerie','🌾'], ['nouilles','Nouilles','Épicerie','🍜'],
    ['gnocchis','Gnocchis','Frais','🥔'], ['pain','Pain','Épicerie','🍞'],
    ['tortillas','Tortillas','Épicerie','🫓'], ['farine','Farine','Épicerie','🌾'],
    ['pois-chiches','Pois chiches cuits','Épicerie','🫘'], ['lentilles','Lentilles cuites','Épicerie','🫘'],
    ['haricots-rouges','Haricots rouges cuits','Épicerie','🫘'], ['mais','Maïs','Épicerie','🌽'],
    ['thon','Thon en boîte','Épicerie','🐟'], ['tomates-concassees','Tomates concassées','Épicerie','🥫'],
    ['lait-coco','Lait de coco','Épicerie','🥥'], ['curry','Curry','Épicerie','🌶️'],
    ['paprika','Paprika','Épicerie','🌶️'], ['cumin','Cumin','Épicerie','🌿'],
    ['bouillon','Bouillon de légumes','Épicerie','🥣'], ['sauce-soja','Sauce soja','Épicerie','🍶'],
    ['beurre-cacahuete','Beurre de cacahuète','Épicerie','🥜'], ['moutarde','Moutarde','Épicerie','🫙'],
    ['miel','Miel','Épicerie','🍯'], ['vinaigre','Vinaigre','Épicerie','🫙'],
    ['basilic','Basilic','Légumes','🌿'], ['persil','Persil','Légumes','🌿']
  ].map(([id,name,category,emoji]) => ({id,name,category,emoji}));
  const catalog = Object.fromEntries(pantrySuggestions.map(item => [item.id,item]));
  const ingredient = (id,quantity,unit='g') => ({id,name:catalog[id].name,category:catalog[id].category,quantity,unit});
  const recipes = [
    {
      id:'pates-tomates', title:'Pâtes aux tomates fondantes', subtitle:'Le bonheur tient dans une poêle.', emoji:'🍝',color:'#e8bba0',visual:'pasta',time:20,vegetarian:true,servings:2,
      ingredients:[ingredient('pates',200),ingredient('tomates',350),ingredient('ail',2,'gousse'),ingredient('fromage',40)],
      instructions:['Portez une grande casserole d’eau salée à ébullition. Faites cuire les pâtes selon le paquet et gardez une tasse d’eau de cuisson.','Coupez les tomates. Émincez l’ail et faites-le revenir une minute dans un filet d’huile, puis ajoutez les tomates et laissez compoter 8 à 10 minutes.','Mélangez les pâtes avec la sauce et un peu d’eau de cuisson. Poivrez et servez avec le fromage râpé.']
    },
    {
      id:'omelette-courgette',title:'Omelette courgette & fromage',subtitle:'Un dîner tout doux, prêt en un rien de temps.',emoji:'🍳',color:'#d7dfa9',visual:'eggs',time:15,vegetarian:true,servings:2,
      ingredients:[ingredient('oeufs',4,'pièce'),ingredient('courgette',1,'pièce'),ingredient('fromage',40)],
      instructions:['Coupez la courgette en fines demi-rondelles. Faites-la dorer 6 à 8 minutes dans une poêle huilée.','Battez les œufs avec une pincée de sel, du poivre et le fromage.','Versez sur les courgettes et faites cuire à feu doux 4 à 5 minutes, jusqu’à ce que les œufs soient pris. Repliez l’omelette et servez.']
    },
    {
      id:'riz-saute',title:'Riz sauté aux petits légumes',subtitle:'Une poêle, de la couleur, et c’est tout.',emoji:'🍚',color:'#e1ca9a',visual:'rice',time:25,vegetarian:true,servings:2,
      ingredients:[ingredient('riz',160),ingredient('oeufs',2,'pièce'),ingredient('carotte',2,'pièce'),ingredient('petits-pois',100),ingredient('sauce-soja',2,'c. à soupe')],
      instructions:['Faites cuire le riz selon le paquet puis égouttez-le. Pendant ce temps, taillez les carottes en petits dés.','Faites revenir les carottes 6 minutes dans une grande poêle huilée. Ajoutez les petits pois et poursuivez 4 minutes avec deux cuillères d’eau.','Poussez les légumes sur le côté. Brouillez les œufs dans la poêle, puis ajoutez le riz et la sauce soja. Faites sauter le tout 2 minutes.']
    },
    {
      id:'curry-pois-chiches',title:'Curry de pois chiches',subtitle:'Crémeux, parfumé et réconfortant.',emoji:'🥘',color:'#e8c482',visual:'curry',time:25,vegetarian:true,servings:2,
      ingredients:[ingredient('pois-chiches',300),ingredient('lait-coco',200,'ml'),ingredient('tomates-concassees',200),ingredient('oignon',1,'pièce'),ingredient('curry',2,'c. à café'),ingredient('riz',150)],
      instructions:['Faites cuire le riz selon le paquet. Égouttez et rincez les pois chiches, déjà cuits ou en conserve.','Émincez l’oignon et faites-le revenir 5 minutes dans un peu d’huile. Ajoutez le curry et remuez 30 secondes.','Ajoutez les tomates, le lait de coco et les pois chiches. Laissez mijoter 12 minutes, salez à votre goût et servez avec le riz.']
    },
    {
      id:'gratin-pommes-terre',title:'Petit gratin de pommes de terre',subtitle:'Doré au-dessus, fondant à cœur.',emoji:'🥔',color:'#ead4aa',visual:'gratin',time:40,vegetarian:true,servings:2,
      ingredients:[ingredient('pommes-de-terre',600),ingredient('creme',150,'ml'),ingredient('lait',100,'ml'),ingredient('fromage',60),ingredient('ail',1,'gousse')],
      instructions:['Préchauffez le four à 210 °C. Épluchez les pommes de terre et coupez-les en fines rondelles de 3 mm.','Faites-les précuire dans de l’eau frémissante salée pendant 10 minutes puis égouttez-les délicatement.','Frottez un plat à gratin adapté à la quantité avec l’ail coupé. Disposez les pommes de terre, ajoutez crème, lait, sel et poivre, puis le fromage.','Enfournez 20 à 25 minutes : le dessus doit être doré et les pommes de terre tendres sous la pointe d’un couteau.']
    },
    {
      id:'tartines-chevre',title:'Tartines chèvre & miel',subtitle:'Le petit plaisir croustillant du soir.',emoji:'🥖',color:'#e5c9a2',visual:'toast',time:12,vegetarian:true,servings:2,
      ingredients:[ingredient('pain',4,'tranche'),ingredient('chevre',120),ingredient('miel',2,'c. à café'),ingredient('salade',100)],
      instructions:['Préchauffez le four à 200 °C. Posez les tranches de pain sur une plaque.','Répartissez le chèvre en rondelles et un filet de miel sur les tartines. Poivrez et enfournez 8 à 10 minutes.','Servez dès que le fromage commence à dorer, avec la salade assaisonnée d’un peu d’huile et de sel.']
    },
    {
      id:'salade-lentilles',title:'Salade de lentilles à la feta',subtitle:'Fraîche, généreuse, et pratique à emporter.',emoji:'🥗',color:'#c6d4ad',visual:'salad',time:15,vegetarian:true,servings:2,
      ingredients:[ingredient('lentilles',300),ingredient('feta',100),ingredient('tomates',200),ingredient('concombre',0.5,'pièce'),ingredient('moutarde',1,'c. à café'),ingredient('vinaigre',1,'c. à soupe')],
      instructions:['Égouttez et rincez les lentilles déjà cuites ou en conserve. Coupez les tomates et la quantité de concombre prévue en petits morceaux.','Fouettez la moutarde et le vinaigre avec un filet d’huile. Salez légèrement et poivrez.','Mélangez les lentilles et les légumes avec la vinaigrette. Émiettez la feta au-dessus et servez frais.']
    },
    {
      id:'poulet-citron',title:'Poulet au citron & riz',subtitle:'Simple, tendre, juste ce qu’il faut de peps.',emoji:'🍋',color:'#dfd3a3',visual:'chicken',time:25,vegetarian:false,servings:2,
      ingredients:[ingredient('poulet',300),ingredient('citron',1,'pièce'),ingredient('riz',160),ingredient('ail',1,'gousse'),ingredient('creme',80,'ml')],
      instructions:['Faites cuire le riz selon le paquet. Coupez le poulet en morceaux réguliers, émincez l’ail et pressez la quantité de citron prévue.','Dans une poêle huilée, faites dorer le poulet 6 à 8 minutes. Ajoutez l’ail, la moitié du jus de citron et un petit fond d’eau.','Ajoutez la crème et laissez mijoter 5 minutes : le poulet doit être entièrement cuit à cœur. Salez, poivrez et servez avec le riz. Ajoutez le jus de citron restant selon votre goût.']
    },
    {
      id:'gnocchis-champignons',title:'Gnocchis poêlés aux champignons',subtitle:'Croustillants dehors, moelleux dedans.',emoji:'🍄',color:'#d4c4b2',visual:'gnocchi',time:15,vegetarian:true,servings:2,
      ingredients:[ingredient('gnocchis',400),ingredient('champignons',250),ingredient('creme',100,'ml'),ingredient('ail',1,'gousse')],
      instructions:['Consultez le paquet de gnocchis : s’ils ne sont pas prévus pour cuire directement à la poêle, faites-les d’abord cuire à l’eau selon les instructions puis égouttez-les.','Coupez les champignons en lamelles. Faites-les revenir à feu vif dans un filet d’huile pendant 5 minutes.','Ajoutez l’ail émincé et les gnocchis. Faites-les dorer en remuant : suivez le temps du paquet pour des gnocchis à poêler, ou comptez 3 à 4 minutes pour des gnocchis déjà précuits à l’eau.','Versez la crème et un petit fond d’eau. Laissez épaissir 2 minutes à feu doux, salez et poivrez.']
    },
    {
      id:'veloute-carottes',title:'Velouté de carottes au coco',subtitle:'Un bol de soleil pour les soirs frais.',emoji:'🥕',color:'#e8b98f',visual:'soup',time:30,vegetarian:true,servings:2,
      ingredients:[ingredient('carotte',500),ingredient('oignon',1,'pièce'),ingredient('lait-coco',150,'ml'),ingredient('bouillon',0.5,'cube')],
      instructions:['Épluchez les carottes et coupez-les en fines rondelles. Émincez l’oignon.','Faites revenir l’oignon dans une casserole huilée pendant 3 minutes. Ajoutez les carottes et le bouillon, puis couvrez d’eau juste à hauteur.','Laissez frémir à couvert 20 minutes, jusqu’à ce que les carottes soient bien tendres. Ajoutez le lait de coco puis mixez. Ajustez la consistance avec un peu d’eau.']
    },
    {
      id:'wraps-haricots',title:'Wraps aux haricots rouges',subtitle:'À garnir, à rouler, à partager.',emoji:'🌯',color:'#dcb5a1',visual:'wrap',time:15,vegetarian:true,servings:2,
      ingredients:[ingredient('tortillas',4,'pièce'),ingredient('haricots-rouges',250),ingredient('mais',100),ingredient('tomates',150),ingredient('yaourt',100),ingredient('cumin',1,'c. à café')],
      instructions:['Rincez les haricots et le maïs en conserve puis égouttez-les. Réchauffez-les 5 minutes dans une poêle avec le cumin et deux cuillères d’eau.','Coupez les tomates en dés. Salez et poivrez le yaourt. Réchauffez les tortillas selon le paquet.','Garnissez chaque tortilla de haricots, de maïs, de tomates et de yaourt. Repliez le bas puis roulez les côtés.']
    },
    {
      id:'shakshuka',title:'Œufs dans leur sauce tomate',subtitle:'Le plat à poser au milieu de la table.',emoji:'🍳',color:'#e6ab92',visual:'eggs',time:25,vegetarian:true,servings:2,
      ingredients:[ingredient('oeufs',4,'pièce'),ingredient('tomates-concassees',400),ingredient('poivron',1,'pièce'),ingredient('oignon',1,'pièce'),ingredient('paprika',1,'c. à café')],
      instructions:['Émincez l’oignon et le poivron. Faites-les revenir dans une poêle huilée 7 à 8 minutes.','Ajoutez le paprika et les tomates concassées. Salez, poivrez et laissez mijoter 8 minutes.','Creusez un petit puits par œuf dans la sauce et cassez-y les œufs. Couvrez et faites cuire à feu doux 5 à 7 minutes, jusqu’à ce que les blancs soient pris.']
    },
    {
      id:'croque-monsieur',title:'Croque-monsieur bien doré',subtitle:'Un classique qui fait toujours plaisir.',emoji:'🥪',color:'#e2c291',visual:'toast',time:15,vegetarian:false,servings:2,
      ingredients:[ingredient('pain',4,'tranche'),ingredient('jambon',2,'tranche'),ingredient('fromage',80),ingredient('creme',2,'c. à soupe')],
      instructions:['Préchauffez le four à 200 °C. Tartinez la moitié des tranches de pain prévues avec la moitié de la crème.','Ajoutez le jambon et la moitié du fromage, puis refermez avec le pain restant. Répartissez le reste de crème et de fromage sur le dessus.','Enfournez 10 à 12 minutes, jusqu’à ce que le fromage soit fondu et le dessus doré.']
    },
    {
      id:'salade-riz-thon',title:'Salade de riz au thon',subtitle:'Le bon plan pour le déjeuner de demain.',emoji:'🥗',color:'#d2d5a6',visual:'rice',time:25,vegetarian:false,servings:2,
      ingredients:[ingredient('riz',160),ingredient('thon',140),ingredient('tomates',200),ingredient('mais',100),ingredient('citron',0.5,'pièce')],
      instructions:['Faites cuire le riz selon le paquet, égouttez-le puis rincez-le brièvement à l’eau froide pour le refroidir.','Égouttez le thon et le maïs. Coupez les tomates en dés.','Mélangez le tout avec le jus de citron et deux cuillères à soupe d’huile. Salez et poivrez. Pour conserver la salade, placez-la rapidement au réfrigérateur.']
    },
    {
      id:'quiche-sans-pate',title:'Quiche légère sans pâte',subtitle:'Tout le moelleux, la pâte en moins.',emoji:'🥧',color:'#e4d49f',visual:'gratin',time:35,vegetarian:true,servings:2,
      ingredients:[ingredient('oeufs',3,'pièce'),ingredient('lait',200,'ml'),ingredient('farine',50),ingredient('fromage',70),ingredient('courgette',1,'pièce')],
      instructions:['Préchauffez le four à 190 °C. Râpez la courgette et pressez-la dans un torchon propre pour retirer l’excès d’eau.','Fouettez les œufs avec la farine, puis versez le lait progressivement. Ajoutez le fromage et la courgette, salez et poivrez.','Versez dans un plat huilé adapté à la quantité et enfournez 25 à 30 minutes, jusqu’à ce que le centre soit pris et la surface dorée.']
    },
    {
      id:'semoule-legumes',title:'Semoule aux légumes dorés',subtitle:'Le soleil s’invite dans le bol.',emoji:'🥣',color:'#d7ca9b',visual:'rice',time:20,vegetarian:true,servings:2,
      ingredients:[ingredient('semoule',160),ingredient('courgette',1,'pièce'),ingredient('carotte',2,'pièce'),ingredient('pois-chiches',150),ingredient('cumin',1,'c. à café')],
      instructions:['Coupez la courgette et les carottes en petits dés. Faites-les revenir dans une poêle huilée 10 minutes avec le cumin et un petit fond d’eau.','Ajoutez les pois chiches déjà cuits et égouttés. Laissez réchauffer 3 minutes, salez et poivrez.','Préparez la semoule avec de l’eau bouillante selon le paquet. Égrainez-la à la fourchette avec un filet d’huile et servez avec les légumes.']
    },
    {
      id:'poelee-pommes-terre',title:'Poêlée rustique & œuf au plat',subtitle:'Trois ingrédients, un vrai bon repas.',emoji:'🥔',color:'#d9c098',visual:'eggs',time:30,vegetarian:true,servings:2,
      ingredients:[ingredient('pommes-de-terre',500),ingredient('oeufs',2,'pièce'),ingredient('oignon',1,'pièce')],
      instructions:['Coupez les pommes de terre en petits cubes de 1 cm. Faites-les précuire 8 minutes dans l’eau bouillante puis égouttez-les.','Faites dorer l’oignon émincé et les pommes de terre dans une grande poêle huilée 10 à 12 minutes. Remuez régulièrement.','Repoussez les pommes de terre sur les côtés, cassez les œufs au centre et couvrez 3 à 4 minutes. Salez, poivrez et servez quand les blancs sont pris.']
    },
    {
      id:'nouilles-cacahuete',title:'Nouilles sauce cacahuète',subtitle:'Crémeuses, croquantes, irrésistibles.',emoji:'🍜',color:'#d6c49e',visual:'pasta',time:20,vegetarian:true,servings:2,
      ingredients:[ingredient('nouilles',180),ingredient('carotte',2,'pièce'),ingredient('beurre-cacahuete',2,'c. à soupe'),ingredient('sauce-soja',2,'c. à soupe'),ingredient('citron',0.5,'pièce')],
      instructions:['Faites cuire les nouilles selon le paquet. Gardez une tasse d’eau de cuisson avant d’égoutter.','Taillez les carottes en fins rubans avec un économe. Faites-les sauter 3 minutes dans une poêle avec un filet d’huile.','Mélangez le beurre de cacahuète, la sauce soja, le jus de citron et un peu d’eau de cuisson. Versez sur les nouilles et les carottes, puis mélangez sur feu doux une minute.']
    },
    {
      id:'pates-epinards',title:'Pâtes crémeuses aux épinards',subtitle:'Votre dîner vert et généreux.',emoji:'🍝',color:'#bfcba0',visual:'pasta',time:20,vegetarian:true,servings:2,
      ingredients:[ingredient('pates',200),ingredient('epinards',250),ingredient('creme',100,'ml'),ingredient('ail',1,'gousse'),ingredient('fromage',40)],
      instructions:['Faites cuire les pâtes dans l’eau bouillante salée selon le paquet. Gardez un peu d’eau de cuisson.','Faites revenir l’ail émincé une minute dans un filet d’huile. Ajoutez les épinards frais ou décongelés et égouttés, puis faites cuire 4 à 5 minutes.','Ajoutez la crème et le fromage, puis les pâtes. Détendez avec un peu d’eau de cuisson, poivrez et servez bien chaud.']
    },
    {
      id:'quesadillas',title:'Quesadillas fromage & maïs',subtitle:'À couper en triangles et à picorer.',emoji:'🫓',color:'#e6c889',visual:'wrap',time:15,vegetarian:true,servings:2,
      ingredients:[ingredient('tortillas',4,'pièce'),ingredient('fromage',120),ingredient('mais',100),ingredient('poivron',1,'pièce')],
      instructions:['Coupez le poivron en très petits dés et faites-le revenir 5 minutes dans un filet d’huile. Ajoutez le maïs égoutté.','Répartissez les légumes et le fromage sur la moitié des tortillas prévues, puis recouvrez avec les tortillas restantes.','Faites dorer chaque quesadilla dans une poêle à feu moyen 2 à 3 minutes par face. Retournez avec une assiette et coupez en triangles.']
    },
    {
      id:'brocoli-feta',title:'Brocoli rôti, pois chiches & feta',subtitle:'Le four s’occupe de tout ou presque.',emoji:'🥦',color:'#bccda2',visual:'salad',time:30,vegetarian:true,servings:2,
      ingredients:[ingredient('brocoli',1,'pièce'),ingredient('pois-chiches',250),ingredient('feta',100),ingredient('citron',0.5,'pièce'),ingredient('paprika',1,'c. à café')],
      instructions:['Préchauffez le four à 210 °C. Détaillez le brocoli en petites fleurettes et coupez le pied épluché en morceaux.','Étalez sur une plaque avec les pois chiches déjà cuits, égouttés et bien séchés. Ajoutez deux cuillères d’huile, le paprika, le sel et le poivre.','Enfournez 20 à 25 minutes en remuant à mi-cuisson. Ajoutez la feta émiettée et le jus de citron au moment de servir.']
    },
    {
      id:'soupe-lentilles',title:'Soupe de lentilles & tomates',subtitle:'Une grande cuillère de réconfort.',emoji:'🥣',color:'#cba78b',visual:'soup',time:25,vegetarian:true,servings:2,
      ingredients:[ingredient('lentilles',300),ingredient('tomates-concassees',200),ingredient('carotte',2,'pièce'),ingredient('oignon',1,'pièce'),ingredient('bouillon',0.5,'cube')],
      instructions:['Coupez les carottes en très petits dés et émincez l’oignon. Faites-les revenir 4 minutes dans une casserole huilée.','Ajoutez les tomates et le bouillon, puis de l’eau juste à hauteur. Faites frémir 15 minutes, jusqu’à ce que les carottes soient tendres.','Ajoutez les lentilles déjà cuites et égouttées. Réchauffez 3 minutes et ajustez la consistance avec un peu d’eau. Poivrez, ajustez le sel et servez.']
    }
  ];
  const aliases = {
    oeufs:['œuf','œufs','oeuf','oeufs','eggs'],tomates:['tomate'],courgette:['courgettes'],carotte:['carotte','carottes'],
    oignon:['oignons'],ail:['gousse d’ail','gousses d’ail','gousse ail','gousses ail'],
    'pommes-de-terre':['pomme de terre','pommes de terre','patate','patates'],
    epinards:['epinard','épinard'],brocoli:['brocolis','broccoli'],poivron:['poivrons'],champignons:['champignon'],
    salade:['laitue'],concombre:['concombres'],citron:['citrons'], 'patate-douce':['patates douces'],
    aubergine:['aubergines'], 'petits-pois':['petit pois'],
    creme:['crème','creme fraiche','crème fraîche','crème liquide','creme liquide'],
    fromage:['fromage rape','fromages','emmental','gruyere','gruyère','comté'],
    chevre:['chevre','chèvre','buche de chevre','fromage de chèvre'],
    feta:['fêta'],mozzarella:['mozza'],yaourt:['yaourts','yaourt nature','yogourt'],
    poulet:['blanc de poulet','filet de poulet','blancs de poulet','filets de poulet'],
    pates:['pâte','pate','spaghetti','spaghettis','penne','tagliatelles','coquillettes','macaroni'],
    semoule:['couscous'],nouilles:['nouille'],gnocchis:['gnocchi'],pain:['pain de mie','baguette'],
    tortillas:['tortilla','wrap','wraps'], 'pois-chiches':['pois chiche','pois chiches','pois chiches cuits'],
    lentilles:['lentille','lentilles cuites','lentilles vertes cuites','lentilles en conserve'],
    'haricots-rouges':['haricot rouge','haricots rouges','haricots rouges cuits'],mais:['maïs','mais en boite'],
    thon:['thon en boite','thon en boîte','thon au naturel'],
    'tomates-concassees':['tomate concassee','tomates concassees','pulpe de tomate','tomates en boite','tomates pelees'],
    'lait-coco':['lait de coco','lait coco'],curry:['curry en poudre'],bouillon:['bouillon de legumes','cube de bouillon'],
    'sauce-soja':['sauce de soja','soja','sauce soja'],
    'beurre-cacahuete':['beurre de cacahuete','beurre de cacahuetes','purée de cacahuète','pate de cacahuetes']
  };
  globalThis.MealData = {recipes,pantrySuggestions,aliases};
})();
