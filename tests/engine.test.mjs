import test from "node:test";
import assert from "node:assert/strict";
import {CATALOG,READY_IDS,THEMES,makeTask,validateTask,generateBundle,solveMaze,checkAnswer} from "../src/engine.mjs";
test("В каталоге ровно 30 различных заданий",()=>{assert.equal(CATALOG.length,30);assert.equal(new Set(CATALOG.map(x=>x.id)).size,30);assert.equal(READY_IDS.length,10);});
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
