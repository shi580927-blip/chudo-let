// ЧУДОЛЁТ: графика не входит в игровую логику или эталонный ответ.
export const ART_ASSETS=Object.freeze({
 clouds:Object.freeze({
 "✉️":{id:"envelope",label:"Конверт"},
 "📦":{id:"parcel",label:"Посылка"},
 "🪁":{id:"kite",label:"Воздушный змей"},
 "🧭":{id:"compass",label:"Компас"},
 "🔔":{id:"bell",label:"Колокольчик"},
 "🗝️":{id:"key",label:"Ключ"},
 "🌈":{id:"rainbow",label:"Радуга"},
 "⭐":{id:"star",label:"Звезда"},
 "☁️":{id:"cloud",label:"Облако"},
 "🌙":{id:"moon",label:"Месяц"},
 "☀️":{id:"sun",label:"Солнце"},
 "⚡":{id:"lightning",label:"Молния"}
 })
});
const escape=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export function artAssetPath(symbol,theme){
 const item=ART_ASSETS[theme]?.[symbol];
 return item?"./assets/items/clouds/"+item.id+".svg":null;
}
// Approved default: the original colourful platform emoji used in Alpha 0.1.
// Experimental flat SVGs remain accessible for comparison, never activated by default.
export function renderSymbol(symbol,theme,variant="classic"){
 const item=ART_ASSETS[theme]?.[symbol];
 if(variant==="illustrated"&&item){
  return '<img class="art-image" src="'+artAssetPath(symbol,theme)+'" alt="'+escape(item.label)+'" loading="eager" decoding="async">';
 }
 return escape(symbol);
}
