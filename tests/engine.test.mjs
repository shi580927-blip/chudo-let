import test from "node:test";
import assert from "node:assert/strict";
import {CATALOG,READY_IDS,THEMES,makeTask,validateTask,generateBundle,solveMaze,countMazeRoutes,neighbors,checkAnswer,countSudokuSolutions,validSudokuSolution,traceMap,validateCrossword,contentKey} from "../src/engine.mjs";
import {WORD_BANK} from "../src/words.mjs";
import {shopSolutions,tangramSvg,tangramPieceSvg,FIGURE_IDS} from "../src/next-mechanics.mjs";
import {backpackSolutions,mirrorRight} from "../src/spatial.mjs";
test("В каталоге ровно 30 различных заданий",()=>{assert.equal(CATALOG.length,30);assert.equal(new Set(CATALOG.map(x=>x.id)).size,30);assert.equal(READY_IDS.length,26);});
test("Генераторы всех тем и возрастов гарантированно корректны",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(const kind of READY_IDS)for(let seed=0;seed<30;seed++){
  const t=makeTask(kind,age,theme,seed);
  assert.equal(validateTask(t),true,JSON.stringify({kind,age,theme,seed}));
  if(kind==="maze")assert.equal(checkAnswer(t,solveMaze(t)),true);
  if(kind==="story")assert.equal(checkAnswer(t,[0,1,2,3]),true);
 }
});
test("Одинаковые параметры порождают одинаковые задания",()=>{
 const a=generateBundle({seed:42,count:20}),b=generateBundle({seed:42,count:20});
 assert.deepEqual(a,b);
});
test("В неготовую механику попасть нельзя",()=>assert.throws(()=>makeTask("detective"),/ещё не готов/));
test("Ошибочные ответы отбрасываются",()=>{
 const m=makeTask("maze","7-9","clouds",10);assert.equal(checkAnswer(m,[0,m.size*m.size-1]),false);
 const s=makeTask("sort","5-6","forest",15);assert.equal(checkAnswer(s,s.items.map(x=>1-x.group)),false);
});

test("Младшие дети: единственный маршрут",()=>{
 for(const age of ["3-4","5-6"])for(let seed=0;seed<100;seed++){
  const maze=makeTask("maze",age,"forest",seed);
  assert.equal(maze.routeCount,1);
  assert.equal(countMazeRoutes(maze),1);
 }
});
test("От 7 лет: два выхода со старта и ровно 2–3 разных пути",()=>{
 const found=new Set();
 for(const age of ["7-9","10-12"])for(let seed=0;seed<200;seed++){
  const maze=makeTask("maze",age,"forest",seed);
  assert.equal(neighbors(maze,0).length,2);
  assert.ok([2,3].includes(maze.routeCount));
  assert.equal(countMazeRoutes(maze),maze.routeCount);
  assert.equal(validateTask(maze),true);
  assert.equal(checkAnswer(maze,solveMaze(maze)),true);
  found.add(maze.routeCount);
 }
 assert.deepEqual([...found].sort(),[2,3]);
});
test("Некорректное количество маршрутов не проходит проверку",()=>{
 const maze=makeTask("maze","7-9","clouds",42);
 assert.equal(validateTask({...maze,routeCount:1}),false);
});

test("«Найди отличия»: точное количество замен, без ложных отличий и одинаковые основы",()=>{
 for(const theme of Object.keys(THEMES))
 for(const age of ["3-4","5-6","7-9","10-12"])
 for(let seed=0;seed<150;seed++){
  const t=makeTask("differences",age,theme,seed);
  assert.ok(validateTask(t),theme+" "+age+" "+seed);
  const actual=t.base.flatMap((x,i)=>t.changed[i]!==x?[i]:[]);
  assert.deepEqual(actual,t.answer);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.answer.slice(1)),false);
  assert.equal(checkAnswer(t,[...t.answer,t.answer[0]]),false);
  const tampered={...t,changed:[...t.changed]};
  tampered.changed[t.answer[0]]=tampered.base[t.answer[0]];
  assert.equal(validateTask(tampered),false);
 }
});
test("Комплект для самых маленьких не включает механики старших возрастов",()=>{
 const b=generateBundle({age:"3-4",count:20,focus:"mixed"});
 assert.ok(b.tasks.every(t=>CATALOG.find(c=>c.id===t.kind).minAge<=3));
});

