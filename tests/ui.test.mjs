import test from "node:test";
import assert from "node:assert/strict";
import {generateBundle} from "../src/engine.mjs";

const nodes=new Map();
function el(id){
 if(!nodes.has(id))nodes.set(id,{
  value:({seed:"20261107",age:"5-6",theme:"clouds",focus:"mixed",count:"7",catalogFilter:"all"})[id]??"",
  innerHTML:"",textContent:"",disabled:false,handlers:{},
  addEventListener(type,fn){this.handlers[type]=fn;},
  classList:{toggle(){}}
 });
 return nodes.get(id);
}
globalThis.document={getElementById:el,querySelectorAll:()=>[]};
await import("../src/app.mjs");
const click=(dataset)=>el("activity").handlers.click({target:{closest:()=>({dataset})}});
const setup=(focus)=>{
 el("focus").value=focus;el("generatorForm").handlers.submit({preventDefault(){}});
 return generateBundle({age:"5-6",theme:"clouds",count:7,seed:20261107,focus}).tasks[0];
};
test("Незаконченное судоку просит заполнить клетки вместо сообщения об ошибке",()=>{
 const puzzle=setup("type:sudoku");
 const i=puzzle.grid.findIndex(x=>x===null);
 click({action:"sudokuCell",cell:String(i)});
 click({action:"sudokuValue",value:String(puzzle.solution[i])});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Закончите задание полностью для проверки/);
 assert.doesNotMatch(el("activity").innerHTML,/Не совсем/);
 for(let k=0;k<puzzle.grid.length;k++)if(puzzle.grid[k]===null&&k!==i){
  click({action:"sudokuCell",cell:String(k)});
  click({action:"sudokuValue",value:String(puzzle.solution[k])});
 }
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Задание на память использует новые отвлекающие варианты",()=>{
 const puzzle=setup("type:memory");
 assert.match(el("activity").innerHTML,/Я запомнил!/);
 click({action:"memoryReveal"});
 assert.match(el("activity").innerHTML,/Какой предмет пропал/);
 assert.notEqual(puzzle.options[0],puzzle.answer);
 assert.ok(puzzle.options.filter(x=>x!==puzzle.answer).every(x=>!puzzle.base.includes(x)));
 click({action:"pick",value:puzzle.answer});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
