(()=>{
'use strict';
function apply(){
 document.querySelectorAll('button[data-page]').forEach(b=>{
  const id=b.getAttribute('data-page');
  if(!id||id==='routine')return;
  b.type='button';
  b.style.pointerEvents='auto';
  b.style.position='relative';
  b.style.zIndex='99999';
  b.style.touchAction='manipulation';
  b.setAttribute('onclick',`try{show(${JSON.stringify(id)})}catch(e){console.error(e)};return false;`);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
setInterval(apply,1000);
})();
