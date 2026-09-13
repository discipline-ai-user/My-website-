(()=>{'use strict';
function openRoutineNow(){
  if(typeof window.openRoutine==='function'){
    window.openRoutine();
    document.querySelectorAll('[data-page="routine"]').forEach(b=>b.blur());
    return true;
  }
  return false;
}
function wire(){
  document.querySelectorAll('[data-page="routine"]').forEach(b=>{
    b.onclick=e=>{e.preventDefault();e.stopPropagation();openRoutineNow();};
    b.style.cursor='pointer';
  });
}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-page="routine"]');
  if(b){e.preventDefault();e.stopPropagation();openRoutineNow();}
},true);
wire();
new MutationObserver(wire).observe(document.body,{childList:true,subtree:true});
})();