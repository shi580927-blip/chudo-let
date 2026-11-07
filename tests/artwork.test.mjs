import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {ART_ASSETS,renderSymbol,artAssetPath} from "../src/artwork.mjs";
import {THEMES,generateBundle,validateTask} from "../src/engine.mjs";

test("Все 12 предметов Облачной почты привязаны к отдельным SVG",()=>{
 const all=[...THEMES.clouds.a,...THEMES.clouds.b];
 assert.equal(all.length,12);
 assert.equal(new Set(all).size,12);
 assert.equal(Object.keys(ART_ASSETS.clouds).length,12);
 for(const symbol of all){
  const path=artAssetPath(symbol,"clouds");
  assert.ok(path);
  const svgFile=new URL("../"+path.replace("./",""),import.meta.url);
  assert.ok(existsSync(svgFile),path);
  const xml=readFileSync(svgFile,"utf8");
  assert.match(xml,/<svg\b/);
  assert.match(xml,/<\/svg>/);
  assert.match(xml,/viewBox="0 0 128 128"/);
  assert.doesNotMatch(xml,/<script\b|<foreignObject\b|href\s*=\s*["']https?:/i);
 }
});
test("По умолчанию во всех мирах сохранены объёмные emoji альфы",()=>{
 assert.equal(artAssetPath("✉️","forest"),null);
 assert.equal(renderSymbol("✉️","forest"),"✉️");
 assert.equal(renderSymbol("✉️","clouds"),"✉️");
 assert.equal(renderSymbol("🦊","clouds"),"🦊");
});
test("Наличие иллюстраций не меняет игровые ответы",()=>{
 const bundle=generateBundle({age:"7-9",theme:"clouds",count:20,seed:2077});
 assert.ok(bundle.tasks.every(validateTask));
 assert.equal(renderSymbol("⭐","clouds"),"⭐");
 assert.match(renderSymbol("⭐","clouds","illustrated"),/star\.svg/);
 assert.match(renderSymbol("⭐","clouds","illustrated"),/Звезда/);
});
