/* Original, local SVG illustrations. No images or network requests are needed. */
(() => {
  'use strict';
  const paths = {
    kitchen: '<path d="M5 3v6m3-6v6M5 6h3M6.5 9v12M17 3c-3 2-3 8 0 9v9m0-18v9h3V3h-3Z"/>',
    leaf: '<path d="M20.5 3.5c-9-1-17 3-16 10 1 7 10 8 14 1 2-3 2-7 2-11Z"/><path d="M3 21 16 8m-7 7 1-6m3 2h5"/>',
    heart: '<path d="m12 20-8-8C-2 5 7-1 12 6c5-7 14-1 8 6Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'arrow-left': '<path d="M20 12H4m6-6-6 6 6 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4v2"/>',
    cart: '<path d="M3 3h2l3 13h10l3-9H6M9 21h.01M18 21h.01"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h1m6 0h1m-8 3h1"/>',
    fridge: '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M5 9h14M9 5v1m0 7v3"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    chevron: '<path d="m8 5 7 7-7 7"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    spark: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4ZM20 2v4m-2-2h4"/>',
    print: '<path d="M7 7V3h10v4M7 17H4V9h16v8h-3M7 14h10v7H7Z"/><path d="M17 11h.01"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 5V3H3v13h2"/>',
    book: '<path d="M12 5v16m0-16C8 2 3 3 3 3v16s5-1 9 2m0-16c4-3 9-2 9-2v16s-5-1-9 2"/>',
    bowl: '<path d="M3 11h18c0 6-3 10-9 10S3 17 3 11Zm2-4h14M8 3v1m4-1v1m4-1v1"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 2M5 16a8 8 0 0 0 13 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    minus: '<path d="M5 12h14"/>'
  };
  const icon = (name, size = 20) => {
    const value = Number(size);
    const safeSize = Number.isFinite(value) ? Math.max(12, Math.min(64, value)) : 20;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.bowl}</svg>`;
  };
  const svg = (inner, width = 480, height = 300) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" aria-hidden="true">${inner}</svg>`;
  const leaf = (x, y, rotate = 0, scale = 1, color = '#4B7046') => `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})"><path d="M0 0C-13-18-34-15-37-6-29 7-9 12 0 0Z" fill="${color}"/><path d="M-31-6-3-1" stroke="#90A675" stroke-width="1.2" stroke-linecap="round"/></g>`;
  const herb = (x, y, rotate = 0, scale = 1) => `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})"><path d="M0 33 0-19" stroke="#4F7548" stroke-width="2.5" stroke-linecap="round"/>${leaf(0, 8, 15, .55)}${leaf(0, -3, 190, .55)}${leaf(0, -15, 30, .5)}${leaf(0, 17, 170, .48)}</g>`;
  const tomato = (x, y, size = 21, rotate = 0) => `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${size / 21})"><circle r="21" fill="#BB5C40"/><circle r="17" fill="#DE7957"/><path d="M-2-14 0-2-13-7M13-6 2 0l11 8M-11 11-1 2l3 13" stroke="#F3A277" stroke-width="4" stroke-linecap="round"/><path d="m-5-11 1 3m11-1-2 2m2 15-2-2m-12 2 2-2" stroke="#FFE5AF" stroke-width="2" stroke-linecap="round"/></g>`;
  const egg = (x, y, rotate = 0, scale = 1) => `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})"><path d="M-33-10c2-16 18-31 33-30 18 0 36 18 36 35 0 14-12 29-28 32-25 6-44-11-41-37Z" fill="#FFF8DA" stroke="#E6D9B9" stroke-width="1.5"/><circle cx="3" cy="-4" r="16" fill="#E7AC43"/><path d="M-5-13c3-3 9-4 13-1" stroke="#F8D17A" stroke-width="3" stroke-linecap="round"/></g>`;
  const cucumber = (x, y, r = 18) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#658350"/><circle r="${r - 3}" fill="#C7CE97"/><path d="M0-9v18M-8-5 8 5m-16 0 16-10" stroke="#E7E6B9" stroke-width="2.5" stroke-linecap="round"/></g>`;
  const bowlBase = (fill = '#E8D6B3') => `<ellipse cx="243" cy="158" rx="119" ry="104" fill="#5D4936" opacity=".09"/><circle cx="240" cy="145" r="106" fill="#FFFCF2"/><circle cx="240" cy="145" r="92" fill="#EEE7D5"/><circle cx="240" cy="145" r="85" fill="${fill}"/><path d="M161 92a97 97 0 0 1 154 2" stroke="#FFFDF8" stroke-width="4" stroke-linecap="round"/>`;
  const sprinkles = (seed = 0) => Array.from({ length: 18 }, (_, n) => {
    const a = (n * 2.39996 + seed) % (Math.PI * 2);
    const r = 18 + (n * 19 + seed * 9) % 64;
    const x = (240 + Math.cos(a) * r).toFixed(2);
    const y = (145 + Math.sin(a) * r).toFixed(2);
    return `<ellipse cx="${x}" cy="${y}" rx="2" ry="1" transform="rotate(${n * 31} ${x} ${y})" fill="${n % 3 ? '#F7E8C0' : '#718258'}"/>`;
  }).join('');
  const pasta = () => `${bowlBase('#C9844D')}<g stroke-linecap="round" stroke-width="10" stroke="#EBC06B"><path d="M186 114c24-30 69-22 64 8s-69 8-58 40 69 27 78 3-17-43-38-32"/><path d="M218 85c35 0 81 26 70 59s-51 15-58 43"/><path d="M170 144c13 0 20-17 14-30m67 90c11-23 50-12 55-47M220 94c-19 10-13 34 4 43"/></g><g stroke-linecap="round" stroke-width="2" stroke="#F8D88C"><path d="M189 113c24-26 63-17 60 10m-56 41c13 25 60 23 73 3M220 85c33 4 68 23 66 46"/></g>${tomato(277, 103, 17, 12)}${tomato(200, 174, 15, 38)}${leaf(257, 147, 15, .8)}${leaf(258, 147, 172, .65)}${sprinkles(1)}`;
  const salad = () => `${bowlBase('#C4CD9D')}<g fill="#829B62"><path d="M176 141c-28-35 12-48 25-24 24-22 42 4 19 24 17 23-18 35-27 15-18 14-29-2-17-15Z"/><path d="M257 96c-10-30 32-31 34-8 31-4 30 25 3 26 7 28-27 29-26 5-21-1-25-19-11-23Z"/><path d="M242 169c-32-24-10-45 8-28 23-22 42 6 20 21 20 23-5 43-19 22-21 15-32-1-9-15Z"/></g>${cucumber(208, 95, 18)}${cucumber(278, 168, 20)}${cucumber(215, 190, 16)}${tomato(231, 131, 23, 20)}${tomato(293, 128, 18, -20)}${tomato(190, 163, 16, 50)}<g fill="#FFFBDF"><rect x="235" y="88" width="17" height="18" rx="3" transform="rotate(18 243 97)"/><rect x="240" y="177" width="18" height="17" rx="3" transform="rotate(-20 249 186)"/><rect x="184" y="123" width="15" height="17" rx="3"/></g>${sprinkles(2)}`;
  const soup = () => `${bowlBase('#D48D45')}<path d="M205 104c39-23 88 9 79 43-6 23-42 36-62 17-13-11-5-31 11-32 21-2 36 21 16 29" stroke="#F4D599" stroke-width="5" stroke-linecap="round"/>${leaf(246, 130, 10, .75)}${leaf(246, 130, 180, .6)}<g fill="#AF793E"><rect x="188" y="145" width="16" height="16" rx="3" transform="rotate(18 196 153)"/><rect x="269" y="169" width="14" height="14" rx="3" transform="rotate(-20 276 176)"/><rect x="263" y="100" width="12" height="12" rx="2"/></g>${sprinkles(3)}`;
  const toast = () => `${bowlBase('#F2EBDC')}<g transform="rotate(-12 239 143)"><path d="M174 105c-10-16 0-36 22-39h82c24 3 31 25 19 39l-5 105H180l-6-105Z" fill="#BA824D"/><path d="M182 104c-10-16 1-28 18-28h75c16 0 27 14 16 29l-5 95H186l-4-96Z" fill="#E3BA79"/><path d="M195 95c25-6 64-6 82 3l-1 86c-28 12-54 6-79 0Z" fill="#A9B570"/><path d="M204 119c18-21 42-24 61-16m-61 35c24-21 43-26 64-16m-64 36c22-16 45-23 65-15m-61 32c21-10 44-15 58-11" stroke="#D0CF91" stroke-width="5" stroke-linecap="round"/></g>${egg(247, 141, 10, .85)}${tomato(180, 177, 18, 30)}${leaf(304, 130, 20, .85)}${sprinkles(4)}`;
  const omelette = () => `${bowlBase('#E6DCC1')}<path d="M164 152c0-50 38-82 79-76 55 7 79 51 62 96-11 30-115 45-141-20Z" fill="#D9A947"/><path d="M166 150c21-17 81-27 139 20-10 33-113 41-139-20Z" fill="#F0C968"/><path d="M181 158c29-8 69-6 104 12" stroke="#D4A347" stroke-width="3" stroke-linecap="round"/>${tomato(234, 113, 16, 15)}${tomato(277, 144, 14, 45)}${leaf(206, 138, 14, .65)}${leaf(270, 183, 140, .6)}${sprinkles(5)}`;
  const rice = () => `${bowlBase('#DCCC9A')}<path d="M173 131c16-45 51-54 75-36 33-25 65 20 49 43 24 27-10 54-32 45-10 29-46 29-60 4-29 5-51-32-32-56Z" fill="#E9DAB0"/>${Array.from({ length: 40 }, (_, n) => { const a = n * 2.4, r = 14 + n * 7 % 62; return `<ellipse cx="${240 + Math.cos(a) * r}" cy="${145 + Math.sin(a) * r}" rx="5" ry="1.7" transform="rotate(${n * 37} ${240 + Math.cos(a) * r} ${145 + Math.sin(a) * r})" fill="${n % 3 ? '#F8EBD0' : '#D6BD84'}"/>`; }).join('')}<g fill="#DB8B48"><rect x="190" y="128" width="13" height="12" rx="2" transform="rotate(15 196 134)"/><rect x="257" y="168" width="13" height="12" rx="2"/><rect x="275" y="113" width="12" height="13" rx="2"/></g><g fill="#6E8B54"><circle cx="217" cy="110" r="6"/><circle cx="278" cy="155" r="6"/><circle cx="220" cy="181" r="5"/><circle cx="204" cy="156" r="5"/><circle cx="256" cy="126" r="5"/></g>${egg(246, 143, -15, .67)}`;
  const gratin = () => `<ellipse cx="243" cy="161" rx="128" ry="96" fill="#675641" opacity=".1"/><rect x="123" y="84" width="237" height="137" rx="35" fill="#FDF9E9"/><rect x="109" y="126" width="23" height="49" rx="8" fill="#EEE4CD"/><rect x="350" y="126" width="23" height="49" rx="8" fill="#EEE4CD"/><rect x="139" y="97" width="205" height="109" rx="23" fill="#D7AB5B"/><g fill="#F0CD7D"><ellipse cx="179" cy="128" rx="26" ry="15" transform="rotate(-25 179 128)"/><ellipse cx="231" cy="126" rx="25" ry="15" transform="rotate(20 231 126)"/><ellipse cx="294" cy="129" rx="27" ry="16" transform="rotate(-15 294 129)"/><ellipse cx="197" cy="174" rx="28" ry="16" transform="rotate(15 197 174)"/><ellipse cx="265" cy="174" rx="29" ry="17" transform="rotate(-20 265 174)"/></g><g fill="#B57E40" opacity=".7"><circle cx="181" cy="124" r="5"/><circle cx="283" cy="166" r="7"/><circle cx="234" cy="149" r="4"/><circle cx="307" cy="116" r="4"/></g>${leaf(263, 140, 40, .7)}${leaf(263, 140, 194, .65)}${sprinkles(6)}`;
  const grainBowl = () => `${bowlBase('#D8C49C')}<path d="M167 126c8-29 37-51 63-54l12 70Z" fill="#B6BC86"/><path d="M244 72c39 3 66 26 77 61l-77 11Z" fill="#D1A46C"/><path d="M319 145c3 42-35 77-74 81l-2-78Z" fill="#A3B07B"/><path d="M231 225c-37-3-70-36-74-72l78-7Z" fill="#EADAB4"/>${tomato(203, 110, 22, -20)}${tomato(184, 145, 18, 30)}${cucumber(271, 184, 22)}${cucumber(294, 160, 17)}<g fill="#EDD5A4" stroke="#BA9A69" stroke-width="1"><circle cx="278" cy="106" r="9"/><circle cx="293" cy="119" r="8"/><circle cx="264" cy="123" r="8"/><circle cx="281" cy="136" r="8"/><circle cx="299" cy="139" r="7"/></g>${egg(220, 170, -16, .68)}${leaf(249, 138, 5, .8)}${leaf(249, 138, 170, .68)}${sprinkles(7)}`;
  const renderers = { pasta, salad, soup, toast, omelette, rice, gratin, bowl: grainBowl };
  const visualFor = recipe => {
    const visual = String(recipe.visual || '').toLowerCase();
    if (renderers[visual]) return visual;
    const label = `${visual} ${String(recipe.id || '').toLowerCase()}`;
    if (/pate|pasta|spaghetti|penne|nouille|noodle|gnocchi/.test(label)) return 'pasta';
    if (/salad|grec|taboule/.test(label)) return 'salad';
    if (/soup|veloute/.test(label)) return 'soup';
    if (/toast|tartine|croque|wrap/.test(label)) return 'toast';
    if (/egg|oeuf|œuf|omelette|shakshuka/.test(label)) return 'omelette';
    if (/rice|riz|risotto/.test(label)) return 'rice';
    if (/gratin|four/.test(label)) return 'gratin';
    return 'bowl';
  };
  const dish = (recipe = {}) => {
    const type = visualFor(recipe);
    const backgrounds = { pasta: '#F1E4D4', salad: '#E9EDDB', soup: '#F2E5D4', toast: '#ECE7D9', omelette: '#F1EBD4', rice: '#EBEBDD', gratin: '#EFE3D2', bowl: '#E7EADF' };
    return svg(`<rect width="480" height="300" fill="${backgrounds[type]}"/><path d="M0 270c87-23 99 9 163-3m219-224c34 17 68 12 98-1" stroke="#FFFDF5" stroke-width="2" opacity=".55"/>${renderers[type]()}${herb(369, 213, 38, .75)}<g fill="#927653" opacity=".35"><circle cx="109" cy="182" r="2"/><circle cx="371" cy="111" r="1.7"/><circle cx="120" cy="191" r="1.3"/></g>`);
  };
  const hero = () => svg(`<ellipse cx="244" cy="184" rx="150" ry="126" fill="#3F583F" opacity=".06"/><path d="M42 250c47 13 80 4 101-13m192-170c28-15 50-13 67-6" stroke="#DEDCCB" stroke-width="1.5" stroke-linecap="round"/><g transform="translate(-9 5) scale(1.1)">${grainBowl()}</g><g transform="translate(67 71) rotate(-17)"><path d="M0 0v48c0 12 14 12 14 0V0M4 0v39m5-39v39m-2 21v125" stroke="#83917B" stroke-width="3.4" stroke-linecap="round"/></g>${herb(365, 222, 32, 1.1)}${tomato(383, 119, 23, 22)}${leaf(383, 100, -32, .55)}<g fill="#C5B48E"><circle cx="107" cy="253" r="3"/><circle cx="121" cy="260" r="2"/><circle cx="117" cy="243" r="2.2"/></g>`, 460, 330);
  globalThis.MealArt = { icon, dish, hero };
})();
