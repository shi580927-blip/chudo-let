import {CATALOG,THEMES,generateBundle,checkAnswer,solutionText,neighbors,solveMaze} from "./engine.mjs";
import {renderSymbol} from "./artwork.mjs";
const $=id=>document.getElementById(id);
const state={bundle:generateBundle(),index:0,answer:null,checked:false,hint:false,done:new Set(),view:"builder"};
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
function reset(){state.answer=null;state.checked=false;state.hint=false;}
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
 if(t.kind==="differences"){
  const selected=Array.isArray(state.answer)?state.answer:[];
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
 switch(t.kind){case"differences":return"Сравни предметы в одинаковых клетках обеих картинок — начни с верхнего ряда.";case"find":case"count":return"Посмотри на каждую строчку слева направо и отмечай найденные значки.";case"odd":return"Пять картинок можно объединить в одну группу, а одну — нет.";case"shadow":return"Сравни общий контур, а не цвет.";case"sequence":return"Посмотри, через сколько шагов повторяется рисунок.";case"sort":return"Названия корзин помогут понять общее свойство.";case"pair":return"Подумай, что обычно используется вместе.";case"maze":return"Из каждой клетки можно перейти только туда, где нет стенки.";case"compare":return"Сосчитай предметы с каждой стороны.";case"story":return"Что произошло сначала, а что могло случиться только потом?";default:return"Посмотри внимательно на условие.";}
}
function renderNav(){
 $("taskNav").innerHTML=state.bundle.tasks.map((t,i)=>'<button class="task-pill'+(i===state.index?' active':'')+(state.done.has(i)?' done':'')+'" data-task="'+i+'" title="'+escapeHtml(t.title)+'" aria-label="Задание '+(i+1)+'">'+(i+1)+'</button>').join("");
}
function renderTask(){
 const t=task(),ready=state.answer!==null;
 let feedback=state.checked?'<div class="feedback '+(checkAnswer(t,state.answer)?'good':'')+'" role="status">'+(checkAnswer(t,state.answer)?"✓ Верно! Отличная работа.":"Не совсем. Можно попробовать ещё раз!")+'</div>':'';
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
  state.checked=true;if(checkAnswer(t,state.answer))state.done.add(state.index);
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
