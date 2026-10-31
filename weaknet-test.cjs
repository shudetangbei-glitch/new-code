const path=require('path'),fs=require('fs'),assert=require('assert');
process.env.PLAYWRIGHT_BROWSERS_PATH=path.join(__dirname,'tmp-browsers');
const {webkit}=require('../sokoban-3d/node_modules/playwright');
(async()=>{
 const browser=await webkit.launch({headless:true});
 try{for(const scenario of (process.env.SCENARIOS||'slow,one-stalled,gzip-failed,all-failed').split(',')){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  if(scenario==='all-failed')await page.addInitScript(()=>{const original=window.fetch;window.modelAttempts=[];window.fetch=function(input,options){const url=String(input);if(/\/art\/[^/]+-city\.glb/.test(url)){window.modelAttempts.push(url);return Promise.reject(new DOMException('Fetch is aborted','AbortError'));}return original.call(this,input,options);};});
  if(scenario!=='normal'&&scenario!=='all-failed')await page.route('**/art/*-city.glb*',async route=>{
   const url=new URL(route.request().url()),filename=path.basename(url.pathname);requests.push(filename);
   if(scenario==='all-failed'||(scenario==='gzip-failed'&&filename.endsWith('.gz')))return route.abort('failed');
   if(scenario==='one-stalled'&&filename.startsWith('animated_woman'))return;
   if(scenario==='slow')await new Promise(resolve=>setTimeout(resolve,21000));
   try{await route.fulfill({body:fs.readFileSync(path.join(__dirname,'art',filename)),contentType:'application/octet-stream'});}catch{}
  });
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8770/wonder-estate.html');
  await page.locator('#visitCity').click({timeout:70000});
  assert.equal(await page.locator('canvas').getAttribute('data-avatar-mode'),scenario==='all-failed'?'built-in':'downloaded');
  if(scenario==='all-failed')requests.push(...await page.evaluate(()=>window.modelAttempts));
  if(scenario!=='normal')assert(requests[0].endsWith('.glb.gz'),'compressed model must be requested first');
  await page.locator('#camera').click();
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.view==='first-person');
  await page.screenshot({path:'weaknet-'+scenario+'.png'});
  await page.locator('#explore').click();await page.locator('#local').click();await page.locator('#startLocal').click();
  await page.locator('#roll').click();await page.locator('#pause').click();await page.reload();await page.locator('#continue').click({timeout:70000});
  await page.locator('#lobby').waitFor({state:'hidden'});
  assert.equal(await page.locator('#pauseLayer').evaluate(e=>getComputedStyle(e).display),'flex');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS WebKit '+scenario+': city, first-person, pause and restored save');
  await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

