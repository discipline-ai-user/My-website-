(()=>{
const PYQ_KEY='discipline_ai_pyqs_v3',TEST_KEY='discipline_ai_tests_v4';
const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function currentSubject(){return document.querySelector('.page.active .title')?.textContent||''}
function isPyqPage(){return currentSubject().includes('PYQ Tests')||currentSubject().includes('PYQ History')}
function decoratePyq(){
 if(!isPyqPage())return;
 const page=document.querySelector('.page.active');if(!page)return;
 const sets=load(PYQ_KEY,[]);
 page.querySelectorAll('.saved-start').forEach(btn=>{
  const p=sets.find(x=>x.id===btn.dataset.id);if(!p)return;
  const row=btn.closest('.chapter');if(!row||row.dataset.routeFixed)return;row.dataset.routeFixed='1';
  const wrongCount=load(TEST_KEY,[]).filter(t=>t.sourcePyqId===p.id).reduce((n,t)=>Math.max(n,t.wrongQuestions?.length||0),0);
  btn.insertAdjacentHTML('beforebegin',`<span class="muted pyq-route-label" style="margin-right:8px">${esc(p.subject)} • ${esc(p.chapter)}</span>`);
  if(wrongCount){const w=document.createElement('button');w.className='btn secondary';w.type='button';w.textContent=`❌ Wrong Test (${wrongCount})`;w.style.marginLeft='8px';w.onclick=()=>startWrongSet(p.id);row.appendChild(w)}
 });
}
function startWrongSet(id){
 const tests=load(TEST_KEY,[]),pyqs=load(PYQ_KEY,[]),p=pyqs.find(x=>x.id===id);
 if(!p)return;
 const t=tests.filter(x=>x.sourcePyqId===id&&Array.isArray(x.wrongQuestions)&&x.wrongQuestions.length).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
 if(!t){toast('Is PYQ ka koi wrong question nahi hai.');return}
 startQuestionTest(p.subject,p.chapter+' • Wrong Questions',t.wrongQuestions,15,'pyq-wrong',id);
}
const oldStart=window.startQuestionTest;
if(typeof oldStart==='function')window.startQuestionTest=function(subject,chapter,questions,mins,...rest){return oldStart.call(this,subject,chapter,questions,mins,...rest)};
const oldFinish=window.finishTest;
if(typeof oldFinish==='function')window.finishTest=function(auto){
 const snap=currentTest?JSON.parse(JSON.stringify(currentTest)):null;
 const result=oldFinish.call(this,auto);
 try{
  if(snap?.sourcePyqId&&Array.isArray(snap.questions)){
   const tests=load(TEST_KEY,[]),last=tests[tests.length-1];
   if(last){
    last.sourcePyqId=snap.sourcePyqId;
    last.sourceType=snap.sourceType||'pyq';
    const wrong=snap.questions.filter((q,i)=>!(q.answer>=0&&snap.answers?.[i]===q.answer)).map((q)=>({...q}));
    last.wrongQuestions=wrong;
    save(TEST_KEY,tests);
   }
   const p=load(PYQ_KEY,[]).find(x=>x.id===snap.sourcePyqId);
   if(p){p.lastWrongCount=last?.wrongQuestions?.length||0;p.attempts=Number(p.attempts||0)+1;save(PYQ_KEY,load(PYQ_KEY,[]));}
  }
 }catch(e){}
 return result;
};
function addRemoveButtons(){
 if(!isPyqPage())return;
 const page=document.querySelector('.page.active');if(!page)return;
 page.querySelectorAll('.saved-start').forEach(btn=>{
  const row=btn.closest('.chapter');if(!row||row.dataset.removeAdded)return;row.dataset.removeAdded='1';
  const del=document.createElement('button');del.type='button';del.className='btn ghost';del.textContent='🗑️ Remove';del.style.marginLeft='8px';del.onclick=()=>{const p=load(PYQ_KEY,[]).find(x=>x.id===btn.dataset.id);if(!p)return;if(!confirm(`Remove ${p.name||'this PYQ set'}?`))return;save(PYQ_KEY,load(PYQ_KEY,[]).filter(x=>x.id!==p.id));save(TEST_KEY,load(TEST_KEY,[]).filter(t=>t.sourcePyqId!==p.id));toast('PYQ set removed.');if(typeof show==='function')show('pyq')};row.appendChild(del);
 });
 page.querySelectorAll('table tbody tr').forEach(tr=>{if(tr.dataset.removeAdded)return;const cells=tr.querySelectorAll('td');if(!cells.length)return;const date=cells[0]?.textContent||'';const subject=cells[1]?.textContent||'';const chapter=cells[2]?.textContent||'';const score=cells[3]?.textContent||'';const t=load(TEST_KEY,[]).find(x=>x.sourceType==='pyq'&&new Date(x.date).toLocaleString()===date&&x.subject===subject&&x.chapter===chapter&&`${x.score}/${x.total}`===score);if(!t)return;tr.dataset.removeAdded='1';const td=document.createElement('td');const del=document.createElement('button');del.className='btn ghost';del.type='button';del.textContent='🗑️';del.title='Remove test record';del.onclick=()=>{if(!confirm('Remove this test record?'))return;save(TEST_KEY,load(TEST_KEY,[]).filter(x=>x.id!==t.id));toast('Test record removed.');if(typeof show==='function')show('pyqhistory')};td.appendChild(del);tr.appendChild(td);});
}
const obs=new MutationObserver(()=>setTimeout(()=>{decoratePyq();addRemoveButtons()},80));
if(document.getElementById('pages'))obs.observe(document.getElementById('pages'),{childList:true,subtree:true});
setTimeout(()=>{decoratePyq();addRemoveButtons()},300);
})();
