const path=require('path'),fs=require('fs'),assert=require('assert');
process.env.PLAYWRIGHT_BROWSERS_PATH=path.join(__dirname,'tmp-browsers');
const {webkit}=require('../sokoban-3d/node_modules/playwright');
const url=process.env.GAME_URL||'http://127.0.0.1:8770/wonder-estate.html';
async function serve(route,file){try{await route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':'application/octet-stream',headers:{'Access-Control-Allow-Origin':'*'}});}catch{}}
(async()=>{
 const browser=await webkit.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await context.addInitScript(()=>{crypto.getRandomValues=a=>a.fill(5);});
  const page=await context.newPage(),errors=[],modelRoutes=[];let modelsReleased=false;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/art/*-city.glb*',async route=>{if(!modelsReleased){modelRoutes.push(route);return;}await serve(route,path.join('art',path.basename(new URL(route.request().url()).pathname)));});
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#local').click();await page.locator('#startLocal').click();
  await page.waitForFunction(()=>document.querySelector('#scene').dataset.art==='rigged-pbr',{},{timeout:60000});
  assert.equal(await page.locator('#scene').getAttribute('data-avatar-mode'),'built-in');
  await page.locator('#roll').click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.moving==='true');await page.locator('#pause').click();
  await page.waitForTimeout(100);const position=await page.locator('#scene').getAttribute('data-actor'),before=await page.evaluate(()=>localStorage.getItem('wonder-estate-v1'));
  modelsReleased=true;for(const route of modelRoutes)await serve(route,path.join('art',path.basename(new URL(route.request().url()).pathname)));
  await page.waitForFunction(()=>document.querySelector('#scene').dataset.avatarMode==='downloaded',{},{timeout:30000});
  assert.equal(await page.locator('#scene').getAttribute('data-actor'),position);assert.equal(await page.evaluate(()=>localStorage.getItem('wonder-estate-v1')),before);
  assert.equal(await page.locator('#pauseLayer').evaluate(e=>getComputedStyle(e).display),'flex');
  await page.locator('#pause').click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.moving==='false',{},{timeout:30000});assert(await page.locator('#end').isEnabled());
  await page.screenshot({path:'progressive-mobile-upgraded.png'});assert.deepEqual(errors,[]);
  console.log('PASS WebKit: deterministic background avatar release preserves position, path, pause and saved state');await context.close();

  const early=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await early.addInitScript(()=>{crypto.getRandomValues=a=>a.fill(5);});
  const p=await early.newPage(),engineRoutes=[];let engineReleased=false;
  await p.route('**/wonder-city-runtime-*.js',async route=>{if(!engineReleased){engineRoutes.push(route);return;}await serve(route,'wonder-city-runtime-20261101.js');});
  await p.goto(url,{waitUntil:'domcontentloaded'});await p.locator('#local').click();await p.locator('#startLocal').click();
  assert.equal(await p.locator('#scene').getAttribute('data-art'),null);await p.locator('#roll').click();
  const state=await p.evaluate(()=>JSON.parse(localStorage.getItem('wonder-estate-v1')).state);assert.equal(state.players[0].pos,6);
  engineReleased=true;for(const route of engineRoutes)await serve(route,'wonder-city-runtime-20261101.js');
  if(await p.evaluate(()=>document.body.dataset.cityPhase==='fallback')){await p.locator('#menu').click();await p.locator('#menuRetryCity').click();await p.locator('[data-close="menuDialog"]').click();}
  await p.waitForFunction(()=>document.body.dataset.renderMode==='3d',{},{timeout:16000});
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('wonder-estate-v1')).state.version),state.version);assert(await p.locator('#end').isEnabled());
  console.log('PASS WebKit: early game remains authoritative when the held runtime is released');await early.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

