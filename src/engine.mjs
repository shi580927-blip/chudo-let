import {WORD_BANK,allowedWords} from "./words.mjs";
import {STORY_BANK,PAIR_BANK} from "./narrative-banks.mjs";
import {makeTangram,validateTangram,checkTangram,FIGURE_IDS,makeMathPath,validateMathPath,checkMathPath,makeShop,validateShop,checkShop} from "./next-mechanics.mjs";
import {makePicturePuzzle,validatePicturePuzzle,checkPicturePuzzle,makeSymmetry,validateSymmetry,checkSymmetry,makeBackpack,validateBackpack,checkBackpack} from "./spatial.mjs";
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
 ["story","История по порядку","Речь",4],["crossword","Кроссворд с картинками","Речь",7],
 ["phrase","Закончи фразу","Речь",5],["cipher","Секретный шифр","Приключения",7],
 ["backpack","Волшебный рюкзак","Приключения",5],["detective","Маленький детектив","Приключения",6],
 ["branching","Приключение с выбором","Приключения",5],["team","Командная миссия","Приключения",6]
].map(([id,name,group,minAge],i)=>({id,name,group,minAge,number:i+1,ready:["find","differences","shadow","memory","odd","sequence","sort","pair","table","sudoku","maze","map","count","compare","number","word","syllables","story","crossword","cipher","puzzle","symmetry","backpack","tangram","mathpath","shop"].includes(id)}));

export const THEMES = {
 clouds:{name:"Облачная почта",icon:"☁️",a:["✉️","📦","🪁","🧭","🔔","🗝️","📮","🏷️","🖋️","👜","🎒","🗞️"],b:["🌈","⭐","☁️","🌙","☀️","⚡","🌧️","🌤️","❄️","🌪️","🌨️","🌌"],labels:["Почтовые находки","Небесные чудеса"]},
 forest:{name:"Волшебный лес",icon:"🌳",a:["🍄","🌰","🍓","🍎","🍐","🥕","🌿","🌼","🍯","🥜","🍂","🪵"],b:["🦊","🐿️","🐻","🦉","🦋","🐇","🦔","🦡","🐌","🐝","🦌","🐸"],labels:["Лесные запасы","Лесные жители"]},
 ocean:{name:"Подводное царство",icon:"🐚",a:["🐟","🐠","🐡","🦀","🐙","🦐","🦈","🐬","🐋","🪼","🦭","🦑"],b:["🐚","🪸","💎","⚓","🧭","🏝️","⛵","🛟","🪙","🗺️","🪨","🛶"],labels:["Морские жители","Морские находки"]},
 space:{name:"Космическая экспедиция",icon:"🚀",a:["🚀","🛸","🛰️","🔭","🤖","📡","📻","🔦","🖥️","🔋","📷","🧪"],b:["⭐","🌟","☀️","🌙","🌎","☄️","🪐","🌌","🌠","🌑","🌘","🌕"],labels:["Космическая техника","Небесные объекты"]},
 pirate:{name:"Пиратское приключение",icon:"🏴‍☠️",a:["🧭","🗝️","⚓","🪙","🗺️","💰","🏴‍☠️","⛵","🪝","🎒","🧰","🔭"],b:["🦜","🐒","🐢","🦀","🐙","🦈","🐟","🐬","🦎","🦭","🐠","🦑"],labels:["Пиратские вещи","Животные"]},
 dino:{name:"Долина динозавров",icon:"🦕",a:["🦕","🦖","🥚","🦎","🐢","🐊","🦤","🐦","🐸","🦋","🪲","🐍"],b:["🌴","🌵","🌋","🪨","🌿","🍃","🌳","🌱","🌼","🪵","🏞️","🌧️"],labels:["Доисторические обитатели","Природа долины"]},
};
// Предметы рюкзака — особый классификационный набор, не меняющий остальные задания.
const BACKPACK_SPACE={
 a:["🚀","🛸","🛰️","🔭"],
 b:["☀️","🌙","🌎","☄️","🪐","🌌"],
 labels:["Космическая техника","Небесные объекты"]
};
const backpackTheme=(id)=>id==="space"?BACKPACK_SPACE:(THEMES[id]??THEMES.clouds);
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

