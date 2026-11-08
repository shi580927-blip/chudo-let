// ЧУДОЛЁТ — независимое хранилище редакторской QA-приёмки.
// Никаких сетевых запросов и персональных данных; только локальные заметки.
export const QA_STORE_KEY="chudolet:qa-reviews:v1";
export const QA_FORMAT="chudolet-qa-v1";
export const QA_STATUSES=["new","pass","issue"];
export const QA_TAGS=["GAME","ART","PRINT","UX","TEXT"];
export const QA_AGES=["3-4","5-6","7-9","10-12"];

export function qaKey({theme,age,seed,kind,index}){
 if(!/^[a-z]+$/.test(String(theme))||!QA_AGES.includes(String(age))||!Number.isSafeInteger(Number(seed))||
  !/^[a-z]+$/.test(String(kind))||!Number.isInteger(Number(index))||Number(index)<0||Number(index)>19){
  throw new Error("Недопустимые параметры QA-заметки");
 }
 return ["qa",theme,age,String(seed),kind,String(index)].join("|");
}
export function qaLabel(status){
 return {new:"Не проверено",pass:"Без замечаний",issue:"Нужна правка",stale:"После изменения"}[status]??"Не проверено";
}
export function qaStatus(record,fingerprint){
 if(!record)return "new";
 if(fingerprint!==undefined&&record.fingerprint!==String(fingerprint))return "stale";
 return QA_STATUSES.includes(record.status)?record.status:"new";
}
export function qaRecord(input){
 if(!input||typeof input!=="object")return null;
 const {theme,age,seed,kind,index}=input;
 let key;try{key=qaKey({theme,age,seed,kind,index});}catch{return null;}
 const status=String(input.status??"new");
 if(!QA_STATUSES.includes(status))return null;
 const tags=Array.isArray(input.tags)?[...new Set(input.tags.filter(x=>QA_TAGS.includes(x)))]:[];
 const note=String(input.note??"").slice(0,3000);
 const fingerprint=String(input.fingerprint??"").slice(0,1500);
 const savedAt=typeof input.savedAt==="string"?input.savedAt.slice(0,40):"";
 return {key,theme:String(theme),age:String(age),seed:Number(seed),kind:String(kind),index:Number(index),status,tags,note,fingerprint,savedAt};
}
export function qaDeepLink({theme,age,seed,kind,index},base="../index.html"){
 qaKey({theme,age,seed,kind,index});
 const p=new URLSearchParams({qa:"1",theme,age,seed:String(seed),kind,task:String(index),count:"20"});
 return base+"?"+p.toString();
}
export function qaTotals(keys,records){
 const totals={total:keys.length,new:0,pass:0,issue:0};
 for(const key of keys){
  const status=records[key]?.status;
  if(status==="pass")totals.pass++;
  else if(status==="issue")totals.issue++;
  else totals.new++;
 }
 return totals;
}
export function qaReport(records,meta={}){
 const all=Object.values(records||{}).map(qaRecord).filter(Boolean).sort((a,b)=>a.key.localeCompare(b.key));
 return {format:QA_FORMAT,exportedAt:new Date().toISOString(),meta:{app:"ЧУДОЛЁТ — лаборатория QA",...meta},records:all};
}
export function qaMerge(current,payload){
 if(!payload||payload.format!==QA_FORMAT||!Array.isArray(payload.records)||payload.records.length>20000)throw new Error("Неизвестный формат QA-отчёта");
 const records={...current},conflicts=[];
 let added=0,identical=0,invalid=0;
 for(const raw of payload.records){
  const row=qaRecord(raw);
  if(!row){invalid++;continue;}
  const present=records[row.key];
  if(!present){records[row.key]=row;added++;continue;}
  if(JSON.stringify(present)===JSON.stringify(row)){identical++;continue;}
  // Никогда не затереть существующую заметку при импорте без решения редактора.
  conflicts.push({key:row.key,existing:present,incoming:row});
 }
 return {records,conflicts,added,identical,invalid};
}
