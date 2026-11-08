import test from "node:test";
import assert from "node:assert/strict";
import {generateBundle,READY_IDS,checkAnswer} from "../src/engine.mjs";

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
const setup=(focus,age="5-6",count=7)=>{
 el("age").value=age;
 el("count").value=String(count);
 el("focus").value=focus;
 el("generatorForm").handlers.submit({preventDefault(){}});
 return generateBundle({age,theme:"clouds",count,seed:20261107,focus}).tasks[0];
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
 assert.ok(dictionary.length>=2);
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

test("Пазл: помещаем каждый фрагмент, завершаем, затем печатаем пустое поле",()=>{
 const t=setup("type:puzzle","5-6");
 assert.match(el("activity").innerHTML,/picture-tray/);
 const n=t.size*t.size;
 for(let i=0;i<n;i++){
  click({action:"puzzleSlot",cell:String(i)});
  click({action:"puzzlePiece",piece:String(i)});
 }
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
 globalThis.requestAnimationFrame=cb=>cb();globalThis.window={print(){}};
 el("printBtn").handlers.click();
 const page=el("printRoot").innerHTML.split('<section class="answer-heading">')[0];
 assert.match(page,/picture-empty/);
});
test("Зеркальная половинка: выбор точного отражения проходит проверку",()=>{
 const t=setup("type:symmetry","5-6");
 assert.match(el("activity").innerHTML,/mirror-options/);
 click({action:"mirrorChoose",value:String(t.answer)});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Волшебный рюкзак: недостаточно предметов — не ошибка, полный ответ верный",()=>{
 const t=setup("type:backpack","7-9");
 assert.match(el("activity").innerHTML,/pack-grid/);
 click({action:"packToggle",value:String(t.answer[0])});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Закончите|Сначала|выбери|Выбери|необходимо|Добавь/);
 assert.doesNotMatch(el("activity").innerHTML,/Не совсем/);
 for(const idx of t.answer.slice(1))click({action:"packToggle",value:String(idx)});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});

test("Фигуры-конструкторы: разместить детали, проверить, распечатать пустую схему",()=>{
 const t=setup("type:tangram","5-6");
 assert.match(el("activity").innerHTML,/tangram-tray/);
 for(let i=0;i<t.parts.length;i++){
  click({action:"tangramSlot",cell:String(i)});
  click({action:"tangramPiece",piece:t.answer[i]});
 }
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
 globalThis.requestAnimationFrame=cb=>cb();globalThis.window={print(){}};
 el("printBtn").handlers.click();
 const page=el("printRoot").innerHTML.split('<section class="answer-heading">')[0];
 assert.match(page,/tangram-art/);
 assert.match(page,/tangram-tray/);
 assert.doesNotMatch(page,/<span class="tangram-mini">/);
});
test("Математическая дорожка: до конца не оценивается ошибкой",()=>{
 const t=setup("type:mathpath","7-9");
 assert.match(el("activity").innerHTML,/mathpath-steps/);
 click({action:"pathChoose",step:"0",choice:String(t.answer[0])});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Выбери число на каждом шаге/);
 assert.doesNotMatch(el("activity").innerHTML,/Не совсем/);
 for(let i=1;i<t.steps.length;i++)click({action:"pathChoose",step:String(i),choice:String(t.answer[i])});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Магазин: единственная покупка по сумме и чистая распечатка",()=>{
 const t=setup("type:shop","10-12");
 assert.match(el("activity").innerHTML,/shop-grid/);
 click({action:"shopToggle",value:String(t.answer[0])});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Сначала выбери ровно/);
 assert.doesNotMatch(el("activity").innerHTML,/Не совсем/);
 for(const i of t.answer.slice(1))click({action:"shopToggle",value:String(i)});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
 globalThis.requestAnimationFrame=cb=>cb();globalThis.window={print(){}};
 el("printBtn").handlers.click();
 const page=el("printRoot").innerHTML.split('<section class="answer-heading">')[0];
 assert.match(page,/shop-checkbox">□/);
 assert.doesNotMatch(page,/shop-item selected/);
});

