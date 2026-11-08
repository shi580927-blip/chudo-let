import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../assets/style.css",import.meta.url),"utf8");
const logo=readFileSync(new URL("../assets/brand/chudolet-horizontal.png",import.meta.url));
test("Фирменный PNG действительно включён в шапку и не заменён текстовой имитацией",()=>{
 assert.match(html,/class="brand-logo"/);
 assert.match(html,/src="\.\/assets\/brand\/chudolet-horizontal\.png"/);
 assert.match(html,/alt="Чудолёт/);
 assert.doesNotMatch(html,/class="brand-icon"/);
 assert.match(css,/\.brand-logo\s*\{/);
 assert.match(css,/object-fit:contain/);
});
test("Логотип сохранён оригинальным прозрачным PNG в нужном размере",()=>{
 assert.equal(logo.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
 assert.equal(logo.readUInt32BE(16),2172);
 assert.equal(logo.readUInt32BE(20),724);
 assert.equal(logo[25],6,"RGBA обязателен для прозрачности");
 assert.equal(logo.length,898037,"Источник PNG не должен быть перерисован или пережат");
});
