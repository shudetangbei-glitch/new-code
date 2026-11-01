export function bindDirectionPad(pad,onChange,doc=document){
 const pointers=new Map();
 const emit=()=>onChange(new Set([...pointers.values()].filter(Boolean)));
 const keyAt=(x,y)=>{const button=doc.elementFromPoint(x,y)?.closest('[data-direction]');return button&&pad.contains(button)?button.dataset.direction:null;};
 function release(event){if(!pointers.has(event.pointerId))return;pointers.delete(event.pointerId);emit();}
 pad.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;const key=keyAt(event.clientX,event.clientY);if(!key)return;event.preventDefault();pointers.set(event.pointerId,key);pad.setPointerCapture(event.pointerId);emit();});
 pad.addEventListener('pointermove',event=>{if(!pointers.has(event.pointerId))return;event.preventDefault();const key=keyAt(event.clientX,event.clientY);if(key!==pointers.get(event.pointerId)){pointers.set(event.pointerId,key);emit();}});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,release);
 pad.addEventListener('contextmenu',event=>event.preventDefault());
 return {clear(){if(!pointers.size)return;pointers.clear();emit();}};
}