test("20 историй и 20 смысловых пар не предупреждают о повторах",()=>{
 setup("type:story","7-9",20);
 assert.match(el("validationBadge").textContent,/все 20 задания разные/);
 setup("type:pair","7-9",20);
 assert.match(el("validationBadge").textContent,/все 20 задания разные/);
});
test("Полный набор числовых заданий не показывает предупреждение о повторах",()=>{
 setup("type:number","5-6",20);
 assert.match(el("validationBadge").textContent,/все 20 задания разные/);
 assert.doesNotMatch(el("validationBadge").textContent,/повторов/);
});

test("Закончи фразу: выбор одного ответа",()=>{
 const t=setup("type:phrase","5-6");
 assert.match(el("activity").innerHTML,/phrase-sentence/);
 click({action:"pick",value:t.answer});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Детектив: пересечение двух улик, нет раскрытого ответа",()=>{
 const t=setup("type:detective","7-9");
 assert.match(el("activity").innerHTML,/detective-clues/);
 assert.match(el("activity").innerHTML,/detective-suspect/);
 click({action:"pick",value:t.answer});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Приключение: неверная развилка не пропускает дальше, три правильные завершают путь",()=>{
 const t=setup("type:branching","7-9");
 assert.match(el("activity").innerHTML,/Этап 1 из 3/);
 click({action:"branchChoose",step:"0",choice:String(1-t.steps[0].correctIndex)});
 assert.match(el("activity").innerHTML,/Так история не продвинется/);
 assert.match(el("activity").innerHTML,/Этап 1 из 3/);
 for(let i=0;i<3;i++)click({action:"branchChoose",step:String(i),choice:String(t.steps[i].correctIndex)});
 assert.match(el("activity").innerHTML,/Путь пройден!/);
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Командная миссия: карточки закрыты, код из 3 цифр и неполный ответ",()=>{
 const t=setup("type:team","7-9");
 assert.match(el("activity").innerHTML,/Личная карточка участника закрыта/);
 click({action:"teamReveal",role:"0"});
 assert.match(el("activity").innerHTML,/Сосчитай значки/);
 click({action:"teamDigit",value:t.answer[0]});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Соберите все три цифры/);
 for(const d of t.answer.slice(1))click({action:"teamDigit",value:d});
 click({action:"check"});
 assert.match(el("activity").innerHTML,/Верно! Отличная работа/);
});
test("Новые игры имеют пригодные для А4 незаполненные карточки",()=>{
 setup("type:branching","7-9");
 globalThis.requestAnimationFrame=cb=>cb();globalThis.window={print(){}};
 el("printBtn").handlers.click();
 let page=el("printRoot").innerHTML.split('<section class="answer-heading">')[0];
 assert.match(page,/Этап 3 из 3/);
 assert.doesNotMatch(page,/branch-error/);
 setup("type:team","7-9");
 el("printBtn").handlers.click();
 page=el("printRoot").innerHTML.split('<section class="answer-heading">')[0];
 assert.match(page,/Личная карточка|Сосчитай значки/);
 assert.match(page,/Секретный код/);
});


