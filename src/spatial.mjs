// ЧУДОЛЁТ — GAME-схемы трёх пространственных/приключенческих заданий.
// Чистые алгоритмы: визуал, ответы и печать не смешиваются.
const integer=(r,n)=>Math.floor(r()*n);
const shuffled=(array,r)=>{
 const a=array.slice();
 for(let i=a.length-1;i>0;i--){const j=integer(r,i+1);[a[i],a[j]]=[a[j],a[i]];}
 return a;
};
const same=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>v===b[i]);

export function makePicturePuzzle(theme,age,r){
 const size=age>=7?3:2,count=size*size;
 const symbols=shuffled([...new Set([...theme.a,...theme.b])],r).slice(0,count);
 const colors=["#f6e8ff","#ccecff","#e3f4ce","#fff0ce","#ffded6","#d9e9fb"];
 const pieces=shuffled(Array.from({length:count},(_,i)=>i),r);
 if(same(pieces,Array.from({length:count},(_,i)=>i)))pieces.push(pieces.shift());
 return {size,scene:{symbols,accent:colors[integer(r,colors.length)]},pieces,answer:Array.from({length:count},(_,i)=>i)};
}
export function validatePicturePuzzle(t,theme){
 const n=t.size*t.size;
 if(![2,3].includes(t.size)||!t.scene||!Array.isArray(t.scene.symbols)||t.scene.symbols.length!==n)return false;
 const available=[...theme.a,...theme.b];
 if(new Set(t.scene.symbols).size!==n||!t.scene.symbols.every(icon=>available.includes(icon)))return false;
 if(typeof t.scene.accent!=="string"||!/^#[0-9a-f]{6}$/i.test(t.scene.accent))return false;
 const sorted=Array.from({length:n},(_,i)=>i);
 return same(t.answer,sorted)&&Array.isArray(t.pieces)&&same(t.pieces.slice().sort((a,b)=>a-b),sorted)&&!same(t.pieces,sorted);
}
export function checkPicturePuzzle(t,answer){
 return Array.isArray(answer)&&same(answer,t.answer);
}

export function mirrorRight(left,rows,halfCols){
 if(!Array.isArray(left)||left.length!==rows*halfCols)return null;
 return Array.from({length:rows},(_,row)=>left.slice(row*halfCols,(row+1)*halfCols).reverse()).flat();
}
export function makeSymmetry(theme,age,r){
 const rows=age>=7?6:4,halfCols=age>=7?3:2;
 const palette=shuffled([...new Set([...theme.a,...theme.b])],r).slice(0,6);
 const left=Array.from({length:rows*halfCols},()=>palette[integer(r,palette.length)]);
 const right=mirrorRight(left,rows,halfCols);
 const wrongOne=right.slice(),wrongTwo=right.slice();
 const positions=shuffled(Array.from({length:right.length},(_,i)=>i),r);
 wrongOne[positions[0]]=shuffled(palette.filter(x=>x!==right[positions[0]]),r)[0];
 for(const i of positions.slice(1,3))wrongTwo[i]=shuffled(palette.filter(x=>x!==right[i]),r)[0];
 const options=shuffled([right,wrongOne,wrongTwo],r);
 const answer=options.findIndex(option=>same(option,right));
 return {rows,halfCols,palette,left,options,answer};
}
export function validateSymmetry(t,theme){
 const count=t.rows*t.halfCols;
 if(![4,6].includes(t.rows)||![2,3].includes(t.halfCols)||!Array.isArray(t.palette)||new Set(t.palette).size!==t.palette.length||t.palette.length!==6)return false;
 if(!t.palette.every(icon=>[...theme.a,...theme.b].includes(icon))||!Array.isArray(t.left)||t.left.length!==count||!t.left.every(x=>t.palette.includes(x)))return false;
 if(!Array.isArray(t.options)||t.options.length!==3||!Number.isInteger(t.answer)||t.answer<0||t.answer>2)return false;
 if(!t.options.every(option=>Array.isArray(option)&&option.length===count&&option.every(x=>t.palette.includes(x))))return false;
 if(new Set(t.options.map(x=>x.join("|"))).size!==3)return false;
 const right=mirrorRight(t.left,t.rows,t.halfCols);
 return t.options.filter(x=>same(x,right)).length===1&&same(t.options[t.answer],right);
}
export function checkSymmetry(t,value){return Number.isInteger(value)&&value===t.answer;}

const subsets=(n,k)=>{
 const result=[];
 const rec=(start,selected)=>{
  if(selected.length===k){result.push(selected.slice());return;}
  for(let i=start;i<n;i++){selected.push(i);rec(i+1,selected);selected.pop();}
 };
 rec(0,[]);return result;
};
export function backpackSolutions(task){
 if(!task||!Array.isArray(task.items)||!Number.isInteger(task.count)||!Number.isInteger(task.fromFirst)||!Number.isInteger(task.totalWeight))return [];
 return subsets(task.items.length,task.count).filter(ids=>{
  const selected=ids.map(i=>task.items[i]);
  return selected.filter(x=>x.group===0).length===task.fromFirst&&
   selected.reduce((s,x)=>s+x.weight,0)===task.totalWeight&&
   (task.stamps===null||selected.reduce((s,x)=>s+x.stamp,0)===task.stamps);
 });
}
export function makeBackpack(theme,age,r){
 const older=age>=7,nFirst=older?3:2,nSecond=3,n=nFirst+nSecond;
 const count=older?3:2,fromFirst=older?2:1,stamps=older?1:null;
 const candidates=subsets(n,count);
 for(let attempt=0;attempt<250;attempt++){
  const first=shuffled(theme.a,r).slice(0,nFirst).map(icon=>({icon,group:0}));
  const second=shuffled(theme.b,r).slice(0,nSecond).map(icon=>({icon,group:1}));
  const items=shuffled([...first,...second],r).map(x=>({...x,weight:1+integer(r,5),stamp:older?integer(r,2):0}));
  const weightGroups=new Map();
  for(const ids of candidates){
   const selected=ids.map(i=>items[i]);
   if(selected.filter(x=>x.group===0).length!==fromFirst)continue;
   if(older&&selected.reduce((s,x)=>s+x.stamp,0)!==stamps)continue;
   const weight=selected.reduce((s,x)=>s+x.weight,0);
   weightGroups.set(weight,[...(weightGroups.get(weight)||[]),ids]);
  }
  const unique=[...weightGroups.entries()].filter(([,ids])=>ids.length===1);
  if(!unique.length)continue;
  const [totalWeight,[answer]]=unique[integer(r,unique.length)];
  return {items,labels:theme.labels.slice(),count,fromFirst,totalWeight,stamps,answer};
 }
 throw new Error("Не удалось подобрать рюкзак с единственным решением");
}
export function validateBackpack(t,theme){
 if(!Array.isArray(t.items)||!Array.isArray(t.labels)||!same(t.labels,theme.labels)||!Array.isArray(t.answer))return false;
 if(![2,3].includes(t.count)||t.fromFirst!==(t.count===2?1:2)||t.items.length!==(t.count===2?5:6))return false;
 if(t.stamps!==(t.count===2?null:1))return false;
 const first=new Set(theme.a),second=new Set(theme.b);
 if(new Set(t.items.map(x=>x.icon)).size!==t.items.length)return false;
 if(!t.items.every(x=>x&&typeof x.icon==="string"&&Number.isInteger(x.weight)&&x.weight>=1&&x.weight<=5&&[0,1].includes(x.stamp)&&
  (x.group===0?first.has(x.icon):x.group===1&&second.has(x.icon))))return false;
 if(!Number.isInteger(t.totalWeight)||t.totalWeight<t.count||t.totalWeight>t.count*5)return false;
 const sols=backpackSolutions(t);
 return sols.length===1&&same(sols[0],t.answer);
}
export function checkBackpack(t,value){
 return Array.isArray(value)&&value.length===t.count&&new Set(value).size===t.count&&value.every(i=>Number.isInteger(i))&&same(value.slice().sort((a,b)=>a-b),t.answer);
}
