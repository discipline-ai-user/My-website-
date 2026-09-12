(()=>{
const PYQ_KEY='discipline_ai_pyqs_v3',TEST_KEY='discipline_ai_tests_v4';
const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const fp=q=>`${q?.text||''}||${(q?.options||[]).join('|')}`;
function sameQuestions(a,b){if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length||!a.length)return false;const indexes=[];for(let i=0;i<Math.min(3,a.length);i++)indexes.push(i);for(let i=Math.max(0,a.length-3);i<a.length;i++)if(!indexes.includes(i))indexes.push(i);return indexes.every(i=>fp(a[i])===fp(b[i]));}
function findPyq(subject,chapter,questions){return load(PYQ_KEY,[]).find(p=>p.subject===subject&&p.chapter===chapter&&sameQuestions(p.questions,questions))||null;}
function getQuestionState(p){const map=p.questionState&&typeof p.questionState==='object'?p.questionState:{};return map;}
function counts(p){const qs=Array.isArray(p.questions)?p.questions:[],map=getQuestionState(p);let right=0,wrong=0;qs.forEach(q=>{if(map[fp(q)]==='right')right++;else if(map[fp(q)]==='wrong')wrong++;});return {right,wrong,total:qs.length};}
function markAttempt(p,questions,userAnswers){
 if(!p||!Array.isArray(questions))return;
 const map=getQuestionState(p);
 questions.forEach((q,i)=>{if(q?.answer<0)return;map[fp(q)]=userAnswers?.[i]===q.answer?'right':'wrong';});
 p.questionState=map;
 const c=counts(p);p.rightCount=c.right;p.wrongCount=c.wrong;p.lastAttemptAt=new Date().toISOString();
}
function startWrong(p){
 const qs=(p.questions||[]).filter(q=>getQuestionState(p)[fp(q)]==='wrong');
 if(!qs.length){toast('Is PYQ ke saare wrong questions ab clear ho gaye hain. 🎉');return;}
 if(typeof startQuestionTest==='function'){
   startQuestionTest(p.subject,p.chapter+' • Wrong Questions',qs,15);
   if(typeof currentTest==='object'&&currentTest){currentTest.sourceType='pyq-wrong';currentTest.sourcePyqId=p.id;currentTest.pyqName=p.name||`${p.subject} — ${p.chapter} PYQ`;currentTest.parentPyqId=p.id;currentTest.isWrongTest=true;}
 }
}
const oldStart=typeof startQuestionTest==='function'?startQuestionTest:null;
if(oldStart){startQuestionTest=function(subject,chapter,questions,mins){const p=findPyq(subject,chapter,questions);const r=oldStart(subject,chapter,questions,mins);if(p&&typeof currentTest==='object'&&currentTest){currentTest.sourceType='pyq';currentTest.sourcePyqId=p.id;currentTest.pyqName=p.name||`${subject} — ${chapter} PYQ`;currentTest.parentPyqId=p.id;}return r;};}
const oldFinish=typeof finishTest==='function'?finishTest:null;
if(oldFinish){finishTest=function(auto){
 const snapshot=currentTest?JSON.parse(JSON.stringify(currentTest)):null;
 const result=oldFinish(auto);
 try{
   if(snapshot?.questions?.length){
     const tests=load(TEST_KEY,[]),last=tests[tests.length-1];
     if(last){
       last.questions=snapshot.questions;
       last.sourceType=snapshot.sourceType||'generated';
       last.sourcePyqId=snapshot.sourcePyqId||null;
       last.parentPyqId=snapshot.parentPyqId||snapshot.sourcePyqId||null;
       last.pyqName=snapshot.pyqName||null;
       last.isWrongTest=Boolean(snapshot.isWrongTest||snapshot.sourceType==='pyq-wrong');
       last.wrongQuestions=snapshot.questions.filter((q,i)=>q.answer>=0&&snapshot.answers?.[i]!==q.answer).map(q=>({...q}));
       last.correctQuestions=snapshot.questions.filter((q,i)=>q.answer>=0&&snapshot.answers?.[i]===q.answer).map(q=>({...q}));
       save(TEST_KEY,tests);
     }
     if(snapshot.parentPyqId||snapshot.sourcePyqId){
       const pyqs=load(PYQ_KEY,[]),p=pyqs.find(x=>x.id===(snapshot.parentPyqId||snapshot.sourcePyqId));
       if(p){markAttempt(p,snapshot.questions,snapshot.answers);p.testedAt=new Date().toISOString();p.attempts=Number(p.attempts||0)+1;save(PYQ_KEY,pyqs);}
     }
   }
 }catch{}
 return result;
};}
function testedRecord(p){return load(TEST_KEY,[]).filter(t=>(t.sourcePyqId===p.id||t.parentPyqId===p.id)).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;}
function deleteTest(id){const tests=load(TEST_KEY,[]),i=tests.findIndex(t=>String(t.id)===String(id));if(i<0)return;const t=tests[i];if(!confirm('Is test record ko delete karna hai? PYQ questions delete nahi honge.'))return;tests.splice(i,1);save(TEST_KEY,tests);toast('Test record deleted.');if(typeof show==='function')show('tests');}
function deletePyq(id){const pyqs=load(PYQ_KEY,[]),i=pyqs.findIndex(p=>String(p.id)===String(id));if(i<0)return;if(!confirm('Is saved PYQ set ko delete karna hai? Iske questions aur progress bhi delete ho jayenge.'))return;pyqs.splice(i,1);save(PYQ_KEY,pyqs);toast('PYQ set deleted.');if(typeof show==='function')show('pyq');}
function openQuestions(p){const old=document.getElementById('pyqQuestionsModal');if(old)old.remove();const qs=Array.isArray(p.questions)?p.questions:[],map=getQuestionState(p),html=qs.map((q,i)=>`<div class="card" style="margin-bottom:10px"><div class="section"><b>Question ${q.originalNumber?esc(q.originalNumber)+'. ':''}${i+1}</b><span class="pill">${map[fp(q)]==='right'?'✅ Right':map[fp(q)]==='wrong'?'❌ Wrong':'Not Attempted'}</span></div><p style="margin:8px 0">${esc(q.text)}</p>${(q.options||[]).map((o,j)=>`<div class="muted" style="margin:4px 0">${String.fromCharCode(65+j)}. ${esc(o)}</div>`).join('')}</div>`).join('');const c=counts(p),modal=document.createElement('div');modal.id='pyqQuestionsModal';modal.innerHTML=`<div class="pyq-modal-backdrop"><div class="card pyq-modal"><div class="section"><div><h2 style="margin:0">📚 ${esc(p.name||'PYQ Test')}</h2><p class="muted" style="margin:4px 0">${c.total} questions • ✅ ${c.right} right • ❌ ${c.wrong} wrong</p></div><button type="button" class="btn secondary" id="closePyqQuestions">✕ Close</button></div><div style="max-height:70vh;overflow:auto;margin-top:14px">${html||'<div class="empty">No questions saved.</div>'}</div></div></div>`;document.body.appendChild(modal);modal.querySelector('#closePyqQuestions').onclick=()=>modal.remove();modal.querySelector('.pyq-modal-backdrop').onclick=e=>{if(e.target===e.currentTarget)modal.remove();};}
function decoratePyq(){const title=document.querySelector('.page.active .title');if(!title||!title.textContent.includes('PYQ Mock Test'))return;document.querySelectorAll('.saved-start').forEach(btn=>{const row=btn.closest('.chapter');if(!row||row.dataset.pyqDecorated==='1')return;const p=load(PYQ_KEY,[]).find(x=>x.id===btn.dataset.id);if(!p)return;row.dataset.pyqDecorated='1';const c=counts(p),meta=row.querySelector('span');if(meta){const badge=document.createElement('span');badge.className='pill';badge.textContent=`${c.total} Q • ✅ ${c.right} • ❌ ${c.wrong}`;meta.appendChild(document.createTextNode(' '));meta.appendChild(badge);}const view=document.createElement('button');view.type='button';view.className='btn ghost';view.textContent='📖 Questions';view.style.marginLeft='8px';view.onclick=()=>openQuestions(p);row.appendChild(view);if(c.wrong){const wrong=document.createElement('button');wrong.type='button';wrong.className='btn secondary';wrong.textContent=`❌ Wrong Test (${c.wrong})`;wrong.style.marginLeft='8px';wrong.onclick=()=>startWrong(p);row.appendChild(wrong);}const del=document.createElement('button');del.type='button';del.className='btn ghost';del.textContent='🗑️ Remove';del.style.marginLeft='8px';del.onclick=()=>deletePyq(p.id);row.appendChild(del);});}
function decorateTests(){const title=document.querySelector('.page.active .title');if(!title||!title.textContent.includes('My Tests'))return;document.querySelectorAll('.table tbody tr').forEach((row,i)=>{if(row.dataset.testDecorated==='1')return;const tests=load(TEST_KEY,[]).slice().reverse(),t=tests[i];if(!t)return;row.dataset.testDecorated='1';const cell=document.createElement('td');cell.innerHTML=`<button type="button" class="btn ghost delete-test" data-id="${esc(t.id)}">🗑️ Remove</button>`;row.appendChild(cell);});const table=document.querySelector('.table');if(table&&!table.querySelector('thead th:last-child')?.textContent?.includes('Action')){table.querySelector('thead tr')?.insertAdjacentHTML('beforeend','<th>Action</th>');}document.querySelectorAll('.delete-test').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.onclick=()=>deleteTest(b.dataset.id);});}
const style=document.createElement('style');style.textContent=`.pyq-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px}.pyq-modal{width:min(900px,100%);max-height:90vh;overflow:hidden}.pyq-modal .card{background:rgba(255,255,255,.025)}.table th:last-child,.table td:last-child{white-space:nowrap}`;document.head.appendChild(style);
const obs=new MutationObserver(()=>setTimeout(()=>{decoratePyq();decorateTests();},50));const pages=document.getElementById('pages');if(pages)obs.observe(pages,{childList:true,subtree:true});setTimeout(()=>{decoratePyq();decorateTests();},250);
})();