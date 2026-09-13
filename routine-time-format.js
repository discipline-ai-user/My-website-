(()=>{
  'use strict';
  function formatTime(t){
    const p=String(t).split(':');
    const h=Number(p[0]);
    return (h>=13&&h<=15?String(h-12):p[0])+':'+p[1];
  }
  function fix(){
    document.querySelectorAll('.mdr-time').forEach(el=>{
      const old=el.textContent;
      const next=old.replace(/\b(13|14|15):(\d{2})\b/g,(_,h,m)=>formatTime(h+':'+m));
      if(next!==old) el.textContent=next;
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
  new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});
})();
