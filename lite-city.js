export function createLiteCity(main){
 const canvas=document.createElement('canvas');canvas.id='liteScene';canvas.dataset.art='lite-map';canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';main.prepend(canvas);
 const ctx=canvas.getContext('2d'),colors=['#ef7c8f','#70d4c5','#f2cc72','#9ba0ed'];let state;
 function draw(){const {width,height}=main.getBoundingClientRect(),ratio=Math.min(devicePixelRatio,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#b9c9bd';ctx.fillRect(0,0,width,height);const mobile=width<651,top=mobile?190:105,bottom=mobile?225:180,cx=width/2,cy=top+Math.max(100,height-top-bottom)/2,rx=Math.min(width*.41,420),ry=Math.max(70,Math.min((height-top-bottom)*.44,230));
  const points=Array.from({length:24},(_,i)=>{const a=i*Math.PI*2/24;return {x:cx+Math.cos(a)*rx*(1+.06*Math.sin(a*3)),y:cy+Math.sin(a)*ry*(1+.1*Math.cos(a*2))};});
  ctx.lineWidth=30;ctx.lineJoin='round';ctx.strokeStyle='#6c7473';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();
  ctx.lineWidth=1;ctx.setLineDash([6,6]);ctx.strokeStyle='#d4d6c9';ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<24;i++){const p=points[i],owner=state?.props?.[i]?.owner;ctx.fillStyle=i%6===0?'#e0d9a4':owner===undefined?'#dbe2dc':colors[owner];ctx.fillRect(p.x-12,p.y-12,24,24);ctx.strokeStyle='#526461';ctx.strokeRect(p.x-12,p.y-12,24,24);ctx.fillStyle='#273c38';ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText(String(i+1),p.x,p.y+4);}
  ctx.fillStyle='#45695d';ctx.font='600 18px system-ui';ctx.fillText('奇境地产局',cx,cy-5);ctx.font='12px system-ui';ctx.fillText('轻量地图',cx,cy+18);
  state?.players.forEach((player,i)=>{const p=points[player.pos],x=p.x+(i-1.5)*10,y=p.y-20;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fillStyle=colors[i];ctx.fill();ctx.strokeStyle='#243c37';ctx.stroke();ctx.fillStyle='#19322c';ctx.font='bold 10px system-ui';ctx.fillText(String(i+1),x,y+3);});
 }
 const observer=new ResizeObserver(draw);observer.observe(main);draw();
 return {update(value){state=value;draw();},reset(value){state=value;draw();},isMoving:()=>false,isExploring:()=>false,setExploring(){},home:draw,destroy(){observer.disconnect();canvas.remove();}};
}