test("Что изменилось: исчезает ровно один из уникальных предметов",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<45;seed++){
  const t=makeTask("memory",age,theme,seed);
  assert.equal(validateTask(t),true);assert.equal(t.changed.filter(x=>x===null).length,1);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.options.find(x=>x!==t.answer)),false);
  assert.equal(t.options.length,4);
  assert.notEqual(t.options[0],t.answer);
  assert.equal(t.options.filter(x=>x===t.answer).length,1);
  assert.ok(t.options.filter(x=>x!==t.answer).every(x=>!t.base.includes(x)));
  assert.equal(validateTask({...t,options:[t.answer,...t.options.filter(x=>x!==t.answer)]}),false);
 }
});
test("Таблица признаков: однозначная пара на пересечении",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["5-6","7-9","10-12"])for(let seed=0;seed<45;seed++){
  const t=makeTask("table",age,theme,seed);
  assert.equal(validateTask(t),true);
  assert.equal(t.options[t.answer][0],t.rows[t.missing[0]]);
  assert.equal(t.options[t.answer][1],t.columns[t.missing[1]]);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,(t.answer+1)%4),false);
 }
});
test("Мини-судоку: правила строк, столбцов и квадратов + единственность решения",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["5-6","7-9","10-12"])for(let seed=0;seed<55;seed++){
  const t=makeTask("sudoku",age,theme,seed);
  assert.ok(validSudokuSolution(t.solution));
  assert.equal(countSudokuSolutions(t.grid,2),1);
  assert.equal(validateTask(t),true);
  assert.equal(checkAnswer(t,t.solution),true);
  assert.equal(checkAnswer(t,t.grid),false);
  const broken=t.solution.slice();broken[0]=broken[1];
  assert.equal(checkAnswer(t,broken),false);
 }
});
test("Возрастная фильтрация не допускает неуместный одиночный режим",()=>{
 assert.throws(()=>generateBundle({age:"3-4",focus:"type:sudoku"}),/возрасту/);
 const b=generateBundle({age:"10-12",focus:"type:sudoku",count:8});
 assert.equal(b.tasks.length,8);assert.ok(b.tasks.every(t=>t.kind==="sudoku"));
});

test("Карта: 6 миров × 4 возраста × 80 вариантов; маршруты без прыжков и повторов",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<80;seed++){
  const t=makeTask("map",age,theme,seed);
  assert.equal(validateTask(t),true,theme+" "+age+" "+seed);
  const path=traceMap(t);
  assert.deepEqual(path,t.path);
  assert.equal(new Set(path).size,path.length);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.options.find(x=>x!==t.answer)),false);
  assert.equal(validateTask({...t,directions:[...t.directions,"↑","↓"]}),false);
 }
});
test("Шифр: полный уникальный ключ, перемешанные символы, нет раскрытого ответа",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<80;seed++){
  const t=makeTask("cipher",age,theme,seed);
  assert.equal(validateTask(t),true);
  const map=new Map(t.key.map(pair=>[pair.symbol,pair.letter]));
  assert.equal(t.encoded.map(sym=>map.get(sym)).join(""),t.answer);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.answer.slice(0,-1)),false);
  assert.equal(validateTask({...t,encoded:t.encoded.slice(1)}),false);
  assert.ok(t.key.length>new Set(t.answer).size);
 }
});
test("Число: сумма сотен, десятков и единиц совпадает с единственным ответом",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<80;seed++){
  const t=makeTask("number",age,theme,seed);
  assert.equal(validateTask(t),true);
  assert.equal(checkAnswer(t,String(t.hundreds*100+t.tens*10+t.ones)),true);
  assert.equal(checkAnswer(t,String(t.value+1)),false);
  assert.equal(validateTask({...t,value:t.value+1}),false);
 }
});
test("Отдельные режимы доступны только подходящим возрастным группам",()=>{
 assert.throws(()=>generateBundle({age:"3-4",focus:"type:map"}),/возрасту/);
 assert.throws(()=>generateBundle({age:"5-6",focus:"type:cipher"}),/возрасту/);
 for(const focus of ["type:map","type:cipher","type:number"]){
  const b=generateBundle({age:"7-9",focus,count:8,seed:102});
  assert.equal(b.tasks.length,8);assert.ok(b.tasks.every(validateTask));
 }
});

