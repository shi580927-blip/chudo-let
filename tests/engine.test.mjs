import test from "node:test";
import assert from "node:assert/strict";
import {CATALOG,READY_IDS,THEMES,makeTask,validateTask,generateBundle,solveMaze,countMazeRoutes,neighbors,checkAnswer,countSudokuSolutions,validSudokuSolution,traceMap,validateCrossword} from "../src/engine.mjs";
import {WORD_BANK} from "../src/words.mjs";
import {backpackSolutions,mirrorRight} from "../src/spatial.mjs";
test("В каталоге ровно 30 различных заданий",()=>{assert.equal(CATALOG.length,30);assert.equal(new Set(CATALOG.map(x=>x.id)).size,30);assert.equal(READY_IDS.length,23);});
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
test("В неготовую механику попасть нельзя",()=>assert.throws(()=>makeTask("tangram"),/ещё не готов/));
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
