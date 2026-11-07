// ЧУДОЛЁТ — независимый детерминированный генератор заданий.
// Никаких запросов к серверу; идентификаторы и решения сохраняются в JSON.
export const CATALOG = [
 ["find","Найди предметы","Внимание",3],["differences","Найди отличия","Внимание",4],
 ["shadow","Чья это тень?","Внимание",3],["memory","Что изменилось?","Внимание",4],
 ["odd","Найди лишнее","Внимание",4],["sequence","Продолжи ряд","Логика",3],
 ["sort","Разложи по группам","Логика",3],["pair","Найди пару","Логика",3],
 ["table","Таблица признаков","Логика",5],["sudoku","Мини-судоку","Логика",5],
 ["maze","Лабиринт","Пространство",3],["map","Путешествие по карте","Пространство",5],
 ["puzzle","Собери картинку","Пространство",3],["tangram","Фигуры-конструкторы","Пространство",5],
 ["symmetry","Зеркальная половинка","Пространство",4],["count","Сосчитай находки","Математика",3],
 ["compare","Больше, меньше, поровну","Математика",3],["mathpath","Математическая дорожка","Математика",5],
 ["number","Составь число","Математика",5],["shop","Магазин приключений","Математика",5],
 ["word","Собери слово","Речь",5],["syllables","Слоговый конструктор","Речь",5],
 ["story","История по порядку","Речь",4],["crossword","Кроссворд с картинками","Речь",6],
 ["phrase","Закончи фразу","Речь",5],["cipher","Секретный шифр","Приключения",6],
 ["backpack","Волшебный рюкзак","Приключения",4],["detective","Маленький детектив","Приключения",6],
 ["branching","Приключение с выбором","Приключения",5],["team","Командная миссия","Приключения",6]
].map(([id,name,group,minAge],i)=>({id,name,group,minAge,number:i+1,ready:["find","differences","shadow","memory","odd","sequence","sort","pair","table","sudoku","maze","count","compare","story"].includes(id)}));

