// ЧУДОЛЁТ — точные механики фигур, математического маршрута и покупки.
// Здесь только логика и конструктивные SVG; текст ответа не вшивается в игровой рисунок.
const choose=(r,n)=>Math.floor(r()*n);
const shuffled=(values,r)=>{
 const a=values.slice();
 for(let i=a.length-1;i>0;i--){const j=choose(r,i+1);[a[i],a[j]]=[a[j],a[i]];}
 return a;
};
const same=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
// Каждый силуэт состоит из ПЯТИ отличающихся по форме деталей.
// Никакого угадывания по цвету: в пределах задания контуры уникальны.
const COMPOSITIONS=Object.freeze({
 house:[
  ["body","square",200,195,1.75,"#d7bafa",0],
  ["roof","triangle",200,86,1.65,"#ffbe64",0],
  ["door","rectangle",215,243,.62,"#a9daed",0],
  ["window","circle",165,190,.65,"#f9e58c",0],
  ["chimney","thin-rectangle",260,70,.8,"#edaaa7",0]
 ],
 rocket:[
  ["body","rectangle",200,180,1.4,"#bfa0f7",0],
  ["tip","triangle",200,60,1.15,"#ffca72",0],
  ["window","circle",200,170,.76,"#9edbff",0],
  ["left-fin","trapezoid",116,248,.76,"#f3aca2",-90],
  ["right-fin","diamond",284,248,.68,"#a4e5c1",90]
 ],
 robot:[
  // Пять узнаваемых по форме деталей: голова, туловище, две разные руки, двойные ботинки.
  // Глаза и рот — гравировка, а не отдельные фишки для угадывания по цвету.
  ["head","robot-head",200,69,1,"#a9dcf6",0],
  ["body","robot-chest",200,197,1,"#bfa9eb",0],
  ["left-arm","robot-claw",94,190,1,"#f3bc88",0],
  ["right-arm","robot-gripper",306,190,1,"#a9d9c7",0],
  ["feet","robot-feet",200,281,1,"#f0bf91",0]
 ],
 ship:[
  // Парусная лодочка: изогнутый корпус, высокая мачта,
  // большой наполненный ветром парус, флажок и иллюминатор.
  ["mast","ship-mast",190,148,1,"#dda879",0],
  ["sail","ship-sail",250,150,1,"#b5e2fa",0],
  ["flag","ship-flag",209,34,1,"#ff9e8d",0],
  ["hull","ship-hull",200,263,1,"#c398e1",0],
  ["porthole","ship-porthole",249,270,1,"#ffe28e",0]
 ],
 tree:[
  // Узнаваемое дерево: разветвлённый ствол, пышная неровная крона,
  // боковая веточка с листвой, яблоко на кроне и основание с травой.
  ["trunk","tree-trunk",200,239,1,"#cba378",0],
  ["crown","tree-crown",200,94,1,"#a3dcae",0],
  ["branch","tree-bough",137,163,1,"#8fc994",0],
  ["fruit","tree-apple",251,123,1,"#f3a3a5",0],
  ["grass","tree-meadow",200,302,1,"#9edc9d",0]
 ],
 flower:[
  // Цветок именно в горшке: лепестки окружают серединку,
  // стебель выходит из горшка, лист растёт сбоку.
  ["stem","flower-stem",200,188,1,"#9ed2a6",0],
  ["pot","flower-pot",200,274,1,"#eac2a3",0],
  ["petals","flower-petals",200,94,1,"#d3b7f7",0],
  ["center","flower-center",200,94,1,"#ffe28d",0],
  ["leaf","flower-leaf",148,195,1,"#94d4a5",0]
 ],
 balloon:[
  // Воздушный шар-аэростат, а не круг на палочке:
  // две верёвки, большая оболочка, цветная полоса, горловина и корзина.
  ["rig","balloon-rig",200,223,1,"#b5a3dc",0],
  ["envelope","balloon-envelope",200,105,1,"#f0b4d7",0],
  ["stripe","balloon-stripe",200,105,1,"#b9d7f5",0],
  ["nozzle","balloon-nozzle",200,194,1,"#f9c98a",0],
  ["basket","balloon-basket",200,279,1,"#d6b18b",0]
 ],
 castle:[
  ["wall","square",200,224,1.45,"#d5c0f4",0],
  ["tower","rectangle",122,186,1.07,"#b7d4f3",0],
  ["roof","triangle",122,104,.96,"#f6be83",0],
  ["gate","rounded-square",220,263,.57,"#dbc4ae",0],
  ["flag","pennant",267,97,.65,"#e9b3c3",90]
 ],

 mushroom:[
  ["stem","mushroom-stem",200,227,1,"#eecaa4",0],
  ["cap","mushroom-cap",200,126,1,"#e99c9b",0],
  ["spots","mushroom-spots",186,115,1,"#fff3d8",0],
  ["grass","mushroom-grass",198,307,1,"#a5d9b1",0],
  ["leaf","mushroom-leaf",283,266,1,"#88ceb1",0]
 ],
 car:[
  ["body","car-body",200,236,1,"#98d8f0",0],
  ["roof","car-roof",182,169,1,"#bca3ea",0],
  ["glass","car-glass",205,169,1,"#e2f6ff",0],
  ["wheels","car-wheels",199,283,1,"#8c769d",0],
  ["headlight","car-light",313,236,1,"#ffda88",0]
 ],
 butterfly:[
  ["left-wing","butterfly-left",131,158,1,"#e7b3df",0],
  ["right-wing","butterfly-right",267,157,1,"#9ad9e8",0],
  ["body","butterfly-body",200,189,1,"#e9ca91",0],
  ["antennae","butterfly-antennae",200,83,1,"#b99adc",0],
  ["patterns","butterfly-pattern",200,164,1,"#ffe19e",0]
 ],
 fish:[
  ["body","fish-body",185,177,1,"#9dd5ec",0],
  ["tail","fish-tail",306,180,1,"#d4b4ee",0],
  ["top-fin","fish-dorsal",198,108,1,"#f3be91",0],
  ["bottom-fin","fish-ventral",213,254,1,"#9dddb6",0],
  ["eye","fish-eye",130,165,1,"#fff4cf",0]
 ],
 owl:[
  ["body","owl-body",200,219,1,"#caace6",0],
  ["head","owl-head",200,120,1,"#e9bf97",0],
  ["mask","owl-mask",200,125,1,"#fff5d9",0],
  ["wings","owl-wings",200,213,1,"#ae94d0",0],
  ["feet","owl-feet",200,292,1,"#f1b785",0]
 ],
 train:[
  ["boiler","train-boiler",177,215,1,"#b5daf0",0],
  ["cabin","train-cabin",274,167,1,"#c7abe5",0],
  ["chimney","train-chimney",108,125,1,"#edaf9b",0],
  ["wheels","train-wheels",197,279,1,"#7b799a",0],
  ["cowcatcher","train-plow",319,240,1,"#ffcf86",0]
 ],
 lighthouse:[
  ["tower","lighthouse-tower",200,209,1,"#e7b0ae",0],
  ["lantern","lighthouse-lamp",200,106,1,"#ffdf9c",0],
  ["roof","lighthouse-roof",200,62,1,"#aa9ade",0],
  ["beams","lighthouse-rays",200,111,1,"#f9e7b5",0],
  ["rocks","lighthouse-rocks",200,306,1,"#a9c7d7",0]
 ],
 umbrella:[
  ["canopy","umbrella-canopy",200,138,1,"#c0a5ef",0],
  ["shaft","umbrella-shaft",200,225,1,"#b9d4ed",0],
  ["handle","umbrella-handle",206,284,1,"#d7b18d",0],
  ["tip","umbrella-tip",200,65,1,"#f7ce86",0],
  ["raindrops","umbrella-rain",300,213,1,"#91d5e8",0]
 ],
 snowman:[
  ["snow","snowman-body",200,207,1,"#e9f7fd",0],
  ["hat","snowman-hat",200,72,1,"#b3a0df",0],
  ["scarf","snowman-scarf",200,173,1,"#f3adad",0],
  ["face","snowman-face",200,124,1,"#f8ce85",0],
  ["arms","snowman-arms",200,209,1,"#c6a17c",0]
 ],
 cat:[
  ["body","cat-body",197,225,1,"#d6b3e9",0],
  ["head","cat-head",171,125,1,"#f3c99c",0],
  ["tail","cat-tail",287,218,1,"#cda8df",0],
  ["paws","cat-paws",190,298,1,"#ebcba4",0],
  ["face","cat-face",171,134,1,"#fff4db",0]
 ],
 snail:[
  ["body","snail-body",195,259,1,"#acd5b3",0],
  ["shell","snail-shell",172,170,1,"#d5b6ec",0],
  ["spiral","snail-spiral",172,170,1,"#f6d7af",0],
  ["feelers","snail-feelers",284,132,1,"#e4ba9d",0],
  ["leaf","snail-leaf",289,285,1,"#a1d9b2",0]
 ],
 submarine:[
  ["hull","submarine-hull",194,211,1,"#a7d9ea",0],
  ["tower","submarine-tower",183,153,1,"#d2b4e8",0],
  ["periscope","submarine-scope",205,96,1,"#e7c497",0],
  ["windows","submarine-windows",187,213,1,"#ffedac",0],
  ["propeller","submarine-propeller",313,213,1,"#b5a4d8",0]
 ]
});
const CONSTRUCTION_NAMES={
 house:"Домик",rocket:"Ракета",robot:"Робот",ship:"Кораблик",
 tree:"Дерево",flower:"Цветок",balloon:"Воздушный шар",castle:"Замок",
 mushroom:"Гриб",car:"Машинка",butterfly:"Бабочка",fish:"Рыбка",
 owl:"Сова",train:"Паровозик",lighthouse:"Маяк",umbrella:"Зонтик",
 snowman:"Снеговик",cat:"Кот",snail:"Улитка",submarine:"Подводная лодка"
};
export const FIGURE_IDS=Object.freeze(Object.keys(COMPOSITIONS));
function blueprint(id){return COMPOSITIONS[id]?.map(([id,shape,x,y,scale,color,rotate])=>({id,shape,x,y,scale,color,rotate}));}
export function makeTangram(age,r,selectedFigure=null){
 const figure=selectedFigure??FIGURE_IDS[choose(r,FIGURE_IDS.length)],parts=blueprint(figure);
 if(!parts)throw new Error("Неизвестная фигура конструктора");
 const answer=parts.map(p=>p.id),tray=shuffled(answer,r);
 if(same(tray,answer))tray.reverse();
 return {figure,figureName:CONSTRUCTION_NAMES[figure],parts,tray,answer};
}
export function validateTangram(task){
 const base=blueprint(task.figure);
 if(!base||!Array.isArray(task.parts)||task.parts.length!==5||!Array.isArray(task.answer)||!Array.isArray(task.tray))return false;
 if(task.figureName!==CONSTRUCTION_NAMES[task.figure])return false;
 if(JSON.stringify(task.parts)!==JSON.stringify(base))return false;
 const ids=base.map(p=>p.id);
 return new Set(base.map(p=>p.shape)).size===5&&
  same(task.answer,ids)&&same(task.tray.slice().sort(),ids.slice().sort())&&!same(task.tray,ids);
}
export function checkTangram(task,answer){return same(answer,task.answer);}