test("Шифр доступен с диапазона 7–9 лет, а не для группы 5–6",()=>{
 assert.throws(()=>generateBundle({age:"5-6",focus:"type:cipher"}),/возрасту/);
 assert.ok(generateBundle({age:"7-9",focus:"type:cipher",count:5}).tasks.every(t=>t.kind==="cipher"));
});

test("Слова: 6 миров × 4 возраста × 100 вариантов; перемешанные буквы, правильный ответ единственный",()=>{
 for(const theme of Object.keys(THEMES))
 for(const age of ["3-4","5-6","7-9","10-12"])
 for(let seed=0;seed<100;seed++){
  const t=makeTask("word",age,theme,seed);
  assert.equal(validateTask(t),true,JSON.stringify({theme,age,seed}));
  assert.notEqual(t.tiles.join(""),t.answer);
  assert.ok(WORD_BANK[theme].some(item=>item.word===t.answer&&item.icon===t.icon));
  const chosen=[];
  for(const letter of t.answer){const index=t.tiles.findIndex((tile,i)=>tile===letter&&!chosen.includes(i));assert.ok(index>=0);chosen.push(index);}
  assert.equal(checkAnswer(t,chosen),true);
  assert.equal(checkAnswer(t,chosen.slice(0,-1)),false);
  assert.equal(checkAnswer(t,[...chosen.slice(0,-1),chosen[0]]),false);
  assert.equal(validateTask({...t,tiles:[...t.answer]}),false);
 }
});
test("Слоги: только редакционно заданная разбивка, порядок перемешан, без неоднозначных карточек",()=>{
 for(const theme of Object.keys(THEMES))
 for(const age of ["3-4","5-6","7-9","10-12"])
 for(let seed=0;seed<100;seed++){
  const t=makeTask("syllables",age,theme,seed);
  assert.equal(validateTask(t),true);
  const entry=WORD_BANK[theme].find(x=>x.word===t.answer);
  assert.ok(entry&&entry.syllables.join("")===t.answer);
  assert.equal(new Set(t.tiles).size,t.tiles.length);
  assert.notEqual(t.tiles.join(""),t.answer);
  const chosen=entry.syllables.map(s=>t.tiles.indexOf(s));
  assert.equal(checkAnswer(t,chosen),true);
  assert.equal(checkAnswer(t,chosen.slice(1)),false);
  assert.equal(checkAnswer(t,[...chosen,chosen[0]]),false);
  assert.equal(validateTask({...t,tiles:t.tiles.slice(1)}),false);
 }
});
test("Кроссворд: три слова, два фактических пересечения и все пустые клетки",()=>{
 for(const theme of Object.keys(THEMES))
 for(const age of ["3-4","5-6","7-9","10-12"])
 for(let seed=0;seed<100;seed++){
  const t=makeTask("crossword",age,theme,seed);
  assert.ok(validateTask(t),JSON.stringify({theme,age,seed}));
  assert.equal(validateCrossword(t),true);
  assert.equal(t.entries.length,3);
  assert.equal(t.entries.filter(x=>x.orientation==="down").length,1);
  assert.equal(t.entries.filter(x=>x.orientation==="across").length,2);
  assert.ok(t.grid.some(x=>x===null));
  assert.ok(t.grid.some(x=>x===""));
  assert.equal(checkAnswer(t,t.solution),true);
  const wrong=t.solution.slice(),at=wrong.findIndex(x=>x!==null);
  wrong[at]="Ф";
  if(wrong[at]===t.solution[at])wrong[at]="А";
  assert.equal(checkAnswer(t,wrong),false);
  const bad=t.entries.map(e=>({...e}));
  bad[0].word="ЗЗЗЗЗЗ";
  assert.equal(validateCrossword({...t,entries:bad}),false);
 }
});
test("Возраст: слово и слоги от 5, кроссворд от 7",()=>{
 for(const kind of ["word","syllables","crossword"]){
  assert.throws(()=>generateBundle({age:"3-4",focus:"type:"+kind}),/возрасту/);
 }
 assert.throws(()=>generateBundle({age:"5-6",focus:"type:crossword"}),/возрасту/);
 for(const kind of ["word","syllables","crossword"]){
  const b=generateBundle({age:"7-9",focus:"type:"+kind,count:9,seed:19});
  assert.equal(b.tasks.length,9);
  assert.ok(b.tasks.every(t=>t.kind===kind&&validateTask(t)));
 }
});

