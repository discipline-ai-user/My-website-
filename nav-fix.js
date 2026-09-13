(()=>{'use strict';
function openPage(id,e){
  if(!id||id==='routine')return;
  const fn=window.show;
  if(typeof fn!=='function')return;
  if(e){e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();}
  fn(id);
}
function wire(){
  document.querySelectorAll('[data-page]').forEach(b=>{
    if(b.dataset.navFix==='1')return;
    b.dataset.navFix='1';
    b.type='button';
    b.style.cursor='pointer';
    b.addEventListener('click',e=>openPage(b.dataset.page,e),true);
    b.addEventListener('pointerup',e=>{
      if(e.pointerType==='touch')openPage(b.dataset.page,e);
    },true);
  });
}
function start(){
  wire();
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-page]');
    if(b&&b.dataset.page!=='routine')openPage(b.dataset.page,e);
  },true);
  document.addEventListener('touchend',e=>{
    const b=e.target.closest?.('[data-page]');
    if(b&&b.dataset.page!=='routine')openPage(b.dataset.page,e);
  },true);
  new MutationObserver(wire).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
