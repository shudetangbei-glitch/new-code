const {chromium}=require('../sokoban-3d/node_modules/playwright'),fs=require('fs');
const report={checks:[],issues:[],errors:[]};
const url=process.env.GAME_URL||'https://shudetangbei-glitch.github.io/new-code/wonder-estate.html?v=journey-1';
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('wonder-estate-v1')));
async function check(name,fn){try{const result=await fn();report.checks.push({name,result});console.log('CHECK',name,JSON.stringify(result));}catch(e){report.issues.push({name,error:e.message});console.log('ISSUE',name,e.message);}}
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const contexts=await Promise.all([browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true}),browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})]);
 const a=await contexts[0].newPage(),b=await contexts[1].newPage();
 for(const p of [a,b]){p.on('pageerror',e=>report.errors.push(e.message));await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.locator('#lobby').waitFor({state:'visible',timeout:180000});}
 await a.locator('#name').fill('测试房主');await a.locator('#create').click({timeout:30000});await a.locator('#lobby').waitFor({state:'hidden'});const code=(await saved(a)).code;report.room=code;console.log('ROOM',code);
 await b.locator('#name').fill('测试朋友');await b.locator('#code').fill(code);await b.locator('#join').click();await b.locator('#lobby').waitFor({state:'hidden'});
 await check('two-player synchronization',async()=>{await a.waitForFunction(()=>JSON.parse(localStorage.getItem('wonder-estate-v1')).state.players.length===2);return {host:(await saved(a)).seat,guest:(await saved(b)).seat};});
 await check('mobile toolbar bounds',async()=>{const issues=[];for(const width of [320,375,390]){await a.setViewportSize({width,height:812});for(const button of await a.locator('.tools button').all()){const box=await button.boundingBox();if(box&&(box.x<0||box.x+box.width>width))issues.push({width,id:await button.getAttribute('id'),box});}}if(issues.length)throw Error(JSON.stringify(issues));return 'all inside viewport';});
 await a.setViewportSize({width:375,height:812});
 await a.locator('#roll').click();await a.waitForFunction(()=>JSON.parse(localStorage.getItem('wonder-estate-v1')).state.status==='playing');
 for(const [p,label] of [[a,'host'],[b,'guest']])await check(label+' roll, movement, purchase and end turn',async()=>{
  await p.locator('#roll').click({timeout:30000});await p.waitForFunction(()=>JSON.parse(localStorage.getItem('wonder-estate-v1')).state.rolled);
  const during={moving:await p.locator('canvas').getAttribute('data-moving'),endEnabled:await p.locator('#end').isEnabled()};
  await p.waitForFunction(()=>document.querySelector('canvas').dataset.moving==='false',{},{timeout:30000});
  const before=await saved(p);let bought=false;if(await p.locator('#buy').isEnabled()){await p.locator('#buy').click();await p.waitForFunction(v=>JSON.parse(localStorage.getItem('wonder-estate-v1')).state.version>v,before.state.version);bought=true;}
  await p.locator('#end').click();await p.waitForFunction(t=>JSON.parse(localStorage.getItem('wonder-estate-v1')).state.turn!==t,before.state.turn);
  if(during.moving==='true'&&during.endEnabled)report.issues.push({name:'turn can end before walking finishes',player:label});return {during,bought};
 });
 await b.locator('#pause').click();await a.waitForFunction(()=>getComputedStyle(document.querySelector('#pauseLayer')).display==='flex');
 await check('global pause and identity restore',async()=>{await b.reload({waitUntil:'domcontentloaded'});await b.locator('#continue').click({timeout:180000});await b.locator('#lobby').waitFor({state:'hidden'});const data=await saved(b);if(data.seat!==1||data.state.status!=='paused')throw Error('identity or pause lost');return {seat:data.seat,status:data.state.status};});
 await check('paused lobby city walking',async()=>{await b.locator('#menu').click();await b.locator('#saveExit').click();await b.locator('#visitCity').click();await b.waitForTimeout(300);const before=await b.locator('canvas').getAttribute('data-actor'),button=await b.locator('#walkPad button').first().boundingBox();await b.mouse.move(button.x+button.width/2,button.y+button.height/2);await b.mouse.down();await b.waitForTimeout(1500);await b.mouse.up();const after=await b.locator('canvas').getAttribute('data-actor');await b.screenshot({path:'audit-paused-walk.png'});if(before===after)throw Error('movement remains frozen by saved game pause');return {before,after};});
 await check('return from roam to saved game',async()=>{await b.locator('#menu').click();await b.locator('#saveExit').click();await b.locator('#continue').click();await b.locator('#lobby').waitFor({state:'hidden'});const visible=await b.locator('.action').isVisible();await b.screenshot({path:'audit-return-game.png'});if(!visible)throw Error('game controls remain hidden after continuing from roam');return 'controls visible';});
 await a.screenshot({path:'audit-online-mobile.png'});
}finally{fs.writeFileSync('journey-audit-report.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));if(report.issues.length||report.errors.length)process.exitCode=1;}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
