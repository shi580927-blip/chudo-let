import {CATALOG,THEMES,generateBundle,checkAnswer,solutionText,neighbors,solveMaze} from "./engine.mjs";
import {renderSymbol} from "./artwork.mjs";
const $=id=>document.getElementById(id);
const state={bundle:generateBundle(),index:0,answer:null,checked:false,hint:false,done:new Set(),view:"builder",phase:"observe",activeCell:null};
const escapeHtml=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const draw=(symbol,theme=state.bundle.theme)=>renderSymbol(symbol,theme);
/** Поднимаем искомый предмет до размера отдельной иллюстрации, включая телефон и печать. */
function targetBadge(target,label="Искомый предмет"){
 return '<span class="target-badge" role="img" aria-label="'+escapeHtml(label)+'">'+draw(target)+'</span>';
}
function promptHTML(t){
 let text=escapeHtml(t.prompt);
 if(["find","count","pair"].includes(t.kind)&&t.target){
  return text.replace(escapeHtml(t.target),targetBadge(t.target));
 }
 if(t.kind==="maze"){
  return text.replace("🐾",targetBadge("🐾","Старт")).replace("⭐",targetBadge("⭐","Финиш"));
 }
 return text;
}
function task(){return state.bundle.tasks[state.index];}
function reset(){state.answer=null;state.checked=false;state.hint=false;state.phase="observe";state.activeCell=null;}
function emojiGrid(arr,compact=false,theme=state.bundle.theme){
 return '<div class="emoji-grid'+(compact?' compact':'')+'">'+arr.map(x=>'<div class="emoji-tile">'+draw(x,theme)+'</div>').join("")+'</div>';
}
function pickButtons(options,print=false,theme=state.bundle.theme){
 return '<div class="choice-row">'+options.map(o=>'<button type="button" class="pick'+(!print&&state.answer!==null&&String(state.answer)===String(o)?' selected':'')+'"'+(print?' tabindex="-1"':' data-action="pick" data-value="'+escapeHtml(o)+'"')+'>'+draw(o,theme)+'</button>').join("")+'</div>';
}
function mazeSvg(t,print=false){
 const N=t.size,side=420,u=side/N,has=(a,b)=>t.edges.some(e=>(e[0]===a&&e[1]===b)||(e[1]===a&&e[0]===b));
 let walls='<rect x="1" y="1" width="'+side+'" height="'+side+'" rx="2" fill="#ffffffdd" stroke="#7357a8" stroke-width="6"/>';
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const i=y*N+x;
  if(x<N-1&&!has(i,i+1))walls+='<line x1="'+((x+1)*u)+'" x2="'+((x+1)*u)+'" y1="'+(y*u)+'" y2="'+((y+1)*u)+'" stroke="#7451ce" stroke-width="5" stroke-linecap="round"/>';
  if(y<N-1&&!has(i,i+N))walls+='<line y1="'+((y+1)*u)+'" y2="'+((y+1)*u)+'" x1="'+(x*u)+'" x2="'+((x+1)*u)+'" stroke="#7451ce" stroke-width="5" stroke-linecap="round"/>';
 }
 const coords=n=>[(n%N+.5)*u,(Math.floor(n/N)+.5)*u];
 const steps=print?[0]:Array.isArray(state.answer)?state.answer:[0];
 let trail='';
 if(steps.length>1)trail='<polyline fill="none" stroke="#e5ac44" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" points="'+steps.map(n=>coords(n).join(",")).join(" ")+'"/>';
 const last=coords(steps.at(-1)),finish=coords(N*N-1);
 let tiles='';
 if(!print)for(let y=0;y<N;y++)for(let x=0;x<N;x++)tiles+='<rect class="maze-cell" data-action="move" data-cell="'+(y*N+x)+'" x="'+(x*u+5)+'" y="'+(y*u+5)+'" width="'+(u-10)+'" height="'+(u-10)+'" fill="transparent"/>';
 return '<svg class="maze" viewBox="-6 -6 432 432" role="img" aria-label="Лабиринт от старта в верхнем левом углу до финиша в нижнем правом">'+walls+trail+'<circle cx="'+finish[0]+'" cy="'+finish[1]+'" r="'+(u*.23)+'" fill="#f2c55e"/><text x="'+finish[0]+'" y="'+(finish[1]+u*.12)+'" text-anchor="middle" font-size="'+(u*.4)+'">★</text><circle cx="'+last[0]+'" cy="'+last[1]+'" r="'+(u*.27)+'" fill="#ecf99f" stroke="#46405b" stroke-width="2"/><text x="'+last[0]+'" y="'+(last[1]+u*.13)+'" text-anchor="middle" font-size="'+(u*.48)+'">🐾</text>'+tiles+'</svg>';
}
function board(t,print=false){
 const pick=(opts)=>pickButtons(opts,print,t.theme);
 if(t.kind==="map"){
  const grid=t.icons.map((icon,i)=>'<div class="map-cell'+(i===t.start?' map-start':'')+'" aria-label="'+(i===t.start?'Начало маршрута':icon?'Место с предметом':'Пустой участок')+'">'+
   (i===t.start?'<span class="map-flag">🚩</span>':icon!==null?draw(icon,t.theme):'<span class="map-empty">·</span>')+'</div>').join("");
  const arrows=t.directions.map((arrow,i)=>'<span class="map-arrow" aria-label="Шаг '+(i+1)+'">'+arrow+'</span>').join("");
  return '<p class="game-label">Начало — 🚩. Пройди шаг за шагом, не пропуская стрелки.</p><div class="map-directions">'+arrows+'</div>'+
   '<div class="map-grid" style="--map-size:'+t.size+'">'+grid+'</div><p class="game-label">На каком предмете остановишься?</p>'+pick(t.options);
 }
 if(t.kind==="cipher"){
  const input=typeof state.answer==="string"?state.answer:"";
  const slots=Array.from({length:t.encoded.length},(_,i)=>'<span class="cipher-slot">'+escapeHtml(input[i]||"·")+'</span>').join("");
  const encoded=t.encoded.map(s=>'<span class="cipher-symbol">'+escapeHtml(s)+'</span>').join("");
  const key=t.key.map(k=>'<div class="cipher-key-item"><b>'+escapeHtml(k.symbol)+'</b><span>=</span><strong>'+escapeHtml(k.letter)+'</strong></div>').join("");
  const keys=print?'':'<div class="cipher-keyboard">'+t.key.map(k=>'<button type="button" class="cipher-letter" data-action="cipherLetter" data-value="'+escapeHtml(k.letter)+'">'+escapeHtml(k.letter)+'</button>').join("")+
   '<button type="button" class="ghost" data-action="textBack">⌫ Стереть</button><button type="button" class="ghost" data-action="textClear">Очистить</button></div>';
  return '<div class="cipher-code">'+encoded+'</div><p class="game-label">Ключ к секретному сообщению (порядок перепутан):</p><div class="cipher-key">'+key+'</div>'+
   '<p class="game-label">Твоё слово:</p><div class="cipher-slots">'+(print?Array.from({length:t.encoded.length},()=>'<span class="cipher-slot blank">_</span>').join(""):slots)+'</div>'+keys;
 }
 if(t.kind==="number"){
  const pieces=(count,kind)=>Array.from({length:count},()=>{
   if(kind==="hundreds")return '<span class="number-hundred" aria-label="Сто">100</span>';
   if(kind==="tens")return '<span class="number-ten" aria-label="Десяток">'+Array.from({length:10},()=>'<i></i>').join("")+'</span>';
   return '<span class="number-one" aria-label="Единица"></span>';
  }).join("");
  const item=(label,kind,n)=>'<div class="number-group"><div class="game-label">'+label+'</div><div class="number-pieces">'+(n===0?'<span class="number-none">Нет</span>':pieces(n,kind))+'</div></div>';
  const answer=typeof state.answer==="string"?state.answer:"";
  const slots=Array.from({length:String(t.value).length},(_,i)=>'<span class="number-slot">'+(print?'_':escapeHtml(answer[i]||"·"))+'</span>').join("");
  const keypad=print?'':'<div class="number-keypad">'+Array.from({length:10},(_,i)=>'<button type="button" class="number-key" data-action="numberDigit" data-value="'+i+'">'+i+'</button>').join("")+
   '<button type="button" class="ghost" data-action="textBack">⌫ Стереть</button><button type="button" class="ghost" data-action="textClear">Очистить</button></div>';
  return '<div class="number-groups">'+(t.hundreds?item("Сотни","hundreds",t.hundreds):"")+item("Десятки","tens",t.tens)+item("Единицы","ones",t.ones)+'</div>'+
   '<p class="game-label">Какое число получилось?</p><div class="number-slots">'+slots+'</div>'+keypad;
 }
 if(t.kind==="memory"){
  const observe=!print&&state.phase!=="answer";
  const cards=cells=>'<div class="memory-cards">'+cells.map(icon=>'<div class="memory-tile">'+(icon===null?'<span class="memory-empty">?</span>':draw(icon,t.theme))+'</div>').join("")+'</div>';
  if(print)return '<div class="memory-print"><div><p class="game-label">Было</p>'+cards(t.base)+'</div><div><p class="game-label">Стало</p>'+cards(t.changed)+'</div></div><p class="game-label">Напиши, что исчезло: _____________________</p>';
  if(observe)return '<div class="game-label">Рассмотри все предметы и постарайся запомнить</div>'+cards(t.base)+'<div class="game-actions"><button class="primary" data-action="memoryReveal">Я запомнил! Показать изменения →</button></div>';
  return '<div class="game-label">Какой предмет пропал?</div>'+cards(t.changed)+pick(t.options);
 }
 if(t.kind==="table"){
  const n=t.rows.length;
  const top='<div class="logic-table-row"><div class="logic-head corner">↘</div>'+t.columns.map(icon=>'<div class="logic-head">'+draw(icon,t.theme)+'</div>').join("")+'</div>';
  const rest=t.rows.map((r,ri)=>'<div class="logic-table-row"><div class="logic-head">'+draw(r,t.theme)+'</div>'+t.columns.map((c,ci)=>{
   const missing=ri===t.missing[0]&&ci===t.missing[1];
   return '<div class="logic-table-cell'+(missing?' missing':'')+'">'+(missing?'?':'<span>'+draw(r,t.theme)+'</span><span>'+draw(c,t.theme)+'</span>')+'</div>';
  }).join("")+'</div>').join("");
  const options='<div class="table-options">'+t.options.map((pair,i)=>'<button type="button" class="table-option'+(!print&&state.answer===i?' selected':'')+'"'+(print?' tabindex="-1"':' data-action="pickTable" data-value="'+i+'"')+'><span>'+draw(pair[0],t.theme)+'</span><b>+</b><span>'+draw(pair[1],t.theme)+'</span></button>').join("")+'</div>';
  return '<div class="logic-table" style="--logic-cols:'+(n+1)+'">'+top+rest+'</div><p class="game-label">Какая пара должна стоять вместо вопроса?</p>'+options;
 }
 if(t.kind==="sudoku"){
  const values=print?t.grid:Array.isArray(state.answer)?state.answer:t.grid;
  const selected=state.activeCell;
  const cells=t.grid.map((given,i)=>{
   const editable=given===null,tag=editable&&!print?"button":"div";
   const value=values[i],symbol=value===null?"":draw(t.symbols[value],t.theme);
   return '<'+tag+(tag==="button"?' type="button" data-action="sudokuCell" data-cell="'+i+'"':'')+' class="sudoku-cell'+(editable?' editable':'')+(selected===i&&!print?' active':'')+'"'+(tag==="button"?' aria-label="Клетка '+(Math.floor(i/4)+1)+'-'+(i%4+1)+'"':'')+'>'+symbol+'</'+tag+'>';
  }).join("");
  const palette=print?'':'<div class="sudoku-palette"><p>Сначала выбери пустую клетку, затем значок:</p><div class="choice-row">'+t.symbols.map((sym,i)=>'<button class="pick" type="button" data-action="sudokuValue" data-value="'+i+'"'+(selected===null?' disabled':'')+'>'+draw(sym,t.theme)+'</button>').join("")+'<button class="ghost" type="button" data-action="sudokuValue" data-value="-1"'+(selected===null?' disabled':'')+'>Стереть</button></div></div>';
  return '<div class="sudoku-grid">'+cells+'</div>'+palette;
 }
 if(t.kind==="differences"){
  const selected=print?[]:Array.isArray(state.answer)?state.answer:[];
  const panel=(cells,second)=>{
   const blocks=cells.map((icon,i)=>{
    const picked=second&&selected.includes(i),className="diff-cell"+(picked?" selected":"");
    const attrs=second&&!print?' data-action="difference" data-cell="'+i+'" aria-label="Позиция '+(i+1)+'"':'';
    const tag=second&&!print?"button":"div";
    return '<'+tag+(tag==="button"?' type="button"':'')+' class="'+className+'"'+attrs+'>'+draw(icon,t.theme)+'</'+tag+'>';
   }).join("");
   return '<div class="diff-panel"><div class="game-label">'+(second?"Картинка Б — ищи здесь":"Картинка А — образец")+'</div><div class="diff-grid" style="--diff-cols:'+t.cols+'">'+blocks+'</div></div>';
  };
  return '<div class="diff-pair">'+panel(t.base,false)+panel(t.changed,true)+'</div>'+
   (print?'<p class="game-label">Отметь отличающиеся предметы на картинке Б.</p>':
    '<p class="game-label">Отмечено '+selected.length+' из '+t.answer.length+'. Нажми повторно, чтобы отменить выбор.</p>');
 }
 if(t.kind==="find"||t.kind==="count")return '<div class="game-label">Ищи значок '+targetBadge(t.target)+' среди других</div>'+emojiGrid(t.cells, t.cells.length<=12,t.theme)+pick(t.options);
 if(t.kind==="shadow")return '<p class="game-label">Узнай предмет по силуэту</p><div class="question-mark" role="img" aria-label="Чёрный силуэт предмета"><span aria-hidden="true">'+draw(t.target,t.theme)+'</span></div>'+pick(t.options);
 if(t.kind==="odd")return '<div class="choice-row">'+t.cells.map((c,i)=>'<button type="button" class="pick '+(!print&&state.answer===i?'selected':'')+'"'+(print?'':' data-action="pick" data-value="'+i+'"')+'>'+draw(c,t.theme)+'</button>').join("")+'</div>';
 if(t.kind==="sequence")return '<div class="series">'+t.shown.map(x=>'<span>'+draw(x,t.theme)+'</span>').join("")+'<span>?</span></div>'+pick(t.options);
 if(t.kind==="sort"){
  if(print)return '<div class="game-label">'+t.labels.join('  /  ')+'</div>'+emojiGrid(t.items.map(x=>x.icon),true,t.theme)+'<p>Подпиши для каждого предмета правильную группу.</p>';
  const answered=state.answer||[],current=t.items[answered.length];
  if(!current)return '<div class="sort-cards"><div class="sort-icon">🎉</div><b>Все предметы распределены!</b><p>Нажми «Проверить».</p></div>';
  return '<div class="sort-cards"><p class="sort-progress">Предмет '+(answered.length+1)+' из '+t.items.length+'</p><div class="sort-icon">'+draw(current.icon,t.theme)+'</div><p>В какую корзину положить?</p></div><div class="choice-row"><button class="pick word-choice" data-action="sort" data-value="0">① '+t.labels[0]+'</button><button class="pick word-choice" data-action="sort" data-value="1">② '+t.labels[1]+'</button></div>';
 }
 if(t.kind==="pair")return '<p class="game-label">Подбери подходящую пару</p><div class="series"><span>'+draw(t.target,t.theme)+'</span><span>+</span><span>?</span></div>'+pick(t.options);
 if(t.kind==="maze"){
  const path=Array.isArray(state.answer)?state.answer:[0],at=path.at(-1),possible=neighbors(t,at),last=at===t.size*t.size-1;
  return (print?'':'<p class="game-label">В этом лабиринте '+t.routeCount+' маршрута. Выбирай любой!</p>')+mazeSvg(t,print)+(print?'':'<p class="game-label">'+(last?'Ты добрался до звезды!':'Нажимай на соседние клетки без стены между ними.')+'</p><div class="maze-actions">'+possible.map(n=>'<button class="ghost" data-action="move" data-cell="'+n+'">Перейти '+(n===at+1?"→":n===at-1?"←":n===at+t.size?"↓":"↑")+' · '+(n+1)+'</button>').join("")+'</div>');
 }
 if(t.kind==="compare")return '<div class="compare-board"><div class="compare-group">'+Array(t.left).fill(t.icon).map(x=>draw(x,t.theme)).join(' ')+'</div><span class="compare-sign">?</span><div class="compare-group">'+Array(t.right).fill(t.icon).map(x=>draw(x,t.theme)).join(' ')+'</div></div>'+pick(t.options);
 if(t.kind==="story")return '<div class="story-options">'+t.cards.map((c,i)=>{
 const chosen=!print&&Array.isArray(state.answer)?state.answer.indexOf(c.order):-1;
 return '<button type="button" class="story-option'+(chosen!==-1?' done':'')+'" '+(print?'':'data-action="story" data-order="'+c.order+'"')+'><span class="figure">'+draw(c.icon,t.theme)+'</span><small>'+escapeHtml(c.text)+'</small>'+(chosen!==-1?'<b>Шаг '+(chosen+1)+'</b>':'')+'</button>';}).join("")+'</div>'+(print?'':'<p class="story-choice">Выбрано: '+((state.answer||[]).length)+' из 4</p>');
 return "<p>Механика пока не поддерживается.</p>";
}
function hintFor(t){
 switch(t.kind){case"map":return"Найди флажок. Следуй стрелкам по порядку, каждую стрелку считай одним шагом.";case"cipher":return"Для каждого значка найди букву в ключе. Записывай буквы по очереди.";case"number":return"Большой квадрат — сто, полоска из десяти точек — десять, маленький круг — один.";case"memory":return"Запомни все значки и их места, затем нажми кнопку и найди исчезнувший.";case"table":return"Сравни нужную строку и столбец: на пересечении должны быть оба значка.";case"sudoku":return"В каждой строке, столбце и квадрате 2×2 значки не повторяются.";case"differences":return"Сравни предметы в одинаковых клетках обеих картинок — начни с верхнего ряда.";case"find":case"count":return"Посмотри на каждую строчку слева направо и отмечай найденные значки.";case"odd":return"Пять картинок можно объединить в одну группу, а одну — нет.";case"shadow":return"Сравни общий контур, а не цвет.";case"sequence":return"Посмотри, через сколько шагов повторяется рисунок.";case"sort":return"Названия корзин помогут понять общее свойство.";case"pair":return"Подумай, что обычно используется вместе.";case"maze":return"Из каждой клетки можно перейти только туда, где нет стенки.";case"compare":return"Сосчитай предметы с каждой стороны.";case"story":return"Что произошло сначала, а что могло случиться только потом?";default:return"Посмотри внимательно на условие.";}
}
function renderNav(){
 $("taskNav").innerHTML=state.bundle.tasks.map((t,i)=>'<button class="task-pill'+(i===state.index?' active':'')+(state.done.has(i)?' done':'')+'" data-task="'+i+'" title="'+escapeHtml(t.title)+'" aria-label="Задание '+(i+1)+'">'+(i+1)+'</button>').join("");
}
function renderTask(){
 const t=task(),ready=state.answer!==null;
 let feedback=state.checked==="incomplete"
  ?'<div class="feedback" role="status">'+(t.kind==="sudoku"?"Закончите задание полностью для проверки — заполните все пустые клетки.":"Сначала заполни все буквы или цифры, затем проверим ответ.")+'</div>'
  :state.checked?'<div class="feedback '+(checkAnswer(t,state.answer)?'good':'')+'" role="status">'+(checkAnswer(t,state.answer)?"✓ Верно! Отличная работа.":"Не совсем. Можно попробовать ещё раз!")+'</div>':'';
 $("activity").innerHTML='<div class="activity-intro"><div><span class="group">'+escapeHtml(CATALOG.find(c=>c.id===t.kind).group)+' · Задание '+(state.index+1)+'</span><h3>'+escapeHtml(t.title)+'</h3></div><span class="status ready">● Можно играть</span></div><p class="prompt">'+promptHTML(t)+'</p><div class="game-board">'+board(t)+'</div><div class="game-actions"><button class="primary" data-action="check" '+(!ready?'disabled':'')+'>✓ Проверить</button><button class="ghost" data-action="reset">↻ Сначала</button><button class="ghost" data-action="hint">? Подсказка</button></div>'+(state.hint?'<div class="answer-hint">'+escapeHtml(hintFor(t))+'</div>':'')+feedback;
 $("taskCounter").textContent="Задание "+(state.index+1)+" из "+state.bundle.tasks.length;
 $("prevBtn").disabled=state.index===0;$("nextBtn").disabled=state.index===state.bundle.tasks.length-1;
 renderNav();
}
function updateBundle(){
 $("bundleTitle").textContent=state.bundle.title;
 $("bundleDetails").textContent=state.bundle.age+" лет · "+state.bundle.count+" заданий · вариант "+state.bundle.seed;
 $("validationBadge").textContent="✓ Все задания прошли проверку";
 renderTask();
}
function navigate(index){state.index=Math.max(0,Math.min(state.bundle.tasks.length-1,index));reset();renderTask();}
function tryMove(cell){
 const t=task(),a=Array.isArray(state.answer)?state.answer:[0],last=a.at(-1);
 if(t.kind!=="maze"||!neighbors(t,last).includes(cell))return;
 state.answer=[...a,cell];state.checked=false;renderTask();
}
$("activity").addEventListener("click",event=>{
 const target=event.target.closest("[data-action]");if(!target)return;
 const action=target.dataset.action,t=task();
 if(action==="cipherLetter"&&t.kind==="cipher"){
  const current=typeof state.answer==="string"?state.answer:"";
  if(current.length<t.answer.length)state.answer=current+String(target.dataset.value);
  state.checked=false;
 }
 if(action==="numberDigit"&&t.kind==="number"){
  const current=typeof state.answer==="string"?state.answer:"",digit=String(target.dataset.value);
  if((current.length>0||digit!=="0")&&current.length<t.answer.length)state.answer=current+digit;
  state.checked=false;
 }
 if((action==="textBack"||action==="textClear")&&(t.kind==="cipher"||t.kind==="number")){
  const current=typeof state.answer==="string"?state.answer:"";
  state.answer=action==="textBack"?current.slice(0,-1):"";
  state.checked=false;
 }
 if(action==="memoryReveal"&&t.kind==="memory"){state.phase="answer";state.answer=null;state.checked=false;}
 if(action==="pickTable"&&t.kind==="table"){state.answer=Number(target.dataset.value);state.checked=false;}
 if(action==="sudokuCell"&&t.kind==="sudoku"){
  const n=Number(target.dataset.cell);
  if(t.grid[n]===null)state.activeCell=n;
 }
 if(action==="sudokuValue"&&t.kind==="sudoku"&&state.activeCell!==null){
  const n=Number(target.dataset.value);
  const values=Array.isArray(state.answer)?state.answer.slice():t.grid.slice();
  values[state.activeCell]=n===-1?null:n;
  state.answer=values;state.checked=false;
 }
 if(action==="difference"){
  const n=Number(target.dataset.cell),prev=Array.isArray(state.answer)?state.answer:[];
  state.answer=prev.includes(n)?prev.filter(x=>x!==n):[...prev,n];
  state.checked=false;
 }
 if(action==="pick"){state.answer=t.kind==="odd"?Number(target.dataset.value):target.dataset.value;state.checked=false;}
 if(action==="sort"){state.answer=[...(state.answer||[]),Number(target.dataset.value)];state.checked=false;}
 if(action==="story"){const next=Number(target.dataset.order);if(!(state.answer||[]).includes(next)){state.answer=[...(state.answer||[]),next];state.checked=false;}}
 if(action==="move"){tryMove(Number(target.dataset.cell));return;}
 if(action==="reset"){reset();renderTask();return;}
 if(action==="hint"){state.hint=!state.hint;}
 if(action==="check"){
  if(state.answer===null)return;
  if(t.kind==="sudoku"&&(!Array.isArray(state.answer)||state.answer.some(v=>v===null))){
   state.checked="incomplete";
  }else if((t.kind==="cipher"||t.kind==="number")&&String(state.answer).length<t.answer.length){
   state.checked="incomplete";
  }else{
   state.checked=true;
   if(checkAnswer(t,state.answer))state.done.add(state.index);
  }
 }
 renderTask();
});
$("taskNav").addEventListener("click",event=>{const b=event.target.closest("[data-task]");if(b)navigate(Number(b.dataset.task));});
$("prevBtn").addEventListener("click",()=>navigate(state.index-1));
$("nextBtn").addEventListener("click",()=>navigate(state.index+1));
$("count").addEventListener("input",()=>{$("countOutput").textContent=$("count").value;});
$("generatorForm").addEventListener("submit",event=>{
 event.preventDefault();
 const seed=Number($("seed").value);
 try{
  state.bundle=generateBundle({age:$("age").value,theme:$("theme").value,count:Number($("count").value),focus:$("focus").value,seed:Number.isFinite(seed)?seed:20261107});
  state.index=0;state.done.clear();reset();updateBundle();
 }catch(err){alert("Не удалось собрать комплект: "+err.message);}
});
function renderCatalog(){
 const group=$("catalogFilter").value,list=CATALOG.filter(c=>group==="all"||c.group===group);
 $("catalogCards").innerHTML=list.map(c=>'<article class="catalog-card"><span class="catalog-number">№ '+String(c.number).padStart(2,"0")+' · '+c.group+'</span><h3>'+c.name+'</h3><p class="muted">Рекомендуемый возраст: от '+c.minAge+' лет</p><span class="status '+(c.ready?'ready':'')+'">'+(c.ready?'✓ Генератор готов':'В плане разработки')+'</span></article>').join("");
}
$("catalogFilter").addEventListener("change",renderCatalog);
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{
 state.view=b.dataset.view;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("is-active",x===b));
 ["builder","catalog","about"].forEach(v=>$(v+"View").classList.toggle("hidden",v!==state.view));
}));
function printTask(t,i){
 return '<section class="print-task"><h2>'+(i+1)+'. '+escapeHtml(t.title)+'</h2><p>'+promptHTML(t)+'</p><div class="game-board print-board">'+board(t,true)+'</div><div class="print-note">Место для ответа: ______________________________</div></section>';
}
function makePrint(){
 const b=state.bundle;
 $("printRoot").innerHTML='<section class="print-cover"><div>✦ ЧУДОЛЁТ ✦</div><h1>'+escapeHtml(b.title)+'</h1><p>Задания для детей '+escapeHtml(b.age)+' лет</p><p>'+b.count+' заданий</p><p class="print-note">Вариант № '+b.seed+' · Для печати на А4</p></section>'+b.tasks.map(printTask).join("")+'<section class="answer-heading"><h2>Ответы для взрослых</h2><p class="print-note">Эту страницу можно не выдавать ребёнку.</p>'+b.tasks.map((t,i)=>'<div class="print-answer"><b>'+(i+1)+'. '+escapeHtml(t.title)+':</b> '+escapeHtml(solutionText(t))+'</div>').join("")+'</section>';
}
$("printBtn").addEventListener("click",()=>{makePrint();requestAnimationFrame(()=>window.print());});
$("downloadBtn").addEventListener("click",()=>{
 const blob=new Blob([JSON.stringify(state.bundle,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="chudolet-"+state.bundle.theme+"-"+state.bundle.seed+".json";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
renderCatalog();updateBundle();