test("Слоговый конструктор: 20 заданий не повторяют слова подряд, через 1 или 2",()=>{
 for(const theme of Object.keys(THEMES))
 for(const age of ["5-6","7-9","10-12"])
 for(let seed=0;seed<45;seed++){
  const b=generateBundle({age,theme,count:20,focus:"type:syllables",seed});
  const words=b.tasks.map(t=>t.answer);
  assert.ok(b.tasks.every(validateTask));
  for(let i=0;i<words.length;i++)for(let gap=1;gap<=3&&i+gap<words.length;gap++){
   assert.notEqual(words[i],words[i+gap],JSON.stringify({theme,age,seed,i,gap,words}));
  }
  assert.deepEqual(b,generateBundle({age,theme,count:20,focus:"type:syllables",seed}));
 }
});
test("Слоговый конструктор: до исчерпания словаря каждое слово новое",()=>{
 for(const theme of Object.keys(THEMES))
 for(const age of ["5-6","7-9","10-12"]){
  const b=generateBundle({age,theme,count:20,focus:"type:syllables",seed:20261107});
  const maxUnique=new Set(b.tasks.map(t=>t.answer)).size;
  assert.ok(maxUnique>=8,theme+" "+age);
  assert.equal(new Set(b.tasks.slice(0,maxUnique).map(t=>t.answer)).size,maxUnique,theme+" "+age);
 }
});
test("Речевые наборы не дублируют слова у соседних заданий",()=>{
 for(const theme of Object.keys(THEMES)){
  const b=generateBundle({age:"7-9",theme,count:20,focus:"story",seed:42});
  const words=b.tasks.filter(t=>t.kind==="word"||t.kind==="syllables").map(t=>t.answer);
  for(let i=1;i<words.length;i++)assert.notEqual(words[i],words[i-1],theme);
 }
});

test("Пазл: перемешаны все кусочки без потерь и ответ — точный порядок",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<65;seed++){
  const t=makeTask("puzzle",age,theme,seed);
  assert.equal(validateTask(t),true);
  assert.equal(new Set(t.pieces).size,t.size*t.size);
  assert.notDeepEqual(t.pieces,t.answer);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.pieces),false);
  assert.equal(checkAnswer(t,t.answer.slice(0,-1)),false);
 }
});
test("Зеркальная половинка: правильный вариант — точная горизонтальная симметрия",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<65;seed++){
  const t=makeTask("symmetry",age,theme,seed),mirror=mirrorRight(t.left,t.rows,t.halfCols);
  assert.equal(validateTask(t),true);
  assert.deepEqual(t.options[t.answer],mirror);
  assert.equal(t.options.filter(a=>JSON.stringify(a)===JSON.stringify(mirror)).length,1);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,(t.answer+1)%3),false);
 }
});
test("Волшебный рюкзак: единственное решение удовлетворяет ВСЕМ ограничениям",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<65;seed++){
  const t=makeTask("backpack",age,theme,seed),sols=backpackSolutions(t);
  assert.equal(validateTask(t),true);
  assert.equal(sols.length,1,JSON.stringify({theme,age,seed}));
  assert.deepEqual(sols[0],t.answer);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.answer.slice(0,-1)),false);
  assert.equal(checkAnswer(t,[...t.answer,t.answer[0]]),false);
  assert.equal(validateTask({...t,totalWeight:t.totalWeight+99}),false);
 }
});
test("Механики доступны лишь в подходящем возрастном диапазоне",()=>{
 assert.throws(()=>generateBundle({age:"3-4",focus:"type:symmetry"}),/возрасту/);
 assert.throws(()=>generateBundle({age:"3-4",focus:"type:backpack"}),/возрасту/);
 for(const kind of ["puzzle","symmetry","backpack"]){
  const age=kind==="puzzle"?"3-4":"5-6";
  const bundle=generateBundle({age,theme:"forest",focus:"type:"+kind,count:12,seed:210});
  assert.equal(bundle.tasks.length,12);
  assert.ok(bundle.tasks.every(t=>t.kind===kind&&validateTask(t)));
 }
});

