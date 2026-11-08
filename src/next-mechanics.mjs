// ЧУДОЛЁТ — точные механики фигур, математического маршрута и покупки.
// Здесь только логика и конструктивные SVG; текст ответа не вшивается в игровой рисунок.
const choose=(r,n)=>Math.floor(r()*n);
const shuffled=(values,r)=>{
 const a=values.slice();
 for(let i=a.length-1;i>0;i--){const j=choose(r,i+1);[a[i],a[j]]=[a[j],a[i]];}
 return a;
};
const same=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
const COMPOSITIONS=Object.freeze({
 house:[
  ["body","square",200,195,1.75,"#d7bafa",0],
  ["roof","triangle",200,86,1.65,"#ffbe64",0],
  ["door","rectangle",215,243,.62,"#a9daed",0],
  ["window","circle",165,190,.65,"#f9e58c",0],
  ["chimney","rectangle",260,70,.65,"#edaaa7",0]
 ],
 rocket:[
  ["body","rectangle",200,180,1.4,"#bfa0f7",0],
  ["tip","triangle",200,60,1.15,"#ffca72",0],
  ["window","circle",200,170,.76,"#9edbff",0],
  ["left-fin","triangle",116,248,.76,"#f3aca2",-90],
  ["right-fin","triangle",284,248,.76,"#a4e5c1",90]
 ],
 robot:[
  ["body","square",200,202,1.55,"#b5d6f6",0],
  ["head","square",200,78,.95,"#ffdb94",0],
  ["eye","circle",200,78,.5,"#aa83d5",0],
  ["arm","rectangle",110,202,.83,"#f2b3b4",0],
  ["antenna","diamond",200,21,.5,"#9ddbba",0]
 ],
 ship:[
  ["hull","trapezoid",200,260,1.4,"#c5a3ef",180],
  ["mast","rectangle",200,169,.9,"#f4c57e",0],
  ["sail","triangle",151,142,1.05,"#aedbe9",0],
  ["flag","triangle",252,115,.64,"#f9b3a1",90],
  ["porthole","circle",200,270,.65,"#d9f28d",0]
 ]
});
const CONSTRUCTION_NAMES={house:"Домик",rocket:"Ракета",robot:"Робот",ship:"Кораблик"};
function blueprint(id){return COMPOSITIONS[id]?.map(([id,shape,x,y,scale,color,rotate])=>({id,shape,x,y,scale,color,rotate}));}
export function makeTangram(age,r){
 const ids=Object.keys(COMPOSITIONS),figure=ids[choose(r,ids.length)],parts=blueprint(figure);
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
 return same(task.answer,ids)&&same(task.tray.slice().sort(),ids.slice().sort())&&!same(task.tray,ids);
}
export function checkTangram(task,answer){return same(answer,task.answer);}

const SHAPES={
 square:'<rect x="-40" y="-40" width="80" height="80" rx="4"/>',
 rectangle:'<rect x="-29" y="-50" width="58" height="100" rx="4"/>',
 triangle:'<polygon points="0,-50 49,41 -49,41"/>',
 circle:'<circle r="41"/>',
 diamond:'<polygon points="0,-53 44,0 0,53 -44,0"/>',
 trapezoid:'<polygon points="-32,-34 32,-34 53,34 -53,34"/>'
};
function shapeItem(part,fill,stroke="#7256a0",strokeWidth=3){
 return '<g transform="translate('+part.x+' '+part.y+') rotate('+part.rotate+') scale('+part.scale+')" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+strokeWidth+'" stroke-linejoin="round">'+SHAPES[part.shape]+'</g>';
}
export function tangramSvg(task,placed=null,{small=false}={}){
 const done=Array.isArray(placed)?placed:task.answer;
 let shapes='';
 for(let i=0;i<task.parts.length;i++){
  const part=task.parts[i];
  shapes+=shapeItem(part,"#ede6f8","#bcaecf",3);
  if(done[i]!==null){
   const selected=task.parts.find(candidate=>candidate.id===done[i]);
   if(selected)shapes+=shapeItem({...selected,x:part.x,y:part.y,scale:part.scale},selected.color,"#604a85",2);
  }
  if(!small)shapes+='<text x="'+(part.x+23)+'" y="'+(part.y-24)+'" font-size="16" fill="#44356d" font-weight="900">'+(i+1)+'</text>';
 }
 return '<svg class="tangram-art" viewBox="35 -35 330 370" role="img" aria-label="Геометрическая фигура '+task.figureName+'">'+
  '<rect x="35" y="-35" width="330" height="370" fill="'+(small?"#fff":"#fffef7")+'" rx="14"/>'+
  shapes+'</svg>';
}
export function tangramPieceSvg(part){
 const fill=part.color,shape=SHAPES[part.shape];
 return '<svg viewBox="-66 -68 132 136" role="img" aria-label="Деталь '+part.id+'" class="tangram-piece-art">'+
  '<g transform="rotate('+part.rotate+') scale('+Math.min(part.scale,1.15)+')" fill="'+fill+'" stroke="#664c88" stroke-width="3" stroke-linejoin="round">'+shape+'</g></svg>';
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
