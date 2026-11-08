/* Moteur local de sélection et de courses, sans requête réseau. */
(() => {
  const plain = text => String(text ?? '').trim().toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const lookup = new Map();
  const data = globalThis.MealData || {pantrySuggestions:[],aliases:{}};
  for (const item of data.pantrySuggestions) {
    lookup.set(plain(item.id),item.id);
    lookup.set(plain(item.name),item.id);
  }
  for (const [id,aliases] of Object.entries(data.aliases || {})) {
    for (const alias of aliases) if(!lookup.has(plain(alias)))lookup.set(plain(alias),id);
  }
  const normalizeIngredient = text => {
    const value = plain(typeof text === 'object' && text !== null ? text.id || text.name : text);
    return lookup.get(value) || value.replace(/ /g,'-');
  };
  const optional = new Set(['huile','huile-olive','huile-d-olive','sel','poivre','eau']);
  const pantryIds = pantry => new Set((Array.isArray(pantry) ? pantry : []).map(normalizeIngredient).filter(Boolean));
  // Only a generic ingredient can accept a more specific compatible product.
  // A recipe asking for parmesan, risotto rice or coconut milk remains specific.
  const compatible = {
    pates:['pates-completes','pates-fraiches','pates-sans-gluten','spaghetti','penne','fusilli','tagliatelles','macaroni','coquillettes'],
    riz:['riz-basmati','riz-complet','riz-long','riz-thai','riz-noir','riz-rouge'],
    fromage:['emmental','gruyere','comte','gouda','edam','mimolette','fromage-rape'],
    lait:['lait-entier','lait-demi-ecreme','lait-ecreme'],
    creme:['creme-liquide','creme-epaisse','creme-fraiche','creme-legere'],
    poulet:['blanc-poulet','blanc-de-poulet','filet-poulet','filet-de-poulet','escalope-poulet'],
    tomates:['tomates-cerises','tomate-cerise'],
    oignon:['oignon-rouge','oignon-jaune','oignon-blanc'],
    poivron:['poivron-rouge','poivron-vert','poivron-jaune'],
    champignons:['pleurotes','shiitake','cepes','girolles'],
    salade:['mache','sucrine','scarole','roquette'],
    epinards:['pousses-epinards'],
    pain:['pain-complet','pain-seigle'],
    yaourt:['yaourt-grec','skyr'],
    beurre:['beurre-demi-sel'],
    amandes:['amandes-effilees'],
    'fruits-rouges':['fraises','framboises','myrtilles','mures','groseilles','cassis'],
    vinaigre:['vinaigre-cidre','vinaigre-riz'],
    chapelure:['chapelure-panko'],
    'chataignes-cuites':['marrons']
  };
  const ingredientAvailable = (id,available) => available.has(id) || (compatible[id] || []).some(specific=>available.has(specific));
  const categoryOf = recipe => {
    if(recipe.category)return recipe.category;
    const name=plain(`${recipe.id} ${recipe.title} ${recipe.visual}`);
    if(/salade|taboule/.test(name))return 'Salades';
    if(/soupe|veloute/.test(name))return 'Soupes';
    if(/pate|riz|gnocchi|nouille|risotto/.test(name))return 'Pâtes & riz';
    if(/thon|saumon|poisson|crevette/.test(name))return 'Poissons';
    if(!recipe.vegetarian)return 'Viandes';
    if(/gratin|quiche|pizza|tarte/.test(name))return 'Au four';
    return 'Végétarien';
  };
  const matchRecipe = (recipe,pantry=[]) => {
    const available = pantryIds(pantry);
    const required = (recipe.ingredients || []).filter(item => !optional.has(normalizeIngredient(item.id || item.name)));
    const matched = required.filter(item => ingredientAvailable(normalizeIngredient(item.id || item.name),available));
    const missing = required.filter(item => !ingredientAvailable(normalizeIngredient(item.id || item.name),available));
    const substitutions=matched.filter(item=>!available.has(normalizeIngredient(item.id))).map(item=>({ingredient:item.id,product:(compatible[normalizeIngredient(item.id)]||[]).find(id=>available.has(id))}));
    return {matched,missing,substitutions,score:required.length ? matched.length / required.length : 0,ready:required.length > 0 && missing.length === 0};
  };
  const rankRecipes = (recipes,pantry=[],filters={}) => {
    const query = plain(filters.query);
    const maxTime = Number(filters.maxTime);
    return recipes.filter(recipe => {
      if (filters.vegetarian && !recipe.vegetarian) return false;
      if (Number.isFinite(maxTime) && maxTime > 0 && recipe.time > maxTime) return false;
      if(filters.category && filters.category!=='all') {
        if(filters.category==='Rapide' && recipe.time>20)return false;
        if(filters.category==='Végétarien' && !recipe.vegetarian)return false;
        if(!['Rapide','Végétarien'].includes(filters.category) && categoryOf(recipe)!==filters.category)return false;
      }
      const haystack=plain([recipe.title,recipe.subtitle,...recipe.ingredients.map(item=>item.name)].join(' '));
      if(query && !query.split(' ').every(term=>haystack.includes(term)))return false;
      return true;
    }).map(recipe => ({...recipe,category:categoryOf(recipe),match:matchRecipe(recipe,pantry)})).sort((a,b) => {
      if(filters.sort==='time' && a.time!==b.time)return a.time-b.time;
      if(filters.sort==='missing' && a.match.missing.length!==b.match.missing.length)return a.match.missing.length-b.match.missing.length;
      return b.match.score - a.match.score || a.match.missing.length - b.match.missing.length || a.time - b.time || a.title.localeCompare(b.title,'fr');
    });
  };
  const searchProducts = (query='',category='all',limit=100) => {
    const terms=plain(query).split(' ').filter(Boolean);
    return data.pantrySuggestions.filter(item=>{
      if(category!=='all' && item.category!==category)return false;
      const text=plain([item.name,item.id,...(data.aliases?.[item.id]||[])].join(' '));
      return terms.every(term=>text.includes(term));
    }).sort((a,b)=>{
      const startsA=plain(a.name).startsWith(plain(query)),startsB=plain(b.name).startsWith(plain(query));
      return Number(startsB)-Number(startsA)||a.name.localeCompare(b.name,'fr');
    }).slice(0,limit);
  };
  const portions = (value,fallback=2) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  };
  const shoppingList = (selections,pantry=[],servings=2) => {
    const available = pantryIds(pantry);
    const entries = new Map();
    for (const selection of selections || []) {
      const recipe = selection?.recipe || selection;
      if (!recipe || !Array.isArray(recipe.ingredients)) continue;
      const scale = portions(selection?.recipe ? selection.servings : servings,portions(servings)) / portions(recipe.servings);
      for (const item of recipe.ingredients) {
        const id = normalizeIngredient(item.id || item.name);
        if (ingredientAvailable(id,available) || optional.has(id)) continue;
        const quantity = Number(item.quantity);
        if (!Number.isFinite(quantity) || quantity < 0) continue;
        const unit = item.unit || '';
        const key = `${id}:${unit}`;
        let entry = entries.get(key);
        if (!entry) {
          entry = {id,key,name:item.name,quantity:0,unit,category:item.category || 'Épicerie',recipeIds:[]};
          entries.set(key,entry);
        }
        entry.quantity = Math.round((entry.quantity + quantity * scale) * 1000) / 1000;
        if (recipe.id && !entry.recipeIds.includes(recipe.id)) entry.recipeIds.push(recipe.id);
      }
    }
    return [...entries.values()].sort((a,b) => a.category.localeCompare(b.category,'fr') || a.name.localeCompare(b.name,'fr') || a.unit.localeCompare(b.unit,'fr'));
  };
  globalThis.MealEngine = {normalizeIngredient,matchRecipe,rankRecipes,shoppingList,searchProducts,categoryOf};
})();
