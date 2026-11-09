(() => {
  'use strict';
  const {recipes, pantrySuggestions} = globalThis.MealData;
  const engine = globalThis.MealEngine;
  const art = globalThis.MealArt;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon = (name, size) => art.icon(name, size);
  const STORAGE_KEY = 'a-table.v1';
  const PAGE_SIZE=24;
  let visibleRecipes=PAGE_SIZE, recipeCategory='all', recipeSort='recommended';
  let productCategory='all', productQuery='', visibleProducts=120;
  let productPreviousFocus=null;
  const localDate = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const today = localDate(new Date());
  const days = Array.from({length:7}, (_, index) => {const date = new Date(); date.setHours(12,0,0,0); date.setDate(date.getDate()+index); return {id:localDate(date), date};});
  const formatDay = (id, options = {weekday:'long', day:'numeric', month:'long'}) => new Intl.DateTimeFormat('fr-FR', options).format(new Date(`${id}T12:00:00`));
  const quantity = value => new Intl.NumberFormat('fr-FR', {maximumFractionDigits:2}).format(value);
  const unitLabel = (unit, amount) => Math.abs(amount)>1 && ['pièce','gousse','tranche','cube'].includes(unit) ? `${unit}s` : unit;
  const validPortions = value => Number.isInteger(Number(value)) && Number(value)>=1 && Number(value)<=6;
  const initial = () => ({pantry:[],customNames:{},favorites:[],plan:[],manualItems:[],checked:[],servings:2,vegetarian:false,maxTime:0,onlyPantry:false});
  function validate(raw) {
    const value = raw && typeof raw === 'object' ? raw : {};
    const validStrings = list => Array.isArray(list) ? [...new Set(list.filter(x=>typeof x==='string' && x.length<=100))].slice(0,1000) : [];
    const validIds = list => validStrings(list).filter(id=>recipes.some(recipe=>recipe.id===id));
    const plan = Array.isArray(value.plan) ? value.plan.filter(item=>item && days.some(day=>day.id===item.day) && recipes.some(recipe=>recipe.id===item.recipeId) && validPortions(item.servings)).map(item=>({day:item.day,recipeId:item.recipeId,servings:Number(item.servings)})) : [];
    const uniquePlan = [...new Map(plan.map(item=>[item.day,item])).values()];
    return {...initial(),pantry:validStrings(value.pantry),customNames:Object.fromEntries(Object.entries(value.customNames||{}).filter(([key,name])=>typeof name==='string' && key.length<=100 && name.length<=100)),favorites:validIds(value.favorites),plan:uniquePlan,manualItems:Array.isArray(value.manualItems)?value.manualItems.filter(item=>item && typeof item.id==='string' && item.id.length<=100 && typeof item.name==='string' && item.name.trim() && item.name.length<=100).slice(0,200):[],checked:validStrings(value.checked),servings:validPortions(value.servings)?Number(value.servings):2,vegetarian:value.vegetarian===true,maxTime:[0,15,30,45,60].includes(value.maxTime)?value.maxTime:0,onlyPantry:value.onlyPantry===true};
  }
  let storageAvailable = true;
  function load() {try {return validate(JSON.parse(localStorage.getItem(STORAGE_KEY)));} catch {storageAvailable=false;return initial();}}
  let state = load();
  let favoritesOnly = false;
  let query = '';
  let view = 'idees';
  let modalRecipe = null;
  let modalServings = state.servings;
  let modalDay = today;
  let planningDay = null;
  let previousFocus = null;
  let toastTimer;
  let ingredientSuggestions=[], activeIngredient=-1;

  function save() {
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageAvailable=true;} catch {storageAvailable=false;}
    $('#save-status').textContent=storageAvailable?'Enregistré sur cet appareil':'Sauvegarde indisponible';
  }
  function notify(message) {
    clearTimeout(toastTimer);
    $('#toast').innerHTML=`${icon('check')}<span>${escape(message)}</span>`;
    $('#toast').classList.add('is-visible');
    toastTimer=setTimeout(()=>$('#toast').classList.remove('is-visible'),3500);
  }
  function dismissNotification() {
    clearTimeout(toastTimer);
    $('#toast').classList.remove('is-visible');
  }
  const ingredientName = id => pantrySuggestions.find(item=>item.id===id)?.name || state.customNames[id] || id;
  function getShopping() {
    const selected=state.plan.map(item=>({recipe:recipes.find(recipe=>recipe.id===item.recipeId),servings:item.servings}));
    return engine.shoppingList(selected,state.pantry,state.servings);
  }
  const shoppingKey = item => `ingredient:${item.key || `${item.id}:${item.unit}`}`;
  const manualKey = item => `manual:${item.id}`;
  function updateCounts() {
    const planCount=state.plan.length;
    const remaining=getShopping().filter(item=>!state.checked.includes(shoppingKey(item))).length+state.manualItems.filter(item=>!state.checked.includes(manualKey(item))).length;
    $('#plan-count').textContent=planCount;$('#plan-count').hidden=!planCount;
    $('#shopping-count').textContent=remaining;$('#shopping-count').hidden=!remaining;
  }
  function closeIngredientSuggestions(){
    $('#ingredient-suggestions').hidden=true;
    $('#ingredient-input').setAttribute('aria-expanded','false');
    $('#ingredient-input').removeAttribute('aria-activedescendant');
    ingredientSuggestions=[];activeIngredient=-1;
  }
  function showIngredientSuggestions(){
    const text=$('#ingredient-input').value.trim();
    if(!text||/[,;\n]/.test(text)){closeIngredientSuggestions();return;}
    ingredientSuggestions=engine.searchProducts(text,'all',12).filter(item=>!state.pantry.includes(item.id)).slice(0,6);
    activeIngredient=-1;
    $('#ingredient-suggestions').innerHTML=ingredientSuggestions.length?ingredientSuggestions.map((item,index)=>`<li class="ingredient-option" id="ingredient-option-${index}" role="option" aria-selected="false" data-suggest-ingredient="${escape(item.id)}"><span><strong>${escape(item.name)}</strong><small>${escape(item.category)}</small></span>${icon('plus',16)}</li>`).join(''):'<li class="ingredient-empty" role="presentation">Entrée pour ajouter cet ingrédient librement.</li>';
    $('#ingredient-suggestions').hidden=false;
    $('#ingredient-input').setAttribute('aria-expanded','true');
    $('#ingredient-input').removeAttribute('aria-activedescendant');
  }
  function chooseSuggestedIngredient(id){
    $('#ingredient-input').value='';closeIngredientSuggestions();addIngredients(id);$('#ingredient-input').focus();
  }
  function renderPantry() {
    $('#pantry-count').textContent=state.pantry.length;
    $('#pantry-tags').innerHTML=state.pantry.length?state.pantry.map(id=>`<span class="ingredient-tag">${escape(ingredientName(id))}<button type="button" data-remove-ingredient="${escape(id)}" aria-label="Retirer ${escape(ingredientName(id))}">${icon('close',14)}</button></span>`).join(''):'<p class="pantry-empty">Votre frigo attend ses premiers ingrédients.<br>On commence par quoi ?</p>';
    const suggestedIds=['tomates','oeufs','pates','courgette','pois-chiches','riz','carotte','poulet','oignon','lentilles','fromage','epinards'];
    const suggestions=suggestedIds.map(id=>pantrySuggestions.find(item=>item.id===id)).filter(Boolean).filter(item=>!state.pantry.includes(item.id)).slice(0,6);
    $('#suggestion-list').innerHTML=suggestions.map(item=>`<button class="suggestion-chip" data-add-ingredient="${escape(item.id)}">${icon('plus',14)}${escape(item.name)}</button>`).join('');
    $('#try-example').hidden=state.pantry.length>0;
    if($('#catalog-count'))$('#catalog-count').textContent=`${pantrySuggestions.length} produits`;
    if($('#total-products-count'))$('#total-products-count').textContent=pantrySuggestions.length;
    if($('#total-recipes-count'))$('#total-recipes-count').textContent=recipes.length;
  }
  function addIngredients(raw) {
    const parts=raw.split(/[,;\n]+/).map(part=>part.trim().slice(0,60)).filter(Boolean);
    let added=0;
    for(const part of parts) {
      const id=engine.normalizeIngredient(part);
      if(!id || state.pantry.includes(id) || state.pantry.length>=600)continue;
      state.pantry.push(id);
      if(!pantrySuggestions.some(item=>item.id===id))state.customNames[id]=part;
      added++;
    }
    visibleRecipes=PAGE_SIZE;save();renderAll();
    if(added)notify(added===1?'Un ingrédient de plus, de nouvelles idées.':`${added} ingrédients ajoutés au frigo.`);
    else if(parts.length)notify('Cet ingrédient est déjà dans le frigo, ou le frigo est plein.');
  }
  const recipePhoto = (recipe, extra='') => `<img class="recipe-photo ${extra}" src="${escape(globalThis.MealPhotos.recipe(recipe))}" alt="Photo de présentation du plat" loading="lazy" decoding="async" width="960" height="640">`;
  function renderRecipes() {
    let ranked=engine.rankRecipes(recipes,state.pantry,{vegetarian:state.vegetarian,maxTime:state.maxTime,query,category:recipeCategory,sort:recipeSort});
    if(state.onlyPantry)ranked=ranked.filter(recipe=>recipe.match.ready);
    if(favoritesOnly)ranked=ranked.filter(recipe=>state.favorites.includes(recipe.id));
    if(!state.pantry.length && !query && recipeCategory==='all' && recipeSort==='recommended' && !favoritesOnly && !state.onlyPantry){
      const featured=['pates-tomates','curry-pois-chiches','omelette-courgette','salade-lentilles','poulet-citron','veloute-carottes','gnocchis-champignons','tartines-chevre'];
      ranked.sort((a,b)=>{const ai=featured.indexOf(a.id),bi=featured.indexOf(b.id);return (ai<0?999:ai)-(bi<0?999:bi);});
    }
    $('#result-count').textContent=`${ranked.length} ${ranked.length===1?'recette':'recettes'}`;
    $('#results-title').textContent=favoritesOnly?'Votre carnet de favoris.':state.pantry.length?'Les idées qui vont avec votre frigo.':'De quoi avoir envie de cuisiner.';
    $('#filter-vegetarian').setAttribute('aria-pressed',String(state.vegetarian));
    $('#filter-ready').setAttribute('aria-pressed',String(state.onlyPantry));
    $('#filter-favorites').setAttribute('aria-pressed',String(favoritesOnly));
    $('#time-filter').value=String(state.maxTime);$('#servings').value=String(state.servings);
    if($('#recipe-sort'))$('#recipe-sort').value=recipeSort;
    const categoryNames=['all','Rapide','Pâtes & riz','Végétarien','Salades','Soupes','Viandes','Poissons','Au four','Cuisine du monde','Desserts','Petit-déjeuner'];
    if($('#recipe-categories'))$('#recipe-categories').innerHTML=categoryNames.map(category=>`<button type="button" class="category-tab ${recipeCategory===category?'is-active':''}" data-recipe-category="${escape(category)}" aria-pressed="${recipeCategory===category}">${category==='all'?'Tout explorer':escape(category)}</button>`).join('');
    if($('#results-summary'))$('#results-summary').textContent=ranked.length?`${Math.min(visibleRecipes,ranked.length)} recettes affichées sur ${ranked.length}`:'Aucune recette ne correspond à ces filtres.';
    if($('#recipe-load-more'))$('#recipe-load-more').hidden=ranked.length<=visibleRecipes;
    if(!ranked.length) {
      const message=state.onlyPantry&&!state.pantry.length?'Ajoutez les ingrédients de votre frigo pour trouver les recettes prêtes à cuisiner.':favoritesOnly&&!state.favorites.length?'Touchez le cœur d’une recette pour la retrouver ici.':'Essayez une autre recherche ou élargissez les filtres. Vous pouvez aussi ajouter librement un produit au frigo.';
      $('#recipe-grid').innerHTML=`<div class="empty-state">${icon('search',42)}<h3>Une autre piste ?</h3><p>${message}</p><button class="button secondary" data-reset-filters>Réinitialiser les filtres</button></div>`;
      return;
    }
    $('#recipe-grid').innerHTML=ranked.slice(0,visibleRecipes).map(recipe=>{
      const {match}=recipe;
      const available=match.matched.length;
      const total=available+match.missing.length;
      const favorite=state.favorites.includes(recipe.id);
      const matchText=!state.pantry.length?`${total} ingrédients à réunir`:match.ready?'Tout est dans votre frigo':`${available} sur ${total} ingrédients disponibles`;
      const missingText=state.pantry.length&&!match.ready?`À prévoir : ${match.missing.slice(0,2).map(item=>item.name.toLocaleLowerCase('fr')).join(', ')}${match.missing.length>2?'…':''}`:match.ready?'Vous pouvez passer en cuisine.':recipe.subtitle;
      return `<article class="recipe-card" data-recipe-card="${escape(recipe.id)}"><div class="recipe-visual"><button class="recipe-image-button" data-open-recipe="${escape(recipe.id)}" aria-label="Découvrir ${escape(recipe.title)}">${recipePhoto(recipe)}</button><div class="recipe-badges">${match.ready?'<span class="badge badge-ready">Prêt à cuisiner</span>':recipe.vegetarian?`<span class="badge">${icon('leaf',13)}Végétarien</span>`:''}</div><button class="favorite-button ${favorite?'is-active':''}" data-favorite="${escape(recipe.id)}" aria-label="${favorite?'Retirer des favoris :':'Ajouter aux favoris :'} ${escape(recipe.title)}" aria-pressed="${favorite}">${icon('heart')}</button></div><div class="recipe-body"><div class="recipe-meta"><span>${icon('clock',14)}${recipe.time} min</span><span>${icon('users',14)}${state.servings} pers.</span><span class="recipe-category-label">${escape(recipe.category)}</span></div><h3 class="recipe-title"><button data-open-recipe="${escape(recipe.id)}">${escape(recipe.title)}</button></h3><p class="recipe-desc">${escape(missingText)}</p><div class="match-row ${match.ready?'is-ready':''} ${state.pantry.length?'has-pantry':''}"><span class="match-progress" aria-hidden="true"><i style="width:${Math.round(match.score*100)}%"></i></span><span>${escape(matchText)}</span></div><div class="card-footer"><button class="recipe-open" data-open-recipe="${escape(recipe.id)}">Cuisiner${icon('arrow-right',16)}</button><button class="plan-add" data-plan-recipe="${escape(recipe.id)}" aria-label="Prévoir ${escape(recipe.title)}">${icon('plus',16)}Au menu</button></div></div></article>`;
    }).join('');
  }
  function renderProducts(){
    const categories=globalThis.MealData.categories||[...new Set(pantrySuggestions.map(item=>item.category))];
    $('#product-categories').innerHTML=['all',...categories].map(category=>`<button class="category-tab ${productCategory===category?'is-active':''}" type="button" data-product-category="${escape(category)}" aria-pressed="${productCategory===category}">${category==='all'?'Tous les rayons':escape(category)}</button>`).join('');
    const all=engine.searchProducts(productQuery,productCategory,1000);
    const visible=all.slice(0,visibleProducts);
    $('#product-grid').innerHTML=`<p class="product-results-summary">${all.length} produit${all.length>1?'s':''} · ${state.pantry.length} dans votre frigo</p>`+visible.map(item=>{const active=state.pantry.includes(item.id);return `<button class="product-card ${active?'is-selected':''}" type="button" data-toggle-product="${escape(item.id)}" aria-pressed="${active}"><span class="product-initial" aria-hidden="true">${escape(item.name.slice(0,1))}</span><span class="product-name"><strong>${escape(item.name)}</strong><small>${escape(item.category)}</small></span><span class="product-tick" aria-hidden="true">${icon(active?'check':'plus',16)}</span></button>`;}).join('')+(all.length>visible.length?'<button class="button secondary product-more" data-more-products>Afficher plus de produits</button>':'')+(!all.length?'<div class="empty-state"><h3>Un produit plus particulier ?</h3><p>Ajoutez-le librement avec le champ « Un ingrédient » du frigo. Il restera dans votre liste.</p></div>':'');
  }
  function openProducts(){
    dismissNotification();
    productPreviousFocus=document.activeElement;productQuery='';productCategory='all';visibleProducts=120;
    $('#product-search').value='';renderProducts();$('#product-modal').hidden=false;document.body.classList.add('modal-open');$('.app-shell').inert=true;$('#product-search').focus();$('.product-dialog').scrollTop=0;
  }
  function closeProducts(){
    $('#product-modal').hidden=true;document.body.classList.remove('modal-open');$('.app-shell').inert=false;if(productPreviousFocus?.isConnected)productPreviousFocus.focus();
  }
  function renderWeek() {
    $('#week-range').textContent=`Du ${formatDay(days[0].id,{day:'numeric',month:'long'})} au ${formatDay(days[6].id,{day:'numeric',month:'long'})}`;
    $('#plan-grid').innerHTML=days.map((day,index)=>{
      const item=state.plan.find(item=>item.day===day.id);
      const recipe=item&&recipes.find(recipe=>recipe.id===item.recipeId);
      return `<article class="day-card ${recipe?'has-meal':''} ${index===0?'is-today':''}"><div class="day-header"><span>${index===0?'Aujourd’hui':escape(formatDay(day.id,{weekday:'long'}))}</span><strong>${escape(formatDay(day.id,{day:'numeric',month:'short'}))}</strong></div>${recipe?`<div class="day-meal"><button class="day-recipe-art" data-open-recipe="${escape(recipe.id)}" aria-label="Voir ${escape(recipe.title)}">${recipePhoto(recipe)}</button><h3><button data-open-recipe="${escape(recipe.id)}">${escape(recipe.title)}</button></h3><p>${recipe.time} min · ${item.servings} pers.</p><button class="remove-plan text-button" data-remove-plan="${day.id}" aria-label="Retirer le repas du ${escape(formatDay(day.id))}">${icon('close',14)}Retirer</button></div>`:`<button class="day-empty" data-pick-day="${day.id}">${icon('plus',23)}<span>Une idée pour<br>ce soir-là ?</span></button>`}</article>`;
    }).join('');
  }
  function renderShopping() {
    const items=getShopping();
    const categories=new Map();
    for(const item of items) {const category=item.category||'Épicerie';if(!categories.has(category))categories.set(category,[]);categories.get(category).push(item);}
    const allKeys=[...items.map(shoppingKey),...state.manualItems.map(manualKey)];
    const done=allKeys.filter(key=>state.checked.includes(key)).length;
    $('#shopping-progress').textContent=allKeys.length?`${done} / ${allKeys.length}`:'0';
    $('#uncheck-all').disabled=done===0;
    const row=(item,key,manual=false)=>`<div class="shopping-row ${state.checked.includes(key)?'is-checked':''}"><label class="shopping-check"><input type="checkbox" data-check-item="${escape(key)}" ${state.checked.includes(key)?'checked':''}><span class="check-visual" aria-hidden="true">${icon('check',14)}</span><span class="shopping-item-name">${escape(item.name)}</span>${!manual?`<span class="shopping-quantity">${quantity(item.quantity)} ${escape(unitLabel(item.unit,item.quantity))}</span>`:''}</label>${manual?`<button class="icon-button remove-manual" data-remove-manual="${escape(item.id)}" aria-label="Retirer ${escape(item.name)}">${icon('close',16)}</button>`:''}</div>`;
    $('#shopping-items').innerHTML=[...categories].map(([category,list])=>`<div class="shopping-category"><h3>${escape(category)}</h3>${list.map(item=>row(item,shoppingKey(item))).join('')}</div>`).join('')+(state.manualItems.length?`<div class="shopping-category"><h3>Les petits extras</h3>${state.manualItems.map(item=>row(item,manualKey(item),true)).join('')}</div>`:'')+(!allKeys.length?`<div class="empty-state shopping-empty">${icon('cart',42)}<h3>${state.plan.length?'Votre frigo a tout prévu.':'Votre liste prend forme ici.'}</h3><p>${state.plan.length?'Les ingrédients de vos repas sont déjà dans votre frigo. Vous pouvez ajouter des extras ci-dessous.':'Prévoyez un premier repas ou ajoutez ce dont vous avez besoin ci-dessous.'}</p>${!state.plan.length?'<button class="button secondary" data-go="idees">Choisir un repas</button>':''}</div>`:'');
    $('#shopping-meals').innerHTML=state.plan.length?[...state.plan].sort((a,b)=>a.day.localeCompare(b.day)).map(item=>{const recipe=recipes.find(recipe=>recipe.id===item.recipeId);return `<button class="summary-meal" data-open-recipe="${escape(recipe.id)}"><span>${escape(formatDay(item.day,{weekday:'short',day:'numeric'}))}</span><strong>${escape(recipe.title)}</strong><small>${item.servings} pers.</small></button>`;}).join(''):'<p class="summary-empty">Un repas choisi, et les ingrédients manquants arrivent ici.</p>';
    $('#copy-shopping').disabled=!allKeys.length;$('#download-shopping').disabled=!allKeys.length;
  }
  function renderAll() {renderPantry();renderRecipes();renderWeek();renderShopping();updateCounts();$('#save-status').textContent=storageAvailable?'Enregistré sur cet appareil':'Sauvegarde indisponible';}
  function goTo(next, focus=false) {
    view=['idees','semaine','courses'].includes(next)?next:'idees';
    $$('.view').forEach(section=>section.hidden=section.id!==`view-${view}`);
    $$('.nav-button').forEach(button=>{const active=button.dataset.view===view;button.classList.toggle('is-active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    if(location.hash!==`#${view}`){const target=new URL(location.href);target.hash=view;history.replaceState(null,'',target.href);}
    if(focus) {window.scrollTo({top:0,behavior:'instant'});const target=$(`#view-${view} h1`);target.tabIndex=-1;target.focus({preventScroll:true});}
  }
  function openRecipe(id) {
    const recipe=recipes.find(item=>item.id===id);if(!recipe)return;
    dismissNotification();
    previousFocus=document.activeElement;modalRecipe=recipe;modalServings=state.servings;
    modalDay=planningDay||days.find(day=>!state.plan.some(item=>item.day===day.id))?.id||today;
    renderModal();$('#recipe-modal').hidden=false;document.body.classList.add('modal-open');$('.app-shell').inert=true;
    $('.modal-dialog').focus();
    $('.modal-dialog').scrollTop=0;
  }
  function closeModal() {
    $('#recipe-modal').hidden=true;document.body.classList.remove('modal-open');$('.app-shell').inert=false;modalRecipe=null;
    if(previousFocus?.isConnected)previousFocus.focus();else $('.nav-button.is-active').focus();
  }
  function renderModal() {
    if(!modalRecipe)return;
    const recipe=modalRecipe;
    const match=engine.matchRecipe(recipe,state.pantry);
    $('#modal-body').innerHTML=`<div class="modal-header"><div><p class="eyebrow">ON PASSE EN CUISINE</p><h2 id="modal-title">${escape(recipe.title)}</h2><p>${escape(recipe.subtitle)}</p></div><button class="button icon-button ghost" data-close-modal aria-label="Fermer la recette">${icon('close')}</button></div><div class="modal-content"><div class="modal-recipe-meta"><span>${icon('clock',17)}${recipe.time} min</span>${recipe.vegetarian?`<span>${icon('leaf',17)}Végétarien</span>`:''}<label>${icon('users',17)}<select class="select-field" id="modal-servings" aria-label="Personnes pour cette recette">${Array.from({length:6},(_,i)=>`<option value="${i+1}" ${modalServings===i+1?'selected':''}>${i+1} ${i?'personnes':'personne'}</option>`).join('')}</select></label></div><h3>Ce qu’il vous faut</h3><div class="modal-ingredients">${recipe.ingredients.map(item=>{const available=match.matched.some(ingredient=>ingredient.id===item.id);const substitution=match.substitutions?.find(entry=>entry.ingredient===item.id);return `<div class="ingredient-line ${available?'is-available':''}"><span>${available?icon('check',15):'<span class="ingredient-missing-dot" aria-hidden="true"></span>'}${escape(item.name)}${substitution?`<small class="ingredient-substitution">Avec votre ${escape(ingredientName(substitution.product).toLocaleLowerCase('fr'))}</small>`:''}<span class="sr-only">${available?', déjà dans le frigo':', à prévoir'}</span></span><strong>${quantity(item.quantity*modalServings/recipe.servings)} ${escape(unitLabel(item.unit,item.quantity*modalServings/recipe.servings))}</strong></div>`;}).join('')}</div><p class="modal-basics">Prévoyez aussi les basiques : huile, sel et poivre.</p><h3>À vous de jouer</h3><ol class="instruction-list">${recipe.instructions.map(step=>`<li>${escape(step)}</li>`).join('')}</ol><div class="modal-plan-box"><label for="modal-day">On le prévoit pour quand ?</label><select class="select-field" id="modal-day">${days.map((day,i)=>`<option value="${day.id}" ${modalDay===day.id?'selected':''}>${i===0?'Aujourd’hui':escape(formatDay(day.id))}</option>`).join('')}</select><p id="replace-warning"></p></div></div><div class="modal-actions"><button class="button secondary" data-close-modal>Garder l’idée</button><button class="button primary" id="confirm-plan">${icon('plus')}<span id="confirm-plan-label">Ajouter au menu</span></button></div>`;
    const picture=document.createElement('div');picture.className='modal-photo';picture.innerHTML=recipePhoto(recipe)+'<span>Photo de présentation · le résultat varie selon vos ingrédients.</span>';
    $('.modal-content').prepend(picture);
    updatePlanWarning();
  }
  function updatePlanWarning() {
    const occupied=state.plan.find(item=>item.day===modalDay);
    const old=occupied&&recipes.find(recipe=>recipe.id===occupied.recipeId);
    $('#replace-warning').textContent=old?`Ce choix remplacera « ${old.title} » pour ce jour.`:'Les ingrédients manquants seront ajoutés à vos courses.';
    $('#confirm-plan-label').textContent=old?'Remplacer le repas':'Ajouter au menu';
  }
  function confirmPlan() {
    if(!modalRecipe)return;
    const id=modalRecipe.id;
    state.plan=state.plan.filter(item=>item.day!==modalDay);
    state.plan.push({day:modalDay,recipeId:id,servings:modalServings});state.checked=state.checked.filter(key=>key.startsWith('manual:'));planningDay=null;
    save();closeModal();renderAll();const nextFocus=$(`#view-${view} [data-plan-recipe="${id}"]`)||$(`#view-${view} [data-open-recipe="${id}"]`);nextFocus?.focus({preventScroll:true});notify('Repas prévu, les courses sont mises à jour.');
  }
  function shoppingText() {
    const rows=getShopping().map(item=>`${state.checked.includes(shoppingKey(item))?'☑':'☐'} ${item.name} — ${quantity(item.quantity)} ${unitLabel(item.unit,item.quantity)}`);
    rows.push(...state.manualItems.map(item=>`${state.checked.includes(manualKey(item))?'☑':'☐'} ${item.name}`));
    return `À TABLE. — MA LISTE DE COURSES\n\n${rows.join('\n')}\n\nVérifiez les quantités des ingrédients déjà dans votre frigo.\n`;
  }
  function downloadList() {
    const link=document.createElement('a');const url=URL.createObjectURL(new Blob([shoppingText()],{type:'text/plain;charset=utf-8'}));
    link.href=url;link.download=`mes-courses-${today}.txt`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Votre liste est prête à emporter.');
  }
  async function copyList() {
    try {
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(shoppingText());
      else {const area=document.createElement('textarea');area.value=shoppingText();area.style.cssText='position:fixed;left:-9999px';document.body.append(area);area.select();const copied=document.execCommand('copy');area.remove();if(!copied)throw new Error('Clipboard unavailable');}
      notify('La liste est copiée. Bonnes courses !');
    }catch {notify('La copie est indisponible. Utilisez « Télécharger ».');}
  }
  function resetFilters() {visibleRecipes=PAGE_SIZE;recipeCategory='all';recipeSort='recommended';state.vegetarian=false;state.onlyPantry=false;state.maxTime=0;favoritesOnly=false;query='';$('#recipe-search').value='';save();renderRecipes();}

  $$('[data-icon]').forEach(element=>element.innerHTML=icon(element.dataset.icon));
  const creditContainer=$('#photo-credits-content');
  if(creditContainer){
    const credits=globalThis.MealPhotoCredits||{images:[]};
    const safeLink=value=>typeof value==='string'&&/^https:\/\//.test(value)?value:null;
    const lines=credits.images.map(item=>{
      const source=safeLink(item.sourceUrl),original=safeLink(item.originalRecipeSource),author=item.originalAuthor||item.credit;
      return `<li><strong>${escape(item.title||item.id)}</strong>${author?` — ${escape(author)}`:''} · ${source?`<a href="${escape(source)}" target="_blank" rel="noreferrer">Source</a>`:''}${original?` · <a href="${escape(original)}" target="_blank" rel="noreferrer">Recette et auteur d’origine</a>`:''}${item.license?` · ${escape(item.license)}`:''}${item.rightsNotice?`<small>${escape(item.rightsNotice)}</small>`:''}</li>`;
    }).join('');
    creditContainer.innerHTML=`<p>Les photographies sont des photos de présentation de plats de la même famille. Elles ne représentent pas chaque recette réalisée à l’identique ; certaines sont réutilisées pour des variantes.</p><p>${escape(credits.rightsNotice||'Photographies issues de collections culinaires publiques, auteurs et liens d’origine conservés ci-dessous. Les droits des photographies restent ceux de leurs auteurs.')}</p><p>Images redimensionnées et converties en WebP pour une utilisation locale. Les photographies de produits Raspberry Pi sont sous CC BY-SA 4.0, avec attribution détaillée ci-dessous.</p><details><summary>Sources et attributions des ${credits.images.length} photos</summary><ul class="photo-credit-list">${lines}</ul></details><details><summary>Police DM Sans — licence SIL Open Font License</summary><pre>${escape(globalThis.MealFontLicense||'')}</pre></details>`;
  }
  $('#hero-art').innerHTML=`<img class="hero-photo" src="${escape(globalThis.MealPhotos.hero())}" alt="Un plat de pâtes généreux, prêt à partager" width="960" height="720" fetchpriority="high"><div class="hero-photo-label"><span>${icon('spark',17)}L’inspiration commence ici</span><strong>Du placard à l’assiette.</strong><small>Des recettes pour cuisiner avec ce que vous avez.</small></div>`;
  $$('a.brand').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();goTo('idees',true);}));
  $('#ingredient-input').addEventListener('input',showIngredientSuggestions);
  $('#ingredient-input').addEventListener('keydown',event=>{
    if(event.key==='Escape'){closeIngredientSuggestions();return;}
    if(event.key==='Tab'){closeIngredientSuggestions();return;}
    if($('#ingredient-suggestions').hidden)return;
    if(['ArrowDown','ArrowUp'].includes(event.key)&&ingredientSuggestions.length){
      event.preventDefault();
      activeIngredient=activeIngredient<0?(event.key==='ArrowDown'?0:ingredientSuggestions.length-1):(activeIngredient+(event.key==='ArrowDown'?1:-1)+ingredientSuggestions.length)%ingredientSuggestions.length;
      $$('.ingredient-option').forEach((option,index)=>{option.classList.toggle('is-active',index===activeIngredient);option.setAttribute('aria-selected',String(index===activeIngredient));});
      const option=$(`#ingredient-option-${activeIngredient}`);$('#ingredient-input').setAttribute('aria-activedescendant',option.id);option.scrollIntoView({block:'nearest'});
    }
    if(event.key==='Enter'&&activeIngredient>=0){event.preventDefault();chooseSuggestedIngredient(ingredientSuggestions[activeIngredient].id);}
  });
  $('#ingredient-input').addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==$('#ingredient-input'))closeIngredientSuggestions();},120));
  $('#ingredient-suggestions').addEventListener('pointerdown',event=>{const option=event.target.closest('[data-suggest-ingredient]');if(option){event.preventDefault();chooseSuggestedIngredient(option.dataset.suggestIngredient);}});
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('.pantry-input-wrap'))closeIngredientSuggestions();});
  $('#ingredient-form').addEventListener('submit',event=>{event.preventDefault();const raw=$('#ingredient-input').value;$('#ingredient-input').value='';closeIngredientSuggestions();addIngredients(raw);$('#ingredient-input').focus();});
  $('#manual-form').addEventListener('submit',event=>{event.preventDefault();const name=$('#manual-input').value.trim();if(!name)return;if(state.manualItems.length>=200){notify('La liste contient déjà 200 extras.');return;}state.manualItems.push({id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,name});$('#manual-input').value='';save();renderShopping();updateCounts();$('#manual-input').focus();notify('Ajouté à votre liste.');});
  $('#recipe-search').addEventListener('input',event=>{query=event.target.value;visibleRecipes=PAGE_SIZE;renderRecipes();});
  $('#time-filter').addEventListener('change',event=>{state.maxTime=Number(event.target.value);visibleRecipes=PAGE_SIZE;save();renderRecipes();});
  $('#servings').addEventListener('change',event=>{state.servings=Number(event.target.value);save();renderRecipes();});
  $('#filter-vegetarian').addEventListener('click',()=>{state.vegetarian=!state.vegetarian;visibleRecipes=PAGE_SIZE;save();renderRecipes();});
  $('#filter-ready').addEventListener('click',()=>{state.onlyPantry=!state.onlyPantry;visibleRecipes=PAGE_SIZE;save();renderRecipes();});
  $('#filter-favorites').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;visibleRecipes=PAGE_SIZE;renderRecipes();});
  $('#try-example').addEventListener('click',()=>addIngredients('tomates, oeufs, pates, courgette, oignon, fromage'));
  $('#uncheck-all').addEventListener('click',()=>{state.checked=[];save();renderShopping();updateCounts();notify('La liste est prête pour un nouveau tour.');});
  $('#browse-products').addEventListener('click',openProducts);
  $('#product-search').addEventListener('input',event=>{productQuery=event.target.value;visibleProducts=120;renderProducts();});
  $('#recipe-sort').addEventListener('change',event=>{recipeSort=event.target.value;visibleRecipes=PAGE_SIZE;renderRecipes();});
  $('#recipe-load-more').addEventListener('click',()=>{visibleRecipes+=PAGE_SIZE;renderRecipes();});
  $('#copy-shopping').addEventListener('click',copyList);$('#download-shopping').addEventListener('click',downloadList);
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-close-products'))closeProducts();
    if(button.hasAttribute('data-open-products'))openProducts();
    if(button.dataset.productCategory){productCategory=button.dataset.productCategory;visibleProducts=120;renderProducts();}
    if(button.dataset.recipeCategory){recipeCategory=button.dataset.recipeCategory;visibleRecipes=PAGE_SIZE;renderRecipes();}
    if(button.hasAttribute('data-more-products')){visibleProducts+=120;renderProducts();}
    if(button.dataset.toggleProduct){
      const id=button.dataset.toggleProduct;
      if(state.pantry.includes(id))state.pantry=state.pantry.filter(item=>item!==id);else if(state.pantry.length<600)state.pantry.push(id);
      visibleRecipes=PAGE_SIZE;save();renderAll();renderProducts();
      const target=$$('[data-toggle-product]').find(element=>element.dataset.toggleProduct===id);target?.focus();
    }
    if(button.dataset.view)goTo(button.dataset.view,true);
    if(button.dataset.go)goTo(button.dataset.go,true);
    if(button.hasAttribute('data-reset-filters'))resetFilters();
    if(button.dataset.addIngredient)addIngredients(button.dataset.addIngredient);
    if(button.dataset.removeIngredient){state.pantry=state.pantry.filter(id=>id!==button.dataset.removeIngredient);save();renderAll();$('#ingredient-input').focus();}
    if(button.dataset.favorite){const id=button.dataset.favorite;state.favorites=state.favorites.includes(id)?state.favorites.filter(item=>item!==id):[...state.favorites,id];save();renderRecipes();$(`[data-favorite="${id}"]`)?.focus();}
    if(button.dataset.openRecipe)openRecipe(button.dataset.openRecipe);
    if(button.dataset.planRecipe)openRecipe(button.dataset.planRecipe);
    if(button.dataset.removePlan){state.plan=state.plan.filter(item=>item.day!==button.dataset.removePlan);save();renderAll();notify('Repas retiré du menu.');}
    if(button.dataset.pickDay){planningDay=button.dataset.pickDay;goTo('idees',true);notify(`Choisissez une recette pour ${formatDay(planningDay,{weekday:'long',day:'numeric'})}.`);}
    if(button.dataset.removeManual){state.manualItems=state.manualItems.filter(item=>item.id!==button.dataset.removeManual);save();renderShopping();updateCounts();}
    if(button.hasAttribute('data-close-modal'))closeModal();
    if(button.id==='confirm-plan')confirmPlan();
  });
  document.addEventListener('change',event=>{
    if(event.target.dataset.checkItem){const key=event.target.dataset.checkItem;state.checked=event.target.checked?[...new Set([...state.checked,key])]:state.checked.filter(item=>item!==key);save();renderShopping();updateCounts();const check=$$('[data-check-item]').find(element=>element.dataset.checkItem===key);check?.focus();}
    if(event.target.id==='modal-day'){modalDay=event.target.value;updatePlanWarning();}
    if(event.target.id==='modal-servings'){modalServings=Number(event.target.value);renderModal();$('#modal-servings').focus();}
  });
  $('#recipe-modal').addEventListener('click',event=>{if(event.target===$('#recipe-modal'))closeModal();});
  $('#product-modal').addEventListener('click',event=>{if(event.target===$('#product-modal'))closeProducts();});
  document.addEventListener('keydown',event=>{
    if(!$('#product-modal').hidden){
      if(event.key==='Escape'){event.preventDefault();closeProducts();return;}
      if(event.key==='Tab'){
        const controls=$$('button:not([disabled]),input:not([disabled])',$('.product-dialog')).filter(element=>element.getClientRects().length);
        const first=controls[0],last=controls.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
      return;
    }
    if($('#recipe-modal').hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeModal();}
    if(event.key==='Tab'){
      const controls=$$('button:not([disabled]),select,a[href],input:not([disabled])',$('.modal-dialog')).filter(element=>element.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===$('.modal-dialog'))){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===$('.modal-dialog'))){event.preventDefault();first?.focus();}
    }
  });
  window.addEventListener('hashchange',()=>goTo(location.hash.slice(1)));
  window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){state=load();renderAll();if(modalRecipe)renderModal();}});
  renderAll();goTo(location.hash.slice(1));
})();
