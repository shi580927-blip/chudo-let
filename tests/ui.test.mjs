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
const setup=(focus,age="5-6")=>{
 el("age").value=age;
 el("focus").value=focus;
 el("generatorForm").handlers.submit({preventDefault(){}});
 return generateBundle({age,theme:"clouds",count:7,seed:20261107,focus}).tasks[0];
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

test("Карта: правильный итог маршрута выбран из четырёх значков",()=>{
 const t=setup("type:map");
 assert.match(el("activity").innerHTML,/map-grid/);
 assert.match(el("activity").innerHTML,/map-directions/);
 click({action:"pick",value:t.answer});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Шифр: незавершённое слово просит дописать, полное проверяется",()=>{
 const t=setup("type:cipher","7-9");
 assert.match(el("activity").innerHTML,/cipher-key/);
 assert.doesNotMatch(el("activity").innerHTML,new RegExp(">"+t.answer+"<"));
 for(const letter of t.answer.slice(0,2))click({action:"cipherLetter",value:letter});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Сначала заполни все буквы или цифры/);
 for(const letter of t.answer.slice(2))click({action:"cipherLetter",value:letter});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Числовой конструктор: проверка неполного и правильного числа",()=>{
 const t=setup("type:number");
 assert.match(el("activity").innerHTML,/number-ten/);
 for(const digit of t.answer.slice(0,1))click({action:"numberDigit",value:digit});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Сначала заполни все буквы или цифры/);
 for(const digit of t.answer.slice(1))click({action:"numberDigit",value:digit});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});

test("Собери слово: вывод перемешанных карточек, сборка и проверка",()=>{
 const t=setup("type:word","7-9");
 assert.match(el("activity").innerHTML,/word-clue/);
 assert.match(el("activity").innerHTML,/word-tiles/);
 assert.doesNotMatch(el("activity").innerHTML,new RegExp(">"+t.answer+"<"));
 const chosen=[];
 for(const letter of t.answer){
  const i=t.tiles.findIndex((x,j)=>x===letter&&!chosen.includes(j));
  assert.ok(i>=0);chosen.push(i);
 }
 for(const i of chosen.slice(0,2))click({action:"tilePick",value:String(i)});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Сначала заполни все буквы или цифры/);
 for(const i of chosen.slice(2))click({action:"tilePick",value:String(i)});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Слоговый конструктор: слоги выбираются без повторов, слово собирается",()=>{
 const t=setup("type:syllables","7-9");
 const word=t.answer;
 const dictionary=[...t.tiles];
 assert.ok(dictionary.length>=3);
 const chosen=[];
 // Перебор коротких перестановок проверяет выбранное слово без доступа к скрытому ключу UI.
 const walk=(remaining,indices)=>{
  if(indices.length===dictionary.length)return indices.map(i=>dictionary[i]).join("")===word?indices:null;
  for(const i of remaining){
   const result=walk(remaining.filter(x=>x!==i),[...indices,i]);
   if(result)return result;
  }
  return null;
 };
 const answer=walk(dictionary.map((_,i)=>i),[]);
 assert.ok(answer);
 for(const i of answer)click({action:"tilePick",value:String(i)});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Кроссворд: ввод по клеткам, частичное поле и правильная проверка",()=>{
 const t=setup("type:crossword","7-9");
 assert.match(el("activity").innerHTML,/crossword-grid/);
 assert.match(el("activity").innerHTML,/crossword-clues/);
 const i=t.solution.findIndex(x=>x!==null);
 click({action:"crosswordCell",cell:String(i)});
 click({action:"crosswordLetter",value:t.solution[i]});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Заполни все белые клетки кроссворда/);
 for(let k=0;k<t.solution.length;k++)if(t.solution[k]!==null&&k!==i){
  click({action:"crosswordCell",cell:String(k)});
  click({action:"crosswordLetter",value:t.solution[k]});
 }
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});

test("Печать: заполненный в браузере кроссворд остаётся пустым в детской части А4",()=>{
 const t=setup("type:crossword","7-9");
 const first=t.solution.findIndex(x=>x!==null);
 click({action:"crosswordCell",cell:String(first)});
 click({action:"crosswordLetter",value:t.solution[first]});
 globalThis.requestAnimationFrame=callback=>callback();
 globalThis.window={print(){}};
 el("printBtn").handlers.click();
 const print=el("printRoot").innerHTML;
 const worksheet=print.split('<section class="answer-heading">')[0];
 assert.match(worksheet,/class="crossword-grid"/);
 assert.match(worksheet,/class="crossword-letter"><\/span>/);
 assert.doesNotMatch(worksheet,/<span class="crossword-letter">[А-ЯЁ]/);
 assert.match(print,/Ответы для взрослых/);
});
test("Печать: после сборки слова детские клеточки не содержат готовый ответ",()=>{
 const t=setup("type:word","7-9");
 const used=[];
 for(const letter of t.answer){
  const idx=t.tiles.findIndex((x,i)=>x===letter&&!used.includes(i));
  assert.ok(idx>=0);used.push(idx);
  click({action:"tilePick",value:String(idx)});
 }
 globalThis.requestAnimationFrame=callback=>callback();
 globalThis.window={print(){}};
 el("printBtn").handlers.click();
 const worksheet=el("printRoot").innerHTML.split('<section class="answer-heading">')[0];
 assert.match(worksheet,/class="word-slot">＿<\/span>/);
 assert.doesNotMatch(worksheet,new RegExp('class="word-slot">'+t.answer[0]));
});
