const REVISION='ca50fa451593f6399c6733beab7856fc9846e6f0';
const CACHE='wonder-city-art-v1';

export async function fetchArt(filename){
 const path='art/'+filename;
 const cacheKey=new URL(path+'?asset='+REVISION,location.href).href;
 let cache;
 try{cache=await caches.open(CACHE);const hit=await cache.match(cacheKey);if(hit)return new Uint8Array(await hit.arrayBuffer());}catch{}
 const controller=new AbortController(),timers=new Set();
 const urls=[new URL(path,location.href).href,`https://cdn.jsdelivr.net/gh/shudetangbei-glitch/new-code@${REVISION}/${path}`,`https://raw.githubusercontent.com/shudetangbei-glitch/new-code/${REVISION}/${path}`];
 const deadline=setTimeout(()=>controller.abort(),45000);
 function delay(ms){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{timers.delete(timer);controller.signal.removeEventListener('abort',abort);resolve();},ms);timers.add(timer);function abort(){clearTimeout(timer);timers.delete(timer);reject(new DOMException('Asset download cancelled','AbortError'));}controller.signal.addEventListener('abort',abort,{once:true});if(controller.signal.aborted)abort();});}
 try{
  const bytes=await Promise.any(urls.map(async(url,index)=>{if(index)await delay(index*2000);const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error(filename+': HTTP '+response.status);const result=new Uint8Array(await response.arrayBuffer());if(!result.length)throw Error(filename+': empty response');return result;}));
  // Cache the winning immutable asset; cache failure must never block rendering.
  if(cache)void cache.put(cacheKey,new Response(bytes)).catch(()=>{});
  return bytes;
 }finally{clearTimeout(deadline);controller.abort();for(const timer of timers)clearTimeout(timer);}
}