export const THEMES = {
 clouds:{name:"Облачная почта",icon:"☁️",a:["✉️","📦","🪁","🧭","🔔","🗝️"],b:["🌈","⭐","☁️","🌙","☀️","⚡"],labels:["Почтовые находки","Небесные чудеса"]},
 forest:{name:"Волшебный лес",icon:"🌳",a:["🍄","🌰","🍓","🍎","🍐","🥕"],b:["🦊","🐿️","🐻","🦉","🦋","🐇"],labels:["Лесные запасы","Лесные жители"]},
 ocean:{name:"Подводное царство",icon:"🐚",a:["🐟","🐠","🐡","🦀","🐙","🦐"],b:["🐚","🪸","💎","⚓","🧭","🏝️"],labels:["Морские жители","Морские находки"]},
 space:{name:"Космическая экспедиция",icon:"🚀",a:["🚀","🛸","🛰️","🔭","🪐","🌌"],b:["⭐","🌟","☀️","🌙","🌎","☄️"],labels:["Космическая техника","Небесные тела"]},
 pirate:{name:"Пиратское приключение",icon:"🏴‍☠️",a:["🧭","🗝️","⚓","🪙","🗺️","💰"],b:["🦜","🐒","🐢","🦀","🐙","🦈"],labels:["Пиратские вещи","Животные"]},
 dino:{name:"Долина динозавров",icon:"🦕",a:["🦕","🦖","🥚","🦎","🐢","🐊"],b:["🌴","🌵","🌋","🪨","🌿","🍃"],labels:["Доисторические обитатели","Природа долины"]}
};
export const STORY_STEPS = [
 {icon:"🫘",text:"Герой посадил семечко"},
 {icon:"💧",text:"Полил землю"},
 {icon:"🌱",text:"Показался росток"},
 {icon:"🌻",text:"Вырос цветок"}
];
export const READY_IDS=CATALOG.filter(x=>x.ready).map(x=>x.id);
export function seeded(seed=12345){let x=Number(seed)>>>0;return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const integer=(r,n)=>Math.floor(r()*n);
function shuffle(a,r){const copy=a.slice();for(let i=copy.length-1;i>0;i--){let j=integer(r,i+1);[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
const pick=(a,r)=>a[integer(r,a.length)];
const shuffleUnique=(a,r,n)=>shuffle([...new Set(a)],r).slice(0,n);
export function resolveAge(key){return {"3-4":3,"5-6":5,"7-9":7,"10-12":10}[key]??5;}
export function neighbors(task,node){return task.edges.filter(e=>e[0]===node||e[1]===node).map(e=>e[0]===node?e[1]:e[0]);}
export function solveMaze(task){
 const queue=[[0]],seen=new Set([0]),finish=task.size*task.size-1;
 while(queue.length){const path=queue.shift(),at=path.at(-1);if(at===finish)return path;
 for(const next of neighbors(task,at)){if(!seen.has(next)){seen.add(next);queue.push([...path,next]);}}}
 return null;
}
// Количество простых путей от старта до финиша, без циклических повторений.
// Останавливаемся на четырёх: это быстрее, чем искать все лишние пути.
export function countMazeRoutes(task,limit=4){
 const goal=task.size*task.size-1,visited=new Set([0]);let routes=0;
 function walk(at){
  if(at===goal){routes++;return;}
  if(routes>=limit)return;
  for(const next of neighbors(task,at)){
   if(!visited.has(next)){visited.add(next);walk(next);visited.delete(next);}
   if(routes>=limit)return;
  }
 }
 walk(0);return routes;
}
function gridWalls(task){
 const walls=[],size=task.size,opened=new Set(task.edges.map(e=>[...e].sort((a,b)=>a-b).join("-")));
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const a=y*size+x;
  if(x<size-1&&!opened.has(a+"-"+(a+1)))walls.push([a,a+1]);
  if(y<size-1&&!opened.has(a+"-"+(a+size)))walls.push([a,a+size]);
 }
 return walls;
}
function mazeTree(size,r){
 const visited=new Set([0]),edges=[],stack=[0];
 while(stack.length){
  const v=stack.at(-1),x=v%size,y=Math.floor(v/size);
  const adjacent=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]]
   .filter(([nx,ny])=>nx>=0&&nx<size&&ny>=0&&ny<size)
   .map(([nx,ny])=>ny*size+nx).filter(n=>!visited.has(n));
  if(!adjacent.length){stack.pop();continue;}
  const n=pick(adjacent,r);edges.push([v,n]);visited.add(n);stack.push(n);
 }
 return {size,edges};
}
function maze(size,r,branching=false){
 // До 7 лет сохраняем понятный единственный путь.
 if(!branching)return {...mazeTree(size,r),routeCount:1};
 const wantThree=r()<0.5;
 for(let attempt=0;attempt<12;attempt++){
  const result=mazeTree(size,r);
  // У углового старта всего два соседних выхода — открываем оба.
  const extraStart=neighbors(result,0).includes(1)?size:1;
  result.edges.push([0,extraStart]);
  // Добавленный цикл содержит старт и гарантирует ровно два решения.
  if(!wantThree)return {...result,routeCount:2};
  // Добавляем второе соединение только при трёх разных простых путях.
  const candidate=shuffle(gridWalls(result),r).find(edge=>{
   result.edges.push(edge);
   const three=countMazeRoutes(result)===3;
   result.edges.pop();return three;
  });
  if(candidate){result.edges.push(candidate);return {...result,routeCount:3};}
 }
 // На редких структурах не удаётся добавить третий путь:
 // гарантируем как минимум два корректных прохода и два выхода вначале.
 const result=mazeTree(size,r),extraStart=neighbors(result,0).includes(1)?size:1;
 result.edges.push([0,extraStart]);
 return {...result,routeCount:2};
}

// Полный набор 4x4: в каждой строке, колонке и квадрате 2x2 все 4 символа по одному разу.
export function validSudokuSolution(s){
 if(!Array.isArray(s)||s.length!==16||!s.every(n=>Number.isInteger(n)&&n>=0&&n<4))return false;
 const correct=a=>new Set(a).size===4;
 for(let k=0;k<4;k++){
  if(!correct(s.slice(k*4,k*4+4)))return false;
  if(!correct([0,1,2,3].map(r=>s[r*4+k])))return false;
 }
 for(let r=0;r<4;r+=2)for(let c=0;c<4;c+=2){
  if(!correct([s[r*4+c],s[r*4+c+1],s[(r+1)*4+c],s[(r+1)*4+c+1]]))return false;
 }
 return true;
}
export function countSudokuSolutions(grid,limit=2){
 if(!Array.isArray(grid)||grid.length!==16||!grid.every(n=>n===null||(Number.isInteger(n)&&n>=0&&n<4)))return 0;
 const work=grid.slice();
 const candidates=(idx)=>{
  const row=Math.floor(idx/4),col=idx%4,used=new Set();
  for(let n=0;n<4;n++){used.add(work[row*4+n]);used.add(work[n*4+col]);}
  const r0=Math.floor(row/2)*2,c0=Math.floor(col/2)*2;
  for(let y=0;y<2;y++)for(let x=0;x<2;x++)used.add(work[(r0+y)*4+c0+x]);
  return [0,1,2,3].filter(x=>!used.has(x));
 };
 // Неправильные подсказки не должны трактоваться как исходное допустимое поле.
 for(let i=0;i<16;i++)if(work[i]!==null){
  const v=work[i];work[i]=null;const ok=candidates(i).includes(v);work[i]=v;
  if(!ok)return 0;
 }
 let count=0;
 const search=()=>{
  if(count>=limit)return;
  let best=-1,bestOpts=null;
  for(let i=0;i<16;i++)if(work[i]===null){
   const opts=candidates(i);
   if(opts.length===0)return;
   if(bestOpts===null||opts.length<bestOpts.length){best=i;bestOpts=opts;}
  }
  if(best===-1){count++;return;}
  for(const n of bestOpts){
   work[best]=n;search();work[best]=null;if(count>=limit)return;
  }
 };
 search();return count;
}
function makeSudoku(r,combined,age){
 const groups=shuffle([0,1],r);
 const rowOrder=groups.flatMap(b=>shuffle([b*2,b*2+1],r));
 const colOrder=shuffle([0,1],r).flatMap(b=>shuffle([b*2,b*2+1],r));
 const digits=shuffle([0,1,2,3],r);
 const canonical=(row,col)=>(row*2+Math.floor(row/2)+col)%4;
 const solution=Array.from({length:16},(_,i)=>digits[canonical(rowOrder[Math.floor(i/4)],colOrder[i%4])]);
 const grid=solution.slice(),symbols=shuffleUnique(combined,r,4);
 const blanksGoal=age<=5?5:age<=7?7:8;
 for(const pos of shuffle(Array.from({length:16},(_,i)=>i),r)){
  if(grid.filter(n=>n===null).length>=blanksGoal)break;
  const previous=grid[pos];grid[pos]=null;
  if(countSudokuSolutions(grid)!==1)grid[pos]=previous;
 }
 return {size:4,symbols,grid,solution,blankCount:grid.filter(n=>n===null).length};
}

function taskFor(kind,age,theme,r){
 const t=THEMES[theme]||THEMES.clouds,combined=[...t.a,...t.b],short=age<=3;
 let q={kind,title:CATALOG.find(e=>e.id===kind)?.name??kind,theme,age};
 if(kind==="memory"){
  const base=shuffleUnique(combined,r,age<=5?4:6);
  const missing=integer(r,base.length),changed=base.slice();
  changed[missing]=null;
  // Варианты-ловушки берём ТОЛЬКО из предметов, не показанных ребёнку.
  const answer=base[missing];
  const distractors=shuffleUnique(combined.filter(icon=>!base.includes(icon)),r,3);
  const options=shuffle([answer,...distractors],r);
  if(options[0]===answer){
   const other=1+integer(r,options.length-1);
   [options[0],options[other]]=[options[other],options[0]];
  }
  return {...q,prompt:"Запомни предметы. Затем узнай, какой предмет исчез.",base,changed,position:missing,answer,options};
 }
 if(kind==="table"){
  const n=age>=10?4:3,rows=shuffleUnique(t.a,r,n),columns=shuffleUnique(t.b,r,n);
  const row=integer(r,n),col=integer(r,n);
  const candidates=[];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)candidates.push([rows[y],columns[x]]);
  const correct=rows[row]+"|"+columns[col];
  const other=shuffle(candidates.filter(x=>x.join("|")!==correct),r).slice(0,3);
  const options=shuffle([[rows[row],columns[col]],...other],r);
  return {...q,prompt:"Найди недостающую пару по строке и столбцу.",rows,columns,missing:[row,col],options,answer:options.findIndex(x=>x.join("|")===correct)};
 }
 if(kind==="sudoku"){
  return {...q,prompt:"Заполни пустые клетки. Каждый значок должен встречаться один раз в строке, столбце и квадрате 2×2.",...makeSudoku(r,combined,age)};
 }
 if(kind==="differences"){
  const cols=short?3:age<=5?4:5,rows=short?3:age<=7?4:5;
  const base=Array.from({length:cols*rows},()=>pick(combined,r));
  const howMany=short?3:age<=5?4:age<=7?5:6;
  const answer=shuffle(Array.from({length:base.length},(_,i)=>i),r).slice(0,howMany).sort((a,b)=>a-b);
  const changed=base.slice();
  for(const pos of answer)changed[pos]=pick(combined.filter(icon=>icon!==base[pos]),r);
  return {...q,prompt:"Найди "+howMany+" отличия. Отмечай изменённые предметы на второй картинке.",cols,rows,base,changed,answer};
 }
 if(kind==="find"||kind==="count"){
  const target=pick(combined,r),n=short?12:20,quantity=2+integer(r,short?3:5);
  const cells=shuffle([...Array(quantity).fill(target),...Array.from({length:n-quantity},()=>pick(combined.filter(e=>e!==target),r))],r);
  return {...q,prompt:kind==="find"?"Найди и сосчитай все "+target:"Сколько "+target+" на картинке?",cells,target,answer:quantity,options:Array.from({length:short?5:8},(_,i)=>i+1)};
 }
 if(kind==="shadow"){
  const original=shuffleUnique(combined,r,short?3:4),target=pick(original,r);
  return {...q,prompt:"Какая картинка спряталась в тени?",target,options:shuffle(original,r),answer:target};
 }
 if(kind==="odd"){
  const base=integer(r,2),a=base?t.b:t.a,b=base?t.a:t.b;
  const outlier=pick(b,r),cells=shuffle([...shuffleUnique(a,r,short?3:5),outlier],r);
  return {...q,prompt:"Найди лишний предмет. Остальные — "+t.labels[base].toLowerCase()+".",cells,answer:cells.indexOf(outlier)};
 }
 if(kind==="sequence"){
  const symbols=shuffleUnique(combined,r,short?3:4),pattern=short?symbols.slice(0,2):symbols.slice(0,3),shown=Array.from({length:short?4:6},(_,i)=>pattern[i%pattern.length]);
  const answer=pattern[shown.length%pattern.length];
  return {...q,prompt:"Какой рисунок должен быть следующим?",shown,options:shuffle(symbols,r),answer};
 }
 if(kind==="sort"){
  const a=shuffleUnique(t.a,r,3).map(icon=>({icon,group:0}));
  const b=shuffleUnique(t.b,r,3).map(icon=>({icon,group:1}));
  return {...q,prompt:"Разложи предметы по двум корзинам.",labels:t.labels,items:shuffle([...a,...b],r),answer:null};
 }
 if(kind==="pair"){
  const pairs=[["🐝","🌼"],["🐇","🥕"],["🔑","🔒"],["✉️","📮"],["🐟","🌊"],["☀️","🕶️"],["🪥","🦷"],["🌧️","☂️"]];
  const selected=shuffle(pairs,r).slice(0,4),target=pick(selected,r);
  return {...q,prompt:"Что подходит к предмету "+target[0]+"?",target:target[0],options:shuffle(selected.map(x=>x[1]),r),answer:target[1]};
 }
 if(kind==="maze")return {...q,prompt:"Проведи героя от старта 🐾 до финиша ⭐.",...maze(short?4:age>=10?7:6,r,age>=7),answer:null};
 if(kind==="compare"){
  const left=1+integer(r,age<=3?4:8),right=1+integer(r,age<=3?4:8);
  return {...q,prompt:"Чего больше? Выбери знак.",left,right,icon:pick(combined,r),options:[">","=","<"],answer:left>right?">":left<right?"<":"="};
 }
 if(kind==="story"){
  const cards=shuffle(STORY_STEPS.map((s,i)=>({...s,order:i})),r);
  return {...q,prompt:"Нажми на картинки в правильном порядке.",cards,answer:[0,1,2,3]};
 }
 throw new Error("Механика ещё не реализована: "+kind);
}
export function makeTask(kind,age="5-6",theme="clouds",seed=1){
 if(!READY_IDS.includes(kind))throw new Error("Механика в каталоге, но генератор ещё не готов: "+kind);
 return {...taskFor(kind,resolveAge(age),theme,seeded(seed)),id:kind+"-"+seed,seed};
}
export function validateTask(t){
 if(!t||!READY_IDS.includes(t.kind))return false;
 if(t.kind==="memory"){
  if(!Array.isArray(t.base)||!Array.isArray(t.changed)||!Array.isArray(t.options)||t.base.length<4||t.base.length!==t.changed.length)return false;
  if(new Set(t.base).size!==t.base.length||t.options.length!==4||new Set(t.options).size!==4)return false;
  const missing=t.base.flatMap((x,i)=>x!==t.changed[i]?[i]:[]);
  const correct=t.answer===t.base[t.position]&&t.options.filter(x=>x===t.answer).length===1;
  const distractors=t.options.filter(x=>x!==t.answer);
  return missing.length===1&&missing[0]===t.position&&t.changed[t.position]===null&&
   correct&&t.options[0]!==t.answer&&distractors.length===3&&distractors.every(x=>!t.base.includes(x));
 }
 if(t.kind==="table"){
  if(!Array.isArray(t.rows)||!Array.isArray(t.columns)||!Array.isArray(t.options)||!Array.isArray(t.missing))return false;
  const [row,col]=t.missing,n=t.rows.length;
  if(n<3||n>4||t.columns.length!==n||new Set(t.rows).size!==n||new Set(t.columns).size!==n)return false;
  if(!Number.isInteger(row)||!Number.isInteger(col)||row<0||col<0||row>=n||col>=n)return false;
  if(t.options.length!==4||new Set(t.options.map(x=>x.join("|"))).size!==4||!Number.isInteger(t.answer)||t.answer<0||t.answer>=4)return false;
  return t.options.every(x=>x.length===2&&t.rows.includes(x[0])&&t.columns.includes(x[1]))&&t.options[t.answer][0]===t.rows[row]&&t.options[t.answer][1]===t.columns[col];
 }
 if(t.kind==="sudoku"){
  if(t.size!==4||!Array.isArray(t.symbols)||new Set(t.symbols).size!==4||!Array.isArray(t.grid)||t.grid.length!==16)return false;
  if(!validSudokuSolution(t.solution)||t.grid.some((v,i)=>v!==null&&v!==t.solution[i]))return false;
  const blanks=t.grid.filter(v=>v===null).length;
  return blanks>=4&&blanks===t.blankCount&&countSudokuSolutions(t.grid)===1;
 }
 if(t.kind==="differences"){
  if(!Array.isArray(t.base)||!Array.isArray(t.changed)||!Array.isArray(t.answer)||!Number.isInteger(t.cols)||!Number.isInteger(t.rows))return false;
  const expected=t.cols*t.rows;
  if(t.base.length!==expected||t.changed.length!==expected||t.answer.length<2)return false;
  const positions=t.base.flatMap((symbol,i)=>t.changed[i]!==symbol?[i]:[]);
  return positions.length===t.answer.length&&positions.every((i,j)=>i===t.answer[j]);
 }
 if(t.kind==="find"||t.kind==="count")return t.cells.filter(c=>c===t.target).length===t.answer&&t.options.includes(t.answer);
 if(t.kind==="odd")return Number.isInteger(t.answer)&&t.answer>=0&&t.answer<t.cells.length;
 if(t.kind==="shadow"||t.kind==="pair"||t.kind==="sequence")return t.options.includes(t.answer)&&new Set(t.options).size===t.options.length;
 if(t.kind==="sort")return t.items.length>0&&t.items.every(i=>i.group===0||i.group===1);
 if(t.kind==="maze"){
  const advanced=t.age>=7,extra=advanced?(t.routeCount===3?2:1):0;
  return t.edges.length===t.size*t.size-1+extra&&
    (advanced?([2,3].includes(t.routeCount)&&neighbors(t,0).length===2):t.routeCount===1)&&
    countMazeRoutes(t)===t.routeCount&&!!solveMaze(t);
 }
 if(t.kind==="compare")return (t.left>t.right?">":t.left<t.right?"<":"=")===t.answer;
 if(t.kind==="story")return t.cards.length===4&&t.cards.map(c=>c.order).sort().join(",")==="0,1,2,3";
 return false;
}
export function checkAnswer(t,value){
 if(t.kind==="memory")return value===t.answer;
 if(t.kind==="table")return Number.isInteger(value)&&value===t.answer;
 if(t.kind==="sudoku")return Array.isArray(value)&&value.length===16&&value.every((v,i)=>v===t.solution[i]);
 if(t.kind==="differences")return Array.isArray(value)&&value.length===t.answer.length&&new Set(value).size===value.length&&value.every(v=>t.answer.includes(v));
 if(t.kind==="sort")return Array.isArray(value)&&value.length===t.items.length&&value.every((x,i)=>x===t.items[i].group);
 if(t.kind==="maze")return Array.isArray(value)&&value[0]===0&&value.at(-1)===t.size*t.size-1&&value.every((cell,i)=>i===0||neighbors(t,value[i-1]).includes(cell));
 if(t.kind==="story")return Array.isArray(value)&&value.join(",")==="0,1,2,3";
 return String(value)===String(t.answer);
}
export function solutionText(t){
 if(t.kind==="memory")return "Исчез: "+t.answer+" (позиция "+(t.position+1)+")";
 if(t.kind==="table")return "Пара: "+t.rows[t.missing[0]]+" + "+t.columns[t.missing[1]];
 if(t.kind==="sudoku")return [0,1,2,3].map(row=>t.solution.slice(row*4,row*4+4).map(n=>t.symbols[n]).join(" ")).join(" / ");
 if(t.kind==="differences")return t.answer.map(i=>"строка "+(Math.floor(i/t.cols)+1)+", столбец "+(i%t.cols+1)).join("; ");
 if(t.kind==="maze")return "Возможных маршрутов: "+t.routeCount+". Пример: "+solveMaze(t).map(n=>"("+((n%t.size)+1)+","+Math.floor(n/t.size+1)+")").join(" → ");
 if(t.kind==="sort")return t.items.map(i=>i.icon+" — "+t.labels[i.group]).join("; ");
 if(t.kind==="story")return STORY_STEPS.map(e=>e.text).join(" → ");
 if(t.kind==="odd")return t.cells[t.answer]+" (позиция "+(t.answer+1)+")";
 if(t.kind==="shadow"||t.kind==="pair"||t.kind==="sequence")return t.answer;
 return String(t.answer);
}
export function generateBundle({age="5-6",theme="clouds",count=7,seed=20261107,focus="mixed"}={}){
 count=Math.max(1,Math.min(20,Number(count)||7));
 const eligible=(ids)=>ids.filter(id=>CATALOG.find(c=>c.id===id).minAge<=resolveAge(age));
 const candidates=focus.startsWith("type:")?[focus.slice(5)]:focus==="logic"?["shadow","differences","memory","odd","sequence","sort","pair","table","sudoku","maze","compare"]:focus==="story"?["find","sort","sequence","maze","count","pair","story"]:READY_IDS;
 const pool=eligible(candidates);
 if(pool.length===0)throw new Error("Эта механика пока не подходит выбранному возрасту.");
 const r=seeded(seed),tasks=Array.from({length:count},(_,i)=>makeTask(pool[i%pool.length],age,theme,integer(r,2**30)+i));
 if(!tasks.every(validateTask))throw new Error("Автопроверка заданий не пройдена");
 return {schema:"chudolet.bundle.v1",title:"Приключение: "+(THEMES[theme]?.name||THEMES.clouds.name),age,theme,count,seed,focus,created:"",tasks};
}