test("Два игровых намёка: последовательное раскрытие и скрытие без ответа",()=>{
 const t=setup("type:word","7-9");
 assert.doesNotMatch(el("activity").innerHTML,/chudo-hint__step/);
 click({action:"hint"});
 let markup=el("activity").innerHTML;
 assert.match(markup,/СЕКРЕТНЫЙ СОВЕТ · 1 ИЗ 2/);
 assert.equal((markup.match(/class="chudo-hint__step/g)||[]).length,1);
 assert.match(markup,/aria-expanded="true"/);
 assert.match(markup,/Ещё один намёк/);
 click({action:"hint"});
 markup=el("activity").innerHTML;
 assert.match(markup,/СЕКРЕТНЫЙ СОВЕТ · 2 ИЗ 2/);
 assert.equal((markup.match(/class="chudo-hint__step/g)||[]).length,2);
 assert.match(markup,/Скрыть подсказки/);
 assert.doesNotMatch(markup,/chudo-result__seal/);
 click({action:"hint"});
 markup=el("activity").innerHTML;
 assert.doesNotMatch(markup,/id="gameHintCard"/);
 assert.match(markup,/aria-expanded="false"/);
 assert.doesNotMatch(markup,/Секретный совет/);
});

test("Все 30 видов показывают два отдельные невскрывающие ответ совета",()=>{
 for(const kind of READY_IDS){
  setup("type:"+kind,"10-12");
  click({action:"hint"});
  let markup=el("activity").innerHTML;
  assert.match(markup,/СЕКРЕТНЫЙ СОВЕТ · 1 ИЗ 2/,kind);
  click({action:"hint"});
  markup=el("activity").innerHTML;
  assert.match(markup,/СЕКРЕТНЫЙ СОВЕТ · 2 ИЗ 2/,kind);
  assert.doesNotMatch(markup,/Ответ пока секрет\..*?Ответ: /,kind);
  assert.doesNotMatch(markup,/chudo-result__seal/,kind);
 }
});

test("Верный ответ: тематическая награда и счётчик, затем рабочая кнопка дальше",()=>{
 const puzzle=setup("type:phrase","7-9",2);
 click({action:"pick",value:puzzle.answer});
 click({action:"check"});
 let markup=el("activity").innerHTML;
 assert.match(markup,/chudo-result--win/);
 assert.match(markup,/МАЛЕНЬКАЯ ПОБЕДА/);
 assert.match(markup,/Верно! Отличная работа/);
 assert.match(markup,/1 из 2/);
 assert.match(markup,/role="progressbar"/);
 assert.match(markup,/aria-valuenow="1"/);
 assert.match(markup,/data-action="noticeNext"/);
 click({action:"noticeNext"});
 markup=el("activity").innerHTML;
 assert.doesNotMatch(markup,/chudo-result--win/);
 assert.doesNotMatch(markup,/Верно! Отличная работа/);
 assert.equal(el("taskCounter").textContent,"Задание 2 из 2");
});

test("Последняя победа завершает комплект без бесполезной кнопки вперёд",()=>{
 const puzzle=setup("type:phrase","7-9",1);
 click({action:"pick",value:puzzle.answer});
 click({action:"check"});
 const markup=el("activity").innerHTML;
 assert.match(markup,/ВСЕ ИСПЫТАНИЯ ПРОЙДЕНЫ/);
 assert.match(markup,/Ура! Всё приключение пройдено!/);
 assert.match(markup,/aria-valuenow="1"/);
 assert.match(markup,/aria-valuemax="1"/);
 assert.doesNotMatch(markup,/data-action="noticeNext"/);
});

test("Неверный и неполный ответы: мягкое сообщение без награды и без утечки решения",()=>{
 const p=setup("type:phrase","5-6");
 click({action:"pick",value:p.options.find(x=>x!==p.answer)});
 click({action:"check"});
 let markup=el("activity").innerHTML;
 assert.match(markup,/chudo-result--retry/);
 assert.match(markup,/Не совсем. Можно попробовать ещё раз!/);
 assert.doesNotMatch(markup,/chudo-result__seal/);
 const sudoku=setup("type:sudoku","5-6");
 const index=sudoku.grid.findIndex(x=>x===null);
 click({action:"sudokuCell",cell:String(index)});
 click({action:"sudokuValue",value:String(sudoku.solution[index])});
 click({action:"check"});
 markup=el("activity").innerHTML;
 assert.match(markup,/chudo-result--unfinished/);
 assert.match(markup,/Закончите задание полностью для проверки/);
 assert.doesNotMatch(markup,/chudo-result__seal/);
});

test("Подсказки и поздравления не попадают в детские задания А4",()=>{
 const p=setup("type:phrase","7-9",1);
 click({action:"hint"});
 click({action:"hint"});
 globalThis.requestAnimationFrame=cb=>cb();globalThis.window={print(){}};
 el("printBtn").handlers.click();
 let page=el("printRoot").innerHTML.split('<section class="answer-heading">')[0];
 assert.doesNotMatch(page,/СЕКРЕТНЫЙ СОВЕТ|chudo-result--win|chudo-hint/);
 click({action:"pick",value:p.answer});
 click({action:"check"});
 el("printBtn").handlers.click();
 page=el("printRoot").innerHTML.split('<section class="answer-heading">')[0];
 assert.doesNotMatch(page,/МАЛЕНЬКАЯ ПОБЕДА|chudo-result__seal|Верно! Отличная работа/);
});