// Маршрут по реальной сетке, без прыжков, выходов за края и повторов клеток.
const MAP_DIRECTIONS=[
 {arrow:"→",dx:1,dy:0},{arrow:"←",dx:-1,dy:0},
 {arrow:"↓",dx:0,dy:1},{arrow:"↑",dx:0,dy:-1}
];
export function traceMap(task){
 const size=task.size;
 if(!Number.isInteger(size)||size<3||!Number.isInteger(task.start)||task.start<0||task.start>=size*size||!Array.isArray(task.directions))return null;
 const path=[task.start],seen=new Set(path);
 for(const arrow of task.directions){
  const move=MAP_DIRECTIONS.find(d=>d.arrow===arrow);
  if(!move)return null;
  const old=path.at(-1),x=old%size+move.dx,y=Math.floor(old/size)+move.dy;
  if(x<0||y<0||x>=size||y>=size)return null;
  const next=y*size+x;
  if(seen.has(next))return null;
  path.push(next);seen.add(next);
 }
 return path;
}
function makeMapRoute(size,steps,r){
 const starts=shuffle(Array.from({length:size*size},(_,i)=>i),r);
 for(const start of starts){
  const seen=new Set([start]),path=[start],directions=[];
  const walk=()=>{
   if(directions.length===steps)return true;
   const at=path.at(-1),x=at%size,y=Math.floor(at/size);
   for(const d of shuffle(MAP_DIRECTIONS,r)){
    const nx=x+d.dx,ny=y+d.dy;
    if(nx<0||ny<0||nx>=size||ny>=size)continue;
    const next=ny*size+nx;
    if(seen.has(next))continue;
    path.push(next);seen.add(next);directions.push(d.arrow);
    if(walk())return true;
    directions.pop();seen.delete(next);path.pop();
   }
   return false;
  };
  if(walk())return {start,path,directions};
 }
 throw new Error("Не удалось построить маршрут карты");
}
const CIPHER_WORDS={
 clouds:["ПОЧТА","ЗВЕЗДА","ОБЛАКО","КОМПАС","ПОСЫЛКА","СЕКРЕТ","СИГНАЛ"],
 forest:["ГРИБ","ЛИСА","ПОЛЯНА","РОДНИК","БЕРЁЗА","ТРОПИНКА","ЗАГАДКА"],
 ocean:["МОРЕ","ВОЛНА","ОСТРОВ","АКУЛА","РАКУШКА","ЖЕМЧУГ"],
 space:["РАКЕТА","КОСМОС","ОРБИТА","ЗВЕЗДА","ПЛАНЕТА","СПУТНИК"],
 pirate:["ПИРАТ","КАРТА","СУНДУК","КОМПАС","СОКРОВИЩЕ"],
 dino:["ЯЙЦО","ЛАПКА","ДОЛИНА","ХВОСТ","ДИНОЗАВР","ЯЩЕРИЦА"]
};
const CIPHER_ALPHABET=[..."АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"];
const CIPHER_SYMBOLS=[..."◆●▲■★✿✦☂☾☀♣♠♥⬟⬢✚✱◉◇▽♜⚑☁"];

