/* Catalogue original de produits du quotidien. Les formes crues, cuites et en conserve
   restent distinctes lorsqu'elles changent la préparation d'une recette. */
(() => {
  'use strict';
  const data = globalThis.MealData;
  if (!data) throw new Error('recipes.js doit être chargé avant catalog.js');
  const categories = ['Légumes','Fruits','Viandes','Poissons','Frais','Féculents','Légumineuses','Conserves','Épicerie','Épices & herbes','Pâtisserie','Surgelés','Sauces'];
  const tables = {
    'Légumes': `
tomates|Tomates|tomate
tomates-cerises|Tomates cerises|tomate cerise
courgette|Courgette|courgettes
carotte|Carottes|carotte
oignon|Oignon|oignons
oignon-rouge|Oignon rouge|oignons rouges
oignon-nouveau|Oignons nouveaux|oignon nouveau;cébettes;cébette
echalote|Échalotes|échalote
ail|Ail|gousse d'ail;gousses d'ail
pommes-de-terre|Pommes de terre|pomme de terre;patate;patates
patate-douce|Patate douce|patates douces
epinards|Épinards|épinard
brocoli|Brocoli|brocolis;broccoli
chou-fleur|Chou-fleur|chou fleur;choux fleurs
chou-blanc|Chou blanc|choux blancs
chou-rouge|Chou rouge|choux rouges
chou-vert|Chou vert|choux verts
chou-kale|Chou kale|kale;chou frisé
choux-bruxelles|Choux de Bruxelles|chou de Bruxelles
chou-chinois|Chou chinois|choux chinois
pak-choi|Pak-choï|bok choy;pak choi
poivron|Poivron|poivrons
poivron-rouge|Poivron rouge|poivrons rouges
poivron-vert|Poivron vert|poivrons verts
poivron-jaune|Poivron jaune|poivrons jaunes
piment-frais|Piment frais|piments frais
champignons|Champignons|champignon;champignons de Paris;champignon de Paris
pleurotes|Pleurotes|pleurote
shiitake|Shiitakés|shiitake;shiitakes
cepes|Cèpes|cèpe
girolles|Girolles|girolle
salade|Salade|laitue
roquette|Roquette
mache|Mâche
endive|Endives|endive;chicon;chicons
sucrine|Sucrines|sucrine
scarole|Scarole
concombre|Concombre|concombres
aubergine|Aubergine|aubergines
petits-pois|Petits pois|petit pois
haricots-verts|Haricots verts|haricot vert
haricots-plats|Haricots plats|haricot plat
poireau|Poireaux|poireau
navet|Navets|navet
panais|Panais
radis|Radis
radis-noir|Radis noir|radis noirs
betterave|Betteraves cuites|betterave cuite;betteraves;betterave
betterave-crue|Betterave crue|betteraves crues
celeri|Céleri branche|céleri;branches de céleri;céleri en branches
celeri-rave|Céleri-rave|céleri rave
fenouil|Fenouil|fenouils
potiron|Potiron|courge musquée
potimarron|Potimarron|potimarrons
butternut|Butternut|courge butternut;courge doubeurre
courge-spaghetti|Courge spaghetti
artichaut|Artichauts|artichaut
asperges|Asperges|asperge
blettes|Blettes|blette;bettes;bette
salsifis|Salsifis
topinambour|Topinambours|topinambour
rutabaga|Rutabaga|rutabagas
germes-soja|Pousses de haricot mungo|pousses de soja;germes de soja
pousses-epinards|Pousses d'épinards|jeunes pousses d'épinards
mais-frais|Épi de maïs|épis de maïs;mais en épi
coeur-palmier|Cœurs de palmier|coeur de palmier
avocat|Avocat|avocats
`,
    'Fruits': `
citron|Citron|citrons
citron-vert|Citron vert|citrons verts;lime;limes
orange|Orange|oranges
orange-sanguine|Orange sanguine|oranges sanguines
mandarine|Mandarines|mandarine
clementine|Clémentines|clémentine
pamplemousse|Pamplemousse|pamplemousses;pomelo
pomme|Pommes|pomme
poire|Poires|poire
banane|Bananes|banane
banane-plantain|Banane plantain|plantain;bananes plantain
fraises|Fraises|fraise
framboises|Framboises|framboise
myrtilles|Myrtilles|myrtille
mures|Mûres|mûre
groseilles|Groseilles|groseille
cassis|Cassis
fruits-rouges|Fruits rouges|mélange de fruits rouges
cerises|Cerises|cerise
abricots|Abricots|abricot
peche|Pêches|pêche
nectarine|Nectarines|nectarine;brugnon;brugnons
prune|Prunes|prune
mirabelles|Mirabelles|mirabelle
raisin|Raisin|raisins frais;grappe de raisin
kiwi|Kiwis|kiwi
ananas|Ananas
mangue|Mangue|mangues
papaye|Papaye|papayes
fruit-passion|Fruits de la passion|fruit de la passion;maracuja
grenade|Grenade|grenades
litchis|Litchis|litchi
melon|Melon|melons
pasteque|Pastèque|pastèques
figues|Figues fraîches|figue fraîche;figues;figue
dattes|Dattes|datte
pruneaux|Pruneaux|pruneau
abricots-secs|Abricots secs|abricot sec
figues-seches|Figues sèches|figue sèche
raisins-secs|Raisins secs|raisin sec
cranberries|Cranberries séchées|canneberges séchées;cranberry
baies-goji|Baies de goji|baie de goji
noix-coco|Noix de coco|noix de coco fraîche
coing|Coings|coing
rhubarbe|Rhubarbe
kaki|Kakis|kaki
kumquats|Kumquats|kumquat
carambole|Carambole
fruit-dragon|Fruit du dragon|pitaya
bergamote|Bergamote
`,
    'Viandes': `
poulet|Poulet|blanc de poulet;blancs de poulet;filet de poulet;filets de poulet
cuisses-poulet|Cuisses de poulet|cuisse de poulet
ailes-poulet|Ailes de poulet|aile de poulet
poulet-roti|Poulet rôti|restes de poulet rôti
dinde|Dinde|escalope de dinde;escalopes de dinde;filet de dinde
boeuf|Bœuf|boeuf;steak de bœuf;bavette;rumsteck
boeuf-hache|Bœuf haché|boeuf hache;viande hachée;steak haché;steaks hachés
boeuf-bourguignon|Bœuf à mijoter|bourguignon;paleron;macreuse;boeuf bourguignon
veau|Veau|escalope de veau;escalopes de veau
veau-mijoter|Veau à mijoter|blanquette de veau;sauté de veau
porc|Porc|échine de porc;sauté de porc;longe de porc
filet-mignon|Filet mignon de porc|filet mignon
cotes-porc|Côtes de porc|côte de porc
poitrine-porc|Poitrine de porc|poitrine fraîche
agneau|Agneau|épaule d'agneau;gigot;gigot d'agneau
agneau-hache|Agneau haché
magret-canard|Magret de canard|magret;magrets de canard
cuisses-canard|Cuisses de canard|cuisse de canard
confit-canard|Confit de canard|cuisses de canard confites
lapin|Lapin
chair-saucisse|Chair à saucisse|farce à saucisse
saucisses|Saucisses|saucisse;saucisse de Toulouse;saucisses de Toulouse
saucisses-fumees|Saucisses fumées|saucisse fumée;saucisse de Montbéliard
merguez|Merguez
chipolatas|Chipolatas|chipolata
boudin-noir|Boudin noir
boudin-blanc|Boudin blanc
jambon|Jambon|jambon blanc;jambon cuit
jambon-cru|Jambon cru|jambon sec;jambon de Parme
lardons|Lardons|lardon;lardons fumés
bacon|Bacon
chorizo|Chorizo
pancetta|Pancetta
coppa|Coppa
rosette|Rosette|saucisson sec;saucisson
foie-volaille|Foies de volaille|foie de volaille
gesiers|Gésiers|gésier
saindoux|Saindoux
`,
    'Poissons': `
saumon|Saumon frais|saumon;pavé de saumon;filet de saumon
saumon-fume|Saumon fumé|tranches de saumon fumé
truite|Truite|truites;filet de truite
truite-fumee|Truite fumée
cabillaud|Cabillaud|dos de cabillaud;filet de cabillaud
colin|Colin|merlu;filet de colin;filet de merlu
lieu-noir|Lieu noir|filet de lieu
eglefin|Églefin|aiglefin
haddock|Haddock|églefin fumé
sole|Sole|soles
daurade|Daurade|dorade;daurades;dorades
bar|Bar|loup de mer
lotte|Lotte|baudroie;queue de lotte
rouget|Rougets|rouget
turbot|Turbot
maquereau-frais|Maquereau frais|maquereaux frais
sardines-fraiches|Sardines fraîches|sardine fraîche
thon-frais|Thon frais|pavé de thon;steak de thon
espadon|Espadon
hareng|Hareng|harengs
hareng-fume|Hareng fumé|harengs fumés
crevettes|Crevettes décortiquées|crevettes;crevette;crevettes roses
gambas|Gambas
langoustines|Langoustines|langoustine
moules|Moules|moule
palourdes|Palourdes|palourde
coques|Coques|coque
huitres|Huîtres|huître
saint-jacques|Noix de Saint-Jacques|saint jacques;coquilles saint jacques
calamars|Calamars|calamar;encornets;encornet
seiche|Seiche|seiches
poulpe|Poulpe|pieuvre
crabe|Chair de crabe|crabe
surimi|Surimi|bâtonnets de surimi
oeufs-poisson|Œufs de poisson|oeufs de lump;œufs de truite
algues-nori|Algues nori|nori;feuilles de nori
algues-wakame|Algues wakamé|wakame;wakamé
`,
    'Frais': `
oeufs|Œufs|œuf;œufs;oeuf;oeufs;eggs
creme|Crème fraîche|crème;crème liquide;creme fraiche;creme liquide
creme-epaisse|Crème épaisse|crème fraîche épaisse
creme-legere|Crème légère|crème allégée
lait|Lait|lait de vache;lait demi-écrémé;lait entier
lait-chevre|Lait de chèvre
lait-sans-lactose|Lait sans lactose
beurre|Beurre|beurre doux
beurre-demi-sel|Beurre demi-sel|beurre salé
yaourt|Yaourt nature|yaourts;yogourt;yaourt
yaourt-grec|Yaourt grec|yaourt à la grecque;yaourts grecs
skyr|Skyr
fromage-blanc|Fromage blanc
petit-suisse|Petits-suisses|petit suisse;petits suisses
faisselle|Faisselle
kefir|Kéfir|kefir de lait
fromage|Fromage râpé|fromage rape;fromages râpés
emmental|Emmental|emmenthal
gruyere|Gruyère|gruyere
comte|Comté|comte
parmesan|Parmesan|parmigiano;parmigiano reggiano
pecorino|Pecorino|pecorino romano
cheddar|Cheddar
gouda|Gouda
edam|Edam
mimolette|Mimolette
mozzarella|Mozzarella|mozza
burrata|Burrata
feta|Feta|fêta
chevre|Fromage de chèvre|chèvre;chevre;bûche de chèvre;buche de chevre
chevre-frais|Chèvre frais|fromage de chèvre frais
ricotta|Ricotta
mascarpone|Mascarpone
cream-cheese|Fromage frais à tartiner|cream cheese;fromage à tartiner;fromage frais nature;saint môret;saint moret
cottage-cheese|Cottage cheese
brie|Brie
camembert|Camembert
reblochon|Reblochon
raclette|Fromage à raclette|raclette
roquefort|Roquefort
bleu|Fromage bleu|bleu;bleu d'auvergne
gorgonzola|Gorgonzola
munster|Munster
maroilles|Maroilles
halloumi|Halloumi
paneer|Paneer|panir
tofu|Tofu|tofu nature;tofu ferme
tofu-soyeux|Tofu soyeux
tofu-fume|Tofu fumé
tempeh|Tempeh
seitan|Seitan
creme-soja|Crème de soja|soja cuisine;crème soja
creme-avoine|Crème d'avoine|avoine cuisine
creme-riz|Crème de riz|riz cuisine
yaourt-soja|Yaourt de soja|yaourt végétal nature;yaourt soja
`,
    'Féculents': `
pates|Pâtes|pâte;pate;spaghetti;spaghettis;penne;tagliatelles;coquillettes;macaroni
pates-completes|Pâtes complètes|pâte complète
pates-sans-gluten|Pâtes sans gluten
feuilles-lasagnes|Feuilles de lasagnes|lasagnes;pâtes à lasagnes;feuilles de lasagne
pates-fraiches|Pâtes fraîches|tagliatelles fraîches
raviolis|Raviolis|ravioli
tortellinis|Tortellinis|tortellini
gnocchis|Gnocchis|gnocchi
riz|Riz
riz-basmati|Riz basmati|basmati
riz-complet|Riz complet|riz brun
riz-risotto|Riz à risotto|riz arborio;arborio;carnaroli;riz rond italien
riz-sushi|Riz à sushi|riz japonais;riz pour sushi
riz-rond|Riz rond à dessert|riz rond;riz à dessert;riz au lait
riz-thai|Riz thaï|riz jasmin
riz-noir|Riz noir|riz venere
riz-rouge|Riz rouge
riz-sauvage|Riz sauvage
quinoa|Quinoa
boulgour|Boulgour|boulghour
semoule|Semoule|couscous;semoule de couscous
semoule-fine|Semoule fine de blé|semoule fine;semoule de blé fine;semoule de blé dur fine
polenta|Polenta|semoule de maïs
sarrasin|Sarrasin en grains|graines de sarrasin;kasha
orge|Orge perlé|orge
epeautre|Épeautre|petit épeautre
millet|Millet
amarante|Amarante
avoine-grains|Avoine en grains
nouilles|Nouilles|nouille;nouilles de blé
nouilles-riz|Nouilles de riz|vermicelles de riz
nouilles-soba|Nouilles soba|soba
nouilles-udon|Nouilles udon|udon
vermicelles|Vermicelles|vermicelle
nouilles-verre|Vermicelles de haricot mungo|nouilles de verre
pain|Pain|pain de mie;baguette
pain-complet|Pain complet|pain intégral
pain-seigle|Pain de seigle
pain-pita|Pain pita|pita;pitas
pain-burger|Pains à burger|pain burger;buns;bun
tortillas|Tortillas|tortilla;wrap;wraps
naan|Naans|naan;pain naan
bagels|Bagels|bagel
biscuits-sales|Crackers salés|crackers;biscuits apéritifs
biscottes|Biscottes|biscotte
pate-brisee|Pâte brisée|pate brisee
pate-feuilletee|Pâte feuilletée|pate feuilletee
pate-pizza|Pâte à pizza|pate a pizza;pâte pizza
feuilles-brick|Feuilles de brick|brick;bricks;feuille de brick
pate-filo|Pâte filo|pâte phyllo;feuilles de filo
galettes-sarrasin|Galettes de sarrasin|galette de sarrasin;galettes de blé noir
feuilles-riz|Galettes de riz à rouler|feuilles de riz;papier de riz
`,
    'Légumineuses': `
pois-chiches|Pois chiches cuits|pois chiche;pois chiches;pois chiches en conserve
pois-chiches-secs|Pois chiches secs|pois chiche sec
lentilles|Lentilles cuites|lentilles en conserve;lentilles vertes cuites;lentille cuite
lentilles-vertes|Lentilles vertes sèches|lentilles vertes;lentille verte;lentilles sèches
lentilles-corail|Lentilles corail|lentille corail
lentilles-beluga|Lentilles beluga|lentille beluga;lentilles noires
lentilles-blondes|Lentilles blondes|lentille blonde
haricots-rouges|Haricots rouges cuits|haricot rouge;haricots rouges;haricots rouges en conserve
haricots-blancs|Haricots blancs cuits|haricot blanc;haricots blancs;haricots blancs en conserve
haricots-noirs|Haricots noirs cuits|haricot noir;haricots noirs;haricots noirs en conserve
haricots-rouges-secs|Haricots rouges secs|haricot rouge sec
haricots-blancs-secs|Haricots blancs secs|haricot blanc sec
haricots-noirs-secs|Haricots noirs secs|haricot noir sec
flageolets|Flageolets cuits|flageolet;flageolets
haricots-mungo|Haricots mungo|haricot mungo
azukis|Haricots azuki|azuki;azukis
feves|Fèves|fève;fèves écossées
pois-casses|Pois cassés|pois cassé
edamame|Edamame|fèves de soja;edamames
proteines-soja|Protéines de soja texturées|pst;soja texturé
lupins|Lupins|lupin
`,
    'Conserves': `
thon|Thon en boîte|thon en boite;thon au naturel;boîte de thon
sardines|Sardines en boîte|sardine en boîte;sardines en conserve
maquereau|Maquereau en boîte|maquereaux en boîte;maquereau en conserve
anchois|Anchois|filets d'anchois
saumon-conserve|Saumon en conserve|saumon en boîte
foie-morue|Foie de morue
tomates-concassees|Tomates concassées|tomate concassée;pulpe de tomate;tomates en boîte;tomates pelées
concentre-tomate|Concentré de tomate|double concentré de tomates;concentré de tomates
coulis-tomate|Coulis de tomate|passata;purée de tomates;coulis de tomates
mais|Maïs|mais en boite;maïs doux;maïs en conserve
petits-pois-conserve|Petits pois en conserve|petits pois en boîte
haricots-verts-conserve|Haricots verts en conserve|haricots verts en boîte
champignons-conserve|Champignons en conserve|champignons en boîte
artichauts-conserve|Cœurs d'artichaut en conserve|coeurs d'artichauts;cœurs d'artichauts
asperges-conserve|Asperges en conserve|asperges en bocal
poivrons-grilles|Poivrons grillés en bocal|poivrons grillés
tomates-sechees|Tomates séchées|tomates confites;tomate séchée
olives-vertes|Olives vertes|olive verte
olives-noires|Olives noires|olive noire
capres|Câpres|câpre
cornichons|Cornichons|cornichon
pickles|Pickles de légumes|légumes au vinaigre
citron-confit|Citrons confits|citron confit
ananas-conserve|Ananas en conserve|ananas en boîte
peches-conserve|Pêches au sirop|pêches en conserve
poires-conserve|Poires au sirop|poires en conserve
lait-coco|Lait de coco|lait coco
creme-coco|Crème de coco|creme de coco
lait-concentre-sucre|Lait concentré sucré
lait-concentre|Lait concentré non sucré|lait évaporé
`,
    'Épicerie': `
huile-olive|Huile d'olive|huile olive
huile-tournesol|Huile de tournesol
huile-colza|Huile de colza
huile-sesame|Huile de sésame
huile-coco|Huile de coco
huile-noix|Huile de noix
huile-avocat|Huile d'avocat
vinaigre|Vinaigre|vinaigre de vin
vinaigre-cidre|Vinaigre de cidre
vinaigre-balsamique|Vinaigre balsamique|balsamique
vinaigre-riz|Vinaigre de riz
bouillon|Bouillon de légumes|cube de bouillon;bouillon de legumes
bouillon-volaille|Bouillon de volaille|fond de volaille;cube de volaille
bouillon-boeuf|Bouillon de bœuf|bouillon boeuf;fond de boeuf
fumet-poisson|Fumet de poisson|bouillon de poisson
vin-blanc|Vin blanc sec|vin blanc
vin-rouge|Vin rouge
biere|Bière|bière blonde
cidre|Cidre
noix|Noix|cerneaux de noix;cerneau de noix
noisettes|Noisettes|noisette
amandes|Amandes|amande
amandes-effilees|Amandes effilées|amande effilée
noix-cajou|Noix de cajou|cajou;cajous
noix-pecan|Noix de pécan|pécan
pistaches|Pistaches|pistache
noix-bresil|Noix du Brésil
noix-macadamia|Noix de macadamia|macadamia
cacahuetes|Cacahuètes|cacahuète;arachides;arachide
pignons|Pignons de pin|pignon de pin;pignons
graines-tournesol|Graines de tournesol
graines-courge|Graines de courge
graines-sesame|Graines de sésame|sésame;sesame
graines-chia|Graines de chia|chia
graines-lin|Graines de lin
graines-pavot|Graines de pavot|pavot
graines-chanvre|Graines de chanvre
chapelure|Chapelure
chapelure-panko|Chapelure panko|panko
levure-maltee|Levure maltée|levure nutritionnelle;levure de bière alimentaire
lait-amande|Boisson à l'amande|lait d'amande;lait amande
lait-avoine|Boisson à l'avoine|lait d'avoine;lait avoine
lait-soja|Boisson au soja|lait de soja;lait soja
lait-riz|Boisson au riz|lait de riz;lait riz
lait-noisette|Boisson à la noisette|lait de noisette
`,
    'Épices & herbes': `
basilic|Basilic
persil|Persil
coriandre|Coriandre fraîche|coriandre
menthe|Menthe
ciboulette|Ciboulette
aneth|Aneth
estragon|Estragon
cerfeuil|Cerfeuil
thym|Thym
romarin|Romarin
origan|Origan
sauge|Sauge
sarriette|Sarriette
laurier|Laurier|feuilles de laurier
citronnelle|Citronnelle
gingembre|Gingembre frais|gingembre
galanga|Galanga
curcuma-frais|Curcuma frais
curry|Curry|curry en poudre
paprika|Paprika|paprika doux
paprika-fume|Paprika fumé|pimentón
cumin|Cumin
curcuma|Curcuma en poudre|curcuma
coriandre-moulue|Coriandre moulue|coriandre en poudre
gingembre-moulu|Gingembre moulu|gingembre en poudre
garam-masala|Garam masala
ras-el-hanout|Ras el-hanout|ras el hanout
colombo|Colombo
tandoori|Épices tandoori|tandoori
quatre-epices|Quatre-épices|4 épices
cinq-epices|Cinq-épices|5 épices
herbes-provence|Herbes de Provence
zaatar|Zaatar|za'atar;zaatar libanais
sumac|Sumac
piment-espelette|Piment d'Espelette|espelette
piment-cayenne|Piment de Cayenne|cayenne
flocons-piment|Flocons de piment|piment en flocons
piment-doux|Piment doux
safran|Safran
cannelle|Cannelle|cannelle en poudre
muscade|Noix de muscade|muscade
clou-girofle|Clous de girofle|clou de girofle
cardamome|Cardamome
badiane|Badiane|anis étoilé
anis-vert|Anis vert
fenugrec|Fenugrec
graines-fenouil|Graines de fenouil
graines-moutarde|Graines de moutarde
baies-genievre|Baies de genièvre|genièvre
baies-roses|Baies roses
poivre-sichuan|Poivre du Sichuan|poivre sichuan
poivre-noir|Poivre noir|poivre en grains
poivre-blanc|Poivre blanc
sel|Sel|sel fin
fleur-sel|Fleur de sel
gros-sel|Gros sel
ail-poudre|Ail en poudre|ail semoule
oignon-poudre|Oignon en poudre
epices-cajun|Épices cajun|cajun
epices-chili|Épices chili|chili en poudre
`,
    'Pâtisserie': `
farine|Farine|farine de blé;farine blanche;farine t45;farine t55
farine-complete|Farine complète|farine intégrale;farine t150
farine-semi-complete|Farine semi-complète|farine t80
farine-sarrasin|Farine de sarrasin|farine de blé noir
farine-chataigne|Farine de châtaigne
farine-riz|Farine de riz
farine-mais|Farine de maïs
farine-pois-chiches|Farine de pois chiches
farine-epeautre|Farine d'épeautre
farine-seigle|Farine de seigle
fecule-mais|Fécule de maïs|maïzena;maizena;amidon de maïs
fecule-pomme-terre|Fécule de pomme de terre
sucre|Sucre|sucre blanc;sucre en poudre;sucre semoule
cassonade|Cassonade|sucre roux
sucre-glace|Sucre glace
sucre-vanille|Sucre vanillé
sucre-coco|Sucre de coco
vergeoise|Vergeoise
miel|Miel
sirop-erable|Sirop d'érable
sirop-agave|Sirop d'agave
melasse|Mélasse
chocolat-noir|Chocolat noir|chocolat pâtissier;chocolat à pâtisser
chocolat-lait|Chocolat au lait
chocolat-blanc|Chocolat blanc
pepites-chocolat|Pépites de chocolat|pépite de chocolat
cacao|Cacao non sucré|cacao;cacao en poudre
levure-chimique|Levure chimique|poudre à lever;levure à gâteaux
levure-boulanger|Levure de boulanger|levure boulangère;levure de boulanger sèche
bicarbonate|Bicarbonate alimentaire|bicarbonate de soude
vanille|Vanille|extrait de vanille;gousse de vanille
poudre-amandes|Poudre d'amandes|amande en poudre;amandes en poudre
poudre-noisettes|Poudre de noisettes|noisettes en poudre
noix-coco-rapee|Noix de coco râpée|coco râpée
flocons-avoine|Flocons d'avoine|avoine;flocon d'avoine
flocons-sarrasin|Flocons de sarrasin
son-avoine|Son d'avoine
muesli|Muesli|müesli
granola|Granola
corn-flakes|Corn flakes|pétales de maïs
compote-pommes|Compote de pommes|compote de pomme;compote
confiture-fraise|Confiture de fraises|confiture de fraise
confiture-abricot|Confiture d'abricots|confiture d'abricot
confiture-framboise|Confiture de framboises|confiture de framboise
pate-tartiner|Pâte à tartiner|pâte à tartiner chocolat noisette
creme-marrons|Crème de marrons
marrons|Marrons cuits|châtaignes cuites;châtaignes en bocal
chataignes-cuites|Châtaignes cuites|châtaigne cuite;châtaignes en bocal;châtaignes sous vide
chataignes-crues|Châtaignes crues|châtaigne crue;châtaignes;châtaigne
gelatine|Gélatine|feuille de gélatine;gélatine en poudre
agar-agar|Agar-agar|agar agar
fleur-oranger|Eau de fleur d'oranger|fleur d'oranger
eau-rose|Eau de rose
biscuits-cuillere|Biscuits à la cuillère|biscuit cuillère;boudoirs
speculoos|Spéculoos|speculoos
petits-beurre|Petits-beurre|petit beurre;biscuits secs
sables|Sablés|sablé
meringues|Meringues|meringue
`,
    'Surgelés': `
legumes-wok|Mélange de légumes pour wok|légumes wok;poêlée asiatique
legumes-couscous|Légumes pour couscous|mélange couscous
legumes-soupe|Légumes pour soupe|mélange pour soupe
legumes-ratatouille|Légumes pour ratatouille|mélange ratatouille
macedoine-legumes|Macédoine de légumes|macédoine
poelee-champignons|Poêlée de champignons|mélange de champignons
melange-fruits-mer|Mélange de fruits de mer|cocktail de fruits de mer;fruits de mer surgelés
filets-poisson-panes|Filets de poisson panés|poisson pané;poissons panés
steaks-vegetaux|Steaks végétaux|steak végétal;galettes végétales
falafels|Falafels|falafel
frites|Frites surgelées|frites
pommes-noisettes|Pommes noisettes
pommes-dauphines|Pommes dauphines
puree-pommes-terre|Purée de pommes de terre|purée
glace-vanille|Glace à la vanille|glace vanille
glace-chocolat|Glace au chocolat
sorbet-citron|Sorbet au citron|sorbet citron
sorbet-framboise|Sorbet à la framboise
`,
    'Sauces': `
sauce-soja|Sauce soja|sauce de soja;soja
sauce-soja-sucree|Sauce soja sucrée
sauce-teriyaki|Sauce teriyaki|teriyaki
sauce-nuoc-mam|Sauce nuoc-mâm|nuoc mam;sauce poisson;fish sauce
sauce-huitre|Sauce d'huître|sauce huître;oyster sauce
sauce-sriracha|Sriracha|sauce sriracha
sauce-chili-douce|Sauce chili douce|sweet chili;sauce sweet chili
sauce-barbecue|Sauce barbecue|sauce bbq;barbecue
ketchup|Ketchup
mayonnaise|Mayonnaise|mayo
moutarde|Moutarde|moutarde de Dijon
moutarde-ancienne|Moutarde à l'ancienne|moutarde en grains
pesto|Pesto au basilic|pesto;pesto vert;pesto genovese
pesto-rosso|Pesto rosso|pesto rouge
tapenade|Tapenade|tapenade noire;tapenade d'olives
houmous|Houmous|hummus;hommos
tzatziki|Tzatziki
guacamole|Guacamole
sauce-tomate|Sauce tomate cuisinée|sauce tomate;sauce napolitaine
sauce-bolognaise|Sauce bolognaise|bolognaise
sauce-arrabbiata|Sauce arrabbiata|arrabbiata
sauce-bechamel|Sauce béchamel|béchamel
sauce-hollandaise|Sauce hollandaise|hollandaise
sauce-yaourt|Sauce au yaourt|sauce yaourt
harissa|Harissa
pate-curry-rouge|Pâte de curry rouge|curry rouge
pate-curry-vert|Pâte de curry vert|curry vert
pate-curry-jaune|Pâte de curry jaune|curry jaune
pate-miso|Miso|miso;pâte miso
tahin|Tahin|tahini;purée de sésame;pâte de sésame
beurre-cacahuete|Beurre de cacahuète|beurre de cacahuètes;purée de cacahuète;pâte de cacahuète
puree-amandes|Purée d'amandes|purée d'amande
puree-noisettes|Purée de noisettes|purée de noisette
gochujang|Gochujang|pâte de piment coréenne
sambal-oelek|Sambal oelek|sambal
sauce-worcestershire|Sauce Worcestershire|worcestershire
tabasco|Sauce pimentée|tabasco
raifort|Raifort|crème de raifort
chutney-mangue|Chutney de mangue|chutney mangue
`};
  const emojis = {'Légumes':'🥬','Fruits':'🍎','Viandes':'🍗','Poissons':'🐟','Frais':'🥛','Féculents':'🍝','Légumineuses':'🫘','Conserves':'🥫','Épicerie':'🫙','Épices & herbes':'🌿','Pâtisserie':'🍰','Surgelés':'❄️','Sauces':'🥣'};
  const inflections = new Map([
    ['filet','filets'],['pavé','pavés'],['tranche','tranches'],['cube','cubes'],['gousse','gousses'],
    ['cuisse','cuisses'],['aile','ailes'],['escalope','escalopes'],['steak','steaks'],['feuille','feuilles'],
    ['haricot','haricots'],['lentille','lentilles'],['fève','fèves'],['graine','graines'],['fruit','fruits'],
    ['courgette','courgettes'],['aubergine','aubergines'],['poivron','poivrons'],['oignon','oignons'],
    ['carotte','carottes'],['tomate','tomates'],['champignon','champignons'],['pomme','pommes'],
    ['banane','bananes'],['poire','poires'],['fraise','fraises'],['framboise','framboises'],
    ['amande','amandes'],['noisette','noisettes'],['gambas','gambas'],['crevette','crevettes'],
    ['poisson','poissons'],['saucisse','saucisses'],['pain','pains'],['galette','galettes'],
    ['biscuit','biscuits'],['pâte','pâtes'],['nouille','nouilles'],['yaourt','yaourts'],
    ['courge','courges'],['chou','choux'],['côte','côtes'],['œuf','œufs']
  ]);
  const grammaticalVariants = value => {
    const variants = [value];
    const first = value.split(' ')[0].toLocaleLowerCase('fr');
    for (const [singular,plural] of inflections) {
      if (first===singular) variants.push(plural+value.slice(first.length));
      else if (first===plural) variants.push(singular+value.slice(first.length));
    }
    return variants;
  };
  const entries = new Map(data.pantrySuggestions.map(item => [item.id,{...item}]));
  const aliases = Object.fromEntries(Object.entries(data.aliases || {}).map(([id,values])=>[id,[...values]]));
  for (const category of categories) {
    for (const row of tables[category].trim().split('\n')) {
      const [id,name,other=''] = row.split('|');
      if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Identifiant de produit invalide : ${id}`);
      const previous = entries.get(id);
      // Conserver les noms des produits originaux protège les listes déjà enregistrées.
      entries.set(id,{id,name:previous?.name || name,category,emoji:previous?.emoji || emojis[category]});
      aliases[id] = [...new Set([...(aliases[id] || []),name,...other.split(';').filter(Boolean)].flatMap(grammaticalVariants))];
    }
  }
  const plain = text => String(text).toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const canonicalNames = new Map();
  for (const item of entries.values()) {
    canonicalNames.set(plain(item.id),item.id);
    canonicalNames.set(plain(item.name),item.id);
  }
  // Un nom canonique explicite prime sur un ancien alias large : le lait de coco,
  // le fromage affiné ou le thon frais ne deviennent pas un autre produit.
  for (const [id,values] of Object.entries(aliases)) aliases[id]=values.filter(alias=>!canonicalNames.has(plain(alias)) || canonicalNames.get(plain(alias))===id);
  data.pantrySuggestions = [...entries.values()];
  data.aliases = aliases;
  data.categories = categories;
})();
