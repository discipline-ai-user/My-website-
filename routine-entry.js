(()=>{'use strict';
function open(){
  if(typeof window.openRoutine==='function')return window.openRoutine();
  if(typeof window.openDailyRoutine==='function')return window.openDailyRoutine();
  return false;
}
function add(){
  const n=document.querySelector('.nav');
  if(n){
    let b=n.querySelector('[data-page="routine"]');
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.page='routine';
      b.innerHTML='📅&nbsp; Daily Study Routine';
      n.appendChild(b);
    }
    b.onclick=open;
    b.addEventListener('touchend',e=>{e.preventDefault();open()},{passive:false});
  }
  const q=document.getElementById('routineQuickOpen');
  if(q)q.remove();
}
function start(){
  add();
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-page="routine"]');if(!b)return;e.preventDefault();e.stopPropagation();open();},true);
  new MutationObserver(add).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();