// Проверяем пересечения реального кроссворда с иллюстрированными подсказками.
// Вертикальное слово пересекают два различных горизонтальных слова на разных строках.
function makeCrossword(theme,age,r){
 const pool=shuffle(allowedWords(theme,4,age>=10?10:8),r);
 for(const down of pool.filter(x=>x.word.length>=5)){
  const acrossWords=shuffle(pool.filter(x=>x!==down&&x.word.length>=4&&x.word.length<=8),r);
  const options=[];
  for(const candidate of acrossWords)for(let v=0;v<down.word.length;v++){
   for(let h=0;h<candidate.word.length;h++){
    if(down.word[v]===candidate.word[h])options.push({entry:candidate,v,h});
   }
  }
  const choices=shuffle(options,r);
  for(const first of choices)for(const second of choices){
   if(first.entry.word===second.entry.word||Math.abs(first.v-second.v)<2)continue;
   const left=Math.min(10-first.h,10-second.h,10);
   const right=Math.max(10-first.h+first.entry.word.length-1,10-second.h+second.entry.word.length-1,10);
   const cols=right-left+1,rows=down.word.length;
   if(cols>12||rows>10||cols<5)continue;
   const vertical={word:down.word,icon:down.icon,orientation:"down",row:0,col:10-left};
   const firstAcross={word:first.entry.word,icon:first.entry.icon,orientation:"across",row:first.v,col:10-first.h-left};
   const secondAcross={word:second.entry.word,icon:second.entry.icon,orientation:"across",row:second.v,col:10-second.h-left};
   const entries=[vertical,firstAcross,secondAcross].sort((a,b)=>a.row-b.row||a.col-b.col);
   const solution=Array(rows*cols).fill(null),occupancy=Array(rows*cols).fill(0);
   let valid=true;
   for(const entry of entries){
    for(let i=0;i<entry.word.length;i++){
     const row=entry.row+(entry.orientation==="down"?i:0);
     const col=entry.col+(entry.orientation==="across"?i:0);
     if(row>=rows||col>=cols){valid=false;break;}
     const idx=row*cols+col,letter=entry.word[i];
     if(solution[idx]!==null&&solution[idx]!==letter){valid=false;break;}
     solution[idx]=letter;occupancy[idx]++;
    }
   }
   if(!valid||occupancy.filter(x=>x===2).length!==2||occupancy.some(x=>x>2))continue;
   let next=1;
   const numbered=entries.map(ent=>({...ent,number:next++}));
   return {rows,cols,entries:numbered,solution,grid:solution.map(x=>x===null?null:"")};
  }
 }
 throw new Error("Для темы не удалось построить проверенный кроссворд");
}
export function validateCrossword(t){
 if(!Number.isInteger(t.rows)||!Number.isInteger(t.cols)||t.rows<5||t.rows>10||t.cols<5||t.cols>12||!Array.isArray(t.entries)||t.entries.length!==3)return false;
 if(!Array.isArray(t.solution)||!Array.isArray(t.grid)||t.solution.length!==t.rows*t.cols||t.grid.length!==t.solution.length)return false;
 const themeWords=WORD_BANK[t.theme]??[],lookup=new Map(themeWords.map(x=>[x.word,x.icon]));
 const built=Array(t.rows*t.cols).fill(null),used=Array(t.rows*t.cols).fill(0);
 const directions=t.entries.map(e=>e.orientation);
 if(directions.filter(x=>x==="across").length!==2||directions.filter(x=>x==="down").length!==1)return false;
 if(new Set(t.entries.map(x=>x.word)).size!==3||new Set(t.entries.map(x=>x.number)).size!==3)return false;
 for(const item of t.entries){
  if(!Number.isInteger(item.number)||item.number<1||item.number>3||lookup.get(item.word)!==item.icon)return false;
  if(!Number.isInteger(item.row)||!Number.isInteger(item.col)||item.row<0||item.col<0)return false;
  for(let i=0;i<item.word.length;i++){
   const row=item.row+(item.orientation==="down"?i:0);
   const col=item.col+(item.orientation==="across"?i:0);
   if(row>=t.rows||col>=t.cols)return false;
   const idx=row*t.cols+col,letter=item.word[i];
   if(built[idx]!==null&&built[idx]!==letter)return false;
   built[idx]=letter;used[idx]++;
  }
 }
 return built.every((x,i)=>x===t.solution[i]&&t.grid[i]===(x===null?null:""))&&used.filter(x=>x===2).length===2&&used.every(x=>x<=2);
}
function shuffledTiles(parts,r){
 let shuffled=shuffle(parts,r);
 if(shuffled.join("")===parts.join("")){
  // Даже для двух слогов не раскрываем готовую последовательность.
  shuffled=parts.slice(1).concat(parts[0]);
 }
 return shuffled;
}