test("Фигуры-конструкторы: все пять деталей, правильное размещение и отсутствие спойлеров",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<110;seed++){
  const t=makeTask("tangram",age,theme,seed);
  assert.equal(validateTask(t),true,theme+" "+age+" "+seed);
  assert.equal(t.parts.length,5);assert.equal(new Set(t.parts.map(x=>x.id)).size,5);
  assert.notDeepEqual(t.tray,t.answer);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.tray),false);
  assert.equal(checkAnswer(t,t.answer.slice(1)),false);
  const blank=tangramSvg(t,Array(5).fill(null));
  assert.ok(!blank.includes('stroke="#604a85"'));
  const duplicate=t.answer.slice();duplicate[1]=duplicate[0];
  assert.equal(checkAnswer(t,duplicate),false);
  assert.equal(validateTask({...t,tray:t.tray.slice(1)}),false);
 }
});
test("Математическая дорожка: одна точная арифметическая последовательность",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<110;seed++){
  const t=makeTask("mathpath",age,theme,seed);
  assert.equal(validateTask(t),true,theme+" "+age+" "+seed);
  let value=t.start;
  for(const step of t.steps){
   value=step.op==="+"?value+step.amount:step.op==="-"?value-step.amount:value*step.amount;
   assert.equal(value,step.result);
   assert.equal(step.options.filter(x=>x===step.result).length,1);
  }
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.answer.slice(0,-1)),false);
  const wrong=t.answer.slice();wrong[0]=(wrong[0]+1)%3;
  assert.equal(checkAnswer(t,wrong),false);
  const invalid=t.steps.map(x=>({...x}));invalid[0].result+=2;
  assert.equal(validateTask({...t,steps:invalid}),false);
 }
});
test("Магазин приключений: бюджет имеет ровно один набор покупок",()=>{
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<110;seed++){
  const t=makeTask("shop",age,theme,seed);
  assert.equal(validateTask(t),true,theme+" "+age+" "+seed);
  const solutions=shopSolutions(t);
  assert.equal(solutions.length,1);
  assert.deepEqual(solutions[0],t.answer);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.answer.slice(1)),false);
  assert.equal(checkAnswer(t,[...t.answer,t.answer[0]]),false);
  assert.equal(validateTask({...t,budget:150}),false);
 }
});
test("Отдельные новые задания фильтруются по возрасту",()=>{
 for(const kind of ["tangram","mathpath","shop"]){
  assert.throws(()=>generateBundle({age:"3-4",focus:"type:"+kind}),/возрасту/);
  const b=generateBundle({age:"5-6",theme:"clouds",count:12,focus:"type:"+kind,seed:733});
  assert.equal(b.tasks.length,12);
  assert.ok(b.tasks.every(t=>t.kind===kind&&validateTask(t)));
 }
});

test("Космический рюкзак: галактика/Млечный Путь — небесный объект, а не техника; звезда только признак",()=>{
 const sky=["☀️","🌙","🌎","☄️","🪐","🌌"];
 const equipment=["🚀","🛸","🛰️","🔭"];
 let sawGalaxy=false,sawPlanet=false;
 for(const age of ["5-6","7-9","10-12"])for(let seed=0;seed<350;seed++){
  const t=makeTask("backpack",age,"space",seed);
  assert.equal(validateTask(t),true);
  assert.deepEqual(t.labels,["Космическая техника","Небесные объекты"]);
  for(const item of t.items){
   assert.equal(["⭐","🌟"].includes(item.icon),false);
   assert.equal(item.group===0?equipment.includes(item.icon):sky.includes(item.icon),true);
   if(item.icon==="🌌"){sawGalaxy=true;assert.equal(item.group,1);}
   if(item.icon==="🪐"){sawPlanet=true;assert.equal(item.group,1);}
  }
  assert.equal(checkAnswer(t,t.answer),true);
 }
 assert.equal(sawGalaxy,true);
 assert.equal(sawPlanet,true);
});

test("Геометрический конструктор: двадцать разных силуэтов, уникальные контуры и номера внутри SVG",()=>{
 const figures=new Set();
 for(const theme of Object.keys(THEMES))for(const age of ["3-4","5-6","7-9","10-12"])for(let seed=0;seed<90;seed++){
  const task=makeTask("tangram",age,theme,seed);
  assert.equal(validateTask(task),true);
  assert.equal(new Set(task.parts.map(p=>p.shape)).size,5);
  assert.equal(checkAnswer(task,task.answer),true);
  figures.add(task.figure);
 }
 assert.equal(figures.size,20);
});
test("Конструктор: комплект из 20 заданий содержит 20 разных силуэтов без повторов",()=>{
 for(const age of ["5-6","7-9","10-12"])for(const theme of Object.keys(THEMES))for(let seed=0;seed<45;seed++){
  const b=generateBundle({age,theme,focus:"type:tangram",count:20,seed});
  const f=b.tasks.map(t=>t.figure);
  assert.equal(new Set(f).size,20);
  for(let i=0;i<f.length;i++)for(let gap=1;gap<=3&&i+gap<f.length;gap++)assert.notEqual(f[i],f[i+gap]);
  assert.ok(b.tasks.every(validateTask));
 }
});

