// ЧУДОЛЁТ — единая сюжетная картинка для пазла, нарезанная точными SVG viewBox.
// Предметы — принятые цветные emoji, без отклонённых плоских пиктограмм.
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export function sceneSvg(t,source=null){
 const side=360,tile=side/t.size;
 const view=source===null?"0 0 360 360":[source%t.size*tile,Math.floor(source/t.size)*tile,tile,tile].join(" ");
 const font=t.size===2?87:63;
 const icons=t.scene.symbols.map((icon,i)=>{
  const x=(i%t.size+.5)*tile,y=(Math.floor(i/t.size)+.5)*tile+4;
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" font-size="'+font+'" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">'+esc(icon)+'</text>';
 }).join("");
 return '<svg class="picture-art" viewBox="'+view+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+(source===null?"Образец картинки":"Фрагмент картинки")+'">'+
 '<rect width="360" height="360" fill="'+t.scene.accent+'"/>'+
 '<path d="M-40 176C75 95 160 251 408 143L408 400H-40Z" fill="#fff9e9" opacity=".55"/>'+
 '<path d="M-45 290C72 231 184 350 406 238L410 410H-40Z" fill="#b0dece" opacity=".58"/>'+
 '<path d="M-20 75C110 160 185 58 390 134" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".58"/>'+
 '<path d="M-30 317C82 253 213 345 385 277" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".43"/>'+
 '<circle cx="319" cy="40" r="20" fill="#fff9d0" opacity=".75"/>'+
 '<circle cx="26" cy="22" r="7" fill="#fff" opacity=".77"/>'+icons+'</svg>';
}
