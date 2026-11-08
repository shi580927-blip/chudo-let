import test from "node:test";
import assert from "node:assert/strict";
import {qaKey,qaLabel,qaStatus,qaRecord,qaDeepLink,qaTotals,qaReport,qaMerge,QA_FORMAT} from "../src/qa-core.mjs";
const context={theme:"clouds",age:"10-12",seed:20261108,kind:"tangram",index:19};
test("QA: стабильный ключ каждой позиции и ссылка на то же игровое задание",()=>{
 assert.equal(qaKey(context),"qa|clouds|10-12|20261108|tangram|19");
 const url=qaDeepLink(context);
 assert.match(url,/\bqa=1\b/);assert.match(url,/\bcount=20\b/);
 const p=new URL(url,"https://example.test").searchParams;
 for(const prop of ["theme","age","kind"])assert.equal(p.get(prop),context[prop]);
 assert.equal(p.get("task"),"19");
 assert.throws(()=>qaKey({...context,index:20}),/Недопустимые/);
 assert.throws(()=>qaKey({...context,age:"9-12"}),/Недопустимые/);
});
test("QA: независимый статус, точный отпечаток содержания и счётчики",()=>{
 const row=qaRecord({...context,status:"issue",tags:["ART","GAME","ART","bogus"],note:"Контур обрезан",fingerprint:"A"});
 assert.deepEqual(row.tags,["ART","GAME"]);
 assert.equal(qaStatus(row,"A"),"issue");
 assert.equal(qaStatus(row,"B"),"stale");
 assert.equal(qaLabel("issue"),"Нужна правка");
 assert.equal(qaStatus(null),"new");
 const other=qaKey({...context,index:1});
 assert.deepEqual(qaTotals([row.key,other],{[row.key]:row}),{total:2,new:1,pass:0,issue:1});
});
test("QA: экспорт и безопасный импорт без потери уже сохранённых правок",()=>{
 const prior=qaRecord({...context,status:"issue",tags:["ART"],note:"Исправить контур",fingerprint:"first"});
 const incoming=qaRecord({...context,status:"pass",note:"Ошибки не вижу",fingerprint:"second"});
 const newRow=qaRecord({...context,index:5,status:"pass",note:"Проверено",fingerprint:"C"});
 const report=qaReport({[incoming.key]:incoming,[newRow.key]:newRow});
 assert.equal(report.format,QA_FORMAT);
 const merge=qaMerge({[prior.key]:prior},report);
 assert.equal(merge.added,1);assert.equal(merge.conflicts.length,1);
 assert.equal(merge.records[prior.key].note,"Исправить контур");
 assert.equal(merge.records[newRow.key].status,"pass");
 assert.equal(qaMerge(merge.records,qaReport(merge.records)).conflicts.length,0);
 assert.throws(()=>qaMerge({},{}),/формат/);
 assert.equal(qaRecord({...context,status:"published"}),null);
});
