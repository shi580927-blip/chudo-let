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
  ["hull","trapezoid",200,260,1.4,"#c5a3ef",180],
  ["mast","rectangle",200,169,.9,"#f4c57e",0],
  ["sail","triangle",151,142,1.05,"#aedbe9",0],
  ["flag","pennant",252,115,.64,"#f9b3a1",90],
  ["porthole","circle",200,270,.65,"#d9f28d",0]
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
 ]
});
const CONSTRUCTION_NAMES={
 house:"Домик",rocket:"Ракета",robot:"Робот",ship:"Кораблик",
 tree:"Дерево",flower:"Цветок",balloon:"Воздушный шар",castle:"Замок"
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
  ship:{hull:[149,271],porthole:[200,270]},
  tree:{trunk:[199,251],crown:[191,91],branch:[134,159],fruit:[251,128],grass:[197,303]},
  flower:{stem:[200,195],pot:[199,279],petals:[232,67],center:[200,95],leaf:[140,198]},
  balloon:{rig:[174,225],envelope:[249,76],stripe:[199,96],nozzle:[200,194],basket:[200,284]},
  castle:{wall:[258,220],gate:[220,263]}
 };
 if(!small)for(let i=0;i<task.parts.length;i++){
  const part=task.parts[i],position=anchors[task.figure]?.[part.id]??[part.x,part.y];
  const radius=part.shape==="thin-rectangle"?11:14;
  shapes+='<g class="tangram-slot-number"><circle cx="'+position[0]+'" cy="'+position[1]+'" r="'+radius+'" fill="#fff" stroke="#665097" stroke-width="1.7" opacity=".96"/>'+
   '<text x="'+position[0]+'" y="'+(position[1]+1)+'" font-size="16" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="#473278">'+(i+1)+'</text></g>';
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
  "balloon-envelope":.62,"balloon-stripe":.71
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
