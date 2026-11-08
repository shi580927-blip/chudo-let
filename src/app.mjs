import {CATALOG,THEMES,generateBundle,checkAnswer,solutionText,neighbors,solveMaze,contentKey} from "./engine.mjs";
import {renderSymbol} from "./artwork.mjs";
import {sceneSvg} from "./scene.mjs";
import {tangramSvg,tangramPieceSvg} from "./next-mechanics.mjs";
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
function reset(){state.answer=null;state.checked=false;state.hint=false;state.phase="observe";state.activeCell=null;state.branchMessage="";state.revealedRoles=new Set();}
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
 if(t.kind==="phrase"){
  const answers=t.options.map(word=>{
   const chosen=!print&&state.answer===word,tag=print?"span":"button";
   return '<'+tag+' class="final-option'+(chosen?' selected':'')+'"'+(print?'':' type="button" data-action="pick" data-value="'+escapeHtml(word)+'"')+'>'+escapeHtml(word)+'</'+tag+'>';
  }).join("");
  return '<section class="phrase-board"><p class="phrase-sentence">'+escapeHtml(t.sentence)+'</p><div class="final-choices">'+answers+'</div></section>';
 }
 if(t.kind==="detective"){
  const hints='<div class="detective-clues"><b>Улика 1: '+draw(t.clues[0],t.theme)+'</b><b>Улика 2: '+draw(t.clues[1],t.theme)+'</b></div>';
  const suspects=t.suspects.map(s=>{
   const chosen=!print&&state.answer===s.id,tag=print?"div":"button";
   return '<'+tag+' class="detective-suspect'+(chosen?' selected':'')+'"'+(print?'':' type="button" data-action="pick" data-value="'+s.id+'"')+'><span class="detective-avatar">'+draw(s.avatar,t.theme)+'</span><b>Подозреваемый '+escapeHtml(s.id)+'</b><span class="detective-traits">'+draw(s.itemA,t.theme)+' '+draw(s.itemB,t.theme)+'</span></'+tag+'>';
  }).join("");
  return '<section class="detective-board"><p>Найди персонажа, у которого есть оба предмета из улик.</p>'+hints+'<div class="detective-grid">'+suspects+'</div></section>';
 }
 if(t.kind==="branching"){
  const chosen=print?[]:Array.isArray(state.answer)?state.answer:[];
  const stage=chosen.length;
  const showStep=(step,i)=>{
   const opts=step.choices.map((x,j)=>{
    const tag=print?"span":"button";
    return '<'+tag+' class="branch-choice"'+(print?'':' type="button" data-action="branchChoose" data-step="'+i+'" data-choice="'+j+'"')+'>'+escapeHtml(x.text)+'</'+tag+'>';
   }).join("");
   return '<div class="branch-step"><span class="branch-stage">Этап '+(i+1)+' из 3</span><p>'+escapeHtml(step.scene)+'</p><div class="branch-choices">'+opts+'</div></div>';
  };
  if(print)return '<div class="branch-board"><p><b>Цель:</b> '+escapeHtml(t.goal)+'</p>'+t.steps.map(showStep).join("")+'</div>';
  if(stage>=3)return '<div class="branch-board"><p class="branch-finish">🎉 Путь пройден! '+escapeHtml(t.goal)+'</p><p>Нажми «Проверить», чтобы завершить приключение.</p></div>';
  return '<div class="branch-board"><p><b>Цель:</b> '+escapeHtml(t.goal)+'</p>'+showStep(t.steps[stage],stage)+(state.branchMessage?'<p class="branch-error" role="status">'+escapeHtml(state.branchMessage)+'</p>':'')+'</div>';
 }
 if(t.kind==="team"){
  const answer=print?"":typeof state.answer==="string"?state.answer:"";
  const revealed=state.revealedRoles??new Set();
  const roles=t.clues.map((clue,i)=>{
   const opened=print||revealed.has(i);
   return '<article class="team-role"><b>'+escapeHtml(clue.role)+'</b><span>'+draw(clue.icon,t.theme)+'</span>'+
     (opened?'<p>'+escapeHtml(clue.riddle)+'</p>':'<p>Личная карточка участника закрыта.</p>')+
     (print?'':('<button type="button" class="team-reveal" data-action="teamReveal" data-role="'+i+'">'+(opened?'Скрыть':'Открыть')+' карточку</button>'))+'</article>';
  }).join("");
  const digitButtons=print?'':('<div class="team-keypad">'+Array.from({length:9},(_,i)=>'<button type="button" data-action="teamDigit" data-value="'+(i+1)+'">'+(i+1)+'</button>').join("")+
   '<button type="button" class="team-erase" data-action="teamBack">⌫</button></div>');
  return '<section class="team-board"><p>Каждый участник узнаёт одну цифру. Назовите цифры по порядку ролей.</p><div class="team-cards">'+roles+'</div>'+
   '<p class="team-code">Секретный код: '+Array.from({length:3},(_,i)=>'<span>'+(answer[i]??'□')+'</span>').join("")+'</p>'+digitButtons+'</section>';
 }
 if(t.kind==="tangram"){
  const n=t.parts.length,placed=print?Array(n).fill(null):Array.isArray(state.answer)?state.answer:Array(n).fill(null);
  const slots=t.parts.map((part,i)=>{
   const selected=!print&&state.activeCell===i,assigned=placed[i];
   const tag=print?"div":"button";
   return '<'+tag+' class="tangram-slot'+(selected?' active':'')+(assigned!==null?' filled':'')+'"'+(print?'':' type="button" data-action="tangramSlot" data-cell="'+i+'"')+'>'+
    '<b>'+String(i+1)+'.</b><span>'+(assigned===null?"Место для фигуры":'<span class="tangram-mini">'+tangramPieceSvg(t.parts.find(x=>x.id===assigned))+'</span>')+'</span></'+tag+'>';
  }).join("");
  const tray=t.tray.map(id=>{
   const part=t.parts.find(p=>p.id===id),used=placed.includes(id),tag=print?"div":"button";
   return '<'+tag+' class="tangram-tray-item'+(used&&!print?' used':'')+'"'+(print?'':' type="button" data-action="tangramPiece" data-piece="'+escapeHtml(id)+'"'+(used?' disabled':''))+'>'+tangramPieceSvg(part)+'</'+tag+'>';
  }).join("");
  return '<p class="game-label">Фигура: '+escapeHtml(t.figureName)+'. Сначала выбери номер места, затем подходящую деталь.</p>'+
   '<div class="tangram-layout"><div class="tangram-stage">'+tangramSvg(t,placed)+'</div><div class="tangram-slots">'+slots+'</div></div>'+
   '<p class="game-label">Детали конструктора:</p><div class="tangram-tray">'+tray+'</div>'+
   (print?'<p class="game-label">Вырежи детали и разложи на схеме.</p>':'<p class="game-label">Нажми занятое место, чтобы вернуть деталь в набор.</p>');
 }
 if(t.kind==="mathpath"){
  const values=print?[]:Array.isArray(state.answer)?state.answer:[];
  const rows=t.steps.map((step,i)=>{
   const action=(step.op==="×"?"×":"")+step.amount;
   const options=step.options.map((v,j)=>{
    const chosen=values[i]===j;
    const tag=print?"span":"button";
    return '<'+tag+' class="mathpath-choice'+(chosen?' selected':'')+'"'+(print?'':' type="button" data-action="pathChoose" data-step="'+i+'" data-choice="'+j+'"')+'>'+v+'</'+tag+'>';
   }).join("");
   return '<div class="mathpath-step"><div class="mathpath-operation"><span class="mathpath-stepno">'+(i+1)+'</span><b>'+(step.op==="×"?"×":step.op)+' '+step.amount+'</b></div><div class="mathpath-options">'+options+'</div></div>';
  }).join("");
  return '<div class="mathpath-board"><div class="mathpath-start">Старт <b>'+t.start+'</b></div><div class="mathpath-steps">'+rows+'</div></div>'+
   '<p class="game-label">На каждом шаге выбери только одно число. Правильные результаты образуют дорожку.</p>';
 }
 if(t.kind==="shop"){
  const selected=print?[]:Array.isArray(state.answer)?state.answer:[];
  const items=t.items.map((item,i)=>{
   const tag=print?"div":"button",chosen=selected.includes(i);
   return '<'+tag+' class="shop-item'+(chosen?' selected':'')+'"'+(print?'':' type="button" data-action="shopToggle" data-value="'+i+'" aria-pressed="'+chosen+'"')+'>'+
    '<span class="shop-emoji">'+draw(item.icon,t.theme)+'</span><span class="shop-price">'+item.price+' 🪙</span>'+
    (print?'<span class="shop-checkbox">□</span>':'<span class="shop-checkbox">'+(chosen?'✓':'○')+'</span>')+'</'+tag+'>';
  }).join("");
  return '<div class="shop-budget"><span>Кошелёк</span><strong>'+t.budget+' 🪙</strong><small>Нужно купить ровно '+t.take+' '+(t.take===2?'предмета':'предмета')+' и потратить все монеты.</small></div>'+
   '<div class="shop-grid">'+items+'</div>'+
   (print?'<p class="game-label">Обведи '+t.take+' предмета так, чтобы сумма цен совпала с содержимым кошелька.</p>':
   '<p class="game-label">В корзине '+selected.length+' из '+t.take+' предметов. Нажми на товар ещё раз, чтобы убрать.</p>');
 }
 if(t.kind==="puzzle"){
  const count=t.size*t.size,placed=!print&&Array.isArray(state.answer)?state.answer:Array(count).fill(null);
  const boardCells=Array.from({length:count},(_,i)=>{
   const piece=placed[i],active=!print&&state.activeCell===i;
   const tag=print?"div":"button";
   return '<'+tag+' class="picture-slot'+(piece!==null?' filled':'')+(active?' active':'')+'"'+(print?'':' type="button" data-action="puzzleSlot" data-cell="'+i+'" aria-label="Позиция '+(i+1)+'"')+'>'+
    (piece===null?'<span class="picture-empty">+</span>':sceneSvg(t,piece))+'</'+tag+'>';
  }).join("");
  const tray=t.pieces.map(piece=>{
   const used=placed.includes(piece),tag=print?"div":"button";
   return '<'+tag+' class="picture-piece'+(used&&!print?' used':'')+'"'+(print?'':' type="button" data-action="puzzlePiece" data-piece="'+piece+'"'+(used?' disabled':''))+'>'+sceneSvg(t,piece)+'</'+tag+'>';
  }).join("");
  return '<div class="picture-layout"><div class="picture-reference"><p class="game-label">Образец картинки</p>'+sceneSvg(t)+'</div>'+
   '<div class="picture-work"><p class="game-label">Собираем картинку</p><div class="picture-board" style="--piece-cols:'+t.size+'">'+boardCells+'</div></div></div>'+
   '<p class="game-label">Перемешанные фрагменты</p><div class="picture-tray" style="--piece-cols:'+t.size+'">'+tray+'</div>'+
   (print?'<p class="game-label">Вырежи фрагменты и сложи картинку на пустом поле.</p>':'<p class="game-label">Выбери место в поле и нажми нужный фрагмент. Нажми занятое место, чтобы вернуть фрагмент.</p>');
 }
 if(t.kind==="symmetry"){
  const cells=(arr,blank=false)=>'<div class="mirror-half" style="--mirror-cols:'+t.halfCols+'">'+
   arr.map(x=>'<span class="mirror-cell">'+(blank?'<span class="mirror-question">?</span>':draw(x,t.theme))+'</span>').join("")+'</div>';
  const empty=Array(t.rows*t.halfCols).fill(null);
  const options=t.options.map((option,i)=>{
   const tag=print?"div":"button";
   return '<'+tag+' class="mirror-option'+(!print&&state.answer===i?' selected':'')+'"'+(print?'':' type="button" data-action="mirrorChoose" data-value="'+i+'"')+'><span class="mirror-option-label">Вариант '+(i+1)+'</span>'+cells(option)+'</'+tag+'>';
  }).join("");
  return '<p class="game-label">Слева — образец. Справа расположение предметов должно отражаться в зеркале.</p>'+
   '<div class="mirror-example">'+cells(t.left)+ '<div class="mirror-divider"></div>'+cells(empty,true)+'</div>'+
   '<p class="game-label">Какая половинка подходит?</p><div class="mirror-options">'+options+'</div>';
 }
 if(t.kind==="backpack"){
  const selected=!print&&Array.isArray(state.answer)?state.answer:[];
  const groupSecond=t.count-t.fromFirst;
  const clue='Возьми ровно '+t.count+' '+(t.count===2?'предмета':'предмета')+
   ': '+t.fromFirst+' из «'+escapeHtml(t.labels[0])+'», '+groupSecond+' из «'+escapeHtml(t.labels[1])+'». Общий вес — '+t.totalWeight+' жетонов.'+
   (t.stamps===null?'':' Среди выбранных предметов должна быть ровно одна золотая звезда ⭐.');
  const items=t.items.map((item,i)=>{
   const tag=print?"div":"button",marked=selected.includes(i);
   const weight=Array.from({length:item.weight},()=>'<span class="pack-pip"></span>').join("");
   return '<'+tag+' class="pack-item'+(marked&&!print?' selected':'')+'"'+(print?'':' type="button" data-action="packToggle" data-value="'+i+'" aria-pressed="'+marked+'"')+'>'+
    '<span class="pack-item-icon">'+draw(item.icon,t.theme)+'</span>'+
    (t.theme==="space"&&item.icon==="🌌"?'<span class="pack-item-name">Млечный Путь</span>':t.theme==="space"&&item.icon==="🪐"?'<span class="pack-item-name">Планета</span>':'')+
    '<span class="pack-item-label">'+escapeHtml(t.labels[item.group])+'</span>'+
    '<span class="pack-weight" aria-label="Вес '+item.weight+' жетонов">'+weight+'</span>'+
    (t.stamps===null?'':'<span class="pack-stamp">'+(item.stamp?'⭐':'')+'</span>')+
    (print?'<span class="pack-box">□</span>':'<span class="pack-mark">'+(marked?'✓':'')+'</span>')+'</'+tag+'>';
  }).join("");
  return '<p class="pack-conditions">'+clue+'</p><div class="pack-grid">'+items+'</div>'+
   (print?'<p class="game-label">Отметь выбранные предметы галочкой.</p>':'<p class="game-label">В рюкзаке '+selected.length+' из '+t.count+' предметов. Нажми ещё раз, чтобы убрать предмет.</p>');
 }
 if(t.kind==="word"||t.kind==="syllables"){
  const selected=!print&&Array.isArray(state.answer)?state.answer:[];
  const used=new Set(selected);
  const clue='<div class="word-clue" role="img" aria-label="Предмет для отгадывания">'+draw(t.icon,t.theme)+'</div>';
  const slots=Array.from({length:t.tiles.length},(_,i)=>'<span class="word-slot'+(t.kind==="syllables"?' syllable-slot':'')+'">'+(print?"＿":selected[i]===undefined?"·":escapeHtml(t.tiles[selected[i]]))+'</span>').join("");
  const tiles=t.tiles.map((token,i)=>{
   const attrs=print?'':' type="button" data-action="tilePick" data-value="'+i+'"'+(used.has(i)?' disabled':'');
   const tag=print?"span":"button";
   return '<'+tag+' class="word-tile'+(used.has(i)&&!print?' used':'')+'"'+attrs+'>'+escapeHtml(token)+'</'+tag+'>';
  }).join("");
  return clue+'<div class="word-slots">'+slots+'</div><p class="game-label">Буквы и слоги перемешаны. Выбирай по порядку:</p>'+
   '<div class="word-tiles">'+tiles+'</div>'+(print?'':'<div class="word-controls"><button type="button" class="ghost" data-action="tileBack">⌫ Убрать последний</button><button type="button" class="ghost" data-action="tileClear">Очистить</button></div>');
 }
 if(t.kind==="crossword"){
  const selected=!print&&Array.isArray(state.answer)?state.answer:t.grid;
  const heads=new Map();
  for(const item of t.entries){
   const pos=item.row*t.cols+item.col;
   heads.set(pos,[...(heads.get(pos)||[]),item.number]);
  }
  const cells=t.grid.map((slot,i)=>{
   if(slot===null)return '<div class="crossword-cell inactive" aria-hidden="true"></div>';
   const tag=print?"div":"button";
   const value=print?"":selected[i]||"";
   return '<'+tag+' class="crossword-cell'+(!print&&state.activeCell===i?' active':'')+'"'+(print?'':' type="button" data-action="crosswordCell" data-cell="'+i+'" aria-label="Клетка '+(Math.floor(i/t.cols)+1)+'-'+(i%t.cols+1)+'"')+'>'+
    (heads.has(i)?'<span class="crossword-number">'+heads.get(i).join("/")+'</span>':'')+
    '<span class="crossword-letter">'+escapeHtml(value)+'</span></'+tag+'>';
  }).join("");
  const clues=t.entries.map(entry=>'<div class="crossword-clue"><span class="crossword-clue-num">'+entry.number+'.</span>'+
   '<span class="crossword-clue-icon">'+draw(entry.icon,t.theme)+'</span>'+
   '<span class="crossword-dir">'+(entry.orientation==="down"?"↓ Сверху вниз":"→ Слева направо")+'</span><small>'+entry.word.length+' букв</small></div>').join("");
  const keyboard=print?'':'<div class="crossword-keyboard">'+[..."АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"].map(letter=>'<button type="button" class="crossword-key" data-action="crosswordLetter" data-value="'+letter+'"'+(state.activeCell===null?' disabled':'')+'>'+letter+'</button>').join("")+
   '<button class="ghost" type="button" data-action="crosswordErase"'+(state.activeCell===null?' disabled':'')+'>⌫ Стереть</button></div>';
  return '<div class="crossword-worksheet"><div class="crossword-grid" style="--cw-cols:'+t.cols+'">'+cells+'</div>'+
   '<div class="crossword-clues"><p class="game-label">Подсказки-картинки</p>'+clues+'</div></div>'+keyboard+
   (print?'':'<p class="game-label">Выбери пустую клетку, затем нажми букву.</p>');
 }
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
 switch(t.kind){case"phrase":return"Произнеси всё предложение. Какое слово подходит по смыслу?";case"detective":return"Каждая улика подходит двум героям. Найди того, кому подходят обе сразу.";case"branching":return"Подумай, какое действие поможет герою приблизиться к цели. Неверный выбор можно исправить.";case"team":return"Один участник считает предметы, второй складывает, третий вычитает. Поделитесь ответами.";case"tangram":return"Посмотри на контур каждой фигуры и выбери подходящую деталь из набора.";case"mathpath":return"Начни со стартового числа. Каждый раз выполни действие, а потом выбери результат.";case"shop":return"Сначала выбери указанное количество товаров. Сложи цены — сумма должна совпасть с кошельком.";case"puzzle":return"Внимательно посмотри на образец. Сначала найди верхний левый фрагмент.";case"symmetry":return"Первая клетка слева должна оказаться последней в правой половинке той же строки.";case"backpack":return"Сначала отбери нужные группы, затем сложи вес и проверь золотую звезду.";case"word":return"Посмотри на картинку, назови предмет и выбирай буквы по одной.";case"syllables":return"Произнеси название предмета по слогам. Сначала выбери первый слог.";case"crossword":return"Начни со слова, которое легко узнать по картинке. В месте пересечения буква одна и та же.";case"map":return"Найди флажок. Следуй стрелкам по порядку, каждую стрелку считай одним шагом.";case"cipher":return"Для каждого значка найди букву в ключе. Записывай буквы по очереди.";case"number":return"Большой квадрат — сто, полоска из десяти точек — десять, маленький круг — один.";case"memory":return"Запомни все значки и их места, затем нажми кнопку и найди исчезнувший.";case"table":return"Сравни нужную строку и столбец: на пересечении должны быть оба значка.";case"sudoku":return"В каждой строке, столбце и квадрате 2×2 значки не повторяются.";case"differences":return"Сравни предметы в одинаковых клетках обеих картинок — начни с верхнего ряда.";case"find":case"count":return"Посмотри на каждую строчку слева направо и отмечай найденные значки.";case"odd":return"Пять картинок можно объединить в одну группу, а одну — нет.";case"shadow":return"Сравни общий контур, а не цвет.";case"sequence":return"Посмотри, через сколько шагов повторяется рисунок.";case"sort":return"Названия корзин помогут понять общее свойство.";case"pair":return"Подумай, что обычно используется вместе.";case"maze":return"Из каждой клетки можно перейти только туда, где нет стенки.";case"compare":return"Сосчитай предметы с каждой стороны.";case"story":return"Что произошло сначала, а что могло случиться только потом?";default:return"Посмотри внимательно на условие.";}
}
function renderNav(){
 $("taskNav").innerHTML=state.bundle.tasks.map((t,i)=>'<button class="task-pill'+(i===state.index?' active':'')+(state.done.has(i)?' done':'')+'" data-task="'+i+'" title="'+escapeHtml(t.title)+'" aria-label="Задание '+(i+1)+'">'+(i+1)+'</button>').join("");
}
function renderTask(){
 const t=task(),ready=state.answer!==null;
 let feedback=state.checked==="incomplete"
  ?'<div class="feedback" role="status">'+(t.kind==="tangram"?"Сначала расставь все геометрические детали.":t.kind==="mathpath"?"Выбери число на каждом шаге дорожки.":t.kind==="shop"?"Сначала выбери ровно "+t.take+" предмета.":t.kind==="puzzle"?"Сначала собери картинку полностью — расставь все фрагменты.":t.kind==="backpack"?"Сначала выбери ровно "+t.count+" предмета для рюкзака.":t.kind==="sudoku"?"Закончите задание полностью для проверки — заполните все пустые клетки.":t.kind==="crossword"?"Заполни все белые клетки кроссворда, затем проверь ответ.":t.kind==="branching"?"Пройди все три развилки, затем проверь результат.":t.kind==="team"?"Соберите все три цифры командного кода, затем проверьте ответ.":"Сначала заполни все буквы или цифры, затем проверим ответ.")+'</div>'
  :state.checked?'<div class="feedback '+(checkAnswer(t,state.answer)?'good':'')+'" role="status">'+(checkAnswer(t,state.answer)?"✓ Верно! Отличная работа.":"Не совсем. Можно попробовать ещё раз!")+'</div>':'';
 $("activity").innerHTML='<div class="activity-intro"><div><span class="group">'+escapeHtml(CATALOG.find(c=>c.id===t.kind).group)+' · Задание '+(state.index+1)+'</span><h3>'+escapeHtml(t.title)+'</h3></div><span class="status ready">● Можно играть</span></div><p class="prompt">'+promptHTML(t)+'</p><div class="game-board">'+board(t)+'</div><div class="game-actions"><button class="primary" data-action="check" '+(!ready?'disabled':'')+'>✓ Проверить</button><button class="ghost" data-action="reset">↻ Сначала</button><button class="ghost" data-action="hint">? Подсказка</button></div>'+(state.hint?'<div class="answer-hint">'+escapeHtml(hintFor(t))+'</div>':'')+feedback;
 $("taskCounter").textContent="Задание "+(state.index+1)+" из "+state.bundle.tasks.length;
 $("prevBtn").disabled=state.index===0;$("nextBtn").disabled=state.index===state.bundle.tasks.length-1;
 renderNav();
}
function updateBundle(){
 $("bundleTitle").textContent=state.bundle.title;
 $("bundleDetails").textContent=state.bundle.age+" лет · "+state.bundle.count+" заданий · вариант "+state.bundle.seed;
 // Педагогически важна уникальность СМЫСЛА, а не номер seed или порядок карточек.
 const keys=state.bundle.tasks.map(t=>t.kind+"|"+contentKey(t));
 const unique=new Set(keys).size,repeat=keys.length-unique;
 const badge=$("validationBadge");
 badge.textContent=repeat
  ?"⚠ "+unique+" разных из "+keys.length+" · "+repeat+" повторов"
  :"✓ Проверена логика · все "+keys.length+" задания разные";
 badge.classList.toggle("has-repeats",repeat>0);
 badge.title=repeat?"Содержание некоторых заданий повторяется. Для полноценного комплекта нужно расширить словари и сюжеты.":"Сравниваются условия и правильные ответы, а не перестановка карточек.";
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
 if(action==="branchChoose"&&t.kind==="branching"){
  const idx=Number(target.dataset.step),choice=Number(target.dataset.choice);
  const prev=Array.isArray(state.answer)?state.answer:[];
  if(idx===prev.length&&idx<t.steps.length&&[0,1].includes(choice)){
   if(choice===t.steps[idx].correctIndex){state.answer=[...prev,choice];state.branchMessage="";}
   else {state.answer=prev.length?prev:null;state.branchMessage=t.steps[idx].badEffect;}
   state.checked=false;
  }
 }
 if(action==="teamReveal"&&t.kind==="team"){
  const i=Number(target.dataset.role),open=state.revealedRoles??new Set();
  if(Number.isInteger(i)&&i>=0&&i<t.clues.length){
   if(open.has(i))open.delete(i);else open.add(i);
   state.revealedRoles=open;
  }
 }
 if(action==="teamDigit"&&t.kind==="team"){
  const digit=String(target.dataset.value),value=typeof state.answer==="string"?state.answer:"";
  if(/^[1-9]$/.test(digit)&&value.length<3){state.answer=value+digit;state.checked=false;}
 }
 if(action==="teamBack"&&t.kind==="team"){
  state.answer=(typeof state.answer==="string"?state.answer:"").slice(0,-1);state.checked=false;
 }
 if(action==="tangramSlot"&&t.kind==="tangram"){
  const i=Number(target.dataset.cell);
  if(Number.isInteger(i)&&i>=0&&i<t.parts.length){
   const slots=Array.isArray(state.answer)?state.answer.slice():Array(t.parts.length).fill(null);
   if(slots[i]!==null){slots[i]=null;state.answer=slots;state.checked=false;}
   state.activeCell=i;
  }
 }
 if(action==="tangramPiece"&&t.kind==="tangram"){
  const id=String(target.dataset.piece),slots=Array.isArray(state.answer)?state.answer.slice():Array(t.parts.length).fill(null);
  if(t.tray.includes(id)&&!slots.includes(id)){
   const index=state.activeCell!==null&&slots[state.activeCell]===null?state.activeCell:slots.indexOf(null);
   if(index>=0){
    slots[index]=id;state.answer=slots;state.checked=false;
    state.activeCell=slots.indexOf(null);if(state.activeCell<0)state.activeCell=null;
   }
  }
 }
 if(action==="pathChoose"&&t.kind==="mathpath"){
  const i=Number(target.dataset.step),choice=Number(target.dataset.choice);
  if(Number.isInteger(i)&&i>=0&&i<t.steps.length&&[0,1,2].includes(choice)){
   const values=Array.isArray(state.answer)?state.answer.slice():Array(t.steps.length).fill(null);
   values[i]=choice;state.answer=values;state.checked=false;
  }
 }
 if(action==="shopToggle"&&t.kind==="shop"){
  const i=Number(target.dataset.value),prev=Array.isArray(state.answer)?state.answer:[];
  if(Number.isInteger(i)&&i>=0&&i<t.items.length){
   if(prev.includes(i))state.answer=prev.filter(x=>x!==i);
   else if(prev.length<t.take)state.answer=[...prev,i];
   state.checked=false;
  }
 }
 if(action==="puzzleSlot"&&t.kind==="puzzle"){
  const idx=Number(target.dataset.cell);
  if(Number.isInteger(idx)&&idx>=0&&idx<t.size*t.size){
   const placed=Array.isArray(state.answer)?state.answer.slice():Array(t.size*t.size).fill(null);
   if(placed[idx]!==null){placed[idx]=null;state.answer=placed;state.checked=false;}
   state.activeCell=idx;
  }
 }
 if(action==="puzzlePiece"&&t.kind==="puzzle"){
  const piece=Number(target.dataset.piece);
  const placed=Array.isArray(state.answer)?state.answer.slice():Array(t.size*t.size).fill(null);
  if(t.pieces.includes(piece)&&!placed.includes(piece)){
   const targetCell=state.activeCell!==null&&placed[state.activeCell]===null?state.activeCell:placed.indexOf(null);
   if(targetCell>=0){
    placed[targetCell]=piece;
    state.answer=placed;state.checked=false;
    state.activeCell=placed.indexOf(null);
    if(state.activeCell<0)state.activeCell=null;
   }
  }
 }
 if(action==="mirrorChoose"&&t.kind==="symmetry"){
  const idx=Number(target.dataset.value);
  if(Number.isInteger(idx)&&idx>=0&&idx<t.options.length){state.answer=idx;state.checked=false;}
 }
 if(action==="packToggle"&&t.kind==="backpack"){
  const idx=Number(target.dataset.value),chosen=Array.isArray(state.answer)?state.answer:[];
  if(Number.isInteger(idx)&&idx>=0&&idx<t.items.length){
   if(chosen.includes(idx))state.answer=chosen.filter(i=>i!==idx);
   else if(chosen.length<t.count)state.answer=[...chosen,idx];
   state.checked=false;
  }
 }
 if(action==="tilePick"&&(t.kind==="word"||t.kind==="syllables")){
  const idx=Number(target.dataset.value),prev=Array.isArray(state.answer)?state.answer:[];
  if(Number.isInteger(idx)&&idx>=0&&idx<t.tiles.length&&!prev.includes(idx)&&prev.length<t.tiles.length){
   state.answer=[...prev,idx];state.checked=false;
  }
 }
 if((action==="tileBack"||action==="tileClear")&&(t.kind==="word"||t.kind==="syllables")){
  const prev=Array.isArray(state.answer)?state.answer:[];
  state.answer=action==="tileBack"?prev.slice(0,-1):[];
  state.checked=false;
 }
 if(action==="crosswordCell"&&t.kind==="crossword"){
  const idx=Number(target.dataset.cell);
  if(Number.isInteger(idx)&&idx>=0&&idx<t.grid.length&&t.grid[idx]!==null)state.activeCell=idx;
 }
 if((action==="crosswordLetter"||action==="crosswordErase")&&t.kind==="crossword"&&state.activeCell!==null){
  const chars=Array.isArray(state.answer)?state.answer.slice():t.grid.slice();
  chars[state.activeCell]=action==="crosswordErase"?"":String(target.dataset.value);
  state.answer=chars;state.checked=false;
 }
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
  if(t.kind==="branching"&&(!Array.isArray(state.answer)||state.answer.length!==3)){state.checked="incomplete";
  }else if(t.kind==="team"&&(typeof state.answer!=="string"||state.answer.length!==3)){state.checked="incomplete";
  }else if(t.kind==="tangram"&&(!Array.isArray(state.answer)||state.answer.some(v=>v===null))){state.checked="incomplete";
  }else if(t.kind==="mathpath"&&(!Array.isArray(state.answer)||state.answer.length!==t.steps.length||state.answer.some(v=>v===null))){state.checked="incomplete";
  }else if(t.kind==="shop"&&(!Array.isArray(state.answer)||state.answer.length!==t.take)){state.checked="incomplete";
  }else if(t.kind==="puzzle"&&(!Array.isArray(state.answer)||state.answer.some(v=>v===null))){
   state.checked="incomplete";
  }else if(t.kind==="backpack"&&(!Array.isArray(state.answer)||state.answer.length!==t.count)){
   state.checked="incomplete";
  }else if(t.kind==="sudoku"&&(!Array.isArray(state.answer)||state.answer.some(v=>v===null))){
   state.checked="incomplete";
  }else if((t.kind==="cipher"||t.kind==="number")&&String(state.answer).length<t.answer.length){
   state.checked="incomplete";
  }else if((t.kind==="word"||t.kind==="syllables")&&(!Array.isArray(state.answer)||state.answer.length!==t.tiles.length)){
   state.checked="incomplete";
  }else if(t.kind==="crossword"&&(!Array.isArray(state.answer)||t.grid.some((slot,i)=>slot!==null&&!state.answer[i]))){
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
