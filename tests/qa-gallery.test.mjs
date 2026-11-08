import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CATALOG,THEMES,generateBundle,contentKey,validateTask} from "../src/engine.mjs";
import {qaKey,qaDeepLink,qaTotals,qaStatus,qaRecord} from "../src/qa-core.mjs";

const html=readFileSync(new URL("../preview/qa-gallery.html",import.meta.url),"utf8");
const source=readFileSync(new URL("../src/qa-gallery.mjs",import.meta.url),"utf8");
const stylesheet=readFileSync(new URL("../assets/qa-gallery.css",import.meta.url),"utf8");
const app=readFileSync(new URL("../src/app.mjs",import.meta.url),"utf8");
const home=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("QA-галерея подключена из конструктора и содержит все элементы редакторской проверки",()=>{
 assert.match(home,/href="\.\/preview\/qa-gallery\.html"/);
 assert.match(html,/src="\.\.\/assets\/brand\/chudolet-horizontal\.png"/);
 assert.match(html,/src="\.\.\/src\/qa-gallery\.mjs"/);
 assert.match(html,/href="\.\.\/assets\/qa-gallery\.css"/);
 for(const id of ["qaFilters","qaTheme","qaAge","qaGroup","qaKind","qaStatus","qaSeed",
   "qaGroups","qaDialog","qaFrame","qaAnswerText","qaReviewForm","qaNote","qaExport",
   "qaImport","qaPrev","qaNext","qaOpenGame","qaSaveMessage","qaOpenAll","qaCloseAll"]){
  assert.match(html,new RegExp('id="'+id+'"'),id);
 }
 assert.match(html,/Только в этом браузере|Замечания хранятся только в этом браузере/);
 assert.match(stylesheet,/prefers-reduced-motion/);
 assert.match(stylesheet,/\.qa-card\[data-verdict="issue"\]/);
 assert.match(source,/statusIncludes/);
 assert.match(source,/qaMerge\(state\.reviews/);
 assert.match(source,/showCard\(kind,index\)/);
 assert.match(source,/tangramSvg\(t,Array\(t\.parts\.length\)\.fill\(null\)\)/);
});
test("QA-ссылка возвращает тот же элемент выбранного комплекта 30×20 для шести миров",()=>{
 let checked=0;
 for(const {id:kind,minAge} of CATALOG)for(const [theme] of Object.entries(THEMES)){
  const age=minAge<=5?"5-6":"10-12",seed=20261108;
  const bundle=generateBundle({theme,age,count:20,seed,focus:"type:"+kind});
  assert.equal(bundle.tasks.length,20);
  assert.equal(new Set(bundle.tasks.map(contentKey)).size,20);
  assert.ok(bundle.tasks.every(validateTask));
  for(const index of [0,7,19]){
   const input={theme,age,kind,seed,index};
   const p=new URL(qaDeepLink(input),"https://local.test/preview/qa-gallery.html").searchParams;
   const reopened=generateBundle({theme:p.get("theme"),age:p.get("age"),seed:Number(p.get("seed")),count:Number(p.get("count")),focus:"type:"+p.get("kind")});
   assert.deepEqual(reopened.tasks[Number(p.get("task"))],bundle.tasks[index],kind+"/"+theme+"/"+index);
   assert.equal(qaKey(input),"qa|"+theme+"|"+age+"|"+seed+"|"+kind+"|"+index);
   checked++;
  }
 }
 assert.equal(checked,540);
});
test("Отметки по разным мирам, возрастам и вариантам не смешиваются",()=>{
 const base={theme:"clouds",age:"10-12",seed:20261108,kind:"tangram",index:6};
 const a=qaRecord({...base,status:"issue",note:"Номер обрезан",tags:["ART"],fingerprint:"abc"});
 const b=qaRecord({...base,theme:"forest",status:"pass",fingerprint:"def"});
 const c=qaRecord({...base,seed:20261109,status:"issue",fingerprint:"xyz"});
 assert.equal(new Set([a.key,b.key,c.key]).size,3);
 assert.equal(qaStatus(a,"abc"),"issue");
 assert.equal(qaStatus(a,"wrong"),"stale");
 assert.deepEqual(qaTotals([a.key,b.key,c.key],{[a.key]:a,[b.key]:b,[c.key]:c}),{total:3,new:0,pass:1,issue:2});
});
test("Редакторский режим берёт номер задачи из ссылки, не раскрывая ответы",()=>{
 assert.match(app,/function openQaDeepLink\(\)/);
 assert.match(app,/params\.get\("task"\)/);
 assert.match(app,/state\.index=index/);
 assert.match(app,/params\.get\("full"\)!=="1"/);
 assert.match(app,/document\.body\.classList\.add\("qa-embed"\)/);
 assert.match(source,/querySelector\("\.qa-answer"\)\.open=false/);
 assert.match(source,/state\.dirty/);
 assert.match(source,/saveCurrent\(false\)/);
 assert.doesNotMatch(html,/id="qaAnswerText"[^>]*>[^<]+/);
});