function wordChoices(kind,theme,age){
 if(kind==="word")return allowedWords(theme,4,age<=5?6:age<=7?8:10);
 if(kind==="syllables")return allowedWords(theme,4,age<=5?8:10)
  .filter(w=>w.syllables.length>=2&&new Set(w.syllables).size===w.syllables.length);
 return [];
}
function taskFor(kind,age,theme,r,selectedWord=null,selectedFigure=null){
 const t=THEMES[theme]||THEMES.clouds,combined=[...t.a,...t.b],short=age<=3;
 let q={kind,title:CATALOG.find(e=>e.id===kind)?.name??kind,theme,age};
 if(kind==="tangram")return {...q,prompt:"Рассмотри контуры и собери фигуру из геометрических деталей.",...makeTangram(age,r,selectedFigure)};
 if(kind==="mathpath")return {...q,prompt:"Пройди числовую дорожку. На каждом шаге выбери правильный результат.",...makeMathPath(age,r)};
 if(kind==="shop")return {...q,prompt:"Купи указанное количество предметов, потратив ровно весь бюджет.",...makeShop(t,age,r)};
 if(kind==="puzzle"){
  return {...q,prompt:"Восстанови картинку из перемешанных фрагментов. Смотри на маленький образец.",...makePicturePuzzle(t,age,r)};
 }
 if(kind==="symmetry"){
  return {...q,prompt:"Какая правая половинка точно отражает левую, как в зеркале?",...makeSymmetry(t,age,r)};
 }
 if(kind==="backpack"){
  return {...q,prompt:"Собери волшебный рюкзак по всем условиям. Выбери нужные предметы.",...makeBackpack(backpackTheme(theme),age,r)};
 }
 if(kind==="word"){
  const pool=wordChoices(kind,theme,age);
  const entry=selectedWord===null?pick(pool,r):pool.find(w=>w.word===selectedWord);
  if(!entry)throw new Error("Неподходящее слово для задания");
  const tiles=shuffledTiles([...entry.word],r);
  return {...q,prompt:"Собери название предмета из перемешанных букв.",icon:entry.icon,tiles,answer:entry.word};
 }
 if(kind==="syllables"){
  // Для старших не ограничиваем набор только 3-сложными словами:
  // это искусственно сокращало словарь до 3–4 вариантов и вызывало повторы.
  const candidates=wordChoices(kind,theme,age);
  const entry=selectedWord===null?pick(candidates,r):candidates.find(w=>w.word===selectedWord);
  if(!entry)throw new Error("Неподходящее слово для задания");
  const tiles=shuffledTiles(entry.syllables,r);
  return {...q,prompt:"Собери название предмета из слогов в правильном порядке.",icon:entry.icon,tiles,answer:entry.word};
 }
 if(kind==="crossword"){
  return {...q,prompt:"Разгадай слова по картинкам. Буквы в пересечениях должны совпадать.",...makeCrossword(theme,age,r)};
 }
 if(kind==="map"){
  const size=age>=7?5:4,steps=age>=10?7:age>=7?6:4;
  const route=makeMapRoute(size,steps,r),goal=route.path.at(-1);
  const icons=Array(size*size).fill(null);
  const positions=[goal,...shuffle(Array.from({length:size*size},(_,i)=>i).filter(i=>i!==goal&&i!==route.start),r).slice(0,size===4?8:10)];
  const symbols=shuffleUnique(combined,r,positions.length);
  for(let i=0;i<positions.length;i++)icons[positions[i]]=symbols[i];
  const answer=icons[goal],options=shuffle([answer,...shuffle(symbols.filter(x=>x!==answer),r).slice(0,3)],r);
  return {...q,prompt:"От флажка двигайся по стрелкам. Какой предмет найдёшь в конце пути?",size,start:route.start,
   directions:route.directions,path:route.path,icons,options,answer};
 }
 if(kind==="cipher"){
  const dictionary=CIPHER_WORDS[theme]||CIPHER_WORDS.clouds;
  const maxLength=age<=5?6:age<=7?7:10;
  const suitable=dictionary.filter(w=>w.length<=maxLength);
  const answer=pick(suitable,r),used=[...new Set(answer)];
  const extras=shuffle(CIPHER_ALPHABET.filter(x=>!used.includes(x)),r).slice(0,3);
  const letters=shuffle([...used,...extras],r);
  const symbols=shuffle(CIPHER_SYMBOLS,r).slice(0,letters.length);
  const key=shuffle(letters.map((letter,i)=>({letter,symbol:symbols[i]})),r);
  const lookup=new Map(key.map(k=>[k.letter,k.symbol]));
  const encoded=[...answer].map(letter=>lookup.get(letter));
  return {...q,prompt:"Расшифруй секретное слово. Воспользуйся ключом и собери буквы по порядку.",key,encoded,answer};
 }
 if(kind==="number"){
  const hundreds=age>=10?1+integer(r,3):0;
  const tens=age<=5?1+integer(r,3):age<=7?2+integer(r,5):integer(r,8);
  const ones=integer(r,10);
  const value=hundreds*100+tens*10+ones;
  return {...q,prompt:"Сосчитай большие квадраты, десятки и отдельные кружочки. Составь число.",hundreds,tens,ones,value,answer:String(value)};
 }
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
  const selected=shuffle(PAIR_BANK,r).slice(0,4),target=pick(selected,r);
  return {...q,prompt:"Что подходит к предмету "+target[0]+"?",target:target[0],options:shuffle(selected.map(x=>x[1]),r),answer:target[1]};
 }
 if(kind==="maze")return {...q,prompt:"Проведи героя от старта 🐾 до финиша ⭐.",...maze(short?4:age>=10?7:6,r,age>=7),answer:null};
 if(kind==="compare"){
  const left=1+integer(r,age<=3?4:8),right=1+integer(r,age<=3?4:8);
  return {...q,prompt:"Чего больше? Выбери знак.",left,right,icon:pick(combined,r),options:[">","=","<"],answer:left>right?">":left<right?"<":"="};
 }
 if(kind==="story"){
  const story=pick(STORY_BANK,r),cards=shuffle(story.steps.map((step,i)=>({...step,order:i})),r);
  return {...q,prompt:"Нажми на картинки в правильном порядке.",storyId:story.id,cards,answer:[0,1,2,3]};
 }
 throw new Error("Механика ещё не реализована: "+kind);
}
export function makeTask(kind,age="5-6",theme="clouds",seed=1,selectedWord=null,selectedFigure=null){
 if(!READY_IDS.includes(kind))throw new Error("Механика в каталоге, но генератор ещё не готов: "+kind);
 return {...taskFor(kind,resolveAge(age),theme,seeded(seed),selectedWord,selectedFigure),id:kind+"-"+seed,seed};
}
export function validateTask(t){
 if(!t||!READY_IDS.includes(t.kind))return false;
 if(t.kind==="tangram")return validateTangram(t);
 if(t.kind==="mathpath")return validateMathPath(t);
 if(t.kind==="shop")return validateShop(t,THEMES[t.theme]??THEMES.clouds);
 if(t.kind==="puzzle")return validatePicturePuzzle(t,THEMES[t.theme]??THEMES.clouds);
 if(t.kind==="symmetry")return validateSymmetry(t,THEMES[t.theme]??THEMES.clouds);
 if(t.kind==="backpack")return validateBackpack(t,backpackTheme(t.theme));
 if(t.kind==="word"||t.kind==="syllables"){
  if(typeof t.answer!=="string"||!Array.isArray(t.tiles)||typeof t.icon!=="string")return false;
  const dictionary=WORD_BANK[t.theme]??[];
  const entry=dictionary.find(x=>x.word===t.answer&&x.icon===t.icon);
  if(!entry||t.tiles.join("")===t.answer||t.tiles.length!==(t.kind==="word"?t.answer.length:entry.syllables.length))return false;
  const original=t.kind==="word"?[...t.answer]:entry.syllables;
  const a=t.tiles.slice().sort(),b=original.slice().sort();
  return a.every((x,i)=>x===b[i])&&a.length===b.length&&(t.kind!=="syllables"||t.tiles.length>=2);
 }
 if(t.kind==="crossword")return validateCrossword(t);
 if(t.kind==="map"){
  if(!Number.isInteger(t.size)||![4,5].includes(t.size)||!Array.isArray(t.path)||!Array.isArray(t.icons)||t.icons.length!==t.size*t.size)return false;
  const traced=traceMap(t);
  if(!traced||traced.length<4||traced.join(",")!==t.path.join(","))return false;
  if(!Array.isArray(t.options)||t.options.length!==4||new Set(t.options).size!==4)return false;
  const icons=t.icons.filter(x=>x!==null);
  return t.icons[t.start]===null&&icons.length>=9&&new Set(icons).size===icons.length&&
   t.answer===t.icons[traced.at(-1)]&&t.options.filter(x=>x===t.answer).length===1&&t.options.every(x=>icons.includes(x));
 }
 if(t.kind==="cipher"){
  if(!Array.isArray(t.key)||!Array.isArray(t.encoded)||typeof t.answer!=="string"||!/^[А-ЯЁ]{4,10}$/.test(t.answer))return false;
  if(t.encoded.length!==t.answer.length||t.key.length<6||t.key.length>CIPHER_SYMBOLS.length)return false;
  const symbols=t.key.map(k=>k.symbol),letters=t.key.map(k=>k.letter);
  if(new Set(symbols).size!==symbols.length||new Set(letters).size!==letters.length||!symbols.every(s=>CIPHER_SYMBOLS.includes(s))||!letters.every(l=>CIPHER_ALPHABET.includes(l)))return false;
  const lookup=new Map(t.key.map(k=>[k.letter,k.symbol]));
  return t.key.length>new Set(t.answer).size&&[...t.answer].every((l,i)=>lookup.get(l)===t.encoded[i]);
 }
 if(t.kind==="number"){
  if(![t.hundreds,t.tens,t.ones,t.value].every(Number.isInteger))return false;
  if(t.hundreds<0||t.hundreds>3||t.tens<0||t.tens>9||t.ones<0||t.ones>9)return false;
  return t.value>=10&&t.value===t.hundreds*100+t.tens*10+t.ones&&t.answer===String(t.value);
 }
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
 if(t.kind==="story"){
  const known=STORY_BANK.find(x=>x.id===t.storyId);
  return !!known&&t.cards.length===4&&t.cards.map(c=>c.order).sort().join(",")==="0,1,2,3"&&
   t.cards.every(c=>known.steps[c.order]?.text===c.text&&known.steps[c.order]?.icon===c.icon)&&
   Array.isArray(t.answer)&&t.answer.join(",")==="0,1,2,3";
 }
 return false;
}
export function checkAnswer(t,value){
 if(t.kind==="tangram")return checkTangram(t,value);
 if(t.kind==="mathpath")return checkMathPath(t,value);
 if(t.kind==="shop")return checkShop(t,value);
 if(t.kind==="puzzle")return checkPicturePuzzle(t,value);
 if(t.kind==="symmetry")return checkSymmetry(t,value);
 if(t.kind==="backpack")return checkBackpack(t,value);
 if(t.kind==="word"||t.kind==="syllables"){
  if(!Array.isArray(value)||value.length!==t.tiles.length||new Set(value).size!==value.length)return false;
  return value.every(i=>Number.isInteger(i)&&i>=0&&i<t.tiles.length)&&value.map(i=>t.tiles[i]).join("")===t.answer;
 }
 if(t.kind==="crossword"){
  return Array.isArray(value)&&value.length===t.solution.length&&value.every((v,i)=>v===t.solution[i]);
 }
 if(t.kind==="map")return typeof value==="string"&&value===t.answer;
 if(t.kind==="cipher")return typeof value==="string"&&value===t.answer;
 if(t.kind==="number")return typeof value==="string"&&value===t.answer;
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
 if(t.kind==="tangram")return "Фигуры в порядке контуров: "+t.parts.map(p=>p.id).join(", ");
 if(t.kind==="mathpath")return "Числовая цепочка: "+t.start+" → "+t.steps.map(s=>s.result).join(" → ");
 if(t.kind==="shop")return "Купи: "+t.answer.map(i=>t.items[i].icon+" ("+t.items[i].price+" монет)").join(", ")+"; итого "+t.budget;
 if(t.kind==="puzzle")return "Порядок фрагментов: "+t.answer.map(x=>x+1).join(" → ");
 if(t.kind==="symmetry")return "Правильная половинка: "+(t.answer+1);
 if(t.kind==="backpack")return "Предметы: "+t.answer.map(i=>t.items[i].icon).join(" ")+"; суммарный вес: "+t.totalWeight+" жетонов";
 if(t.kind==="word"||t.kind==="syllables")return "Слово: "+t.answer;
 if(t.kind==="crossword")return t.entries.map(x=>x.number+". "+x.word).join("; ");
 if(t.kind==="map"){const last=t.path.at(-1);return "Маршрут: "+t.directions.join(" ")+"; финиш (столбец "+(last%t.size+1)+", строка "+(Math.floor(last/t.size)+1)+"): "+t.answer;}
 if(t.kind==="cipher")return "Слово: "+t.answer;
 if(t.kind==="number")return t.hundreds+"×100 + "+t.tens+"×10 + "+t.ones+" = "+t.value;
 if(t.kind==="memory")return "Исчез: "+t.answer+" (позиция "+(t.position+1)+")";
 if(t.kind==="table")return "Пара: "+t.rows[t.missing[0]]+" + "+t.columns[t.missing[1]];
 if(t.kind==="sudoku")return [0,1,2,3].map(row=>t.solution.slice(row*4,row*4+4).map(n=>t.symbols[n]).join(" ")).join(" / ");
 if(t.kind==="differences")return t.answer.map(i=>"строка "+(Math.floor(i/t.cols)+1)+", столбец "+(i%t.cols+1)).join("; ");
 if(t.kind==="maze")return "Возможных маршрутов: "+t.routeCount+". Пример: "+solveMaze(t).map(n=>"("+((n%t.size)+1)+","+Math.floor(n/t.size+1)+")").join(" → ");
 if(t.kind==="sort")return t.items.map(i=>i.icon+" — "+t.labels[i.group]).join("; ");
 if(t.kind==="story")return t.cards.slice().sort((a,b)=>a.order-b.order).map(e=>e.text).join(" → ");
 if(t.kind==="odd")return t.cells[t.answer]+" (позиция "+(t.answer+1)+")";
 if(t.kind==="shadow"||t.kind==="pair"||t.kind==="sequence")return t.answer;
 return String(t.answer);
}
// Ключ именно СОДЕРЖАНИЯ, без номера варианта и перестановки вариантов ответа.
// Нужен для контроля повторов в комплекте, а не для проверки решения.
export function contentKey(t){
 switch(t.kind){
  case "find":case "count":return t.target+"|"+t.answer;
  case "shadow":case "odd":return t.kind==="shadow"?t.target:t.cells[t.answer];
  case "pair":return t.target+"|"+t.answer;
  case "cipher":case "word":case "syllables":return t.answer;
  case "story":return t.cards.slice().sort((a,b)=>a.order-b.order).map(c=>c.text).join("|");
  case "tangram":return t.figure;
  case "number":return String(t.value);
  case "sequence":return t.shown.join("|");
  case "sort":return t.items.map(x=>x.icon+":"+x.group).sort().join("|");
  case "compare":return t.left+"|"+t.right+"|"+t.icon;
  case "crossword":return t.entries.map(x=>x.word+":"+x.orientation).sort().join("|");
  case "table":return t.rows.join("|")+"#"+t.columns.join("|")+"#"+t.missing.join("|");
  case "puzzle":return t.scene.symbols.join("|");
  case "memory":return t.base.join("|")+"#"+t.position;
  case "sudoku":return t.symbols.join("|")+"#"+t.grid.map(x=>x===null?"_":x).join("|");
  case "map":return t.start+"#"+t.directions.join("|")+"#"+t.icons.join("|");
  case "symmetry":return t.left.join("|");
  case "backpack":return t.items.map(x=>x.icon+":"+x.weight+":"+x.group+":"+x.stamp).sort().join("|")+"#"+t.totalWeight+"#"+t.fromFirst;
  case "shop":return t.items.map(x=>x.icon+":"+x.price).sort().join("|")+"#"+t.budget;
  case "mathpath":return t.start+"#"+t.steps.map(x=>x.op+x.amount).join("|");
  case "differences":return t.base.join("|")+"#"+t.changed.join("|");
  case "maze":return t.edges.map(x=>x.join(":")).join("|");
  default:return JSON.stringify(t);
 }
}
function finiteVariety(kind,theme,age){
 const t=THEMES[theme]??THEMES.clouds;
 if(kind==="shadow"||kind==="odd")return new Set([...t.a,...t.b]).size;
 if(kind==="pair")return PAIR_BANK.length;
 if(kind==="cipher")return (CIPHER_WORDS[theme]??CIPHER_WORDS.clouds).filter(x=>x.length<=(age<=5?6:age<=7?7:10)).length;
 if(kind==="story")return STORY_BANK.length;
 return null;
}
export function generateBundle({age="5-6",theme="clouds",count=7,seed=20261107,focus="mixed"}={}){
 count=Math.max(1,Math.min(20,Number(count)||7));
 const eligible=(ids)=>ids.filter(id=>CATALOG.find(c=>c.id===id).minAge<=resolveAge(age));
 const candidates=focus.startsWith("type:")?[focus.slice(5)]:focus==="logic"?["shadow","differences","memory","odd","sequence","sort","pair","table","sudoku","maze","map","compare","number","cipher","crossword","puzzle","symmetry","tangram","mathpath","shop"]:focus==="story"?["find","sort","sequence","maze","map","count","pair","story","cipher","word","syllables","crossword","puzzle","backpack","tangram","mathpath","shop"]:READY_IDS;
 const pool=eligible(candidates);
 if(pool.length===0)throw new Error("Эта механика пока не подходит выбранному возрасту.");
 const r=seeded(seed),tasks=[],cycles=new Map(),recentWords=[],figureRecent=[],contentSeen=new Map(),contentRecent=new Map();
 let figurePool=[];
 for(let i=0;i<count;i++){
  const kind=pool[i%pool.length],taskSeed=integer(r,2**30)+i;
  let selectedWord=null;
  if(kind==="word"||kind==="syllables"){
   let cycle=cycles.get(kind);
   if(!cycle?.length){
    const choices=wordChoices(kind,theme,resolveAge(age));
    if(choices.length===0)throw new Error("Словарь выбранной темы пуст.");
    cycle=shuffle(choices,r);
    cycles.set(kind,cycle);
   }
   // Сначала используем все допустимые слова, затем начинаем новый цикл.
   // Учитываем и соседние задания другого речевого типа.
   const index=cycle.findIndex(x=>!recentWords.includes(x.word));
   const item=cycle.splice(index>=0?index:0,1)[0];
   selectedWord=item.word;
   recentWords.push(selectedWord);
   if(recentWords.length>3)recentWords.shift();
  }
  let selectedFigure=null;
  if(kind==="tangram"){
   if(figurePool.length===0)figurePool=shuffle(FIGURE_IDS,r);
   const good=figurePool.findIndex(id=>!figureRecent.includes(id));
   selectedFigure=figurePool.splice(good>=0?good:0,1)[0];
   figureRecent.push(selectedFigure);
   if(figureRecent.length>3)figureRecent.shift();
  }
  let task=makeTask(kind,age,theme,taskSeed,selectedWord,selectedFigure);
  // Слова и фигуры уже расходуются отдельными циклами; остальным типам
  // подбираем новые СОДЕРЖАТЕЛЬНЫЕ задания, а не только другой seed.
  if(kind!=="word"&&kind!=="syllables"&&kind!=="tangram"){
   const cap=finiteVariety(kind,theme,resolveAge(age));
   let used=contentSeen.get(kind);
   if(!used){used=new Set();contentSeen.set(kind,used);}
   if(cap!==null&&used.size>=cap)used.clear();
   const recent=contentRecent.get(kind)||[];
   let attempts=0;
   while(attempts<250){
    const key=contentKey(task);
    if(!used.has(key)&&(cap===null||!recent.includes(key)))break;
    task=makeTask(kind,age,theme,integer(r,2**30)+i+attempts);
    attempts++;
   }
   let key=contentKey(task);
   if(used.has(key)||cap!==null&&recent.includes(key)){
    // Не выпускаем дубликат там, где уникальность математически достижима.
    // Для ограниченного словаря не прерываем комплект: по окончании цикла
    // приоритет имеет отсутствие недавнего повтора.
    if(cap===null)throw new Error("Не удалось сгенерировать 20 различных заданий типа "+kind);
    let best=task,bestScore=-1;
    for(let tries=0;tries<160;tries++){
     const candidate=makeTask(kind,age,theme,integer(r,2**30)+i+tries+251);
     const k=contentKey(candidate);
     const score=(used.has(k)?0:10)+(recent.includes(k)?0:5);
     if(score>bestScore){best=candidate;bestScore=score;}
     if(score===15)break;
    }
    task=best;key=contentKey(task);
   }
   used.add(key);
   const nextRecent=[...recent,key].slice(-3);
   contentRecent.set(kind,nextRecent);
  }
  tasks.push(task);
 }
 if(!tasks.every(validateTask))throw new Error("Автопроверка заданий не пройдена");
 return {schema:"chudolet.bundle.v1",title:"Приключение: "+(THEMES[theme]?.name||THEMES.clouds.name),age,theme,count,seed,focus,created:"",tasks};
}
