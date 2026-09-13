(()=>{'use strict';
function openRoutineNow(){
  try{
    if(typeof window.openRoutine==='function'){
      const ok=window.openRoutine();
      if(ok!==false){document.querySelectorAll('[data-page="routine"]').forEach(b=>b.blur());document.getElementById('side')?.classList.remove('open');return true;}
    }
    if(typeof window.show==='function'){
      window.show('routine');
      return true;
    }
  }catch(e){console.error('Daily Study Routine open error:',e)}
  return false;
}
function handle(e){
  const b=e.target?.closest?.('[data-page="routine"]');
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  openRoutineNow();
}
function wire(){
  document.querySelectorAll('[data-page="routine"]').forEach(b=>{
    b.style.cursor='pointer';
    b.setAttribute('role','button');
    b.onclick=e=>{e.preventDefault();e.stopPropagation();openRoutineNow()};
  });
}
['click','pointerup','touchend'].forEach(type=>document.addEventListener(type,handle,true));
wire();
new MutationObserver(wire).observe(document.body,{childList:true,subtree:true});
})();