const SHAPES={
 square:'<rect x="-40" y="-40" width="80" height="80" rx="4"/>',
 rectangle:'<rect x="-29" y="-50" width="58" height="100" rx="4"/>',
 'thin-rectangle':'<rect x="-13" y="-50" width="26" height="100" rx="3"/>',
 'rounded-square':'<rect x="-40" y="-40" width="80" height="80" rx="23"/>',
 pennant:'<polygon points="-47,-34 44,-34 21,0 44,34 -47,34"/>',
 // Модульный робот: контуры пяти крупных деталей действительно различаются.
 'robot-head':'<path d="M-48 -38 H-25 V-49 H-9 V-38 H24 V-53 H39 V-38 H48 Q60 -38 60 -24 V29 Q60 44 46 44 H-46 Q-60 44 -60 29 V-24 Q-60 -38 -48 -38Z"/>',
 'robot-chest':'<path d="M-52 -55 H52 L64 -32 L56 51 Q56 59 47 59 H-47 Q-56 59 -56 51 L-64 -32Z"/>',
 'robot-claw':'<path d="M-17 -51 H18 V9 L32 19 L39 37 L26 49 L2 32 L-20 50 L-39 38 L-18 10Z"/>',
 'robot-gripper':'<path d="M-14 -50 H14 V5 Q42 12 42 34 Q41 53 17 54 Q-11 53 -14 33 Q-16 18 -3 8Z"/>',
 'robot-feet':'<path d="M-45 -36 H-11 V5 H10 V-36 H45 L50 16 L63 28 V43 H8 V29 H-8 V43 H-63 V28 L-50 16Z"/>',
 triangle:'<polygon points="0,-50 49,41 -49,41"/>',
 circle:'<circle r="41"/>',
 diamond:'<polygon points="0,-53 44,0 0,53 -44,0"/>',
 trapezoid:'<polygon points="-32,-34 32,-34 53,34 -53,34"/>',
 // Пять уникальных узнаваемых геометрических силуэтов лодочки.
 'ship-mast':'<path d="M-9 -101 H9 L10 96 H-10 Z"/>',
 'ship-sail':'<path d="M-48 -90 Q-38 -96 -27 -79 C9 -42 54 22 67 64 Q12 70 -47 68 Z"/>',
 'ship-flag':'<path d="M-13 -20 H46 Q44 -12 28 -1 L46 19 H-13 Z"/>',
 'ship-hull':'<path d="M-120 -30 Q-124 -27 -114 -12 L-91 28 Q-76 49 -2 50 H69 Q93 48 107 22 L123 -12 Q128 -27 113 -27 H-100 Q-113 -27 -120 -30Z"/>',
 'ship-porthole':'<path fill-rule="evenodd" d="M0 -23 A23 23 0 1 1 0 23 A23 23 0 1 1 0 -23 Z M0 -13 A13 13 0 1 0 0 13 A13 13 0 1 0 0 -13 Z"/>',
 // Дерево: крона не круг, а естественная волнистая форма.
 'tree-trunk':'<path d="M-23 -74 Q-23 -85 -11 -86 L-2 -54 L10 -74 Q16 -81 22 -73 L16 -29 L24 58 L43 69 L40 75 L7 70 L-15 75 L-45 70 L-23 58 L-18 -31Z"/>',
 'tree-crown':'<path d="M-84 25 C-105 12 -100 -27 -79 -38 C-80 -65 -47 -79 -22 -67 C0 -90 32 -81 46 -64 C76 -65 94 -43 84 -17 C110 2 94 39 73 48 C67 69 39 77 17 66 C-5 80 -37 68 -47 57 C-68 62 -89 50 -84 25Z"/>',
 'tree-bough':'<path d="M35 0 C9 -31 -25 -35 -43 -7 C-50 14 -24 36 4 25 C22 20 29 8 35 0Z"/>',
 'tree-apple':'<path d="M0 -21 Q-27 -39 -28 -10 C-39 12 -24 35 -3 30 C16 36 35 12 28 -11 Q25 -34 5 -21 L3 -32 L-2 -32Z"/>',
 'tree-meadow':'<path d="M-96 20 Q-81 -4 -61 7 Q-38 -17 -19 2 Q4 -24 24 1 Q49 -17 66 6 Q84 -2 96 20 Q65 15 42 25 H-42 Q-72 25 -96 20Z"/>',
 // Цветок: пять лепестковых лопастей в одном контуре, лист, стебель и горшок.
 'flower-stem':'<path d="M-9 -68 Q1 -73 10 -62 L7 59 Q0 70 -10 60 Z"/>',
 'flower-pot':'<path d="M-60 -35 H60 V-23 H48 L37 36 Q0 43 -37 36 L-48 -23 H-60Z"/>',
 'flower-petals':'<path d="M-22 -33 C-47 -70 -82 -39 -53 -7 C-83 3 -68 44 -33 35 C-27 72 18 72 29 35 C65 57 85 16 53 -9 C70 -43 32 -66 18 -36 C8 -73 -26 -70 -22 -33Z"/>',
 'flower-center':'<path d="M0 -26 C-17 -28 -28 -12 -26 5 C-25 23 -9 29 1 25 C16 28 27 13 26 -3 C25 -20 10 -29 0 -26Z"/>',
 'flower-leaf':'<path d="M49 -6 C29 -44 -29 -43 -49 17 C-18 46 33 22 49 -6Z"/>',
 // Аэростат: характерная каплевидная оболочка и ДВЕ подвесные верёвки.
 'balloon-rig':'<path d="M-39 -43 L-19 50 H-12 L-29 -43Z M31 -43 L12 50 H19 L39 -43Z"/>',
 'balloon-envelope':'<path d="M0 -91 C-53 -91 -86 -49 -84 -1 C-82 46 -41 69 -24 80 H24 C41 69 82 46 84 -1 C86 -49 53 -91 0 -91Z"/>',
 'balloon-stripe':'<path d="M-12 -83 C-34 -54 -35 23 -19 71 H19 C35 23 34 -54 12 -83Z"/>',
 'balloon-nozzle':'<path d="M-24 -15 H24 L17 13 Q0 25 -17 13Z"/>',
 'balloon-basket':'<path d="M-47 -31 H47 L40 30 Q0 42 -40 30Z"/>',

 // 12 новых узнаваемых предметов с реальными отличающимися контурами.
 'mushroom-stem':'<path d="M-24 -66 Q-3 -82 22 -64 L20 44 Q15 64 33 68 Q0 78 -33 68 Q-15 51 -18 39Z"/>',
 'mushroom-cap':'<path d="M-111 35 C-111 -10 -70 -65 -11 -68 C49 -71 98 -23 109 35 Q75 52 42 44 Q0 59 -40 44 Q-75 50 -111 35Z"/>',
 'mushroom-spots':'<path d="M-57 -17 Q-35 -39 -17 -15 Q-16 5 -40 7Z M7 -36 Q32 -39 37 -14 Q19 2 2 -9Z M53 5 Q79 2 82 25 Q63 36 53 22Z"/>',
 'mushroom-grass':'<path d="M-117 26 L-89 -3 L-67 18 L-35 -12 L-10 18 L13 -6 L37 18 L63 -8 L86 17 L117 1 L105 30 L-105 30Z"/>',
 'mushroom-leaf':'<path d="M-57 13 C-34 -45 35 -45 62 -12 C41 29 -16 48 -57 13Z"/>',
 'car-body':'<path d="M-121 -34 Q-131 -30 -132 -8 L-130 20 Q-126 39 -106 42 H112 Q132 39 133 18 V-8 Q130 -29 109 -31 L75 -46 H-74Z"/>',
 'car-roof':'<path d="M-85 38 L-65 -22 Q-59 -38 -37 -40 H29 Q50 -38 67 -9 L90 38Z"/>',
 'car-glass':'<path d="M-59 24 L-44 -17 Q-40 -23 -32 -23 H12 V26Z M25 -22 H45 Q58 -22 66 -9 L82 26 H25Z"/>',
 'car-wheels':'<path fill-rule="evenodd" d="M-67 -31 A31 31 0 1 1 -67 31 A31 31 0 1 1 -67 -31 Z M-67 -15 A15 15 0 1 0 -67 15 A15 15 0 1 0 -67 -15 Z M70 -31 A31 31 0 1 1 70 31 A31 31 0 1 1 70 -31 Z M70 -15 A15 15 0 1 0 70 15 A15 15 0 1 0 70 -15Z"/>',
 'car-light':'<path d="M-24 -20 H23 Q35 -9 31 5 Q25 23 -2 24 L-23 12Z"/>',
 'butterfly-left':'<path d="M43 -9 C-10 -74 -94 -82 -91 -23 C-88 1 -64 13 -46 9 C-107 54 -50 104 1 55 L43 25Z"/>',
 'butterfly-right':'<path d="M-43 -12 C5 -91 90 -77 90 -18 C88 11 67 16 50 11 C105 53 53 97 -2 57 L-43 23Z"/>',
 'butterfly-body':'<path d="M0 -75 C-14 -76 -21 -54 -15 -37 L-18 43 Q-8 73 0 88 Q9 74 18 43 L15 -37 Q21 -54 0 -75Z"/>',
 'butterfly-antennae':'<path d="M-5 39 Q-18 -19 -45 -37 Q-66 -50 -62 -27 Q-57 -19 -49 -29 M5 39 Q15 -20 44 -38 Q65 -49 62 -27 Q57 -17 49 -30" fill="none" stroke-width="9" stroke-linecap="round"/>',
 'butterfly-pattern':'<path d="M-97 -23 C-116 -44 -137 -24 -129 -4 Q-108 12 -97 -23Z M86 -38 C116 -44 123 -18 101 -7 Q85 -10 86 -38Z M-91 36 C-99 60 -78 68 -61 49 Q-61 25 -91 36Z M84 35 C95 55 80 67 62 51 Q60 30 84 35Z"/>',
 'fish-body':'<path d="M-100 2 Q-40 -72 45 -47 Q85 -34 103 0 Q78 45 34 50 Q-45 69 -100 2Z"/>',
 'fish-tail':'<path d="M-33 0 Q13 -54 57 -68 Q40 -23 30 -3 Q45 24 59 62 Q3 54 -33 0Z"/>',
 'fish-dorsal':'<path d="M-59 43 L-20 -42 Q-12 -58 0 -37 L55 43Z"/>',
 'fish-ventral':'<path d="M-58 -34 Q-37 24 15 60 L54 -37 Q0 -11 -58 -34Z"/>',
 'fish-eye':'<path fill-rule="evenodd" d="M0 -24 A24 24 0 1 1 0 24 A24 24 0 1 1 0 -24 Z M1 -10 A10 10 0 1 0 1 10 A10 10 0 1 0 1 -10Z"/>',
 'owl-body':'<path d="M-75 -67 Q-101 -27 -87 59 Q-79 88 -33 92 H37 Q80 87 88 53 Q103 -27 73 -67Z"/>',
 'owl-head':'<path d="M-85 -44 L-80 -89 L-45 -63 Q0 -83 45 -63 L80 -89 L86 -44 Q91 30 58 53 Q0 76 -58 53 Q-91 30 -85 -44Z"/>',
 'owl-mask':'<path fill-rule="evenodd" d="M-48 -34 C-75 -38 -81 -5 -60 18 Q-31 41 -1 17 C21 42 58 42 67 15 C82 -14 53 -39 22 -31 Q0 -24 -1 -14 Q-25 -31 -48 -34Z M-33 -15 A13 13 0 1 1 -33 11 A13 13 0 1 1 -33 -15Z M36 -15 A13 13 0 1 1 36 11 A13 13 0 1 1 36 -15Z"/>',
 'owl-wings':'<path d="M-80 -64 Q-115 -35 -92 50 Q-85 80 -61 65 L-39 21Z M80 -64 Q115 -35 92 50 Q85 80 61 65 L39 21Z"/>',
 'owl-feet':'<path d="M-59 -36 V10 L-83 26 L-53 30 L-38 19 L-22 33 L-7 24 L-32 6 V-36Z M36 -36 V9 L13 25 L33 34 L52 20 L67 31 L81 22 L60 8 V-36Z"/>',
 'train-boiler':'<path d="M-111 -49 H76 Q101 -49 113 -22 V28 Q112 50 91 52 H-102 Q-119 49 -119 29 V-25 Q-117 -44 -111 -49Z"/>',
 'train-cabin':'<path d="M-62 -72 H46 Q66 -70 66 -48 V63 H-66 V-50 Q-66 -72 -62 -72Z M-37 -41 V-9 H21 V-41Z" fill-rule="evenodd"/>',
 'train-chimney':'<path d="M-25 -54 H27 V-36 L18 -28 V45 H-16 V-28 L-25 -36Z"/>',
 'train-wheels':'<path fill-rule="evenodd" d="M-88 -28 A28 28 0 1 1 -88 28 A28 28 0 1 1 -88 -28Z M-88 -12 A12 12 0 1 0 -88 12 A12 12 0 1 0 -88 -12 Z M0 -34 A34 34 0 1 1 0 34 A34 34 0 1 1 0 -34Z M0 -14 A14 14 0 1 0 0 14 A14 14 0 1 0 0 -14Z M87 -28 A28 28 0 1 1 87 28 A28 28 0 1 1 87 -28Z M87 -12 A12 12 0 1 0 87 12 A12 12 0 1 0 87 -12Z"/>',
 'train-plow':'<path d="M-41 -43 L34 -30 L57 0 L42 25 L58 44 L-37 37Z"/>',
 'lighthouse-tower':'<path d="M-46 -97 H46 L62 96 H-62Z"/>',
 'lighthouse-lamp':'<path d="M-38 -42 H38 L48 27 H-48Z M-19 -19 V15 H19 V-19Z" fill-rule="evenodd"/>',
 'lighthouse-roof':'<path d="M-68 15 L-7 -43 L68 15 H41 V29 H-41 V15Z"/>',
 'lighthouse-rays':'<path d="M-60 -7 L-127 -44 L-127 28Z M60 -7 L127 -44 L127 28Z"/>',
 'lighthouse-rocks':'<path d="M-120 36 L-98 -4 L-55 8 L-28 -29 L8 -12 L40 -24 L67 12 L98 -5 L120 36Z"/>',
 'umbrella-canopy':'<path d="M-122 29 Q-116 -55 0 -75 Q112 -56 122 29 Q98 8 76 29 Q49 4 25 29 Q0 4 -25 29 Q-49 5 -76 29 Q-101 7 -122 29Z"/>',
 'umbrella-shaft':'<path d="M-9 -69 H9 L8 62 H-8Z"/>',
 'umbrella-handle':'<path d="M-10 -62 H10 V2 Q10 26 29 27 Q51 30 48 8 H68 Q70 49 27 50 Q-10 49 -10 8Z"/>',
 'umbrella-tip':'<path d="M-18 42 L0 -48 L18 42Z"/>',
 'umbrella-rain':'<path d="M-44 -31 Q-68 8 -51 19 Q-28 25 -35 6Z M20 -47 Q-7 3 13 21 Q35 30 31 5Z M66 -12 Q44 31 61 44 Q84 43 76 23Z"/>',
 'snowman-body':'<path d="M0 -95 C-47 -95 -62 -54 -54 -24 C-91 -13 -104 50 -66 78 C-44 101 43 101 66 78 C104 50 91 -13 54 -24 C62 -54 47 -95 0 -95Z"/>',
 'snowman-hat':'<path d="M-68 29 H68 V17 H40 V-41 H-39 V17 H-68Z"/>',
 'snowman-scarf':'<path d="M-68 -34 Q0 -14 68 -34 L66 0 Q13 17 -49 3 L-32 57 L-54 69 L-83 3Z"/>',
 'snowman-face':'<path d="M-45 -35 A10 10 0 1 1 -45 -15 A10 10 0 1 1 -45 -35Z M24 -35 A10 10 0 1 1 24 -15 A10 10 0 1 1 24 -35Z M-2 -11 L61 8 L-2 16Z M-30 25 Q0 50 32 25" stroke-width="5" fill="none"/>',
 'snowman-arms':'<path d="M-70 23 L-117 -14 L-128 -44 M-116 -16 L-90 -48 M73 26 L119 -14 L130 -46 M116 -16 L94 -48" stroke-width="12" fill="none" stroke-linecap="round"/>',
 'cat-body':'<path d="M-75 -75 Q-104 -28 -86 69 Q-44 89 47 82 Q90 69 87 8 Q80 -62 44 -75Z"/>',
 'cat-head':'<path d="M-78 -30 L-77 -84 L-30 -57 Q0 -70 30 -57 L77 -84 L78 -30 Q90 27 48 55 Q0 75 -48 55 Q-90 27 -78 -30Z"/>',
 'cat-tail':'<path d="M-34 54 C-3 48 18 28 12 -8 C8 -43 40 -67 68 -47 C87 -25 66 4 44 -14 C52 -26 58 -34 49 -37 C29 -41 29 -20 32 -5 C44 49 1 83 -34 76Z"/>',
 'cat-paws':'<path d="M-69 -37 Q-82 -10 -69 27 Q-46 40 -14 27 V-13Z M17 -13 V27 Q50 40 71 27 Q82 -10 69 -37Z"/>',
 'cat-face':'<path d="M-51 -15 Q-38 -29 -23 -16 M23 -16 Q38 -29 51 -15 M-3 -4 L3 -4 L0 7Z M0 7 Q-12 25 -27 16 M0 7 Q12 25 27 16 M-39 12 L-80 5 M39 12 L80 5" stroke-width="6" fill="none" stroke-linecap="round"/>',
 'snail-body':'<path d="M-109 42 Q-87 -4 -56 -4 Q-28 -11 -3 22 Q28 35 42 -16 Q64 -53 96 -27 Q124 17 111 44 Q77 74 -72 71 Q-100 66 -109 42Z"/>',
 'snail-shell':'<path d="M-72 46 C-123 -2 -71 -75 -7 -77 C64 -81 94 -29 77 26 Q53 70 -10 76 Q-55 77 -72 46Z"/>',
 'snail-spiral':'<path d="M48 28 C58 -9 32 -43 -10 -39 C-49 -35 -53 12 -24 27 C-5 37 20 23 16 4 C14 -13 -10 -13 -16 -2" fill="none" stroke-width="12" stroke-linecap="round"/>',
 'snail-feelers':'<path d="M-32 45 L-49 -37 M24 45 L43 -37 M-49 -40 A15 15 0 1 1 -49 -70 A15 15 0 1 1 -49 -40Z M43 -40 A15 15 0 1 1 43 -70 A15 15 0 1 1 43 -40Z"/>',
 'snail-leaf':'<path d="M-78 28 Q-10 -70 89 -33 Q38 68 -78 28Z"/>',
 'submarine-hull':'<path d="M-126 0 C-127 -56 -80 -80 -13 -79 H47 C104 -73 128 -41 128 4 C128 51 96 72 40 73 H-52 C-100 64 -126 36 -126 0Z"/>',
 'submarine-tower':'<path d="M-58 48 V-32 Q-54 -55 -23 -58 H37 Q62 -55 62 -30 V48Z"/>',
 'submarine-scope':'<path d="M-17 45 V-35 Q-17 -53 6 -53 H48 V-30 H9 V45Z"/>',
 'submarine-windows':'<path fill-rule="evenodd" d="M-69 -25 A25 25 0 1 1 -69 25 A25 25 0 1 1 -69 -25Z M-69 -13 A13 13 0 1 0 -69 13 A13 13 0 1 0 -69 -13Z M4 -25 A25 25 0 1 1 4 25 A25 25 0 1 1 4 -25Z M4 -13 A13 13 0 1 0 4 13 A13 13 0 1 0 4 -13Z M76 -25 A25 25 0 1 1 76 25 A25 25 0 1 1 76 -25Z M76 -13 A13 13 0 1 0 76 13 A13 13 0 1 0 76 -13Z"/>',
 'submarine-propeller':'<path d="M-17 -12 L-28 -60 Q-5 -68 19 -45 L16 -17 L62 -27 Q74 0 61 25 L17 19 L-1 65 Q-33 64 -37 37 L-15 13 L-66 17 Q-74 -15 -61 -31 Z"/>',
};
function shapeItem(part,fill,stroke="#7256a0",strokeWidth=3){
 return '<g transform="translate('+part.x+' '+part.y+') rotate('+part.rotate+') scale('+part.scale+')" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+strokeWidth+'" stroke-linejoin="round">'+SHAPES[part.shape]+'</g>';
}
export function tangramSvg(task,placed=null,{small=false}={}){
 const done=Array.isArray(placed)?placed:task.answer;
 let shapes='';
 if(task.figure==="robot"){
  // Соединители не являются выбираемыми деталями и не зависят от правильности ответа.
  shapes+='<g class="robot-joints" fill="#f1eef9" stroke="#9887b5" stroke-width="3">'+
   '<rect x="186" y="105" width="28" height="41" rx="6"/>'+
   '<rect x="113" y="164" width="37" height="18" rx="7"/>'+
   '<rect x="249" y="164" width="39" height="18" rx="7"/></g>';
 }
 for(let i=0;i<task.parts.length;i++){
  const part=task.parts[i];
  shapes+=shapeItem(part,"#ede6f8","#bcaecf",3);
  if(done[i]!==null){
   const selected=task.parts.find(candidate=>candidate.id===done[i]);
   if(selected)shapes+=shapeItem({...selected,x:part.x,y:part.y,scale:part.scale},selected.color,"#604a85",2);
  }
 }
 if(task.figure==="ship"){
  // Вода под лодкой: постоянный декоративный штрих, не игровая деталь.
  shapes+='<g class="ship-waves" fill="none" stroke="#80cee2" stroke-width="5" stroke-linecap="round">'+
   '<path d="M102 321 Q126 309 146 320 T191 320"/>'+
   '<path d="M219 323 Q242 310 265 323 T305 323"/></g>';
 }
 if(task.figure==="robot"){
  // Дружелюбная мордочка и экран на груди улучшают узнаваемость даже без цвета.
  // Они одинаковы на пустом шаблоне и при любой расстановке, поэтому не выдают ответ.
  shapes+='<g class="robot-face" stroke="#6f5c96" stroke-width="3" fill="none" stroke-linecap="round">'+
   '<circle cx="177" cy="63" r="9" fill="#fff"/><circle cx="218" cy="63" r="9" fill="#fff"/>'+
   '<circle cx="178" cy="64" r="3" fill="#664b93" stroke="none"/><circle cx="219" cy="64" r="3" fill="#664b93" stroke="none"/>'+
   '<path d="M184 88 Q200 101 216 88"/>'+
   '<rect x="162" y="175" width="76" height="48" rx="9" fill="#fff" fill-opacity=".54"/>'+
   '<circle cx="176" cy="198" r="5" fill="#36c3d6" stroke="none"/>'+
   '<path d="M192 198 H222"/>'+
   '</g>';
 }
 // Метки находятся ВНУТРИ контуров и прорисовываются поверх любой поставленной детали.
 const anchors={
  house:{body:[254,218],roof:[200,90],door:[215,245],window:[165,190],chimney:[260,70]},
  rocket:{body:[200,241],tip:[200,60],window:[200,170]},
  robot:{head:[241,90],body:[243,236],"left-arm":[94,194],"right-arm":[306,194],feet:[200,290]},
  ship:{mast:[190,190],sail:[278,163],flag:[224,33],hull:[125,264],porthole:[249,270]},
  tree:{trunk:[199,251],crown:[191,91],branch:[134,159],fruit:[251,128],grass:[197,303]},
  flower:{stem:[200,195],pot:[199,279],petals:[232,67],center:[200,95],leaf:[140,198]},
  balloon:{rig:[174,225],envelope:[249,76],stripe:[199,96],nozzle:[200,194],basket:[200,284]},
  castle:{wall:[258,220],gate:[220,263]},
  mushroom:{stem:[201,226],cap:[252,125],spots:[163,108],grass:[191,310],leaf:[283,266]},
  car:{body:[141,232],roof:[155,170],glass:[214,170],wheels:[200,287],headlight:[313,236]},
  butterfly:{"left-wing":[92,119],"right-wing":[307,116],body:[200,210],antennae:[200,66],patterns:[133,164]},
  fish:{body:[182,200],tail:[322,188],"top-fin":[197,105],"bottom-fin":[213,256],eye:[130,165]},
  owl:{body:[201,257],head:[205,97],mask:[200,138],wings:[107,218],feet:[200,292]},
  train:{boiler:[177,214],cabin:[278,162],chimney:[108,125],wheels:[195,281],cowcatcher:[318,243]},
  lighthouse:{tower:[199,227],lantern:[200,106],roof:[200,48],beams:[304,110],rocks:[190,315]},
  umbrella:{canopy:[126,130],shaft:[200,217],handle:[219,300],tip:[200,63],raindrops:[300,216]},
  snowman:{snow:[197,264],hat:[200,65],scarf:[145,171],face:[200,118],arms:[292,206]},
  cat:{body:[191,244],head:[134,106],tail:[307,221],paws:[187,295],face:[175,137]},
  snail:{body:[249,264],shell:[115,177],spiral:[177,166],feelers:[288,115],leaf:[293,285]},
  submarine:{hull:[126,225],tower:[169,147],periscope:[209,83],windows:[218,213],propeller:[313,212]}
 };
 if(!small)for(let i=0;i<task.parts.length;i++){
  const part=task.parts[i],position=anchors[task.figure]?.[part.id]??[part.x,part.y];
  const radius=part.shape==="thin-rectangle"?11:part.shape==="ship-mast"?8:part.shape==="ship-porthole"?11:part.shape==="ship-flag"?12:14;
  const fontSize=radius<12?12:16;
  shapes+='<g class="tangram-slot-number"><circle cx="'+position[0]+'" cy="'+position[1]+'" r="'+radius+'" fill="#fff" stroke="#665097" stroke-width="1.7" opacity=".96"/>'+
   '<text x="'+position[0]+'" y="'+(position[1]+1)+'" font-size="'+fontSize+'" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="#473278">'+(i+1)+'</text></g>';
 }
 return '<svg class="tangram-art" viewBox="35 -35 330 370" role="img" aria-label="Геометрическая фигура '+task.figureName+'">'+
  '<rect x="35" y="-35" width="330" height="370" fill="'+(small?"#fff":"#fffef7")+'" rx="14"/>'+
  shapes+'</svg>';
}
export function tangramPieceSvg(part){
 const fill=part.color,shape=SHAPES[part.shape];
 // Изящные кроны, лепестки и оболочки аэростата крупнее прежних
 // условных фигур; уменьшаем только миниатюры в лотке, не игровую схему.
 const trayLimits={
  "tree-crown":.61,"tree-trunk":.68,"tree-meadow":.58,
  "flower-petals":.59,"flower-stem":.74,
  "balloon-envelope":.62,"balloon-stripe":.71,
  "ship-mast":.48,"ship-sail":.67,"ship-hull":.47,"ship-flag":1,"ship-porthole":1.05,
  "mushroom-stem":.78,"mushroom-cap":.52,"mushroom-spots":.78,"mushroom-grass":.5,"mushroom-leaf":.95,
  "car-body":.47,"car-roof":.70,"car-glass":.74,"car-wheels":.55,"car-light":1.05,
  "butterfly-left":.56,"butterfly-right":.58,"butterfly-body":.73,"butterfly-antennae":.88,"butterfly-pattern":.46,
  "fish-body":.60,"fish-tail":.94,"fish-dorsal":1.03,"fish-ventral":1.03,"fish-eye":1.10,
  "owl-body":.63,"owl-head":.69,"owl-mask":.77,"owl-wings":.57,"owl-feet":.75,
  "train-boiler":.53,"train-cabin":.76,"train-chimney":1.04,"train-wheels":.52,"train-plow":.97,
  "lighthouse-tower":.62,"lighthouse-lamp":.93,"lighthouse-roof":.90,"lighthouse-rays":.49,"lighthouse-rocks":.49,
  "umbrella-canopy":.49,"umbrella-shaft":.87,"umbrella-handle":.88,"umbrella-tip":1.07,"umbrella-rain":.77,
  "snowman-body":.62,"snowman-hat":.87,"snowman-scarf":.70,"snowman-face":.78,"snowman-arms":.46,
  "cat-body":.62,"cat-head":.69,"cat-tail":.75,"cat-paws":.79,"cat-face":.80,
  "snail-body":.50,"snail-shell":.52,"snail-spiral":.88,"snail-feelers":.76,"snail-leaf":.72,
  "submarine-hull":.48,"submarine-tower":.79,"submarine-scope":1.04,"submarine-windows":.53,"submarine-propeller":.80
 };
 const size=Math.min(part.scale,trayLimits[part.shape]??1.15);
 return '<svg viewBox="-66 -68 132 136" role="img" aria-label="Деталь '+part.id+'" class="tangram-piece-art">'+
  '<g transform="rotate('+part.rotate+') scale('+size+')" fill="'+fill+'" stroke="#664c88" stroke-width="3" stroke-linejoin="round">'+shape+'</g></svg>';
}
export function makeMathPath(age,r){
 const limit=age>=10?90:age>=7?50:20;
 const start=age<=5?2+choose(r,7):age<=7?5+choose(r,14):8+choose(r,20);
 const n=age>=10?5:age>=7?4:3;
 let value=start;
 const steps=[];
 for(let i=0;i<n;i++){
  let op="+",amount=1,next=value;
  for(let tries=0;tries<60;tries++){
   op=age>=10?["+", "-", "×"][choose(r,3)]:age>=7?["+", "-"][choose(r,2)]:"+";
   amount=op==="×"?2:1+choose(r,age<=5?5:age<=7?9:12);
   next=op==="+"?value+amount:op==="-"?value-amount:value*amount;
   if(next>=1&&next<=limit&&next!==value)break;
  }
  if(next<1||next>limit||next===value){op="+";amount=1;next=Math.min(limit,value+1);}
  const wrong=[];
  for(let delta=1;wrong.length<2&&delta<limit;delta++){
   for(const alternative of [next-delta,next+delta]){
    if(alternative>=1&&alternative<=limit&&alternative!==next&&!wrong.includes(alternative))wrong.push(alternative);
    if(wrong.length===2)break;
   }
  }
  const options=shuffled([next,...wrong.slice(0,2)],r);
  steps.push({op,amount,options,answer:options.indexOf(next),result:next});
  value=next;
 }
 return {start,steps,answer:steps.map(s=>s.answer)};
}
export function validateMathPath(task){
 if(!Number.isInteger(task.start)||task.start<1||!Array.isArray(task.steps)||![3,4,5].includes(task.steps.length))return false;
 let prev=task.start;
 for(const s of task.steps){
  if(!["+", "-", "×"].includes(s.op)||!Number.isInteger(s.amount)||s.amount<1)return false;
  const exact=s.op==="+"?prev+s.amount:s.op==="-"?prev-s.amount:prev*s.amount;
  if(!Number.isInteger(s.result)||s.result!==exact||s.result<1||s.result>90)return false;
  if(!Array.isArray(s.options)||s.options.length!==3||new Set(s.options).size!==3||!s.options.every(Number.isInteger))return false;
  if(!Number.isInteger(s.answer)||s.answer<0||s.answer>=3||s.options[s.answer]!==s.result)return false;
  prev=s.result;
 }
 return same(task.answer,task.steps.map(s=>s.answer));
}
export function checkMathPath(task,value){return same(value,task.answer);}

