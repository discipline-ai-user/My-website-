(()=>{
const PYQ_KEY='discipline_ai_pyqs_v3',TEST_KEY='discipline_ai_tests_v4';
const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function renderWrong(){
 const pages=document.getElementById('pages');
 if(!pages||!document.querySelector('.page.active .title')?.textContent?.includes('PYQ Mock Test'))return;
 if(pages.dataset.wrongPyq==='1')return;
 pages.dataset.wrongPyq='1';
 const pyqs=load(PYQ_KEY,[]),tests=load(TEST_KEY,[]);
 const rows=pyqs.map(p=>{const attempts=tests.filter(t=>t.sourcePyqId===p.id&&Array.isArray(t.wrongQuestions));const last=attempts.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];return {p,last}}).filter(x=>x.last?.wrongQuestions?.length);
 const block=document.createElement('div');block.className='card';block.style.marginTop='15px';block.innerHTML=`<div class="section"><div><h3>❌ Wrong Questions Practice</h3><p class="muted">Har PYQ test ke wrong questions yahan automatically save honge.</p></div><span class="pill">${rows.reduce((n,x)=>n+x.last.wrongQuestions.length,0)} saved</span></div><div id="wrongPyqRows">${rows.length?rows.map(x=>`<div class="chapter"><span><b>${esc(x.p.name)}</b><br><small class="muted">${x.last.wrongQuestions.length} wrong • Last test ${new Date(x.last.date).toLocaleString()}</small></span><button type="button" class="btn secondary wrong-pyq-start" data-pyqid="${esc(x.p.id)}">Start Wrong Test</button></div>`).join(''):'<div class="empty">Abhi kisi PYQ test me wrong questions nahi hain.</div>'}</div>`;
 pages.querySelector('.page.active')?.appendChild(block);
 block.querySelectorAll('.wrong-pyq-start').forEach(b=>b.onclick=()=>{const p=load(PYQ_KEY,[]).find(x=>x.id===b.dataset.pyqid),t=load(TEST_KEY,[]).filter(x=>x.sourcePyqId===b.dataset.pyqid&&x.wrongQuestions?.length).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];if(!p||!t)return;const qs=t.wrongQuestions;if(typeof startQuestionTest==='function')startQuestionTest(p.subject,p.chapter+' • Wrong Questions',qs,15)});
}
const obs=new MutationObserver(()=>setTimeout(renderWrong,50));
const p=document.getElementById('pages');if(p)obs.observe(p,{childList:true,subtree:true});
setTimeout(renderWrong,300);
})();