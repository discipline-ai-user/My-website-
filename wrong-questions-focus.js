(()=>{'use strict';
const KEY='discipline_ai_tests_v4';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function render(){
 const p=document.getElementById('pages'); if(!p)return;
 const ts=load(),groups=[];
 ts.forEach(t=>{
   const bad=(t.questions||[]).map((q,i)=>({q,i})).filter(x=>x.q?.answer>=0 && t.answers?.[x.i]!==x.q.answer);
   if(bad.length)groups.push({t,bad});
 });
 const total=groups.reduce((n,g)=>n+g.bad.length,0);
 p.innerHTML=typeof window.page==='function'?window.page('Wrong Questions','Sirf galat questions ka focused practice.',`
 <div class="card"><div class="section"><h3>❌ Mistakes Only</h3><span class="pill">${total} questions</span></div>
 ${groups.length?groups.map(g=>`<div class="card" style="margin-top:12px"><b>${esc(g.t.subject)} • ${esc(g.t.chapter)}</b><small class="muted" style="display:block">${new Date(g.t.date).toLocaleString()}</small>
 ${g.bad.map((x,i)=>`<div class="chapter"><span>${i+1}. ${esc(x.q.text)}<br><small class="muted">Your: ${g.t.answers?.[x.i]==null?'Unanswered':esc(x.q.options?.[g.t.answers?.[x.i]]||'—')} • Correct: ${esc(x.q.options?.[x.q.answer]||'—')}</small></span><button class="btn secondary wq-practice" data-t="${g.t.id}" data-q="${x.i}">Practice</button></div>`).join('')}
 <button class="btn wq-all" data-t="${g.t.id}">Practice All Mistakes</button></div>`).join(''):'<div class="empty">🎉 Abhi koi wrong question nahi hai.</div>'}
 </div>`);
 document.querySelectorAll('.wq-practice').forEach(b=>b.onclick=()=>start(b.dataset.t,[Number(b.dataset.q)]));
 document.querySelectorAll('.wq-all').forEach(b=>b.onclick=()=>{const g=groups.find(x=>String(x.t.id)===String(b.dataset.t));start(b.dataset.t,g?g.bad.map(x=>x.i):[])});
 function start(id,idx){const t=ts.find(x=>String(x.id)===String(id)),qs=(idx||[]).map(i=>t?.questions?.[i]).filter(Boolean);if(!qs.length)return;window.startQuestionTest?.(t.subject,t.chapter+' • Wrong Questions',qs,Math.max(5,Math.ceil((t.elapsed||300)/60)),'wrong',t.sourcePyqId||null)}
}
window.openWrongQuestionsFocus=render;
})();