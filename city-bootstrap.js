import {RUNTIME_FILE,RUNTIME_HASH} from './runtime-build-info.js';
export async function loadCityEngine(onProgress=()=>{}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 const urls=[new URL(RUNTIME_FILE,location.href).href,`https://cdn.jsdelivr.net/gh/shudetangbei-glitch/new-code@main/${RUNTIME_FILE}`,`https://raw.githubusercontent.com/shudetangbei-glitch/new-code/main/${RUNTIME_FILE}`];
 function delay(ms){return new Promise((resolve,reject)=>{const id=setTimeout(done,ms);function done(){controller.signal.removeEventListener('abort',abort);resolve();}function abort(){clearTimeout(id);reject(new DOMException('3D download timed out','AbortError'));}controller.signal.addEventListener('abort',abort,{once:true});if(controller.signal.aborted)abort();});}
 let source;try{source=await Promise.any(urls.map(async(url,index)=>{if(index)await delay(index*1500);onProgress('connecting',index);const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);const text=await response.text();if(crypto.subtle){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));const hash=Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');if(hash!==RUNTIME_HASH)throw Error('3D version mismatch');}return text;}));}finally{clearTimeout(timer);controller.abort();}
 const blob=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));try{return await import(blob);}finally{URL.revokeObjectURL(blob);}
}
