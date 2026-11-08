// Финальная четвёрка GAME-механик. Каждая модель проверяет однозначный ключ.
import {STORY_BANK} from "./narrative-banks.mjs";
export const PHRASE_BANK=Object.freeze([{"id":"phrase-01","sentence":"Чтобы отправить письмо, его кладут в ___","answer":"конверт","decoys":["кастрюлю","ботинок","кувшин"],"explanation":"Конверт защищает письмо по дороге."},{"id":"phrase-02","sentence":"Дождь удобно переждать под ___","answer":"зонтом","decoys":["ковром","стулом","книгой"],"explanation":"Зонт укрывает от капель."},{"id":"phrase-03","sentence":"Рыбке для плавания нужна ___","answer":"вода","decoys":["мука","трава","бумага"],"explanation":"Рыбы живут и плавают в воде."},{"id":"phrase-04","sentence":"Почтальон опускает письма в ___","answer":"ящик","decoys":["сапог","кастрюлю","гнездо"],"explanation":"Почтовый ящик служит для писем."},{"id":"phrase-05","sentence":"В саду семечко сажают в ___","answer":"землю","decoys":["облако","море","стекло"],"explanation":"Растения укореняются в земле."},{"id":"phrase-06","sentence":"Снежную бабу лепят из ___","answer":"снега","decoys":["песка","глины","бумаги"],"explanation":"Снеговик состоит из снежных комьев."},{"id":"phrase-07","sentence":"Чтобы увидеть далёкую планету, используют ___","answer":"телескоп","decoys":["расчёску","веник","ложку"],"explanation":"Телескоп помогает наблюдать далёкие объекты."},{"id":"phrase-08","sentence":"Парус наполняет сильный ___","answer":"ветер","decoys":["камень","камин","ключ"],"explanation":"Парус движется благодаря ветру."},{"id":"phrase-09","sentence":"Велосипед катится на ___","answer":"колёсах","decoys":["крыльях","полозьях","лапах"],"explanation":"У велосипеда есть колёса."},{"id":"phrase-10","sentence":"Пчела собирает нектар с ___","answer":"цветка","decoys":["кирпича","замка","тарелки"],"explanation":"Пчёлы собирают нектар с цветов."},{"id":"phrase-11","sentence":"Улитка носит домик на ___","answer":"спине","decoys":["хвосте","носу","крыле"],"explanation":"Раковина находится на спине улитки."},{"id":"phrase-12","sentence":"В гнезде у птицы бывает ___","answer":"яйцо","decoys":["якорь","компас","зеркало"],"explanation":"Птицы откладывают яйца в гнёздах."},{"id":"phrase-13","sentence":"Волшебный ключ открывает ___","answer":"замок","decoys":["облако","цветок","радугу"],"explanation":"Ключ поворачивают в замке."},{"id":"phrase-14","sentence":"Пекарь выпекает хлеб в ___","answer":"печи","decoys":["рюкзаке","кармане","корзине"],"explanation":"Хлеб пекут в печи."},{"id":"phrase-15","sentence":"На море кораблю помогает ориентироваться ___","answer":"компас","decoys":["градусник","молоток","мелок"],"explanation":"Компас помогает определять направление."},{"id":"phrase-16","sentence":"Подарок красиво перевязывают ___","answer":"лентой","decoys":["веткой","ложкой","камнем"],"explanation":"Подарочную коробку перевязывают лентой."},{"id":"phrase-17","sentence":"Картину рисуют красками с помощью ___","answer":"кисти","decoys":["вилки","лопаты","весла"],"explanation":"Кистью наносят краски."},{"id":"phrase-18","sentence":"Листья у дерева растут на ___","answer":"ветках","decoys":["колёсах","чашках","кнопках"],"explanation":"Ветки удерживают листья."},{"id":"phrase-19","sentence":"В лесу грибы удобно собирать в ___","answer":"корзину","decoys":["каску","конверт","подушку"],"explanation":"Грибы складывают в корзину."},{"id":"phrase-20","sentence":"Подводная лодка движется под ___","answer":"водой","decoys":["песком","крышкой","ковром"],"explanation":"Подводная лодка умеет идти под водой."},{"id":"phrase-21","sentence":"На карте крестик отмечает место ___","answer":"клада","decoys":["чая","перьев","снега"],"explanation":"На приключенческой карте отмечают клад."},{"id":"phrase-22","sentence":"Чтобы узнать время, смотрят на ___","answer":"часы","decoys":["ракушку","яблоко","скалу"],"explanation":"Часы показывают время."},{"id":"phrase-23","sentence":"Ракете для полёта нужно ___","answer":"топливо","decoys":["варенье","сено","мыло"],"explanation":"Ракетные двигатели используют топливо."},{"id":"phrase-24","sentence":"Чтобы скрепить две доски, можно забить ___","answer":"гвоздь","decoys":["семечко","ракушку","конфету"],"explanation":"Гвоздём закрепляют деревянные детали."},{"id":"phrase-25","sentence":"Чтобы не промокнуть в луже, надевают ___","answer":"сапоги","decoys":["варежки","очки","шарф"],"explanation":"Сапоги защищают ноги от воды."},{"id":"phrase-26","sentence":"Чтобы найти дорогу ночью, включают ___","answer":"фонарик","decoys":["тарелку","лопату","карандаш"],"explanation":"Фонарик освещает путь."}]);
const BRANCH_WRONG=[["Разломить семечко","Забыть о посадке","Сорвать первый росток"],["Порвать лист","Выбросить написанное","Спрятать конверт"],["Сложить карту","Пойти наугад","Вернуться к началу тропинки"],["Искать лужу","Закрыть зонтик","Остаться на улице"],["Рассыпать детали","Выбрать детали наугад","Разобрать готовую игрушку"],["Раздавить ягоды","Не промывать ягоды","Спрятать угощение"],["Выбросить фонарик","Поставить его в ящик","Погасить свет снова"],["Разбить яйцо","Положить его в холодную воду","Испугать птенца"],["Отрезать верёвку","Сложить змея","Занести змея домой"],["Проколоть шар","Не завязывать горлышко","Развязать шар"],["Бросить доски в воду","Оставить мост без опоры","Повернуть обратно"],["Убрать продукты","Оставить тесто сырым","Положить булочки в снег"],["Растопить первый снежок","Разнести шары по двору","Снять все украшения"],["Выбросить камешек","Не мыть его","Стереть рисунок"],["Засыпать следы песком","Не рассматривать следы","Уйти в другую сторону"],["Выдернуть саженец","Забыть о поливе","Срубить молодое деревце"],["Разбить ракушки","Положить ракушки в грязь","Разрезать верёвочку"],["Выбросить колесо","Выбрать неподходящую деталь","Снять колесо снова"],["Закрыть окно","Убрать телескоп в шкаф","Не смотреть в окуляр"],["Потерять подарок","Оставить коробку открытой","Спрятать подарок от друга"]];
const randomItem=(a,r)=>a[Math.floor(r()*a.length)];
const mix=(a,r)=>{const o=a.slice();for(let i=o.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;};
export function makePhrase(r){
 const entry=randomItem(PHRASE_BANK,r);
 return {phraseId:entry.id,sentence:entry.sentence,options:mix([entry.answer,...entry.decoys],r),answer:entry.answer,explanation:entry.explanation};
}
export function validatePhrase(t){
 const p=PHRASE_BANK.find(x=>x.id===t.phraseId);
 return !!p&&t.sentence===p.sentence&&t.answer===p.answer&&t.explanation===p.explanation&&Array.isArray(t.options)&&t.options.length===4&&new Set(t.options).size===4&&t.options.every(x=>[p.answer,...p.decoys].includes(x))&&t.options.includes(t.answer);
}
export const checkPhrase=(t,value)=>typeof value==="string"&&value===t.answer;
export function makeDetective(t,r){
 const a=mix(t.a,r).slice(0,2),b=mix(t.b,r).slice(0,2);
 const avatars=["🦊","🐻","🐼","🐰"];
 const combinations=[[0,0],[0,1],[1,0],[1,1]];
 const suspects=mix(combinations.map(([x,y],i)=>({id:"ABCD"[i],avatar:avatars[i],itemA:a[x],itemB:b[y]})),r);
 const picked=randomItem(suspects,r);
 return {suspects,clues:[picked.itemA,picked.itemB],labels:t.labels,answer:picked.id,
  caseId:a.slice().sort().join("")+"#"+b.slice().sort().join("")+"#"+picked.itemA+"#"+picked.itemB};
}
export function validateDetective(t,theme){
 if(!Array.isArray(t.suspects)||t.suspects.length!==4||!Array.isArray(t.clues)||t.clues.length!==2||!Array.isArray(t.labels))return false;
 const ids=t.suspects.map(x=>x.id);if(new Set(ids).size!==4)return false;
 if(t.suspects.some(s=>!theme.a.includes(s.itemA)||!theme.b.includes(s.itemB)||typeof s.avatar!=="string"))return false;
 const aa=new Set(t.suspects.map(s=>s.itemA)),bb=new Set(t.suspects.map(s=>s.itemB));
 if(aa.size!==2||bb.size!==2)return false;
 const combos=t.suspects.map(s=>s.itemA+"|"+s.itemB);
 if(new Set(combos).size!==4)return false;
 if(t.suspects.filter(s=>s.itemA===t.clues[0]).length!==2||t.suspects.filter(s=>s.itemB===t.clues[1]).length!==2)return false;
 return t.suspects.filter(s=>s.itemA===t.clues[0]&&s.itemB===t.clues[1]).length===1&&
  t.suspects.some(s=>s.id===t.answer&&s.itemA===t.clues[0]&&s.itemB===t.clues[1]);
}
export const checkDetective=(t,value)=>typeof value==="string"&&value===t.answer;
export function makeBranching(r){
 const index=Math.floor(r()*STORY_BANK.length),story=STORY_BANK[index];
 const steps=[0,1,2].map(i=>{
  const correct=story.steps[i+1],bad=BRANCH_WRONG[index][i],answers=mix([{text:correct.text,icon:"◆",correct:true},{text:bad,icon:"◆",correct:false}],r);
  return {scene:story.steps[i].text,sceneIcon:story.steps[i].icon,choices:answers.map(x=>({text:x.text,icon:x.icon})),correctIndex:answers.findIndex(x=>x.correct),badEffect:"Так история не продвинется. Выбери действие, которое поможет герою."};
 });
 return {branchId:story.id,goal:story.steps[3].text,steps,answer:steps.map(x=>x.correctIndex)};
}
export function validateBranching(t){
 const story=STORY_BANK.find(x=>x.id===t.branchId),index=STORY_BANK.findIndex(x=>x.id===t.branchId);
 if(!story||!Array.isArray(t.steps)||t.steps.length!==3||!Array.isArray(t.answer)||t.answer.length!==3||t.goal!==story.steps[3].text)return false;
 return t.steps.every((s,i)=>{
  if(s.scene!==story.steps[i].text||s.sceneIcon!==story.steps[i].icon||!Array.isArray(s.choices)||s.choices.length!==2||![0,1].includes(s.correctIndex)||t.answer[i]!==s.correctIndex)return false;
  const good=s.choices[s.correctIndex],bad=s.choices[1-s.correctIndex];
  return good.text===story.steps[i+1].text&&good.icon==="◆"&&bad.text===BRANCH_WRONG[index][i]&&bad.icon==="◆";
 });
}
export const checkBranching=(t,value)=>Array.isArray(value)&&value.length===t.answer.length&&value.every((v,i)=>v===t.answer[i]);
export function makeTeam(theme,age,r){
 const roles=["Разведчик","Мастер","Навигатор"],symbols=mix([...theme.a,...theme.b],r).slice(0,3);
 const digits=[0,1,2].map(()=>1+Math.floor(r()*9));
 const clues=digits.map((digit,i)=>{
  const symbol=symbols[i],kind=i===0?"count":i===1?"add":"subtract";
  if(kind==="count")return {role:roles[i],icon:symbol,kind,operand:digit,amount:0,riddle:"Сосчитай значки: "+Array(digit).fill(symbol).join(" "),digit};
  if(kind==="add"){
   const first=Math.floor(r()*(digit+1));return {role:roles[i],icon:symbol,kind,operand:first,amount:digit-first,riddle:"Сколько будет "+first+" + "+(digit-first)+"?",digit};
  }
  const first=digit+Math.floor(r()*(10-digit));return {role:roles[i],icon:symbol,kind,operand:first,amount:first-digit,riddle:"Сколько будет "+first+" − "+(first-digit)+"?",digit};
 });
 return {clues,answer:digits.join("")};
}
export function validateTeam(t){
 if(!Array.isArray(t.clues)||t.clues.length!==3||typeof t.answer!=="string"||!/^[1-9]{3}$/.test(t.answer))return false;
 if(new Set(t.clues.map(x=>x.role)).size!==3)return false;
 return t.clues.every((c,i)=>{
  if(!Number.isInteger(c.digit)||c.digit<1||c.digit>9||typeof c.riddle!=="string"||!c.riddle||typeof c.icon!=="string")return false;
  const expected=c.kind==="count"?c.operand:c.kind==="add"?c.operand+c.amount:c.kind==="subtract"?c.operand-c.amount:NaN;
  return expected===c.digit&&Number(t.answer[i])===c.digit;
 });
}
export const checkTeam=(t,value)=>typeof value==="string"&&value===t.answer;
