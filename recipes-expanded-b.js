/* Collection complémentaire : légumes, bols, soupes, desserts et petits déjeuners. */
(() => {
  'use strict';
  const data = globalThis.MealData;
  const catalog = new Map(data.pantrySuggestions.map(item => [item.id, item]));
  const additions = [];
  const ingredients = text => text.split('|').map(value => {
    const [id, amount, unit = 'g'] = value.split(':');
    const item = catalog.get(id);
    if (!item) throw new Error(`Ingrédient inconnu dans la collection B : ${id}`);
    return {id, name:item.name, category:item.category, quantity:Number(amount), unit};
  });
  const add = (id, title, time, category, photoKey, items, instructions, subtitle) => additions.push({
    id:`b-${id}`, title, time, category, photoKey, visual:photoKey, vegetarian:true, servings:2,
    subtitle:subtitle || 'Des ingrédients simples, une nouvelle façon de les cuisiner.',
    ingredients:ingredients(items), instructions
  });
  const salad = (id, title, time, items, prep, sauce, finish, subtitle) => add(id,title,time,'Salades','salad',items,[prep,sauce,finish],subtitle);
  const soup = (id, title, time, items, prep, cook, finish, subtitle) => add(id,title,time,'Soupes','soup',items,[prep,cook,finish],subtitle);
  const veg = (id,title,time,photoKey,items,steps,subtitle) => add(id,title,time,'Végétarien',photoKey,items,steps,subtitle);
  const dessert = (id,title,time,photoKey,items,steps,subtitle) => add(id,title,time,'Desserts',photoKey,items,steps,subtitle);
  const breakfast = (id,title,time,photoKey,items,steps,subtitle) => add(id,title,time,'Petit-déjeuner',photoKey,items,steps,subtitle);

  // 30 salades : légumes crus, céréales et légumineuses, sans protéines animales cachées.
  salad('quinoa-avocat-mangue','Quinoa, avocat et mangue',25,'quinoa:140|avocat:1:pièce|mangue:0.5:pièce|citron-vert:1:pièce|coriandre:8',
    'Rincez le quinoa puis cuisez-le selon le paquet. Étalez-le dans un plat pour le laisser tiédir. Coupez la mangue et l’avocat en dés.',
    'Pressez le citron vert et mélangez le jus avec un filet d’huile, du sel et la coriandre ciselée.',
    'Réunissez quinoa, avocat et mangue. Versez la sauce et mélangez délicatement avant de servir.','Un bol frais et acidulé, à emporter aussi.');
  salad('boulgour-poivron-persil','Taboulé de boulgour au persil',25,'boulgour:140|poivron:1:pièce|tomates:200|persil:25|citron:1:pièce',
    'Faites cuire le boulgour selon le paquet puis laissez-le refroidir. Coupez tomates et poivron en très petits dés.',
    'Hachez le persil. Mélangez-le avec le jus de citron, de l’huile, du sel et du poivre.',
    'Incorporez les légumes et l’assaisonnement au boulgour. Goûtez et ajustez le citron.','Beaucoup d’herbes, des légumes et du croquant.');
  salad('haricots-blancs-asperges','Haricots blancs et asperges au citron',25,'haricots-blancs:300|asperges:250|tomates:150|citron:0.5:pièce|moutarde:1:c. à café',
    'Égouttez les haricots blancs déjà cuits. Éliminez la base dure des asperges et cuisez-les 6 à 9 minutes à l’eau frémissante, puis rafraîchissez-les.',
    'Fouettez la moutarde avec le jus de citron et un filet d’huile. Coupez les tomates en quartiers.',
    'Mélangez haricots, tomates et asperges en tronçons avec la sauce. Salez modérément et poivrez.');
  salad('chou-pomme-noix','Chou rouge, pomme et noix',15,'chou-rouge:250|pomme:1:pièce|noix:40|yaourt:100|moutarde:1:c. à café|vinaigre:1:c. à soupe',
    'Retirez les grosses côtes du chou et émincez-le très finement. Coupez la pomme en allumettes et concassez les noix.',
    'Mélangez le yaourt avec la moutarde, le vinaigre, une pincée de sel et du poivre.',
    'Enrobez le chou et la pomme de sauce. Ajoutez les noix juste au moment de servir.','Une salade croquante, même en plein hiver.');
  salad('carottes-orange-raisins','Carottes, orange et raisins secs',15,'carotte:300|orange:1:pièce|raisins-secs:30|cumin:0.5:c. à café|persil:8',
    'Râpez les carottes. Pelez l’orange à vif au-dessus d’un bol pour recueillir le jus, puis détachez les quartiers.',
    'Mélangez le jus récupéré avec le cumin, un filet d’huile et une pincée de sel.',
    'Réunissez carottes, orange et raisins secs. Ajoutez la sauce et le persil ciselé.');
  salad('betterave-chevre-noix','Betteraves au chèvre et aux noix',12,'betterave:300|chevre:100|noix:35|salade:80|vinaigre-balsamique:1:c. à soupe',
    'Utilisez des betteraves déjà cuites. Coupez-les en dés et répartissez-les sur la salade lavée et essorée.',
    'Mélangez le vinaigre balsamique avec de l’huile et du poivre. Salez très légèrement car le fromage l’est déjà.',
    'Ajoutez le chèvre émietté et les noix concassées. Versez la vinaigrette au dernier moment.');
  salad('fenouil-orange-olives','Fenouil, orange et olives noires',15,'fenouil:1:pièce|orange:1:pièce|olives-noires:50|citron:0.5:pièce|persil:8',
    'Retirez la base du fenouil puis émincez-le finement. Pelez l’orange à vif et coupez-la en morceaux.',
    'Fouettez le jus de citron avec de l’huile et du poivre. Dénoyautez les olives si nécessaire.',
    'Mélangez fenouil, orange et olives. Ajoutez le persil et la sauce, puis goûtez avant de saler.');
  salad('concombre-aneth-yaourt','Concombre frais à l’aneth',10,'concombre:1:pièce|yaourt-grec:150|aneth:10|citron:0.5:pièce|ail:0.5:gousse',
    'Coupez le concombre en fines rondelles et épongez-le s’il rend beaucoup d’eau. Ciselez l’aneth et écrasez l’ail.',
    'Mélangez le yaourt grec, le jus de citron, l’ail et l’aneth. Salez et poivrez.',
    'Enrobez le concombre de cette sauce et gardez au frais jusqu’au repas.','Fraîche et crémeuse, sans cuisson.');
  salad('brocoli-amandes','Brocoli croquant, amandes et citron',20,'brocoli:400|amandes:40|citron:0.5:pièce|moutarde:1:c. à café|yaourt:80',
    'Détachez de petites fleurettes de brocoli et blanchissez-les 3 à 4 minutes à l’eau bouillante. Rafraîchissez-les et égouttez très soigneusement.',
    'Mélangez yaourt, moutarde, jus de citron, sel et poivre. Faites dorer les amandes dans une poêle sèche.',
    'Enrobez le brocoli de sauce et ajoutez les amandes juste avant de servir.');
  salad('pommes-terre-haricots','Pommes de terre et haricots verts',30,'pommes-de-terre:450|haricots-verts:250|moutarde:2:c. à café|vinaigre:1:c. à soupe|echalote:1:pièce',
    'Cuisez les pommes de terre en morceaux 15 à 20 minutes à l’eau salée. Faites cuire les haricots verts à part 8 à 10 minutes, puis égouttez.',
    'Émincez l’échalote. Fouettez la moutarde avec le vinaigre, de l’huile, du sel et du poivre.',
    'Mélangez les légumes encore tièdes avec la vinaigrette et l’échalote. Servez tiède ou froid.');
  salad('sarrasin-champignons','Sarrasin, champignons et noisettes',30,'sarrasin:140|champignons:250|noisettes:35|persil:10|vinaigre:1:c. à soupe',
    'Faites cuire le sarrasin selon le paquet puis égouttez-le. Faites dorer les champignons émincés dans une poêle huilée pendant 8 minutes.',
    'Concassez les noisettes et ciselez le persil. Mélangez le vinaigre avec de l’huile, du sel et du poivre.',
    'Réunissez le sarrasin tiède, les champignons et la sauce. Parsemez de persil et de noisettes.');
  salad('semoule-abricots-menthe','Semoule aux abricots secs et à la menthe',15,'semoule:140|abricots-secs:50|concombre:0.5:pièce|amandes:30|menthe:10|citron:0.5:pièce',
    'Préparez la semoule avec l’eau chaude indiquée sur le paquet. Égrenez à la fourchette et laissez tiédir. Coupez concombre et abricots secs en petits dés.',
    'Mélangez le jus de citron avec un filet d’huile et une pincée de sel. Ciselez la menthe.',
    'Incorporez les dés de concombre et d’abricot, les amandes et la menthe à la semoule. Assaisonnez.');
  salad('lentilles-betterave-roquette','Lentilles, betterave et roquette',15,'lentilles:300|betterave:200|roquette:60|moutarde:1:c. à café|vinaigre:1:c. à soupe|noix:25',
    'Égouttez les lentilles déjà cuites et coupez la betterave cuite en dés. Lavez et essorez la roquette.',
    'Fouettez moutarde, vinaigre, huile, sel et poivre. Concassez les noix.',
    'Mélangez les lentilles et la betterave avec la sauce. Ajoutez roquette et noix au moment de servir.');
  salad('pois-chiches-tahin','Pois chiches, concombre et sauce tahin',15,'pois-chiches:300|concombre:0.5:pièce|tomates:200|tahin:25|citron:0.5:pièce|persil:10',
    'Égouttez les pois chiches déjà cuits. Coupez concombre et tomates en dés et ciselez le persil.',
    'Délayez le tahin avec le jus de citron puis ajoutez progressivement un peu d’eau jusqu’à obtenir une sauce fluide. Salez.',
    'Mélangez les pois chiches et les légumes. Ajoutez la sauce et le persil.');
  salad('haricots-avocat-mais','Haricots rouges, avocat et maïs',15,'haricots-rouges:250|mais:120|avocat:1:pièce|citron-vert:1:pièce|coriandre:10|cumin:0.5:c. à café',
    'Rincez et égouttez les haricots rouges déjà cuits ainsi que le maïs. Coupez l’avocat en dés.',
    'Mélangez le jus de citron vert avec le cumin, un filet d’huile et du sel. Ciselez la coriandre.',
    'Réunissez haricots, maïs, avocat et coriandre. Enrobez de sauce sans écraser l’avocat.');
  salad('tomates-peche-burrata','Tomates, pêche et burrata',12,'tomates:300|peche:1:pièce|burrata:125|basilic:10|vinaigre-balsamique:1:c. à café',
    'Coupez les tomates et la pêche en quartiers. Disposez-les dans un plat et salez légèrement les tomates.',
    'Égouttez la burrata et ouvrez-la délicatement sur les fruits. Déchirez le basilic à la main.',
    'Ajoutez basilic, huile, poivre et un trait de vinaigre balsamique. Servez immédiatement.','Une assiette d’été, douce et juteuse.');
  salad('melon-concombre-feta','Melon, concombre et feta',12,'melon:0.5:pièce|concombre:0.5:pièce|feta:100|menthe:10|citron-vert:0.5:pièce',
    'Retirez peau et pépins du melon et coupez la chair en dés. Coupez le concombre en morceaux.',
    'Pressez le citron vert et mélangez son jus avec un peu d’huile et du poivre. Ciselez la menthe.',
    'Réunissez melon, concombre, feta émiettée et menthe. Ajoutez la sauce et goûtez avant de saler.');
  salad('panais-carotte-pomme','Rémoulade de panais, carotte et pomme',15,'panais:150|carotte:150|pomme:1:pièce|yaourt:100|moutarde:1:c. à café|citron:0.5:pièce',
    'Épluchez le panais et les carottes puis râpez-les. Râpez la pomme ou coupez-la en fines allumettes.',
    'Mélangez yaourt, moutarde et jus de citron. Salez et poivrez.',
    'Mélangez immédiatement les légumes et la pomme à la sauce pour éviter qu’ils ne s’oxydent.');
  salad('quinoa-patate-douce','Quinoa et patate douce rôtie',35,'quinoa:120|patate-douce:300|epinards:80|feta:80|citron:0.5:pièce|paprika:1:c. à café',
    'Préchauffez le four à 210 °C. Coupez la patate douce en petits dés, enrobez-les d’huile et de paprika, puis enfournez 20 à 25 minutes. Faites cuire le quinoa selon le paquet.',
    'Rincez les jeunes épinards et coupez la feta. Préparez une sauce avec le jus de citron, de l’huile et du poivre.',
    'Mélangez quinoa et patate douce tièdes. Ajoutez épinards, feta et sauce.');
  salad('chou-fleur-roti-pois-chiches','Chou-fleur rôti et pois chiches citronnés',35,'chou-fleur:400|pois-chiches:200|cumin:1:c. à café|yaourt:100|citron:0.5:pièce|persil:10',
    'Préchauffez le four à 210 °C. Coupez le chou-fleur en petites fleurettes. Égouttez et séchez les pois chiches déjà cuits, puis enrobez le tout d’huile et de cumin.',
    'Étalez sur une plaque et enfournez 25 minutes en remuant à mi-cuisson. Mélangez yaourt, jus de citron, sel et poivre.',
    'Laissez les légumes tiédir et servez-les avec le yaourt citronné et le persil ciselé.');
  salad('haricots-noirs-patate-douce','Haricots noirs et patate douce au citron vert',35,'haricots-noirs:250|patate-douce:250|mais:100|citron-vert:1:pièce|coriandre:10|paprika:1:c. à café',
    'Coupez la patate douce en petits dés et faites-les rôtir à 210 °C avec huile et paprika pendant 25 minutes. Rincez les haricots noirs déjà cuits et le maïs.',
    'Mélangez le jus de citron vert avec un filet d’huile et une pincée de sel. Ciselez la coriandre.',
    'Réunissez les légumes tièdes, haricots et maïs. Ajoutez la sauce et la coriandre.');
  salad('roquette-poire-parmesan','Roquette, poire et parmesan',12,'roquette:100|poire:1:pièce|parmesan:50|noix:35|vinaigre-balsamique:1:c. à soupe',
    'Lavez et essorez la roquette. Coupez la poire en fines tranches et faites des copeaux de parmesan.',
    'Mélangez le vinaigre balsamique avec un filet d’huile et du poivre. Concassez les noix.',
    'Disposez roquette, poire, parmesan et noix. Assaisonnez juste avant de servir.');
  salad('edamame-concombre-sesame','Edamame, concombre et sésame',15,'edamame:250|concombre:0.5:pièce|carotte:1:pièce|sauce-soja:1:c. à soupe|graines-sesame:15|citron-vert:0.5:pièce',
    'Faites cuire les edamame écossés selon le paquet puis rafraîchissez-les. Coupez le concombre en petits morceaux et râpez la carotte.',
    'Mélangez sauce soja et jus de citron vert avec un filet d’huile et un peu d’eau.',
    'Réunissez les légumes et les edamame. Versez la sauce et parsemez de sésame.');
  salad('salade-nouilles-mangue','Nouilles de riz, mangue et cacahuètes',25,'nouilles-riz:140|mangue:0.5:pièce|carotte:1:pièce|cacahuetes:30|citron-vert:1:pièce|sauce-soja:1:c. à soupe|menthe:8',
    'Cuisez les nouilles de riz selon le paquet puis rincez-les à l’eau froide. Coupez mangue et carotte en fins bâtonnets.',
    'Mélangez jus de citron vert, sauce soja, un filet d’huile et un peu d’eau. Ciselez la menthe.',
    'Mélangez nouilles, légumes, mangue et sauce. Ajoutez cacahuètes concassées et menthe.');
  salad('panzanella','Panzanella aux tomates et pain grillé',20,'pain:120|tomates:400|concombre:0.5:pièce|oignon-rouge:0.5:pièce|basilic:10|vinaigre:1:c. à soupe',
    'Coupez le pain en cubes et faites-les dorer dans une poêle avec un filet d’huile. Coupez tomates et concombre, puis émincez l’oignon rouge.',
    'Salez les tomates et laissez-les rendre un peu de jus. Ajoutez le vinaigre et de l’huile.',
    'Mélangez les légumes, leur jus et le pain grillé. Ajoutez le basilic et laissez le pain s’imprégner quelques minutes.');
  salad('lentilles-carottes-cumin','Lentilles aux carottes rôties et cumin',35,'lentilles:300|carotte:300|cumin:1:c. à café|yaourt:100|citron:0.5:pièce|persil:8',
    'Coupez les carottes en fins bâtonnets. Enrobez-les d’huile et de cumin, puis faites-les rôtir 25 minutes à 210 °C. Égouttez les lentilles déjà cuites.',
    'Mélangez le yaourt et le jus de citron avec sel et poivre. Ciselez le persil.',
    'Servez les lentilles avec les carottes tièdes, la sauce au yaourt et le persil.');
  salad('betterave-orange-feta','Betteraves, orange et feta',15,'betterave:250|orange:1:pièce|feta:80|salade:80|noisettes:25|vinaigre:1:c. à café',
    'Coupez les betteraves déjà cuites en quartiers. Pelez l’orange à vif au-dessus d’un bol pour recueillir le jus. Lavez la salade.',
    'Mélangez le jus d’orange récupéré avec vinaigre, huile et poivre. Concassez les noisettes.',
    'Disposez salade, betteraves, orange et feta émiettée. Ajoutez vinaigrette et noisettes.');
  salad('chou-kale-pomme-graines','Chou kale, pomme et graines de courge',15,'chou-kale:180|pomme:1:pièce|graines-courge:30|cranberries:30|citron:0.5:pièce|moutarde:1:c. à café',
    'Retirez les grosses tiges du kale et émincez les feuilles. Massez-les une minute avec un peu d’huile et de sel pour les attendrir.',
    'Coupez la pomme en allumettes. Mélangez jus de citron, moutarde et un filet d’huile.',
    'Ajoutez au kale la pomme, les cranberries et les graines de courge, puis la vinaigrette.');
  salad('riz-complet-champignons','Riz complet, champignons et roquette',40,'riz-complet:140|champignons:250|roquette:60|noix:25|citron:0.5:pièce|persil:8',
    'Faites cuire le riz complet selon le paquet. Émincez les champignons et faites-les dorer dans une poêle huilée pendant 8 minutes.',
    'Mélangez jus de citron, huile, sel et poivre. Ciselez le persil et concassez les noix.',
    'Laissez le riz tiédir, puis mélangez-le aux champignons et à la vinaigrette. Ajoutez roquette, persil et noix.');
  salad('feves-petits-pois-menthe','Fèves, petits pois et menthe',20,'feves:200|petits-pois:150|feta:80|menthe:10|citron:0.5:pièce|salade:60',
    'Cuisez les fèves écossées et les petits pois selon leur paquet. Rafraîchissez-les et retirez la peau des fèves si elle est épaisse.',
    'Ciselez la menthe et mélangez-la au jus de citron avec de l’huile et du poivre.',
    'Disposez les légumineuses sur la salade. Ajoutez feta émiettée et sauce citronnée.');

  // 30 soupes, avec temps de cuisson adaptés aux légumes et légumineuses utilisés.
  soup('potimarron-chataignes','Velouté de potimarron et châtaignes',35,'potimarron:500|chataignes-cuites:120|oignon:1:pièce|bouillon:0.5:cube|creme:60:ml',
    'Brossez le potimarron, retirez les graines et coupez-le en petits morceaux. Émincez l’oignon. Utilisez des châtaignes déjà cuites.',
    'Faites revenir l’oignon dans une casserole huilée. Ajoutez potimarron, châtaignes et bouillon, puis de l’eau juste à hauteur. Laissez frémir 25 minutes.',
    'Mixez avec la crème. Ajustez la texture avec un peu d’eau chaude et rectifiez le sel.');
  soup('butternut-curry','Velouté de butternut au curry',35,'butternut:500|lait-coco:150:ml|oignon:1:pièce|curry:1:c. à café|bouillon:0.5:cube',
    'Épluchez et épépinez la butternut puis coupez-la en petits dés. Émincez l’oignon.',
    'Faites revenir oignon et curry dans un peu d’huile. Ajoutez la courge, le bouillon et de l’eau juste à hauteur. Laissez cuire 25 minutes à couvert.',
    'Ajoutez le lait de coco puis mixez jusqu’à obtenir un velouté lisse. Réchauffez sans faire bouillir fortement.');
  soup('poireaux-pommes-terre','Soupe de poireaux et pommes de terre',35,'poireau:350|pommes-de-terre:250|bouillon:0.5:cube|beurre:15|creme:50:ml',
    'Lavez soigneusement les poireaux et émincez-les. Épluchez les pommes de terre et coupez-les en dés.',
    'Faites fondre les poireaux 5 minutes dans le beurre. Ajoutez les pommes de terre, le bouillon et de l’eau juste à hauteur. Laissez cuire 20 à 25 minutes.',
    'Mixez avec la crème. Vérifiez que les pommes de terre sont tendres et ajustez l’assaisonnement.');
  soup('courgette-chevre','Velouté de courgettes au chèvre',25,'courgette:500|chevre:80|oignon:0.5:pièce|bouillon:0.5:cube|basilic:8',
    'Coupez les courgettes en morceaux et émincez l’oignon. Réservez quelques feuilles de basilic.',
    'Faites revenir l’oignon dans un peu d’huile. Ajoutez les courgettes, le bouillon et de l’eau aux trois quarts de la hauteur. Laissez frémir 15 minutes.',
    'Mixez avec le chèvre et le basilic. Ajoutez de l’eau si le velouté est trop épais, puis goûtez avant de saler.');
  soup('tomates-roties-basilic','Soupe de tomates rôties au basilic',45,'tomates:650|oignon:1:pièce|ail:2:gousse|basilic:10|bouillon:0.5:cube',
    'Préchauffez le four à 210 °C. Coupez tomates et oignon en quartiers et pelez l’ail. Étalez le tout dans un plat, arrosez d’huile et salez légèrement.',
    'Faites rôtir 30 minutes. Transférez les légumes et leur jus dans une casserole avec le bouillon et un peu d’eau chaude.',
    'Mixez avec le basilic puis ajustez la consistance et réchauffez quelques minutes.');
  soup('chou-fleur-muscade','Crème de chou-fleur à la muscade',30,'chou-fleur:500|pommes-de-terre:150|lait:150:ml|bouillon:0.5:cube|muscade:0.25:c. à café',
    'Détaillez le chou-fleur en petites fleurettes. Épluchez et coupez les pommes de terre en dés.',
    'Placez les légumes dans une casserole avec le bouillon et de l’eau à hauteur. Laissez cuire à couvert 20 minutes, jusqu’à ce que tout soit tendre.',
    'Ajoutez le lait et la muscade puis mixez. Réchauffez doucement et rectifiez l’assaisonnement.');
  soup('brocoli-fromage','Velouté de brocoli au fromage',25,'brocoli:450|pommes-de-terre:150|fromage:70|oignon:0.5:pièce|bouillon:0.5:cube',
    'Coupez le brocoli en petites fleurettes et la tige pelée en dés. Épluchez et coupez les pommes de terre, puis émincez l’oignon.',
    'Faites revenir l’oignon. Ajoutez pommes de terre, tige du brocoli et bouillon avec de l’eau à hauteur. Cuisez 10 minutes, ajoutez les fleurettes et poursuivez 8 minutes.',
    'Mixez puis incorporez le fromage hors du feu. Poivrez et goûtez avant de saler.');
  soup('petits-pois-menthe','Velouté de petits pois à la menthe',20,'petits-pois:400|oignon:0.5:pièce|menthe:10|bouillon:0.5:cube|creme:60:ml',
    'Émincez l’oignon et effeuillez la menthe. Utilisez des petits pois frais ou surgelés.',
    'Faites revenir l’oignon dans un peu d’huile. Ajoutez les petits pois, le bouillon et de l’eau juste à hauteur, puis cuisez 10 minutes.',
    'Ajoutez crème et menthe, mixez finement puis réchauffez sans prolonger la cuisson.');
  soup('epinards-coco','Soupe d’épinards au lait de coco',25,'epinards:350|pommes-de-terre:150|lait-coco:150:ml|ail:1:gousse|bouillon:0.5:cube',
    'Épluchez les pommes de terre et coupez-les en petits dés. Lavez les épinards et hachez l’ail.',
    'Faites revenir l’ail rapidement. Ajoutez pommes de terre, bouillon et de l’eau à hauteur, puis cuisez 15 minutes. Ajoutez les épinards et poursuivez 4 minutes.',
    'Versez le lait de coco, mixez et ajustez la consistance avec de l’eau chaude.');
  soup('lentilles-corail-carottes','Soupe de lentilles corail et carottes',30,'lentilles-corail:120|carotte:300|oignon:1:pièce|cumin:1:c. à café|bouillon:0.5:cube|citron:0.5:pièce',
    'Rincez les lentilles corail sèches. Émincez l’oignon et coupez les carottes en fines rondelles.',
    'Faites revenir oignon et cumin. Ajoutez carottes, lentilles et bouillon, puis couvrez généreusement d’eau. Laissez frémir 20 minutes en ajoutant de l’eau si nécessaire.',
    'Mixez légèrement ou complètement selon votre goût. Ajoutez le jus de citron et rectifiez le sel.');
  soup('pois-chiches-tomates','Soupe de pois chiches à la tomate',30,'pois-chiches:300|tomates-concassees:300|oignon:1:pièce|ail:1:gousse|paprika:1:c. à café|bouillon:0.5:cube',
    'Égouttez les pois chiches déjà cuits. Émincez l’oignon et hachez l’ail.',
    'Faites revenir oignon et ail dans de l’huile, ajoutez paprika et tomates puis cuisez 5 minutes. Ajoutez pois chiches, bouillon et assez d’eau pour une soupe.',
    'Laissez frémir 15 minutes. Écrasez une partie des pois chiches à la fourchette pour épaissir et rectifiez l’assaisonnement.');
  soup('haricots-blancs-romarin','Soupe de haricots blancs au romarin',25,'haricots-blancs:350|carotte:150|oignon:1:pièce|romarin:1:branche|bouillon:0.5:cube|ail:1:gousse',
    'Égouttez les haricots blancs déjà cuits. Coupez la carotte en très petits dés et hachez oignon et ail.',
    'Faites suer oignon, ail et carotte pendant 5 minutes. Ajoutez haricots, romarin, bouillon et de l’eau à hauteur. Laissez cuire 15 minutes.',
    'Retirez la branche de romarin. Mixez une partie de la soupe puis mélangez-la au reste pour garder de la texture.');
  soup('champignons-creme','Crème de champignons au persil',30,'champignons:500|echalote:2:pièce|bouillon:0.5:cube|creme:100:ml|persil:10',
    'Nettoyez les champignons et émincez-les. Pelez et hachez les échalotes.',
    'Faites dorer les champignons en plusieurs fois dans une casserole huilée. Ajoutez les échalotes puis le bouillon et de l’eau à hauteur. Laissez frémir 15 minutes.',
    'Ajoutez la crème et mixez. Parsemez de persil ciselé et poivrez.');
  soup('celeri-pomme-noisette','Velouté de céleri-rave, pomme et noisettes',35,'celeri-rave:400|pomme:1:pièce|oignon:0.5:pièce|bouillon:0.5:cube|noisettes:25|creme:50:ml',
    'Épluchez céleri-rave et pomme, puis coupez-les en petits dés. Émincez l’oignon et concassez les noisettes.',
    'Faites revenir l’oignon, ajoutez céleri, pomme, bouillon et de l’eau à hauteur. Faites cuire 25 minutes jusqu’à tendreté.',
    'Mixez avec la crème. Faites dorer les noisettes à sec et ajoutez-les sur le velouté au moment de servir.');
  soup('panais-poire','Velouté de panais à la poire',35,'panais:400|poire:1:pièce|pommes-de-terre:100|bouillon:0.5:cube|creme:60:ml',
    'Épluchez panais, pomme de terre et poire, puis coupez-les en petits morceaux en retirant le cœur de la poire.',
    'Placez le tout dans une casserole avec le bouillon et de l’eau juste à hauteur. Faites frémir à couvert 25 minutes.',
    'Mixez avec la crème et ajoutez de l’eau si nécessaire. Poivrez et rectifiez le sel.');
  soup('carotte-gingembre-citron','Velouté de carottes au gingembre',30,'carotte:500|gingembre:15|oignon:1:pièce|bouillon:0.5:cube|citron:0.5:pièce',
    'Épluchez et émincez les carottes, l’oignon et le gingembre.',
    'Faites revenir l’oignon et le gingembre dans un peu d’huile. Ajoutez carottes, bouillon et de l’eau à hauteur, puis cuisez 20 à 25 minutes.',
    'Mixez finement, ajoutez le jus de citron et goûtez avant de saler.');
  soup('patate-douce-cacahuete','Soupe de patate douce à la cacahuète',35,'patate-douce:450|beurre-cacahuete:35|tomates-concassees:150|oignon:1:pièce|bouillon:0.5:cube|paprika:1:c. à café',
    'Coupez la patate douce pelée en petits dés et émincez l’oignon.',
    'Faites revenir l’oignon et le paprika. Ajoutez tomates, patate douce, bouillon et de l’eau à hauteur, puis laissez frémir 25 minutes.',
    'Ajoutez le beurre de cacahuète et mixez. Délayez avec de l’eau chaude si nécessaire et rectifiez le sel.');
  soup('mais-coco-curry','Soupe de maïs au coco et curry',25,'mais:350|lait-coco:150:ml|pommes-de-terre:150|oignon:0.5:pièce|curry:1:c. à café|bouillon:0.5:cube',
    'Égouttez le maïs, émincez l’oignon et coupez les pommes de terre pelées en petits dés.',
    'Faites revenir l’oignon avec le curry. Ajoutez pommes de terre, bouillon et de l’eau à hauteur, puis cuisez 15 minutes. Ajoutez maïs et lait de coco et poursuivez 5 minutes.',
    'Mixez très finement. Passez la soupe au tamis si vous souhaitez une texture plus lisse et rectifiez l’assaisonnement.');
  soup('miso-tofu-champignons','Bouillon miso, tofu et champignons',20,'pate-miso:25|tofu:200|champignons:150|nouilles-riz:80|gingembre:10|oignon-nouveau:2:pièce',
    'Émincez les champignons, le gingembre et les oignons nouveaux. Coupez le tofu en cubes et faites cuire les nouilles selon le paquet.',
    'Faites frémir les champignons et le gingembre dans de l’eau pendant 8 minutes. Ajoutez le tofu pour le réchauffer.',
    'Délayez le miso dans un peu de bouillon puis remettez-le dans la casserole hors du feu. Ajoutez nouilles et oignons nouveaux ; goûtez avant de saler.');
  soup('minestrone-haricots','Minestrone de légumes aux haricots',40,'haricots-blancs:200|carotte:150|courgette:200|tomates-concassees:250|pates:60|bouillon:0.5:cube|oignon:1:pièce',
    'Coupez les carottes et courgettes en petits dés. Émincez l’oignon et égouttez les haricots blancs déjà cuits.',
    'Faites revenir l’oignon et les carottes pendant 5 minutes. Ajoutez tomates, courgettes, bouillon et de l’eau pour une soupe. Laissez frémir 15 minutes.',
    'Ajoutez les pâtes et poursuivez la cuisson selon leur paquet, en incorporant les haricots en fin de cuisson. Ajoutez de l’eau si nécessaire.');
  soup('courge-lentilles-corail','Soupe de courge et lentilles corail',35,'butternut:350|lentilles-corail:100|oignon:1:pièce|curry:1:c. à café|lait-coco:100:ml|bouillon:0.5:cube',
    'Épluchez la courge et coupez-la en petits dés. Émincez l’oignon et rincez les lentilles corail sèches.',
    'Faites revenir oignon et curry. Ajoutez courge, lentilles, bouillon et assez d’eau pour couvrir généreusement. Cuisez à couvert 25 minutes.',
    'Ajoutez le lait de coco puis mixez partiellement ou complètement. Ajustez la consistance à l’eau chaude.');
  soup('navet-pomme-terre','Velouté de navets et pommes de terre',35,'navet:300|pommes-de-terre:250|oignon:1:pièce|bouillon:0.5:cube|beurre:15|creme:50:ml',
    'Épluchez navets et pommes de terre et coupez-les en dés. Émincez l’oignon.',
    'Faites fondre l’oignon dans le beurre. Ajoutez les légumes, le bouillon et de l’eau à hauteur, puis faites frémir 25 minutes à couvert.',
    'Mixez avec la crème et poivrez. Ajoutez de l’eau chaude si le velouté est trop épais.');
  soup('fenouil-pommes-terre','Soupe de fenouil aux pommes de terre',35,'fenouil:1:pièce|pommes-de-terre:250|oignon:0.5:pièce|bouillon:0.5:cube|creme:60:ml|citron:0.5:pièce',
    'Émincez le fenouil en retirant sa base dure. Pelez et coupez les pommes de terre puis émincez l’oignon.',
    'Faites revenir oignon et fenouil quelques minutes. Ajoutez pommes de terre, bouillon et de l’eau à hauteur, puis cuisez 25 minutes.',
    'Mixez avec la crème puis ajoutez un peu de jus de citron selon votre goût. Salez et poivrez.');
  soup('poivron-tomate','Velouté de poivrons rouges à la tomate',40,'poivron:2:pièce|tomates-concassees:300|oignon:1:pièce|ail:1:gousse|bouillon:0.5:cube|paprika:1:c. à café',
    'Épépinez et émincez les poivrons. Hachez l’oignon et l’ail.',
    'Faites revenir les poivrons et l’oignon 8 minutes dans une casserole huilée. Ajoutez ail, paprika, tomates, bouillon et un peu d’eau. Laissez frémir 20 minutes.',
    'Mixez longuement puis ajustez la texture avec de l’eau chaude. Passez au tamis si vous souhaitez retirer les petits morceaux de peau.');
  soup('soupe-oignon','Soupe à l’oignon et tartines gratinées',50,'oignon:500|bouillon:1:cube|pain:4:tranche|fromage:70|beurre:20|farine:10',
    'Émincez les oignons et faites-les fondre dans le beurre à feu doux pendant 20 à 25 minutes, en remuant pour les colorer sans les brûler.',
    'Saupoudrez de farine, mélangez une minute puis ajoutez le bouillon et de l’eau pour une soupe. Laissez frémir 15 minutes.',
    'Couvrez les tranches de pain de fromage et faites-les gratiner sous le gril en surveillant. Servez-les sur la soupe ou à côté.');
  soup('soupe-chou-carotte','Soupe rustique au chou et aux carottes',40,'chou-blanc:300|carotte:200|pommes-de-terre:200|oignon:1:pièce|bouillon:0.5:cube|thym:1:branche',
    'Émincez le chou et l’oignon. Pelez et coupez les carottes et pommes de terre en petits morceaux.',
    'Faites revenir l’oignon dans une casserole huilée. Ajoutez les autres légumes, le thym, le bouillon et de l’eau pour couvrir. Laissez frémir 30 minutes.',
    'Retirez la branche de thym. Vérifiez que les légumes sont tendres, puis salez et poivrez à votre goût sans mixer.');
  soup('soupe-betterave','Velouté de betteraves au yaourt',25,'betterave:400|pommes-de-terre:150|oignon:0.5:pièce|bouillon:0.5:cube|yaourt:100|citron:0.5:pièce',
    'Utilisez des betteraves déjà cuites. Épluchez et coupez les pommes de terre en petits dés, puis émincez l’oignon.',
    'Faites revenir l’oignon, ajoutez pommes de terre, bouillon et de l’eau à hauteur. Cuisez 15 minutes puis ajoutez les betteraves en morceaux et réchauffez 5 minutes.',
    'Mixez finement avec un peu de jus de citron. Servez avec le yaourt et du poivre.');
  soup('gaspacho','Gaspacho de tomates et concombre',15,'tomates:500|concombre:0.5:pièce|poivron:0.5:pièce|pain:40|vinaigre:1:c. à soupe|ail:0.5:gousse',
    'Coupez les tomates, le concombre et le poivron épépiné en petits morceaux. Pelez l’ail et émiettez le pain.',
    'Mixez les légumes avec le pain, l’ail, le vinaigre, un filet d’huile et une pincée de sel. Ajoutez un peu d’eau froide pour obtenir une soupe.',
    'Goûtez et ajustez le vinaigre. Servez immédiatement avec des ingrédients bien froids ou conservez au réfrigérateur avant le repas.','Une soupe froide, sans allumer les plaques.');
  soup('concombre-avocat-froid','Soupe froide de concombre et avocat',10,'concombre:1:pièce|avocat:1:pièce|yaourt:120|citron-vert:0.5:pièce|menthe:8',
    'Épluchez le concombre si sa peau est épaisse et coupez-le en morceaux. Prélevez la chair de l’avocat et effeuillez la menthe.',
    'Mixez concombre, avocat, yaourt et menthe avec le jus de citron vert. Ajoutez progressivement un peu d’eau froide pour obtenir la texture voulue.',
    'Salez légèrement et poivrez. Servez aussitôt avec des ingrédients froids ou réservez au frais.');
  soup('asperges-creme','Velouté d’asperges à la crème',30,'asperges:400|pommes-de-terre:150|echalote:1:pièce|bouillon:0.5:cube|creme:70:ml',
    'Retirez la base dure des asperges et pelez les tiges si nécessaire. Coupez-les en tronçons, puis épluchez et détaillez les pommes de terre.',
    'Faites revenir l’échalote émincée dans un peu d’huile. Ajoutez pommes de terre, asperges, bouillon et de l’eau à hauteur. Cuisez 20 minutes.',
    'Mixez avec la crème et passez au tamis si les asperges sont fibreuses. Ajustez l’assaisonnement et réchauffez doucement.');

  // 30 plats végétariens : méthodes et associations explicites, pas un produit cartésien.
  veg('tofu-brocoli-sesame','Tofu croustillant et brocoli au sésame',30,'vegetables','tofu:250|brocoli:350|sauce-soja:2:c. à soupe|graines-sesame:20|fecule-mais:15|riz:120',[
    'Faites cuire le riz selon le paquet. Séchez soigneusement le tofu, coupez-le en cubes et enrobez-le de fécule.',
    'Faites dorer le tofu 8 à 10 minutes dans une poêle huilée. Pendant ce temps, cuisez les fleurettes de brocoli 5 minutes à la vapeur.',
    'Ajoutez brocoli et sauce soja dans la poêle avec un petit fond d’eau. Faites sauter 2 minutes et servez avec le riz et le sésame.']);
  veg('tempeh-champignons','Tempeh laqué et champignons',25,'vegetables','tempeh:250|champignons:250|sauce-soja:2:c. à soupe|miel:1:c. à soupe|gingembre:10|riz:120',[
    'Faites cuire le riz selon le paquet. Coupez le tempeh en fines tranches et les champignons en quartiers.',
    'Faites dorer le tempeh dans une poêle huilée, puis réservez-le. Faites sauter les champignons pendant 6 à 8 minutes.',
    'Mélangez sauce soja, miel, gingembre râpé et un peu d’eau. Remettez le tempeh dans la poêle, ajoutez la sauce et laissez enrober 3 minutes. Servez avec le riz.']);
  veg('galettes-pois-chiches','Galettes de pois chiches au cumin',30,'hummus','pois-chiches:300|oeufs:1:pièce|farine:35|cumin:1:c. à café|persil:15|yaourt:100|citron:0.5:pièce',[
    'Égouttez et séchez les pois chiches déjà cuits. Écrasez-les grossièrement avec la quantité d’œuf prévue, la farine, le cumin et le persil ciselé.',
    'Façonnez de petites galettes. Faites-les dorer dans une poêle huilée 4 à 5 minutes de chaque côté, jusqu’à ce qu’elles se tiennent.',
    'Mélangez le yaourt avec le jus de citron et une pincée de sel. Servez les galettes chaudes avec cette sauce.']);
  veg('galettes-courgette-feta','Galettes de courgette à la feta',30,'vegetables','courgette:400|feta:100|oeufs:1:pièce|farine:50|menthe:8|yaourt:100',[
    'Râpez les courgettes, salez légèrement et pressez-les dans un torchon propre pour retirer le maximum d’eau.',
    'Mélangez-les avec la quantité d’œuf prévue, la farine, la feta émiettée et la menthe ciselée. Formez des galettes directement dans une poêle huilée.',
    'Faites cuire 4 à 5 minutes de chaque côté à feu moyen. Servez avec le yaourt nature poivré.']);
  veg('galettes-patate-douce','Galettes de patate douce et haricots rouges',35,'vegetables','patate-douce:300|haricots-rouges:250|farine:40|paprika:1:c. à café|cumin:0.5:c. à café|yaourt:100',[
    'Épluchez et coupez la patate douce en petits dés. Cuisez-la à l’eau 12 à 15 minutes, puis égouttez-la très soigneusement.',
    'Écrasez-la avec les haricots rouges déjà cuits et égouttés, la farine, le paprika et le cumin. Laissez tiédir avant de former des galettes.',
    'Faites dorer les galettes dans une poêle huilée 5 minutes par face. Servez avec le yaourt salé et poivré.']);
  veg('houmous-bol-croquant','Bol de houmous et crudités croquantes',20,'hummus','pois-chiches:300|tahin:35|citron:1:pièce|ail:1:gousse|carotte:2:pièce|concombre:0.5:pièce|pain-pita:2:pièce',[
    'Égouttez les pois chiches déjà cuits et mixez-les avec le tahin, le jus de citron, l’ail et un peu d’eau pour une purée lisse.',
    'Salez le houmous et ajoutez un filet d’huile. Coupez carottes et concombre en bâtonnets.',
    'Réchauffez les pains pita selon le paquet. Servez le houmous dans des bols avec les crudités et les pains.']);
  veg('haricots-blancs-tomate','Haricots blancs mijotés à la tomate',30,'vegetables','haricots-blancs:400|tomates-concassees:300|oignon:1:pièce|ail:2:gousse|thym:1:branche|pain:4:tranche',[
    'Émincez l’oignon et l’ail. Faites-les revenir dans une casserole huilée pendant 5 minutes.',
    'Ajoutez les tomates et le thym, puis laissez mijoter 10 minutes. Incorporez les haricots blancs déjà cuits et égouttés avec un peu d’eau.',
    'Poursuivez 10 minutes, retirez la branche de thym et rectifiez l’assaisonnement. Servez avec le pain grillé.']);
  veg('pois-chiches-epinards','Pois chiches aux épinards et citron',20,'vegetables','pois-chiches:350|epinards:300|ail:2:gousse|citron:0.5:pièce|paprika:1:c. à café|yaourt:100',[
    'Rincez les pois chiches déjà cuits et lavez les épinards. Hachez l’ail.',
    'Faites revenir l’ail et le paprika dans un peu d’huile. Ajoutez les pois chiches et un fond d’eau, puis réchauffez 5 minutes.',
    'Ajoutez les épinards et laissez-les tomber 3 à 4 minutes. Terminez avec le jus de citron et servez avec le yaourt.']);
  veg('lentilles-champignons','Lentilles crémeuses aux champignons',25,'vegetables','lentilles:350|champignons:300|echalote:1:pièce|creme:100:ml|moutarde:1:c. à café|persil:10',[
    'Émincez les champignons et l’échalote. Égouttez les lentilles déjà cuites.',
    'Faites dorer les champignons dans une poêle huilée, puis ajoutez l’échalote et poursuivez 3 minutes.',
    'Ajoutez les lentilles, la crème et la moutarde. Laissez mijoter doucement 5 minutes et parsemez de persil ciselé.']);
  veg('polenta-champignons','Polenta souple et champignons dorés',25,'vegetables','polenta:130|lait:250:ml|champignons:300|parmesan:40|ail:1:gousse|persil:10',[
    'Portez le lait avec un volume d’eau adapté à votre polenta à frémissement, en suivant les proportions du paquet. Salez légèrement.',
    'Versez la polenta en pluie et remuez selon le temps indiqué sur le paquet. Incorporez le parmesan en fin de cuisson.',
    'Faites dorer les champignons avec l’ail dans une poêle huilée. Servez sur la polenta et ajoutez le persil.']);
  veg('aubergines-miso','Aubergines laquées au miso',40,'vegetables','aubergine:2:pièce|pate-miso:25|miel:1:c. à soupe|sauce-soja:1:c. à soupe|graines-sesame:15|riz:140',[
    'Préchauffez le four à 210 °C. Coupez les aubergines dans la longueur et quadrillez leur chair. Badigeonnez d’huile et enfournez 25 minutes.',
    'Faites cuire le riz selon le paquet. Mélangez miso, miel et sauce soja avec un peu d’eau.',
    'Étalez la sauce sur les aubergines et poursuivez la cuisson 8 à 10 minutes, jusqu’à ce que la chair soit fondante. Servez avec le riz et le sésame.']);
  veg('carottes-roties-tahin','Carottes rôties, tahin et pois chiches',35,'vegetables','carotte:500|pois-chiches:250|tahin:30|citron:0.5:pièce|cumin:1:c. à café|persil:10',[
    'Préchauffez le four à 210 °C. Coupez les carottes en bâtonnets et égouttez les pois chiches déjà cuits.',
    'Enrobez les carottes d’huile et de cumin. Faites-les rôtir 25 minutes, en ajoutant les pois chiches sur la plaque pour les 10 dernières minutes.',
    'Délayez le tahin avec le jus de citron puis un peu d’eau. Servez légumes et pois chiches avec cette sauce et le persil.']);
  veg('chou-fleur-curry-four','Chou-fleur rôti et sauce yaourt',40,'vegetables','chou-fleur:600|curry:1:c. à café|yaourt-grec:150|citron:0.5:pièce|amandes:30|semoule:100',[
    'Préchauffez le four à 210 °C. Coupez le chou-fleur en petites fleurettes, enrobez-les d’huile et de curry, puis enfournez 25 à 30 minutes.',
    'Préparez la semoule selon le paquet. Mélangez le yaourt grec avec le jus de citron et une pincée de sel.',
    'Servez le chou-fleur tendre et doré sur la semoule, avec le yaourt et les amandes concassées.']);
  veg('poireaux-vinaigrette-oeufs','Poireaux vinaigrette et œufs durs',30,'vegetables','poireau:500|oeufs:2:pièce|moutarde:1:c. à café|vinaigre:1:c. à soupe|persil:10|pain:4:tranche',[
    'Nettoyez les poireaux et cuisez-les à la vapeur ou à l’eau frémissante 15 à 20 minutes, jusqu’à tendreté. Égouttez-les soigneusement.',
    'Faites cuire les œufs 9 à 10 minutes dans l’eau frémissante, rafraîchissez-les et écalez-les. Mélangez moutarde, vinaigre et huile pour la sauce.',
    'Disposez les poireaux dans un plat. Ajoutez la vinaigrette, les œufs hachés et le persil. Servez avec le pain.']);
  veg('endives-braisees-noix','Endives braisées aux noix et bleu',35,'vegetables','endive:4:pièce|bleu:80|noix:35|beurre:20|miel:1:c. à café|pain:4:tranche',[
    'Retirez les feuilles abîmées des endives et coupez-les dans la longueur. Faites-les dorer côté coupé dans le beurre.',
    'Ajoutez le miel et un petit fond d’eau. Couvrez et laissez braiser 20 à 25 minutes, jusqu’à ce que les endives soient tendres.',
    'Découvrez pour faire évaporer le jus. Ajoutez le bleu émietté et les noix, poivrez et servez avec du pain.']);
  veg('poelee-chou-pommes-terre','Poêlée de chou, pommes de terre et œufs',35,'vegetables','chou-blanc:300|pommes-de-terre:350|oeufs:2:pièce|oignon:1:pièce|paprika:1:c. à café',[
    'Coupez les pommes de terre en petits dés et précuisez-les 8 à 10 minutes à l’eau. Émincez le chou et l’oignon.',
    'Faites dorer l’oignon et les pommes de terre dans une poêle huilée. Ajoutez chou, paprika et un fond d’eau, puis cuisez à couvert 10 minutes.',
    'Cassez les œufs dans de petits creux, couvrez et faites cuire 5 à 7 minutes, jusqu’à ce que les blancs soient pris.']);
  veg('blettes-ail-pois-chiches','Blettes à l’ail et pois chiches',30,'vegetables','blettes:500|pois-chiches:300|ail:2:gousse|citron:0.5:pièce|paprika:0.5:c. à café',[
    'Séparez les côtes et les feuilles des blettes. Coupez les côtes en petits morceaux et émincez les feuilles. Égouttez les pois chiches déjà cuits.',
    'Faites cuire les côtes 8 à 10 minutes dans une poêle huilée avec un fond d’eau et un couvercle. Ajoutez l’ail et le paprika.',
    'Ajoutez feuilles et pois chiches et cuisez encore 5 minutes. Terminez avec du jus de citron et rectifiez l’assaisonnement.']);
  veg('oeufs-champignons-creme','Œufs cocotte aux champignons',30,'omelette','oeufs:2:pièce|champignons:250|creme:100:ml|fromage:40|pain:4:tranche',[
    'Préchauffez le four à 180 °C. Émincez les champignons et faites-les dorer dans une poêle huilée jusqu’à évaporation de leur eau.',
    'Répartissez-les avec la crème dans des ramequins huilés adaptés au nombre de portions. Ajoutez les œufs puis le fromage.',
    'Placez les ramequins dans un plat avec de l’eau chaude à mi-hauteur. Enfournez 12 à 16 minutes, jusqu’à ce que les blancs soient pris. Servez avec le pain grillé.']);
  veg('tofu-cacahuete','Tofu et légumes sauce cacahuète',30,'vegetables','tofu:250|carotte:200|poivron:1:pièce|beurre-cacahuete:35|sauce-soja:2:c. à soupe|citron-vert:0.5:pièce|nouilles:120',[
    'Cuisez les nouilles selon le paquet. Coupez tofu et légumes en petits morceaux réguliers.',
    'Faites dorer le tofu dans une poêle huilée, réservez-le puis faites sauter les légumes 8 à 10 minutes avec un fond d’eau si nécessaire.',
    'Délayez le beurre de cacahuète avec sauce soja, jus de citron vert et eau chaude. Réunissez tofu, légumes, nouilles et sauce puis réchauffez 2 minutes.']);
  veg('seitan-poivrons','Seitan sauté aux poivrons',25,'vegetables','seitan:250|poivron:2:pièce|oignon:1:pièce|sauce-soja:1:c. à soupe|paprika:1:c. à café|semoule:120',[
    'Préparez la semoule selon le paquet. Coupez le seitan en lanières et émincez oignon et poivrons.',
    'Faites revenir les oignons et poivrons dans une poêle huilée pendant 10 minutes. Ajoutez le paprika et un peu d’eau si les légumes accrochent.',
    'Ajoutez le seitan et la sauce soja puis faites sauter 5 minutes. Servez avec la semoule.']);
  veg('courgettes-farcies-lentilles','Courgettes farcies aux lentilles',50,'vegetables','courgette:2:pièce|lentilles:250|tomates-concassees:200|oignon:1:pièce|fromage:60|ail:1:gousse',[
    'Préchauffez le four à 200 °C. Coupez les courgettes dans la longueur et évidez-les sans percer la peau. Hachez la chair retirée.',
    'Faites revenir oignon, ail et chair de courgette. Ajoutez les tomates puis les lentilles déjà cuites et égouttées, et laissez réduire 10 minutes.',
    'Garnissez les courgettes, parsemez de fromage et placez-les dans un plat avec un fond d’eau. Enfournez 30 minutes, jusqu’à tendreté.']);
  veg('poivrons-farcis-quinoa','Poivrons farcis au quinoa et feta',45,'vegetables','poivron:2:pièce|quinoa:120|feta:100|tomates:150|oignon:0.5:pièce|persil:10',[
    'Préchauffez le four à 200 °C. Faites cuire le quinoa selon le paquet. Coupez les poivrons dans la longueur et retirez les graines.',
    'Faites revenir l’oignon émincé avec les tomates en dés. Mélangez au quinoa cuit avec la feta émiettée et le persil.',
    'Garnissez les poivrons et placez-les dans un plat avec un fond d’eau. Enfournez 25 à 30 minutes, jusqu’à ce que les poivrons soient tendres.']);
  veg('champignons-farcis-ricotta','Champignons farcis à la ricotta',30,'vegetables','champignons:500|ricotta:180|ail:1:gousse|persil:15|chapelure:30|parmesan:25',[
    'Préchauffez le four à 200 °C. Choisissez de gros champignons et retirez leurs pieds. Hachez les pieds avec l’ail et le persil.',
    'Faites revenir les pieds hachés dans une poêle huilée pour évaporer leur eau. Mélangez-les à la ricotta et au parmesan, puis poivrez.',
    'Garnissez les chapeaux, parsemez de chapelure et d’un peu d’huile. Enfournez 18 à 20 minutes.']);
  veg('patates-douces-feta','Patates douces rôties, feta et graines',55,'vegetables','patate-douce:600|feta:100|graines-courge:25|yaourt:100|citron:0.5:pièce|persil:10',[
    'Préchauffez le four à 210 °C. Coupez les patates douces dans la longueur, huilez légèrement et enfournez 40 à 45 minutes, jusqu’à ce que la chair soit tendre.',
    'Mélangez yaourt, jus de citron, sel et poivre. Faites griller les graines de courge dans une poêle sèche.',
    'Ouvrez légèrement les patates douces. Ajoutez feta, sauce au yaourt, persil ciselé et graines.']);
  veg('ratatouille-oeufs','Ratatouille minute aux œufs',35,'vegetables','aubergine:1:pièce|courgette:1:pièce|poivron:1:pièce|tomates-concassees:250|oeufs:2:pièce|ail:1:gousse',[
    'Coupez aubergine, courgette et poivron en petits dés. Faites revenir l’aubergine dans une grande poêle huilée pendant 6 minutes.',
    'Ajoutez les autres légumes et l’ail, puis les tomates. Salez et laissez mijoter à couvert 15 minutes, en ajoutant un peu d’eau si nécessaire.',
    'Creusez de petits puits dans les légumes et cassez-y les œufs. Couvrez et cuisez 5 à 7 minutes, jusqu’à ce que les blancs soient pris.']);
  veg('mafe-legumes','Mijoté de légumes à la cacahuète',40,'curry','patate-douce:250|carotte:200|pois-chiches:250|tomates-concassees:250|beurre-cacahuete:40|oignon:1:pièce|riz:120',[
    'Coupez carottes et patate douce en petits dés. Émincez l’oignon et égouttez les pois chiches déjà cuits. Faites cuire le riz selon le paquet.',
    'Faites revenir l’oignon, ajoutez les légumes, les tomates et de l’eau à mi-hauteur. Couvrez et laissez frémir 25 minutes.',
    'Délayez le beurre de cacahuète dans un peu de jus, remettez-le dans la casserole avec les pois chiches et poursuivez 5 minutes. Servez avec le riz.']);
  veg('dahl-epinards','Dahl de lentilles corail aux épinards',30,'curry','lentilles-corail:160|epinards:200|lait-coco:200:ml|oignon:1:pièce|curry:1:c. à café|tomates-concassees:150',[
    'Rincez les lentilles corail sèches. Faites revenir l’oignon émincé dans une casserole huilée et ajoutez le curry.',
    'Ajoutez lentilles, tomates, lait de coco et assez d’eau pour couvrir généreusement. Laissez frémir 20 minutes en remuant et en ajoutant de l’eau si nécessaire.',
    'Incorporez les épinards et cuisez encore 3 à 4 minutes. Salez et ajustez la texture avec de l’eau chaude.']);
  veg('tartines-haricots-tomates','Tartines de haricots blancs et tomates',20,'toast','pain:4:tranche|haricots-blancs:250|tomates:250|ail:1:gousse|basilic:10|citron:0.5:pièce',[
    'Égouttez les haricots blancs déjà cuits et écrasez-les avec un peu de jus de citron, de l’huile et du sel.',
    'Faites compoter les tomates en dés avec l’ail haché dans une poêle huilée pendant 8 minutes.',
    'Grillez le pain, tartinez-le de purée de haricots, puis ajoutez les tomates et le basilic.']);
  veg('tacos-chou-fleur','Tacos de chou-fleur rôti',35,'vegetables','chou-fleur:450|tortillas:4:pièce|avocat:1:pièce|yaourt:100|citron-vert:1:pièce|paprika:1:c. à café|cumin:0.5:c. à café',[
    'Préchauffez le four à 210 °C. Coupez le chou-fleur en petites fleurettes, enrobez-le d’huile, de paprika et de cumin, puis faites rôtir 25 minutes.',
    'Coupez l’avocat et arrosez-le d’un peu de jus de citron vert. Mélangez le reste du jus au yaourt avec une pincée de sel.',
    'Réchauffez les tortillas selon le paquet. Garnissez-les de chou-fleur, d’avocat et de sauce au yaourt.']);
  veg('frittata-brocoli','Frittata de brocoli et pommes de terre',35,'omelette','oeufs:4:pièce|brocoli:250|pommes-de-terre:250|fromage:50|oignon:0.5:pièce',[
    'Préchauffez le four à 190 °C. Coupez les pommes de terre en petits dés et faites-les cuire à l’eau 10 minutes. Ajoutez les fleurettes de brocoli pour les 4 dernières minutes, puis égouttez.',
    'Faites revenir l’oignon émincé dans une poêle allant au four. Ajoutez les légumes puis les œufs battus avec le fromage, du sel et du poivre.',
    'Laissez prendre 2 minutes sur le feu, puis enfournez 12 à 15 minutes, jusqu’à ce que le centre soit pris.']);

  // 30 desserts : formules pour deux personnes, avec cuisson et texture de fin précisées.
  dessert('fondant-chocolat','Petits fondants au chocolat noir',25,'cake','chocolat-noir:80|beurre:50|sucre:40|oeufs:1:pièce|farine:20',[
    'Préchauffez le four à 180 °C. Faites fondre doucement le chocolat et le beurre, puis laissez tiédir.',
    'Fouettez la quantité d’œuf prévue et le sucre, ajoutez le chocolat fondu puis la farine. Répartissez dans des moules individuels beurrés adaptés aux portions.',
    'Enfournez 10 à 12 minutes : les bords doivent être pris et le centre encore souple. Laissez reposer quelques minutes avant de servir.']);
  dessert('mousse-chocolat','Mousse au chocolat classique',140,'chocolate','chocolat-noir:80|oeufs:2:pièce|sucre:10',[
    'Faites fondre doucement le chocolat puis laissez-le tiédir. Séparez les blancs des jaunes d’œufs.',
    'Incorporez les jaunes au chocolat tiède. Montez les blancs en neige en ajoutant le sucre, puis incorporez-les délicatement au mélange.',
    'Répartissez dans des verres et réfrigérez au moins 2 heures. Utilisez des œufs très frais et consommez la mousse rapidement.']);
  dessert('crumble-pommes','Crumble aux pommes et à la cannelle',40,'crumble','pomme:2:pièce|farine:60|beurre:40|cassonade:35|cannelle:0.5:c. à café',[
    'Préchauffez le four à 180 °C. Pelez les pommes, retirez leur cœur et coupez-les en petits morceaux dans un plat adapté aux portions.',
    'Mélangez farine, cassonade et cannelle, puis frottez le beurre froid du bout des doigts pour obtenir des miettes.',
    'Répartissez les miettes sur les pommes et enfournez 25 à 30 minutes, jusqu’à ce que le dessus soit doré et les pommes tendres.']);
  dessert('crumble-poire-chocolat','Crumble poire et chocolat',40,'crumble','poire:2:pièce|chocolat-noir:40|farine:60|beurre:40|cassonade:30',[
    'Préchauffez le four à 180 °C. Pelez et coupez les poires en dés. Répartissez-les dans un plat avec le chocolat haché.',
    'Frottez farine, cassonade et beurre froid du bout des doigts pour obtenir des miettes irrégulières.',
    'Couvrez les poires de crumble et enfournez 25 à 30 minutes, jusqu’à ce que la surface soit dorée.']);
  dessert('riz-lait-vanille','Riz au lait à la vanille',45,'pudding','riz-rond:60|lait:450:ml|sucre:30|vanille:0.5:c. à café',[
    'Rincez brièvement le riz rond. Faites chauffer le lait avec la vanille dans une casserole à fond épais.',
    'Versez le riz et laissez cuire à très petits frémissements 30 à 35 minutes en remuant souvent, jusqu’à ce que le riz soit tendre.',
    'Ajoutez le sucre en fin de cuisson. Retirez du feu alors que le mélange est encore crémeux : il épaissira en refroidissant.']);
  dessert('semoule-lait','Semoule au lait et cannelle',15,'pudding','semoule-fine:50|lait:400:ml|sucre:25|cannelle:0.5:c. à café|raisins-secs:25',[
    'Faites chauffer le lait avec le sucre, la cannelle et les raisins secs.',
    'Versez la semoule fine en pluie tout en remuant. Faites cuire à feu doux selon le paquet, généralement 4 à 6 minutes.',
    'Répartissez dans des bols et servez tiède ou froid. Ajoutez un peu de lait si la semoule devient trop épaisse.']);
  dessert('creme-chocolat','Crèmes au chocolat sans œuf',20,'chocolate','lait:300:ml|chocolat-noir:60|sucre:20|fecule-mais:15',[
    'Délayez la fécule dans une partie du lait froid. Faites chauffer le reste du lait avec le sucre et le chocolat haché.',
    'Quand le chocolat est fondu, ajoutez la fécule délayée et remuez à feu doux jusqu’à épaississement, puis poursuivez une minute à léger frémissement.',
    'Répartissez dans des petits pots. Servez tiède ou laissez refroidir puis placez au réfrigérateur.']);
  dessert('compote-pomme-poire','Compote pomme et poire',25,'fruit','pomme:2:pièce|poire:1:pièce|vanille:0.5:c. à café|citron:0.25:pièce',[
    'Pelez pommes et poire, retirez les cœurs et coupez la chair en petits morceaux.',
    'Placez les fruits dans une casserole avec la vanille, un peu de jus de citron et un petit fond d’eau. Couvrez et laissez cuire 15 à 20 minutes.',
    'Écrasez à la fourchette pour garder des morceaux ou mixez. Servez tiède ou laissez refroidir.']);
  dessert('pommes-four','Pommes au four, miel et noix',40,'fruit','pomme:2:pièce|miel:20|noix:30|beurre:15|cannelle:0.5:c. à café',[
    'Préchauffez le four à 180 °C. Retirez le cœur des pommes sans percer leur base et placez-les dans un petit plat.',
    'Garnissez les cavités de noix concassées, de miel et de beurre. Saupoudrez de cannelle et ajoutez un fond d’eau dans le plat.',
    'Enfournez 30 à 35 minutes, en arrosant de jus à mi-cuisson. Les pommes doivent être tendres sous la pointe d’un couteau.']);
  dessert('poires-chocolat','Poires pochées et chocolat chaud',30,'fruit','poire:2:pièce|chocolat-noir:60|sucre:30|vanille:0.5:c. à café|creme:50:ml',[
    'Pelez les poires et placez-les dans une casserole adaptée avec le sucre, la vanille et de l’eau aux trois quarts de leur hauteur.',
    'Faites pocher à petits frémissements 15 à 20 minutes en tournant les fruits, jusqu’à ce qu’ils soient tendres. Égouttez-les.',
    'Faites chauffer la crème, versez-la sur le chocolat haché et mélangez. Nappez les poires de cette sauce au moment de servir.']);
  dessert('bananes-caramelisees','Bananes caramélisées à la poêle',12,'fruit','banane:2:pièce|beurre:15|cassonade:20|citron-vert:0.5:pièce|yaourt:100',[
    'Pelez les bananes et coupez-les dans la longueur. Faites fondre le beurre dans une poêle à feu moyen.',
    'Ajoutez la cassonade puis les bananes et laissez dorer 2 à 3 minutes par face sans les écraser.',
    'Ajoutez un trait de jus de citron vert hors du feu. Servez avec le yaourt nature.']);
  dessert('ananas-roti','Ananas rôti au miel et au citron vert',25,'fruit','ananas:400|miel:25|citron-vert:1:pièce|beurre:15|vanille:0.5:c. à café',[
    'Préchauffez le four à 200 °C. Retirez peau et cœur dur de l’ananas, puis coupez la chair en quartiers.',
    'Placez dans un plat avec le miel, le beurre en petits morceaux et la vanille. Enfournez 15 à 20 minutes en retournant à mi-cuisson.',
    'Arrosez de jus de citron vert et servez tiède avec le jus du plat.']);
  dessert('peches-amandes','Pêches rôties aux amandes',25,'fruit','peche:2:pièce|amandes:30|miel:20|beurre:15|yaourt-grec:100',[
    'Préchauffez le four à 190 °C. Coupez les pêches dans la longueur et retirez les noyaux.',
    'Disposez les fruits dans un plat, ajoutez miel, beurre et amandes concassées. Enfournez 15 à 20 minutes, jusqu’à tendreté.',
    'Servez les pêches tièdes avec leur jus et le yaourt grec.']);
  dessert('fraises-yaourt-pistache','Fraises, yaourt et pistaches',10,'fruit','fraises:300|yaourt-grec:200|pistaches:30|miel:15|citron:0.25:pièce',[
    'Rincez les fraises, équeutez-les et coupez-les en morceaux. Arrosez d’un peu de jus de citron.',
    'Mélangez le yaourt grec avec le miel et répartissez-le dans des verres.',
    'Ajoutez les fraises et les pistaches concassées. Servez aussitôt pour garder le croquant.']);
  dessert('verrines-mangue-coco','Verrines mangue, coco et yaourt',10,'yogurt','mangue:1:pièce|yaourt:200|noix-coco-rapee:25|citron-vert:0.5:pièce|miel:15',[
    'Prélevez la chair de la mangue et coupez-la en petits dés. Arrosez d’un peu de jus de citron vert.',
    'Mélangez le yaourt avec le miel et une partie de la noix de coco.',
    'Alternez yaourt et mangue dans des verres. Parsemez du reste de noix de coco et servez frais.']);
  dessert('cheesecake-verrine','Cheesecake en verrine, sans cuisson',20,'yogurt','petits-beurre:70|cream-cheese:150|yaourt-grec:80|sucre-glace:20|citron:0.5:pièce|fruits-rouges:120',[
    'Émiettez les biscuits et répartissez-les au fond de petits verres. Râpez un peu de zeste de citron.',
    'Fouettez le fromage frais avec le yaourt grec, le sucre glace, le zeste et un peu de jus de citron.',
    'Déposez la crème sur les biscuits puis ajoutez les fruits rouges. Servez immédiatement ou gardez au frais jusqu’au dessert.']);
  dessert('cookies-chocolat','Cookies au chocolat noir',30,'cookies','farine:100|beurre:50|cassonade:50|oeufs:0.5:pièce|chocolat-noir:60|levure-chimique:2',[
    'Préchauffez le four à 180 °C. Travaillez le beurre mou avec la cassonade puis incorporez la quantité d’œuf battu prévue.',
    'Ajoutez farine et levure puis le chocolat haché. Formez de petites boules espacées sur une plaque couverte de papier cuisson.',
    'Enfournez 10 à 12 minutes. Sortez les cookies quand leurs bords sont dorés et leur centre encore souple, puis laissez-les raffermir sur la plaque.']);
  dessert('cookies-avoine-raisins','Cookies d’avoine aux raisins',30,'cookies','flocons-avoine:70|farine:50|beurre:45|cassonade:40|oeufs:0.5:pièce|raisins-secs:40|levure-chimique:2',[
    'Préchauffez le four à 180 °C. Mélangez beurre mou et cassonade puis ajoutez la quantité d’œuf battu prévue.',
    'Incorporez farine, levure, flocons d’avoine et raisins. Déposez des petits tas aplatis et espacés sur une plaque.',
    'Faites cuire 12 à 15 minutes, jusqu’à ce que les bords commencent à dorer. Laissez refroidir sur la plaque.']);
  dessert('brownie-noix','Brownie au chocolat et aux noix',35,'cake','chocolat-noir:90|beurre:55|sucre:50|oeufs:1:pièce|farine:35|noix:40',[
    'Préchauffez le four à 180 °C. Faites fondre chocolat et beurre puis laissez tiédir.',
    'Fouettez la quantité d’œuf prévue avec le sucre, ajoutez le chocolat puis la farine et les noix concassées. Versez dans un petit moule chemisé adapté à la quantité.',
    'Enfournez 18 à 22 minutes : le centre doit rester légèrement humide. Laissez tiédir avant de découper.']);
  dessert('financiers-amandes','Petits financiers aux amandes',30,'cake','poudre-amandes:50|sucre-glace:60|farine:20|oeufs:2:pièce|beurre:45',[
    'Préchauffez le four à 180 °C. Faites fondre le beurre et laissez-le légèrement colorer en surveillant, puis laissez tiédir.',
    'Mélangez poudre d’amandes, sucre glace et farine. Séparez les blancs des jaunes d’œufs. Incorporez seulement les blancs non montés au mélange sec, puis ajoutez le beurre. Réservez les jaunes au frais pour une autre préparation.',
    'Répartissez dans de petits moules beurrés et enfournez 12 à 15 minutes, jusqu’à ce que les bords soient bien dorés.']);
  dessert('moelleux-citron','Moelleux au citron',35,'cake','farine:80|sucre:50|beurre:40|oeufs:1:pièce|citron:1:pièce|levure-chimique:3|yaourt:50',[
    'Préchauffez le four à 180 °C. Prélevez le zeste du citron puis pressez-le. Faites fondre le beurre.',
    'Fouettez la quantité d’œuf prévue avec le sucre. Ajoutez beurre, yaourt, zeste et une partie du jus, puis farine et levure.',
    'Versez dans un petit moule adapté à la quantité et enfournez 20 à 25 minutes. Vérifiez la cuisson avec une lame qui doit ressortir sans pâte crue.']);
  dessert('gateau-yaourt-pomme','Petit gâteau au yaourt et à la pomme',40,'cake','farine:100|yaourt:80|sucre:50|oeufs:1:pièce|beurre:35|levure-chimique:3|pomme:1:pièce',[
    'Préchauffez le four à 180 °C. Pelez la pomme et coupez-la en petits dés. Faites fondre le beurre.',
    'Mélangez le yaourt, le sucre, la quantité d’œuf prévue et le beurre, puis incorporez farine, levure et dés de pomme.',
    'Versez dans un petit moule chemisé et cuisez 25 à 30 minutes, jusqu’à ce qu’une lame ressorte sans pâte crue.']);
  dessert('clafoutis-cerises','Clafoutis aux cerises',40,'cake','cerises:250|oeufs:1:pièce|farine:35|sucre:35|lait:150:ml|beurre:10',[
    'Préchauffez le four à 180 °C. Lavez et dénoyautez les cerises, puis répartissez-les dans un petit plat beurré.',
    'Fouettez la quantité d’œuf prévue avec le sucre et la farine. Versez le lait progressivement pour obtenir une pâte lisse.',
    'Versez sur les fruits et enfournez 25 à 30 minutes, jusqu’à ce que le centre soit pris et le dessus légèrement doré.']);
  dessert('clafoutis-abricots','Clafoutis aux abricots',40,'cake','abricots:250|oeufs:1:pièce|farine:35|sucre:40|lait:150:ml|vanille:0.5:c. à café|beurre:10',[
    'Préchauffez le four à 180 °C. Ouvrez les abricots, retirez les noyaux et coupez-les en quartiers dans un plat beurré.',
    'Fouettez la quantité d’œuf prévue avec le sucre, la vanille et la farine. Incorporez le lait petit à petit.',
    'Versez la pâte sur les fruits et enfournez 25 à 30 minutes, jusqu’à ce que le centre soit pris. Servez tiède.']);
  dessert('tarte-fine-pommes','Tarte fine aux pommes',35,'cake','pate-feuilletee:150|pomme:2:pièce|beurre:20|cassonade:25|compote-pommes:60',[
    'Préchauffez le four à 200 °C. Découpez la pâte à la taille souhaitée et piquez le centre à la fourchette, en laissant un petit bord.',
    'Étalez la compote puis disposez de fines lamelles de pomme. Ajoutez la cassonade et le beurre en petits morceaux.',
    'Enfournez 22 à 27 minutes, jusqu’à ce que la pâte soit dorée et cuite sous les fruits.']);
  dessert('tarte-chocolat-minute','Tartelettes au chocolat sans cuisson',80,'chocolate','petits-beurre:80|beurre:35|chocolat-noir:90|creme:100:ml',[
    'Réduisez les biscuits en miettes et mélangez-les au beurre fondu. Tassez dans de petits moules ou au fond de verres, puis placez au frais.',
    'Faites chauffer la crème jusqu’au frémissement. Versez-la sur le chocolat haché et mélangez jusqu’à obtenir une ganache lisse.',
    'Versez sur les fonds de biscuits et réfrigérez au moins une heure, jusqu’à ce que la ganache se tienne.']);
  dessert('flan-coco','Petits flans à la noix de coco',45,'pudding','oeufs:1:pièce|lait-coco:200:ml|lait:100:ml|sucre:35|noix-coco-rapee:20',[
    'Préchauffez le four à 160 °C. Fouettez la quantité d’œuf prévue et le sucre sans faire mousser excessivement.',
    'Incorporez lait, lait de coco et noix de coco râpée. Versez dans de petits ramequins placés dans un plat avec de l’eau chaude à mi-hauteur.',
    'Enfournez 30 à 35 minutes, jusqu’à ce que le centre soit juste pris. Laissez tiédir puis réfrigérez si vous les servez froids.']);
  dessert('creme-vanille','Crèmes à la vanille sans œuf',20,'pudding','lait:350:ml|sucre:30|fecule-mais:20|vanille:0.5:c. à café',[
    'Délayez la fécule dans un peu de lait froid. Chauffez le reste du lait avec sucre et vanille.',
    'Versez la fécule délayée dans le lait chaud en fouettant. Faites épaissir à feu doux puis laissez frémir une minute en remuant.',
    'Répartissez dans des petits pots. Servez tiède ou laissez refroidir et gardez au réfrigérateur.']);
  dessert('oranges-cannelle','Oranges à la cannelle et pistaches',10,'fruit','orange:2:pièce|cannelle:0.5:c. à café|pistaches:25|miel:10|menthe:5',[
    'Pelez les oranges à vif au-dessus d’un bol pour récupérer le jus, puis coupez-les en rondelles.',
    'Mélangez le jus récupéré avec le miel et la cannelle. Concassez les pistaches et ciselez la menthe.',
    'Disposez les oranges dans un plat et arrosez de leur jus parfumé. Ajoutez pistaches et menthe.']);
  dessert('salade-fruits-exotiques','Salade de fruits mangue, ananas et kiwi',15,'fruit','mangue:0.5:pièce|ananas:200|kiwi:2:pièce|citron-vert:1:pièce|menthe:8',[
    'Pelez les fruits et retirez le cœur dur de l’ananas. Coupez les chairs en morceaux de taille comparable.',
    'Pressez le citron vert et ciselez la menthe. Réunissez les fruits dans un saladier.',
    'Ajoutez jus de citron et menthe, puis mélangez délicatement. Servez frais sans ajouter de sucre si les fruits sont mûrs.']);

  // 20 petits déjeuners : aucune préparation de nuit cachée dans le temps annoncé.
  breakfast('porridge-banane-cacahuete','Porridge banane et beurre de cacahuète',12,'oatmeal','flocons-avoine:90|lait:350:ml|banane:1:pièce|beurre-cacahuete:25|cannelle:0.5:c. à café',[
    'Versez les flocons d’avoine, le lait et la cannelle dans une petite casserole.',
    'Faites cuire à feu doux 5 à 7 minutes en remuant, jusqu’à obtenir une texture crémeuse. Ajoutez un peu de lait si nécessaire.',
    'Répartissez dans des bols et ajoutez la banane en rondelles et le beurre de cacahuète.']);
  breakfast('porridge-pomme-cannelle','Porridge à la pomme et cannelle',15,'oatmeal','flocons-avoine:90|lait:350:ml|pomme:1:pièce|cannelle:0.5:c. à café|noix:25|miel:10',[
    'Râpez la pomme ou coupez-la en tout petits dés. Placez-la dans une casserole avec les flocons, le lait et la cannelle.',
    'Faites cuire à feu doux 7 à 9 minutes en remuant. Ajoutez un peu de lait si le mélange épaissit trop.',
    'Servez dans des bols avec les noix concassées et un filet de miel.']);
  breakfast('porridge-cacao-noisette','Porridge cacao et noisettes',12,'oatmeal','flocons-avoine:90|lait:350:ml|cacao:15|miel:20|noisettes:30|banane:1:pièce',[
    'Délayez le cacao dans un peu de lait puis ajoutez le reste du lait et les flocons d’avoine.',
    'Faites cuire à feu doux 5 à 7 minutes en remuant. Incorporez le miel en fin de cuisson.',
    'Ajoutez banane en rondelles et noisettes concassées juste avant de servir.']);
  breakfast('porridge-coco-mangue','Porridge coco, mangue et citron vert',12,'oatmeal','flocons-avoine:90|lait-coco:150:ml|lait:200:ml|mangue:0.5:pièce|citron-vert:0.5:pièce|noix-coco-rapee:15',[
    'Mélangez les flocons, le lait et le lait de coco dans une casserole. Faites cuire à feu doux 5 à 7 minutes en remuant.',
    'Coupez la mangue en dés et arrosez-la d’un peu de jus de citron vert.',
    'Répartissez le porridge dans des bols et ajoutez mangue et noix de coco râpée.']);
  breakfast('yaourt-granola-fruits','Bol de yaourt, granola et fruits rouges',5,'yogurt','yaourt-grec:300|granola:70|fruits-rouges:150|miel:15',[
    'Lavez les fruits rouges frais. S’ils sont surgelés, suivez les indications du paquet et décongelez-les au préalable si nécessaire.',
    'Répartissez le yaourt grec dans des bols et ajoutez les fruits.',
    'Parsemez de granola et d’un filet de miel juste avant de servir, pour conserver le croquant.']);
  breakfast('fromage-blanc-poire','Fromage blanc, poire et amandes',5,'yogurt','fromage-blanc:300|poire:1:pièce|amandes:30|flocons-avoine:30|miel:15',[
    'Lavez la poire, retirez son cœur et coupez-la en morceaux. Concassez les amandes.',
    'Répartissez le fromage blanc dans des bols et ajoutez la poire.',
    'Parsemez de flocons d’avoine et d’amandes puis ajoutez un filet de miel.']);
  breakfast('pancakes-nature','Pancakes moelleux du matin',20,'pancakes','farine:120|lait:150:ml|oeufs:1:pièce|sucre:15|beurre:20|levure-chimique:4|sirop-erable:25',[
    'Mélangez farine, levure et sucre. Fouettez la quantité d’œuf prévue avec le lait et le beurre fondu puis incorporez aux ingrédients secs sans trop travailler la pâte.',
    'Faites chauffer une poêle légèrement huilée. Versez de petites louches de pâte et retournez les pancakes lorsque des bulles apparaissent.',
    'Poursuivez environ une minute sur l’autre face et servez avec le sirop d’érable.']);
  breakfast('pancakes-banane-avoine','Pancakes banane et avoine',20,'pancakes','banane:1:pièce|oeufs:1:pièce|flocons-avoine:80|lait:80:ml|levure-chimique:3|yaourt:100',[
    'Mixez les flocons d’avoine pour obtenir une farine grossière. Ajoutez la banane, la quantité d’œuf prévue, le lait et la levure, puis mixez brièvement.',
    'Laissez la pâte épaissir quelques minutes. Faites cuire de petits pancakes dans une poêle légèrement huilée à feu moyen.',
    'Retournez quand les bords se tiennent et poursuivez la cuisson jusqu’à ce que le cœur soit cuit. Servez avec le yaourt.']);
  breakfast('crepes-sarrasin-oeufs','Galettes de sarrasin aux œufs',30,'pancakes','farine-sarrasin:100|lait:200:ml|oeufs:3:pièce|fromage:60|beurre:15',[
    'Prélevez la part d’œufs destinée à la pâte : un tiers du total. Battez-la avec la farine et le lait pour obtenir une pâte fluide, puis salez légèrement.',
    'Faites cuire de fines galettes dans une poêle beurrée, une face puis l’autre.',
    'Garnissez les galettes avec le fromage et les œufs restants. Repliez les bords et poursuivez doucement, à couvert si nécessaire, jusqu’à ce que les blancs soient pris.']);
  breakfast('pain-perdu','Pain perdu à la cannelle',20,'toast','pain:4:tranche|oeufs:1:pièce|lait:150:ml|sucre:20|beurre:20|cannelle:0.5:c. à café',[
    'Fouettez la quantité d’œuf prévue avec le lait, le sucre et la cannelle. Trempez brièvement les tranches de pain dans ce mélange sans les laisser se défaire.',
    'Faites fondre le beurre dans une poêle et faites dorer le pain à feu moyen 2 à 3 minutes par face.',
    'Vérifiez que le mélange d’œuf est bien cuit au centre et servez immédiatement.']);
  breakfast('toast-avocat-oeuf','Toast avocat et œuf au plat',15,'toast','pain:4:tranche|avocat:1:pièce|oeufs:2:pièce|citron:0.5:pièce|paprika:0.5:c. à café',[
    'Écrasez la chair de l’avocat avec un peu de jus de citron, du sel et le paprika. Grillez le pain.',
    'Faites cuire les œufs au plat dans une poêle légèrement huilée, jusqu’à ce que les blancs soient pris.',
    'Tartinez le pain d’avocat et ajoutez les œufs. Poivrez et servez aussitôt.']);
  breakfast('toast-ricotta-fraises','Tartines de ricotta et fraises',10,'toast','pain:4:tranche|ricotta:150|fraises:200|miel:20|citron:0.25:pièce',[
    'Grillez les tranches de pain et coupez les fraises lavées en morceaux.',
    'Mélangez la ricotta avec un peu de jus de citron et la moitié du miel.',
    'Tartinez le pain de ricotta, ajoutez les fraises et le reste du miel. Servez immédiatement.']);
  breakfast('oeufs-brouilles-tomates','Œufs brouillés aux tomates',15,'omelette','oeufs:4:pièce|tomates:250|pain:4:tranche|beurre:15|basilic:8',[
    'Coupez les tomates en petits dés. Faites-les revenir dans une poêle avec une partie du beurre pour évaporer leur eau.',
    'Battez les œufs avec du sel et du poivre. Baissez le feu puis ajoutez-les à la poêle en remuant doucement jusqu’à ce qu’ils soient pris mais moelleux.',
    'Grillez le pain et servez avec les œufs et le basilic ciselé.']);
  breakfast('omelette-epinards-feta','Omelette du matin, épinards et feta',15,'omelette','oeufs:4:pièce|epinards:150|feta:70|pain:4:tranche',[
    'Lavez les épinards et faites-les tomber dans une poêle huilée. Laissez évaporer l’excès d’eau.',
    'Battez les œufs avec du poivre et peu de sel, puis ajoutez la feta émiettée. Versez sur les épinards et cuisez à feu doux.',
    'Quand les œufs sont pris, repliez l’omelette. Servez avec le pain grillé.']);
  breakfast('smoothie-banane-fruits-rouges','Smoothie banane et fruits rouges',5,'smoothie','banane:1:pièce|fruits-rouges:150|yaourt:150|lait:200:ml|flocons-avoine:30',[
    'Pelez la banane et coupez-la en rondelles. Préparez les fruits rouges selon leur paquet s’ils sont surgelés.',
    'Placez fruits, yaourt, lait et flocons d’avoine dans le blender.',
    'Mixez jusqu’à obtenir une boisson lisse. Ajoutez un peu de lait si nécessaire et servez aussitôt.']);
  breakfast('smoothie-mangue-coco','Smoothie mangue et coco',5,'smoothie','mangue:1:pièce|banane:1:pièce|lait-coco:150:ml|lait:150:ml|citron-vert:0.5:pièce',[
    'Prélevez la chair de la mangue et pelez la banane. Coupez les fruits en morceaux.',
    'Mixez-les avec les laits et un peu de jus de citron vert.',
    'Ajoutez de l’eau fraîche ou du lait si le smoothie est trop épais. Servez immédiatement.']);
  breakfast('granola-poele','Granola express à la poêle',15,'oatmeal','flocons-avoine:100|amandes:35|graines-courge:25|miel:35|beurre:15|yaourt:250',[
    'Concassez les amandes. Faites fondre le beurre avec le miel à feu doux dans une grande poêle.',
    'Ajoutez avoine, amandes et graines, puis faites dorer 7 à 9 minutes à feu doux en remuant continuellement pour ne pas brûler le miel.',
    'Étalez sur une assiette et laissez refroidir : le granola devient croustillant. Servez avec le yaourt.']);
  breakfast('bowl-skyr-kiwi','Bol de skyr au kiwi et graines',5,'yogurt','skyr:300|kiwi:2:pièce|graines-chia:15|granola:50|miel:15',[
    'Pelez les kiwis et coupez-les en morceaux. Répartissez le skyr dans des bols.',
    'Ajoutez kiwi et granola, puis parsemez de graines de chia en petite quantité.',
    'Terminez avec un filet de miel et servez immédiatement pour garder le granola croquant.']);
  breakfast('tartines-banane-cacahuete','Tartines banane et cacahuète',8,'toast','pain:4:tranche|banane:1:pièce|beurre-cacahuete:40|cannelle:0.5:c. à café|graines-chia:10',[
    'Grillez les tranches de pain et coupez la banane en rondelles.',
    'Étalez le beurre de cacahuète sur le pain encore tiède puis répartissez la banane.',
    'Parsemez de cannelle et d’un peu de graines de chia. Servez immédiatement.']);
  breakfast('bowl-semoule-dattes','Semoule du matin aux dattes',12,'pudding','semoule-fine:60|lait:350:ml|dattes:60|amandes:25|cannelle:0.5:c. à café',[
    'Dénoyautez les dattes et coupez-les en petits morceaux. Faites chauffer le lait avec les dattes et la cannelle.',
    'Versez la semoule fine en pluie, puis cuisez à feu doux selon le paquet en remuant régulièrement.',
    'Répartissez dans des bols et ajoutez les amandes concassées. Les dattes sucrent naturellement la préparation.']);

  if (additions.length !== 140) throw new Error(`Collection B incomplète : ${additions.length} recettes au lieu de 140`);
  const used = new Set(data.recipes.map(recipe => recipe.id));
  for (const recipe of additions) {
    if (used.has(recipe.id)) throw new Error(`Identifiant de recette dupliqué : ${recipe.id}`);
    if (recipe.ingredients.some(item => !Number.isFinite(item.quantity) || item.quantity <= 0)) throw new Error(`Quantité invalide : ${recipe.id}`);
    used.add(recipe.id);
  }
  data.recipes.push(...additions);
})();
