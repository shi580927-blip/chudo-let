import test from "node:test";
import assert from "node:assert/strict";
import {CATALOG,READY_IDS,THEMES,makeTask,validateTask,generateBundle,solveMaze,countMazeRoutes,neighbors,checkAnswer} from "../src/engine.mjs";
test("В каталоге ровно 30 различных заданий",()=>{assert.equal(CATALOG.length,30);assert.equal(new Set(CATALOG.map(x=>x.id)).size,30);assert.equal(READY_IDS.length,11);});
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
test("В неготовую механику попасть нельзя",()=>assert.throws(()=>makeTask("sudoku"),/ещё не готов/));
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
