import {CATALOG,THEMES,generateBundle,contentKey,solutionText} from "./engine.mjs";
import {qaKey,qaLabel,qaStatus,qaRecord,qaDeepLink,qaTotals,qaReport,qaMerge,QA_STORE_KEY,QA_TAGS} from "./qa-core.mjs";
import {renderSymbol} from "./artwork.mjs";
import {tangramSvg} from "./next-mechanics.mjs";
import {sceneSvg} from "./scene.mjs";

const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const glyph=(x,theme)=>renderSymbol(x,theme);
const statusIncludes=(desired,status)=>desired==="all"||desired===status||(desired==="new"&&status==="stale");
const initial={
 theme:"clouds",age:"10-12",seed:20261107,group:"all",kind:"all",status:"all",search:""
};
const state={...initial,reviews:{},cache:new Map(),selected:null,dirty:false,openKinds:new Set(),saveAvailable:true};

function notify(message){$("qaSummary").textContent=message;}
function loadReviews(){
 try{
  const text=localStorage.getItem(QA_STORE_KEY);
  if(!text)return {};
  const parsed=JSON.parse(text),records=parsed?.records??parsed;
  if(!records||typeof records!=="object"||Array.isArray(records))return {};
  const valid={};
  for(const item of Object.values(records)){
   const row=qaRecord(item);
   if(row)valid[row.key]=row;
  }
  return valid;
 }catch{
  return {};
 }
}
function saveReviews(){
 try{
  localStorage.setItem(QA_STORE_KEY,JSON.stringify({format:"chudolet-qa-v1",records:state.reviews}));
  state.saveAvailable=true;
  return true;
 }catch{
  state.saveAvailable=false;
  return false;
 }
}
function context(kind,index){return {theme:state.theme,age:state.age,seed:state.seed,kind,index};}
function getBundle(kind){
 const key=[state.theme,state.age,state.seed,kind].join("|");
 if(state.cache.has(key))return state.cache.get(key);
 const bundle=generateBundle({theme:state.theme,age:state.age,seed:state.seed,count:20,focus:"type:"+kind});
 state.cache.set(key,bundle);
 return bundle;
}
function available(){
 const minAge=Number(state.age.split("-")[0]);
 return CATALOG.filter(x=>x.ready&&x.minAge<=minAge)
  .filter(x=>state.group==="all"||x.group===state.group)
  .filter(x=>state.kind==="all"||x.id===state.kind)
  .filter(x=>!state.search||((x.name+" "+x.group).toLocaleLowerCase("ru")).includes(state.search));
}
function indicesFor(kind,withTasks=false){
 const indices=[];
 const tasks=withTasks?getBundle(kind).tasks:null;
 for(let i=0;i<20;i++){
  if(state.status==="all"){indices.push(i);continue;}
  const review=state.reviews[qaKey(context(kind,i))];
  const status=tasks?qaStatus(review,contentKey(tasks[i])):review?.status??"new";
  if(statusIncludes(state.status,status))indices.push(i);
 }
 return indices;
}
function updateKinds(){
 const select=$("qaKind"),v=select.value||state.kind;
 select.innerHTML='<option value="all">Все 30 механик</option>'+
  CATALOG.filter(c=>c.ready&&c.minAge<=Number($("qaAge").value.split("-")[0]))
   .map(c=>'<option value="'+esc(c.id)+'">№'+c.number+' · '+esc(c.name)+'</option>').join("");
 select.value=[...select.options].some(x=>x.value===v)?v:"all";
}
function symbolLine(items,theme,compact=false){
 return '<div class="qa-emoji-sample'+(compact?' is-small':'')+'">'+items.slice(0,15).map(s=>'<span>'+glyph(s,theme)+'</span>').join("")+'</div>';
}
function gridMini(items,cols,theme,limit=25){
 return '<div class="qa-mini-grid" style="--qa-cols:'+Number(cols)+'">'+items.slice(0,limit).map(x=>
  '<span'+(x===null||x===""?' class="qa-empty-cell"':'')+'>'+(x===null||x===""?'·':glyph(x,theme))+'</span>'
 ).join("")+'</div>';
}
function mazeMini(task){
 const n=task.size,side=120,u=side/n;
 const has=new Set(task.edges.map(e=>[...e].sort((a,b)=>a-b).join("-")));
 let walls='<rect x="2" y="2" width="'+(side-4)+'" height="'+(side-4)+'" rx="3" fill="#fffdf4" stroke="#8566ae" stroke-width="3"/>';
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const a=y*n+x;
  if(x<n-1&&!has.has(a+"-"+(a+1)))walls+='<path d="M'+((x+1)*u)+' '+(y*u)+'v'+u+'" stroke="#8766bf" stroke-width="2.1"/>';
  if(y<n-1&&!has.has(a+"-"+(a+n)))walls+='<path d="M'+(x*u)+' '+((y+1)*u)+'h'+u+'" stroke="#8766bf" stroke-width="2.1"/>';
 }
 return '<svg viewBox="-3 -3 126 126" role="img" aria-label="Миниатюра лабиринта">'+walls+
  '<circle cx="'+(u/2)+'" cy="'+(u/2)+'" r="'+(u*.29)+'" fill="#ffd676"/>'+
  '<circle cx="'+(side-u/2)+'" cy="'+(side-u/2)+'" r="'+(u*.29)+'" fill="#8adcd2"/></svg>';
}
function visual(t){
 const theme=t.theme;
 switch(t.kind){
  case "tangram":return tangramSvg(t,Array(t.parts.length).fill(null));
  case "puzzle":return sceneSvg(t);
  case "maze":return mazeMini(t);
  case "sudoku":return gridMini(t.grid.map(n=>n===null?null:t.symbols[n]),4,theme,16);
  case "map":return gridMini(t.icons,t.size,theme,25);
  case "table":return symbolLine([...t.rows,...t.columns],theme,true);
  case "differences":return '<div class="qa-mini-lines"><span>Сравни две сетки</span>'+symbolLine([...t.base.slice(0,5),...t.changed.slice(0,5)],theme,true)+'</div>';
  case "crossword":return gridMini(t.grid.map(x=>x===null?'':x),t.cols,theme,t.grid.length);
  case "symmetry":return gridMini(t.left,t.halfCols,theme,18);
  case "memory":return symbolLine(t.base,theme);
  case "find":case "count":return symbolLine(t.cells.slice(0,12),theme,true);
  case "odd":return symbolLine(t.cells,theme);
  case "sequence":return '<div class="qa-mini-lines">'+symbolLine(t.shown,theme)+'<span>· · · ?</span></div>';
  case "sort":return symbolLine(t.items.map(x=>x.icon),theme);
  case "shadow":return symbolLine(t.options,theme);
  case "pair":return '<div class="qa-mini-lines">'+symbolLine([t.target],theme)+'<span>Найди пару</span></div>';
  case "compare":return '<div class="qa-mini-lines">'+symbolLine(Array(Math.min(6,t.left)).fill(t.icon),theme,true)+'<span>◀ ? ▶</span>'+symbolLine(Array(Math.min(6,t.right)).fill(t.icon),theme,true)+'</div>';
  case "mathpath":return '<div class="qa-mini-lines"><span>СТАРТ '+t.start+'</span><span>'+t.steps.slice(0,4).map(x=>x.op+" "+x.amount).join(" → ")+'</span></div>';
  case "number":return '<div class="qa-mini-lines"><span>Сотни · Десятки · Единицы</span><span>▦ ▤ •</span></div>';
  case "shop":return symbolLine(t.items.map(x=>x.icon),theme);
  case "word":case "syllables":return '<div class="qa-mini-lines">'+symbolLine([t.icon],theme)+'<div class="qa-mini-word">'+esc(t.tiles.join(" · "))+'</div></div>';
  case "story":return symbolLine(t.cards.map(x=>x.icon),theme);
  case "cipher":return '<div class="qa-mini-word">'+esc(t.encoded.slice(0,8).join(" "))+'<br><small>Секретный код</small></div>';
  case "phrase":return '<div class="qa-mini-word">'+esc(t.sentence)+'</div>';
  case "backpack":return symbolLine(t.items.map(x=>x.icon),theme);
  case "detective":return '<div class="qa-mini-lines">'+symbolLine(t.clues,theme)+'<span>4 подозреваемых</span></div>';
  case "branching":return '<div class="qa-mini-lines"><span>'+esc(t.steps[0].scene)+'</span><span>Как поступить? ⇢</span></div>';
  case "team":return '<div class="qa-mini-lines"><span>Разведчик · Мастер</span><span>Навигатор · □ □ □</span></div>';
  default:return '<div class="qa-mini-word">'+esc(t.prompt)+'</div>';
 }
}
function cardMarkup(kind,index,task){
 const key=qaKey(context(kind,index));
 const record=state.reviews[key];
 const mark=qaStatus(record,contentKey(task));
 return '<button type="button" class="qa-card" data-kind="'+esc(kind)+'" data-index="'+index+'" data-verdict="'+mark+'" aria-label="Открыть задание '+(index+1)+', '+esc(task.title)+', статус: '+qaLabel(mark)+'">'+
  '<div class="qa-card__meta"><span class="qa-card__index">№ '+String(index+1).padStart(2,"0")+'</span><span class="qa-card__status">'+qaLabel(mark)+'</span></div>'+
  '<div class="qa-card__visual">'+visual(task)+'</div>'+
  '<div class="qa-card__prompt">'+esc(task.prompt)+'</div>'+
  '<div class="qa-card__bottom"><span>Вариант '+esc(task.seed)+'</span><b>Открыть ↗</b></div>'+
  '</button>';
}
function redrawOpenGroup(details){
 const kind=details.dataset.kind,grid=details.querySelector(".qa-card-grid");
 if(!grid)return;
 try{
  const tasks=getBundle(kind).tasks;
  const indices=indicesFor(kind,true);
  grid.innerHTML=indices.map(i=>cardMarkup(kind,i,tasks[i])).join("");
  grid.hidden=indices.length===0;
  let note=details.querySelector(".qa-group-empty");
  if(!note){note=document.createElement("p");note.className="qa-group-empty";details.append(note);}
  note.textContent=indices.length?"":"Заданий с выбранным статусом пока нет.";
  note.hidden=indices.length>0;
 }catch(error){
  grid.textContent="Не удалось собрать комплект: "+error.message;
 }
}
function recordKeys(kinds){
 return kinds.flatMap(kind=>Array.from({length:20},(_,i)=>qaKey(context(kind.id,i))));
}
function refreshCounters(kinds){
 const totals=qaTotals(recordKeys(kinds),state.reviews);
 $("qaMetricTypes").textContent=String(kinds.length);
 $("qaMetricTasks").textContent=String(totals.total);
 $("qaMetricIssues").textContent=String(totals.issue);
 $("qaCountNew").textContent=String(totals.new);
 $("qaCountPass").textContent=String(totals.pass);
 $("qaCountIssue").textContent=String(totals.issue);
}
function renderGroups(){
 const kinds=available(),target=$("qaGroups");
 target.replaceChildren();
 const visible=kinds.filter(kind=>indicesFor(kind.id).length);
 refreshCounters(kinds);
 $("qaEmpty").hidden=visible.length>0;
 const shown=visible.reduce((sum,kind)=>sum+indicesFor(kind.id).length,0);
 notify("Доступно "+kinds.length+" механик · "+shown+" заданий по текущим фильтрам. Открой группу, чтобы посмотреть её 20 вариантов.");
 const fragment=document.createDocumentFragment();
 for(const kind of visible){
  const details=document.createElement("details");details.className="qa-section";details.dataset.kind=kind.id;
  const count=indicesFor(kind.id).length,records=Array.from({length:20},(_,i)=>state.reviews[qaKey(context(kind.id,i))]);
  const good=records.filter(x=>x?.status==="pass").length,issue=records.filter(x=>x?.status==="issue").length;
  details.innerHTML='<summary class="qa-section__summary">'+
    '<span class="qa-section__number">'+String(kind.number).padStart(2,"0")+'</span>'+
    '<span class="qa-section__title"><strong>'+esc(kind.name)+'</strong><small>'+esc(kind.group)+' · от '+kind.minAge+' лет</small></span>'+
    '<span class="qa-section__right"><span class="qa-section__badge">'+count+' вариантов · ✓ '+good+' · ✎ '+issue+'</span><span class="qa-section__chevron" aria-hidden="true">⌄</span></span></summary>'+
    '<div class="qa-card-grid"></div>';
  details.addEventListener("toggle",()=>{if(details.open){state.openKinds.add(kind.id);redrawOpenGroup(details);}else state.openKinds.delete(kind.id);});
  fragment.append(details);
 }
 target.append(fragment);
 // Не генерировать 600 сложных заданий до запроса: первая группа открыта, остальные — по щелчку.
 const first=visible[0]?.id;
 for(const detail of target.querySelectorAll("details")){
  if(state.openKinds.has(detail.dataset.kind)||(!state.openKinds.size&&detail.dataset.kind===first))detail.open=true;
 }
}
function applyFilters(){
 const age=$("qaAge").value,seed=Number($("qaSeed").value);
 if(!Number.isSafeInteger(seed)||seed<1||seed>999999999){notify("Номер варианта должен быть целым числом от 1 до 999999999.");$("qaSeed").focus();return;}
 const changed=state.theme!==$("qaTheme").value||state.age!==age||state.seed!==seed;
 state.theme=$("qaTheme").value;state.age=age;state.seed=seed;
 state.group=$("qaGroup").value;state.kind=$("qaKind").value;
 state.status=$("qaStatus").value;state.search=$("qaSearch").value.trim().toLocaleLowerCase("ru").slice(0,80);
 if(changed){state.cache.clear();state.openKinds.clear();}
 renderGroups();
}
function showCard(kind,index){
 if(state.dirty)saveCurrent(false);
 const bundle=getBundle(kind),t=bundle.tasks[index],ctx=context(kind,index),key=qaKey(ctx);
 const last=state.reviews[key],status=qaStatus(last,contentKey(t));
 state.selected={kind,index};
 const catalog=CATALOG.find(x=>x.id===kind);
 $("qaDialogMeta").textContent=esc(catalog.group)+" · № "+String(catalog.number).padStart(2,"0")+" · "+THEMES[state.theme].name;
 $("qaDialogTitle").textContent=t.title;
 $("qaCurrentStep").textContent="Задание "+(index+1)+" из 20";
 $("qaPrev").disabled=index===0;$("qaNext").disabled=index===19;
 $("qaFingerprint").textContent="ID: "+t.id+" · вариант "+state.seed+(status==="stale"?" · задание изменилось после прошлой отметки":"");
 $("qaAnswerText").textContent=solutionText(t);
 $("qaDialog").querySelector(".qa-answer").open=false;
 const url=qaDeepLink(ctx);
 $("qaFrame").src=url;
 const full=new URL(url,location.href);
 full.searchParams.set("full","1");
 $("qaOpenGame").href=full.href;
 const verdict=status==="stale"?"new":last?.status??"new";
 for(const input of document.querySelectorAll('input[name="qaVerdict"]'))input.checked=input.value===verdict;
 for(const tag of document.querySelectorAll('input[name="qaTag"]'))tag.checked=!!last?.tags?.includes(tag.value);
 $("qaNote").value=last?.note??"";
 $("qaSaveMessage").textContent=status==="stale"?"Исходное содержание изменилось. Проверь и заново сохрани отметку.":"Пока не сохранено новых изменений.";
 state.dirty=false;
 if(!$("qaDialog").open)$("qaDialog").showModal();
}
function saveCurrent(showMessage=true){
 const selected=state.selected;if(!selected)return;
 if(!state.dirty)return;
 const t=getBundle(selected.kind).tasks[selected.index];
 const data=context(selected.kind,selected.index);
 const choice=document.querySelector('input[name="qaVerdict"]:checked')?.value??"new";
 const tags=[...document.querySelectorAll('input[name="qaTag"]:checked')].map(x=>x.value).filter(x=>QA_TAGS.includes(x));
 const rec=qaRecord({...data,status:choice,tags,note:$("qaNote").value,fingerprint:contentKey(t),savedAt:new Date().toISOString()});
 if(!rec)return;
 state.reviews[rec.key]=rec;state.dirty=false;
 const stored=saveReviews();
 if(showMessage)$("qaSaveMessage").textContent=stored?"Отметка сохранена в этом браузере. Для резервной копии скачай JSON.":"Отметка осталась в открытой вкладке, но браузер запретил хранение. Скачай JSON!";
 const group=$("qaGroups").querySelector('details[data-kind="'+selected.kind+'"]');
 if(group){
  const grid=group.querySelector(".qa-card-grid");
  if(grid) {
   const card=grid.querySelector('[data-index="'+selected.index+'"]');
   if(card){card.outerHTML=cardMarkup(selected.kind,selected.index,t);}
  }
  const summary=group.querySelector(".qa-section__badge");
  if(summary){
   const reviews=Array.from({length:20},(_,i)=>state.reviews[qaKey(context(selected.kind,i))]);
   summary.textContent="20 вариантов · ✓ "+reviews.filter(x=>x?.status==="pass").length+" · ✎ "+reviews.filter(x=>x?.status==="issue").length;
  }
 }
 refreshCounters(available());
 if(state.status!=="all")renderGroups();
}
function closeDialog(){
 if(state.dirty)saveCurrent(false);
 $("qaDialog").close();$("qaFrame").src="about:blank";state.selected=null;
}
function download(name,text){
 const blob=new Blob([text],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function reportDownload(){
 const payload=qaReport(state.reviews,{branch:"develop/activity-library-v0.2",generatedFor:{theme:state.theme,age:state.age,seed:state.seed},usage:"Только редакторская QA-проверка. Файлы не отправляются автоматически."});
 download("chudolet-qa-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify(payload,null,2));
 notify("Отчёт выгружен: "+payload.records.length+" записей. Храни копию вместе с материалами проекта.");
}
async function importReport(file){
 if(!file)return;
 if(file.size>5*1024*1024){notify("Файл слишком большой. Максимум — 5 МБ.");return;}
 try{
  const incoming=JSON.parse(await file.text());
  const merged=qaMerge(state.reviews,incoming);
  state.reviews=merged.records;
  saveReviews();renderGroups();
  if(merged.conflicts.length){
   download("chudolet-qa-import-conflicts.json",JSON.stringify({format:"chudolet-qa-import-conflicts-v1",items:merged.conflicts},null,2));
  }
  notify("Импорт: новых записей "+merged.added+", совпадений "+merged.identical+", неверных строк "+merged.invalid+", конфликтов "+merged.conflicts.length+". Прежние отметки не перезаписаны."+(merged.conflicts.length?" Конфликтующие версии отдельно выгружены.":""));
 }catch(err){notify("Не удалось прочитать отчёт: "+err.message);}
}
function connectEvents(){
 $("qaFilters").addEventListener("submit",e=>{e.preventDefault();applyFilters();});
 $("qaGroup").addEventListener("change",applyFilters);
 $("qaStatus").addEventListener("change",applyFilters);
 $("qaKind").addEventListener("change",applyFilters);
 $("qaTheme").addEventListener("change",applyFilters);
 $("qaAge").addEventListener("change",()=>{updateKinds();applyFilters();});
 $("qaSearch").addEventListener("input",applyFilters);
 $("qaOpenAll").addEventListener("click",()=>{
  for(const group of $("qaGroups").querySelectorAll("details"))group.open=true;
 });
 $("qaCloseAll").addEventListener("click",()=>{
  for(const group of $("qaGroups").querySelectorAll("details"))group.open=false;
  state.openKinds.clear();
 });
 $("qaGroups").addEventListener("click",e=>{
  const card=e.target.closest(".qa-card");if(card)showCard(card.dataset.kind,Number(card.dataset.index));
 });
 $("qaPrev").addEventListener("click",()=>{if(state.selected&&state.selected.index>0)showCard(state.selected.kind,state.selected.index-1);});
 $("qaNext").addEventListener("click",()=>{if(state.selected&&state.selected.index<19)showCard(state.selected.kind,state.selected.index+1);});
 $("qaClose").addEventListener("click",closeDialog);
 $("qaDialog").addEventListener("cancel",()=>{if(state.dirty)saveCurrent(false);$("qaFrame").src="about:blank";state.selected=null;});
 $("qaReviewForm").addEventListener("input",()=>{state.dirty=true;$("qaSaveMessage").textContent="Есть несохранённые изменения";});
 $("qaReviewForm").addEventListener("change",()=>{state.dirty=true;});
 $("qaReviewForm").addEventListener("submit",e=>{e.preventDefault();saveCurrent();});
 $("qaExport").addEventListener("click",reportDownload);
 $("qaImportTrigger").addEventListener("click",()=>$("qaImport").click());
 $("qaImport").addEventListener("change",async()=>{await importReport($("qaImport").files?.[0]);$("qaImport").value="";});
}
state.reviews=loadReviews();
connectEvents();
updateKinds();
renderGroups();
