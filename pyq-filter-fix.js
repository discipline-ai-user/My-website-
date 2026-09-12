(()=>{
const K='discipline_ai_pyqs_v3';
const get=()=>{try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}};
function apply(){
 const s=document.getElementById('pyqSubject'); const c=document.getElementById('pyqChapter');
 if(!s||!c)return;
 const subject=s.value, chapter=c.value;
 document.querySelectorAll('.saved-start').forEach(btn=>{
  const p=get().find(x=>String(x.id)===String(btn.dataset.id));
  const row=btn.closest('.chapter'); if(!p||!row)return;
  const ok=String(p.subject||'')===String(subject||'') && (!chapter||String(p.chapter||'')===String(chapter));
  row.hidden=!ok;
 });
 const rows=[...document.querySelectorAll('.saved-start')].map(b=>b.closest('.chapter')).filter(Boolean);
 const card=rows[0]?.closest('.card');
 if(card){let n=card.querySelector('.pyq-only-note');if(!n){n=document.createElement('div');n.className='muted pyq-only-note';n.style.margin='8px 0';card.querySelector('.section')?.after(n)}n.textContent=chapter?`Showing only ${subject} • ${chapter} PYQs.`:`Showing only ${subject} PYQs.`}
}
function boot(){apply();document.getElementById('pyqSubject')?.addEventListener('change',()=>setTimeout(apply,30));document.getElementById('pyqChapter')?.addEventListener('change',()=>setTimeout(apply,30));}
new MutationObserver(()=>setTimeout(boot,30)).observe(document.getElementById('pages')||document.body,{childList:true,subtree:true});setTimeout(boot,100);
})();