test("Робот: голова, корпус, две руки и ноги, пять разных контуров, видимые номера и лицо",()=>{
 for(const age of ["5-6","7-9","10-12"])for(let seed=0;seed<30;seed++){
  const task=makeTask("tangram",age,"clouds",seed);
  if(task.figure!=="robot")continue;
  assert.deepEqual(task.parts.map(x=>x.id),["head","body","left-arm","right-arm","feet"]);
  assert.equal(new Set(task.parts.map(x=>x.shape)).size,5);
  assert.ok(task.parts.every(x=>x.shape.startsWith("robot-")));
  const unfilled=tangramSvg(task,Array(5).fill(null));
  const full=tangramSvg(task,task.answer);
  assert.match(unfilled,/class="robot-face"/);
  assert.match(unfilled,/class="robot-joints"/);
  assert.match(full,/class="tangram-slot-number"/);
  assert.equal((full.match(/class="tangram-slot-number"/g)||[]).length,5);
  assert.ok(full.indexOf('class="robot-face"')<full.indexOf('class="tangram-slot-number"'));
  assert.equal(validateTask(task),true);
  assert.equal(checkAnswer(task,task.answer),true);
 }
});

test("Дерево, цветок и аэростат: смысловые 5 частей, уникальные контуры, наглядные силуэты",()=>{
 const expectations={
  tree:["trunk","crown","branch","fruit","grass"],
  flower:["stem","pot","petals","center","leaf"],
  balloon:["rig","envelope","stripe","nozzle","basket"]
 };
 for(const figure of Object.keys(expectations))for(let seed=0;seed<140;seed++){
  const t=makeTask("tangram","5-6","clouds",seed,null,figure);
  assert.equal(t.figure,figure);
  assert.deepEqual(t.parts.map(p=>p.id),expectations[figure]);
  assert.equal(new Set(t.parts.map(p=>p.shape)).size,5);
  assert.ok(t.parts.every(p=>p.shape.startsWith(figure==="balloon"?"balloon-":figure+"-")));
  assert.equal(validateTask(t),true);
  assert.equal(checkAnswer(t,t.answer),true);
  const empty=tangramSvg(t,Array(5).fill(null));
  const full=tangramSvg(t,t.answer);
  assert.equal((empty.match(/class="tangram-slot-number"/g)||[]).length,5);
  assert.equal((full.match(/class="tangram-slot-number"/g)||[]).length,5);
  for(const piece of t.parts)assert.ok(full.includes(piece.color));
  assert.equal(checkAnswer(t,t.tray),false);
 }
});

test("Кораблик узнаваем: длинный корпус, мачта, парус, флаг и иллюминатор — пять разных форм",()=>{
 const expected=["mast","sail","flag","hull","porthole"];
 let count=0;
 for(const theme of Object.keys(THEMES))for(const age of ["5-6","7-9","10-12"])for(let seed=0;seed<70;seed++){
  const task=makeTask("tangram",age,theme,seed,null,"ship");
  assert.deepEqual(task.parts.map(p=>p.id),expected);
  assert.ok(task.parts.every(p=>p.shape.startsWith("ship-")));
  assert.equal(new Set(task.parts.map(p=>p.shape)).size,5);
  assert.equal(validateTask(task),true);
  assert.equal(checkAnswer(task,task.answer),true);
  assert.equal(checkAnswer(task,task.tray),false);
  const blank=tangramSvg(task,Array(5).fill(null));
  const solved=tangramSvg(task,task.answer);
  assert.match(blank,/class="ship-waves"/);
  assert.equal((blank.match(/class="tangram-slot-number"/g)||[]).length,5);
  assert.equal((solved.match(/class="tangram-slot-number"/g)||[]).length,5);
  assert.ok(blank.indexOf('class="ship-waves"')<blank.indexOf('class="tangram-slot-number"'));
  assert.equal(task.parts.find(p=>p.id==="flag").y,34);
  assert.equal(task.parts.find(p=>p.id==="sail").x,250);
  count++;
 }
 assert.equal(count,1260);
});

