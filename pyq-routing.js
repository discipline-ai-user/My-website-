(()=>{
const PYQ_KEY='discipline_ai_pyqs_v3',TEST_KEY='discipline_ai_tests_v4';
const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function title(){return document.querySelector('.page.active .title')?.textContent||''}
function isPyqPage(){return title().includes('PYQ Tests')||title().includes('PYQ History')}
function filterSets(){
 if(!title().includes('PYQ Tests'))return;
 const subject=document.getElementById('pyqSubject')?.value||'';
 const chapter=document.getElementById('pyqChapter')?.value||'';
 document.querySelectorAll('.saved-start').forEach(btn=>{
  const p=load(PYQ_KEY,[]).find(x=>x.id===btn.dataset.id),row=btn.closest('.chapter');
  if(!p||!row)return;
  row.style.display=((!subject||p.subject===subject)&&(!chapter||p.chapter===chapter))?'':'none';
 });
 const card=[...document.querySelectorAll('.card')].find(x=>x.querySelector('.saved-start'));
 if(card){let msg=card.querySelector('.pyq-filter-note');if(!msg){msg=document.createElement('div');msg.className='pyq-filter-note muted';msg.style.margin='8px 0';card.querySelector('.section')?.after(msg)}msg.textContent=chapter?`Showing ${subject} • ${chapter} PYQs only.`:`Showing ${subject} PYQs only.`}
}
function decorate(){
 if(!isPyqPage())return;
 const sets=load(PYQ_KEY,[]);
 document.querySelectorAll('.saved-start').forEach(btn=>{
  const p=sets.find(x=>x.id===btn.dataset.id),row=btn.closest('.chapter');if(!p||!row)return;
  if(!row.dataset.routeFixed){row.dataset.routeFixed='1';const label=document.createElement('span');label.className='muted pyq-route-label';label.style.cssText='margin-right:8px';label.textContent=`${p.subject} • ${p.chapter}`;btn.before(label)}
  if(!row.dataset.removeAdded){row.dataset.removeAdded='1';const del=document.createElement('button');del.type='button';del.className='btn ghost';del.textContent='🗑️ Remove';del.style.marginLeft='8px';del.onclick=()=>{if(!confirm(`Remove ${p.name||'this PYQ set'}?`))return;save(PYQ_KEY,load(PYQ_KEY,[]).filter(x=>x.id!==p.id));save(TEST_KEY,load(TEST_KEY,[]).filter(t=>t.sourcePyqId!==p.id));toast('PYQ set removed.');if(typeof show==='function')show('pyq')};row.appendChild(del)}
  const wrongCount=load(TEST_KEY,[]).filter(t=>t.sourcePyqId===p.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]?.wrongQuestions?.length||0;
  if(wrongCount&&!row.dataset.wrongAdded){row.dataset.wrongAdded='1';const w=document.createElement('button');w.type='button';w.className='btn secondary';w.textContent=`❌ Wrong Test (${wrongCount})`;w.style.marginLeft='8px';w.onclick=()=>startWrongSet(p.id);row.appendChild(w)}
 });
 filterSets();
}
function startWrongSet(id){const ts=load(TEST_KEY,[]),p=load(PYQ_KEY,[]).find(x=>x.id===id);const t=ts.filter(x=>x.sourcePyqId===id&&x.wrongQuestions?.length).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];if(!p||!t){toast('Is PYQ ka koi wrong question saved nahi hai.');return}startQuestionTest(p.subject,p.chapter+' • Wrong Questions',t.wrongQuestions,15,'pyq-wrong',id)}
function addHistoryRemove(){if(!title().includes('PYQ History'))return;document.querySelectorAll('.table tbody tr').forEach(tr=>{if(tr.dataset.removeAdded)return;const c=tr.querySelectorAll('td');if(c.length<6)return;const date=c[0].textContent,subject=c[1].textContent,chapter=c[2].textContent,score=c[3].textContent;const t=load(TEST_KEY,[]).find(x=>x.sourceType==='pyq'&&new Date(x.date).toLocaleString()===date&&x.subject===subject&&x.chapter===chapter&&`${x.score}/${x.total}`===score);if(!t)return;tr.dataset.removeAdded='1';const td=document.createElement('td'),b=document.createElement('button');b.type='button';b.className='btn ghost';b.textContent='🗑️';b.title='Remove test record';b.onclick=()=>{if(!confirm('Remove this test record?'))return;save(TEST_KEY,load(TEST_KEY,[]).filter(x=>x.id!==t.id));toast('Test record removed.');if(typeof show==='function')show('pyqhistory')};td.appendChild(b);tr.appendChild(td)})}
const obs=new MutationObserver(()=>setTimeout(()=>{decorate();addHistoryRemove()},80));if(document.getElementById('pages'))obs.observe(document.getElementById('pages'),{childList:true,subtree:true});setTimeout(()=>{decorate();addHistoryRemove()},300);
document.addEventListener('change',e=>{if(e.target?.id==='pyqSubject'||e.target?.id==='pyqChapter')setTimeout(filterSets,20)});
})();
