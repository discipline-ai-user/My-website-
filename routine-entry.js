(()=>{'use strict';
function add(){
  const n=document.querySelector('.nav');
  if(n){
    let b=n.querySelector('[data-page="routine"]');
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.page='routine';
      b.innerHTML='📅&nbsp; Daily Study Routine';
      b.onclick=()=>window.show?.('routine');
      n.appendChild(b);
    }
  }
  const q=document.getElementById('routineQuickOpen');
  if(q)q.remove();
}
function start(){add();new MutationObserver(add).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();