test("Библиотека фигур содержит ровно 20 уникальных названий и 5 разных деталей в каждой",()=>{
 assert.equal(FIGURE_IDS.length,20);
 assert.equal(new Set(FIGURE_IDS).size,20);
 const names=new Set();
 for(const figure of FIGURE_IDS){
  const t=makeTask("tangram","5-6","clouds",700,null,figure);
  assert.ok(t.figureName&&typeof t.figureName==="string");
  assert.equal(names.has(t.figureName),false,figure);
  names.add(t.figureName);
  assert.equal(t.parts.length,5,figure);
  assert.equal(new Set(t.parts.map(p=>p.shape)).size,5,figure);
  assert.equal(new Set(t.parts.map(p=>p.id)).size,5,figure);
  assert.equal(validateTask(t),true,figure);
  assert.equal(checkAnswer(t,t.answer),true,figure);
  assert.equal(checkAnswer(t,t.tray),false,figure);
  const empty=tangramSvg(t,Array(5).fill(null));
  const filled=tangramSvg(t,t.answer);
  assert.equal((empty.match(/class="tangram-slot-number"/g)||[]).length,5,figure);
  assert.equal((filled.match(/class="tangram-slot-number"/g)||[]).length,5,figure);
  assert.doesNotMatch(empty,/undefined/,figure);
  assert.doesNotMatch(filled,/undefined/,figure);
  for(const p of t.parts){
   const svg=tangramPieceSvg(p);
   assert.match(svg,/<svg[^>]+viewBox/,figure+" "+p.id);
   assert.doesNotMatch(svg,/undefined/,figure+" "+p.id);
  }
 }
});
test("20 разных фигур подряд воспроизводятся по seed во всех шести мирах",()=>{
 let verified=0;
 for(const age of ["5-6","7-9","10-12"])
 for(const theme of Object.keys(THEMES))
 for(let seed=0;seed<80;seed++){
  const options={age,theme,focus:"type:tangram",count:20,seed};
  const tasks=generateBundle(options).tasks;
  assert.equal(tasks.length,20);
  assert.deepEqual(new Set(tasks.map(t=>t.figure)),new Set(FIGURE_IDS));
  assert.ok(tasks.every(t=>t.parts.length===5&&validateTask(t)));
  assert.deepEqual(tasks.map(t=>t.figure),generateBundle(options).tasks.map(t=>t.figure));
  verified++;
 }
 assert.equal(verified,1440);
});


test("Аудит 20 заданий: 19 механик не повторяют содержательное условие",()=>{
 const limited=new Set(["shadow","odd","pair","word","syllables","story","cipher"]);
 const abundant=READY_IDS.filter(kind=>!limited.has(kind));
 assert.equal(abundant.length,19);
 for(const kind of abundant)for(const theme of Object.keys(THEMES))
 for(const age of ["5-6","7-9","10-12"])for(const seed of [11,42,20261107,90531]){
  if(CATALOG.find(x=>x.id===kind).minAge>Number(age.split("-")[0]))continue;
  const bundle=generateBundle({kind,theme,age,count:20,focus:"type:"+kind,seed});
  const keys=bundle.tasks.map(contentKey);
  assert.equal(bundle.tasks.length,20);
  assert.equal(new Set(keys).size,20,JSON.stringify({kind,theme,age,seed,keys}));
  assert.ok(bundle.tasks.every(validateTask));
  assert.deepEqual(bundle.tasks,generateBundle({kind,theme,age,count:20,focus:"type:"+kind,seed}).tasks);
 }
});

