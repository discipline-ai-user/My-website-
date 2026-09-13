(()=>{'use strict';
function openRoutineDirect(e){
  if(e){e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();}
  const fn=window.openRoutine;
  if(typeof fn==='function'){fn();return false;}
  if(typeof window.show==='function'){window.show('routine');return false;}
  return false;
}
function wire(){
  document.querySelectorAll('[data-page="routine"], [data-routine-open="1"]').forEach(b=>{
    // Do not let app.js treat Routine as a normal page route.
    b.removeAttribute('data-page');
    b.setAttribute('data-routine-open','1');
    b.type='button';
    b.style.cursor='pointer';
    b.onclick=openRoutineDirect;
    b.ontouchend=openRoutineDirect;
    b.onpointerup=openRoutineDirect;
  });
}
function start(){
  wire();
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-routine-open="1"]');
    if(b)openRoutineDirect(e);
  },true);
  document.addEventListener('touchend',e=>{
    const b=e.target.closest?.('[data-routine-open="1"]');
    if(b)openRoutineDirect(e);
  },true);
  new MutationObserver(wire).observe(document.body,{childList:true,subtree:true});
  setInterval(wire,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();