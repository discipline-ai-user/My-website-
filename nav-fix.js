(()=>{'use strict';
function openPage(id,e){
  if(!id||id==='routine')return;
  const fn=window.show;
  if(typeof fn!=='function')return;
  if(e){e.preventDefault();e.stopPropagation();}
  fn(id);
}
function wire(){
  document.querySelectorAll('.nav button[data-page], .top button[data-page], button[data-page]').forEach(b=>{
    b.type='button';
    b.style.pointerEvents='auto';
    b.style.touchAction='manipulation';
    b.onclick=function(e){openPage(b.dataset.page,e)};
  });
}
function start(){
  wire();
  document.addEventListener('pointerdown',e=>{
    const b=e.target.closest?.('button[data-page]');
    if(b&&b.dataset.page!=='routine'){e.preventDefault();openPage(b.dataset.page,e);}
  },true);
  document.addEventListener('touchstart',e=>{
    const b=e.target.closest?.('button[data-page]');
    if(b&&b.dataset.page!=='routine'){e.preventDefault();openPage(b.dataset.page,e);}
  },{capture:true,passive:false});
  new MutationObserver(wire).observe(document.body,{childList:true,subtree:true});
  setInterval(wire,1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