test("Ограниченные библиотеки: без ранних повторов и без повторов через 1-2 задания",()=>{
 const kinds=["shadow","odd","pair","cipher"];
 const limit=(kind,theme,age)=>{
  if(kind==="shadow"||kind==="odd")return new Set([...THEMES[theme].a,...THEMES[theme].b]).size;
  if(kind==="pair")return 8;
  const words={clouds:["ПОЧТА","ЗВЕЗДА","ОБЛАКО","КОМПАС","ПОСЫЛКА","СЕКРЕТ","СИГНАЛ"],
   forest:["ГРИБ","ЛИСА","ПОЛЯНА","РОДНИК","БЕРЁЗА","ТРОПИНКА","ЗАГАДКА"],
   ocean:["МОРЕ","ВОЛНА","ОСТРОВ","АКУЛА","РАКУШКА","ЖЕМЧУГ"],
   space:["РАКЕТА","КОСМОС","ОРБИТА","ЗВЕЗДА","ПЛАНЕТА","СПУТНИК"],
   pirate:["ПИРАТ","КАРТА","СУНДУК","КОМПАС","СОКРОВИЩЕ"],
   dino:["ЯЙЦО","ЛАПКА","ДОЛИНА","ХВОСТ","ДИНОЗАВР","ЯЩЕРИЦА"]};
  return words[theme].filter(w=>w.length<=(age==="7-9"?7:10)).length;
 };
 for(const kind of kinds)for(const theme of Object.keys(THEMES))
 for(const age of ["5-6","7-9","10-12"])for(const seed of [3,29,20261107]){
  if(CATALOG.find(x=>x.id===kind).minAge>Number(age.split("-")[0]))continue;
  const tasks=generateBundle({theme,age,count:20,focus:"type:"+kind,seed}).tasks;
  const keys=tasks.map(contentKey);
  const capacity=limit(kind,theme,age);
  assert.equal(new Set(keys.slice(0,capacity)).size,capacity,JSON.stringify({kind,theme,age,seed}));
  for(let i=0;i<keys.length;i++)for(let gap=1;gap<=3&&i+gap<keys.length;gap++)
   assert.notEqual(keys[i],keys[i+gap],JSON.stringify({kind,theme,age,seed,i,gap}));
 }
});

test("История по порядку: отмечаем ограничение 1 сюжета, варианты с перестановками не считаем новыми",()=>{
 for(const theme of Object.keys(THEMES)){
  const tasks=generateBundle({theme,age:"7-9",count:20,focus:"type:story",seed:20261107}).tasks;
  assert.equal(new Set(tasks.map(contentKey)).size,1);
 }
});


test("ART/GAME: собранные ракета, замок и улитка имеют пять уникальных взаимосвязанных деталей",()=>{
 const expectations={
  rocket:["body","nose","left-fin","right-fin","window"],
  castle:["wall","left-tower","right-tower","gate","flag"],
  snail:["body","head","shell","spiral","feelers"]
 };
 for(const figure of Object.keys(expectations))for(const age of ["5-6","7-9","10-12"])for(let seed=0;seed<80;seed++){
  const t=makeTask("tangram",age,"clouds",seed,null,figure);
  assert.deepEqual(t.parts.map(p=>p.id),expectations[figure]);
  assert.equal(new Set(t.parts.map(p=>p.shape)).size,5);
  assert.equal(validateTask(t),true);
  assert.equal(checkAnswer(t,t.answer),true);
  assert.equal(checkAnswer(t,t.tray),false);
  const empty=tangramSvg(t,Array(5).fill(null));
  const full=tangramSvg(t,t.answer);
  assert.equal((empty.match(/class="tangram-slot-number"/g)||[]).length,5);
  assert.equal((full.match(/class="tangram-slot-number"/g)||[]).length,5);
  assert.doesNotMatch(empty,/undefined|NaN/);
  for(const p of t.parts){
   assert.match(tangramPieceSvg(p),/<svg/);
   assert.match(full,new RegExp(p.color));
  }
  const f=empty.match(/viewBox="([^"]+)"/);
  assert.ok(f);
  assert.ok(Number(f[1].split(" ")[2])<330,"Кадрирование должно быть плотным и без обрезки контура");
 }
});
test("Ракета: два стабилизатора присоединены к корпусу; улитка без лишнего листа",()=>{
 const rocket=makeTask("tangram","5-6","clouds",1,null,"rocket");
 const p=Object.fromEntries(rocket.parts.map(x=>[x.id,x]));
 assert.ok(p["left-fin"].x+43>=p.body.x-40);
 assert.ok(p["right-fin"].x-43<=p.body.x+40);
 assert.ok(p.nose.y+35>=p.body.y-84);
 const snail=makeTask("tangram","5-6","clouds",1,null,"snail");
 const q=Object.fromEntries(snail.parts.map(x=>[x.id,x]));
 assert.equal(q.leaf,undefined);
 assert.ok(q.head.y+63>=q.body.y-28);
 assert.ok(q.shell.y+73>=q.body.y-28);
 assert.ok(q.feelers.y+52>=q.head.y-73);
});