function combinations(n,k){
 const out=[],walk=(start,prefix)=>{
  if(prefix.length===k){out.push(prefix);return;}
  for(let i=start;i<n;i++)walk(i+1,[...prefix,i]);
 };
 walk(0,[]);return out;
}
export function shopSolutions(task){
 if(!task||!Array.isArray(task.items)||!Number.isInteger(task.take)||!Number.isInteger(task.budget))return [];
 return combinations(task.items.length,task.take).filter(ids=>ids.reduce((sum,i)=>sum+task.items[i].price,0)===task.budget);
}
export function makeShop(theme,age,r){
 const take=age>=10?3:2,count=age>=7?6:5;
 const symbols=shuffled([...new Set([...theme.a,...theme.b])],r).slice(0,count);
 for(let attempt=0;attempt<300;attempt++){
  const items=symbols.map(icon=>({icon,price:(age<=5?1:age<=7?2:4)+choose(r,age<=5?9:age<=7?15:22)}));
  const result=new Map();
  for(const choice of combinations(count,take)){
   const sum=choice.reduce((total,i)=>total+items[i].price,0);
   if(!result.has(sum))result.set(sum,[]);
   result.get(sum).push(choice);
  }
  const choices=[...result].filter(([sum,variants])=>variants.length===1&&sum>=take+3);
  if(choices.length){
   const [budget,[answer]]=choices[choose(r,choices.length)];
   return {items,take,budget,answer};
  }
 }
 throw new Error("Не удалось найти покупку с единственным решением");
}
export function validateShop(task,theme){
 if(!Array.isArray(task.items)||![5,6].includes(task.items.length)||![2,3].includes(task.take))return false;
 const available=new Set([...theme.a,...theme.b]);
 if(new Set(task.items.map(x=>x.icon)).size!==task.items.length)return false;
 if(!task.items.every(x=>available.has(x.icon)&&Number.isInteger(x.price)&&x.price>=1&&x.price<=25))return false;
 const correct=shopSolutions(task);
 return correct.length===1&&same(correct[0],task.answer);
}
export function checkShop(task,value){
 return Array.isArray(value)&&value.length===task.take&&new Set(value).size===task.take&&
  same(value.slice().sort((a,b)=>a-b),task.answer);
}
