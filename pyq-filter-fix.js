(()=>{
const K='discipline_ai_pyqs_v3';
const get=()=>{try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}};
function apply(){
 const s=document.getElementById('pyqSubject'); const c=document.getElementById('pyqChapter');
 if(!s||!c)return;
 const subject=String(s.value||'');
 const chapter=String(c.value||'');
 document.querySelectorAll('.saved-start').forEach(btn=>{
  const p=get().find(x=>String(x.id)===String(btn.dataset.id));
  const row=btn.closest('.chapter');
  if(!row)return;
  const ok=!!p && String(p.subject||'')===subject && (!chapter || String(p.chapter||'')===chapter);
  row.style.display=ok?'flex':'none';
  row.hidden=!ok;
 });
 const card=document.querySelector('.saved-start')?.closest('.card');
 if(card){
  let n=card.querySelector('.pyq-only-note');
  if(!n){n=document.createElement('div');n.className='muted pyq-only-note';n.style.margin='8px 0';card.querySelector('.section')?.after(n)}
  n.textContent=chapter?`Showing only ${subject} • ${chapter} PYQs.`:`Showing only ${subject} PYQs.`;
 }
}
function boot(){
 apply();
 document.getElementById('pyqSubject')?.addEventListener('change',()=>setTimeout(apply,50));
 document.getElementById('pyqChapter')?.addEventListener('change',()=>setTimeout(apply,50));
}
const root=document.getElementById('pages')||document.body;
new MutationObserver(()=>setTimeout(apply,30)).observe(root,{childList:true,subtree:true});
setTimeout(boot,100);
})();
