(()=>{
function hidePyqMenu(){
 document.querySelectorAll('.nav button[data-page="pyq"]').forEach(b=>b.remove());
 document.querySelectorAll('[data-page="pyq"]').forEach(b=>{if(b.closest('.nav'))b.remove()});
}
const pages=document.getElementById('pages');
if(pages)new MutationObserver(hidePyqMenu).observe(pages,{childList:true,subtree:true});
const side=document.getElementById('side');
if(side)new MutationObserver(hidePyqMenu).observe(side,{childList:true,subtree:true});
setTimeout(hidePyqMenu,100);setTimeout(hidePyqMenu,500);setTimeout(hidePyqMenu,1500);
})();