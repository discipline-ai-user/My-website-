(()=>{'use strict';
function getShow(){
  try{if(typeof show==='function')return show}catch(_){ }
  try{if(typeof window.show==='function')return window.show}catch(_){ }
  return null;
}
function openPage(id,e){
  if(!id||id==='routine')return;
  const fn=getShow();
  if(typeof fn!=='function')return;
  if(e){e.preventDefault();}
  fn(id);
}
function wire(){
  document.querySelectorAll('button[data-page]').forEach(b=>{
    b.type='button';
    b.style.pointerEvents='auto';
    b.style.touchAction='manipulation';
    if(b.dataset.navFix2==='1')return;
    b.dataset.navFix2='1';
    b.addEventListener('click',e=>openPage(b.dataset.page,e),false);
  });
}
function start(){
  wire();
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('button[data-page]');
    if(b&&b.dataset.page!=='routine')openPage(b.dataset.page,e);
  },false);
  document.addEventListener('touchend',e=>{
    const b=e.target.closest?.('button[data-page]');
    if(b&&b.dataset.page!=='routine')openPage(b.dataset.page,e);
  },{capture:false,passive:true});
  new MutationObserver(wire).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
