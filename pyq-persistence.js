(()=>{
  const PYQ_KEY='discipline_ai_pyqs_v3';
  const TEST_KEY='discipline_ai_tests_v4';
  const ACTIVE_KEY='discipline_ai_active_test_v1';
  const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function sameQuestions(a,b){
    if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;
    const pick=q=>`${q?.text||''}||${(q?.options||[]).join('|')}`;
    if(!a.length)return false;
    const indexes=[];
    for(let i=0;i<Math.min(3,a.length);i++)indexes.push(i);
    for(let i=Math.max(0,a.length-3);i<a.length;i++)if(!indexes.includes(i))indexes.push(i);
    return indexes.every(i=>pick(a[i])===pick(b[i]));
  }

  function findPyq(subject,chapter,questions){
    const pyqs=load(PYQ_KEY,[]);
    return pyqs.find(p=>p.subject===subject&&p.chapter===chapter&&sameQuestions(p.questions,questions))||null;
  }

  function saveActive(){
    try{
      if(typeof currentTest==='object'&&currentTest?.questions?.length){
        localStorage.setItem(ACTIVE_KEY,JSON.stringify({test:currentTest,index:qIndex,answers,timeLeft}));
      }
    }catch{}
  }

  const oldStart=typeof startQuestionTest==='function'?startQuestionTest:null;
  if(oldStart){
    startQuestionTest=function(subject,chapter,questions,mins){
      const p=findPyq(subject,chapter,questions);
      const r=oldStart(subject,chapter,questions,mins);
      if(p&&typeof currentTest==='object'){
        currentTest.sourceType='pyq';
        currentTest.sourcePyqId=p.id;
        currentTest.pyqName=p.name||`${subject} — ${chapter} PYQ`;
        saveActive();
      }
      return r;
    };
  }

  const oldFinish=typeof finishTest==='function'?finishTest:null;
  if(oldFinish){
    finishTest=function(auto){
      const snapshot=currentTest?JSON.parse(JSON.stringify(currentTest)):null;
      const result=oldFinish(auto);
      try{
        if(snapshot?.questions?.length){
          const tests=load(TEST_KEY,[]);
          const last=tests[tests.length-1];
          if(last){
            last.questions=snapshot.questions;
            last.sourceType=snapshot.sourceType||'generated';
            last.sourcePyqId=snapshot.sourcePyqId||null;
            last.pyqName=snapshot.pyqName||null;
            save(TEST_KEY,tests);
          }
          if(snapshot.sourcePyqId){
            const pyqs=load(PYQ_KEY,[]);
            const p=pyqs.find(x=>x.id===snapshot.sourcePyqId);
            if(p){
              p.testedAt=new Date().toISOString();
              p.attempts=Number(p.attempts||0)+1;
              save(PYQ_KEY,pyqs);
            }
          }
        }
      }catch{}
      return result;
    };
  }

  function testedRecord(p){
    const tests=load(TEST_KEY,[]);
    return tests.filter(t=>t.sourcePyqId===p.id || (!t.sourcePyqId&&t.subject===p.subject&&t.chapter===p.chapter&&Number(t.total)===Number(p.questions?.length))).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;
  }

  function openQuestions(p){
    const old=document.getElementById('pyqQuestionsModal');
    if(old)old.remove();
    const qs=Array.isArray(p.questions)?p.questions:[];
    const html=qs.map((q,i)=>`<div class="card" style="margin-bottom:10px"><b>Question ${q.originalNumber?esc(q.originalNumber)+'. ':''}${i+1}</b><p style="margin:8px 0">${esc(q.text)}</p>${(q.options||[]).map((o,j)=>`<div class="muted" style="margin:4px 0">${String.fromCharCode(65+j)}. ${esc(o)}</div>`).join('')}</div>`).join('');
    const modal=document.createElement('div');
    modal.id='pyqQuestionsModal';
    modal.innerHTML=`<div class="pyq-modal-backdrop"><div class="card pyq-modal"><div class="section"><div><h2 style="margin:0">📚 ${esc(p.name||'PYQ Test')}</h2><p class="muted" style="margin:4px 0">${qs.length} questions • ${testedRecord(p)?'Tested':'Not tested yet'}</p></div><button type="button" class="btn secondary" id="closePyqQuestions">✕ Close</button></div><div style="max-height:70vh;overflow:auto;margin-top:14px">${html||'<div class="empty">No questions saved.</div>'}</div></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#closePyqQuestions').onclick=()=>modal.remove();
    modal.querySelector('.pyq-modal-backdrop').onclick=e=>{if(e.target===e.currentTarget)modal.remove()};
  }

  function decorate(){
    const title=document.querySelector('.page.active .title');
    if(!title||!title.textContent.includes('PYQ Mock Test'))return;
    document.querySelectorAll('.saved-start').forEach(btn=>{
      const row=btn.closest('.chapter');
      if(!row||row.dataset.pyqDecorated==='1')return;
      const p=load(PYQ_KEY,[]).find(x=>x.id===btn.dataset.id);
      if(!p)return;
      row.dataset.pyqDecorated='1';
      const tested=testedRecord(p);
      const meta=row.querySelector('span');
      if(meta){
        const badge=document.createElement('span');
        badge.className='pill';
        badge.textContent=tested?`✅ Tested • ${tested.percent}% • ${tested.score}/${tested.total}`:'🕘 Not Tested';
        meta.appendChild(document.createTextNode(' '));
        meta.appendChild(badge);
      }
      const view=document.createElement('button');
      view.type='button'; view.className='btn ghost'; view.textContent='📖 View Questions';
      view.style.marginLeft='8px';
      view.onclick=()=>openQuestions(p);
      row.appendChild(view);
    });
  }

  const style=document.createElement('style');
  style.textContent=`.pyq-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px}.pyq-modal{width:min(900px,100%);max-height:90vh;overflow:hidden}.pyq-modal .card{background:rgba(255,255,255,.025)}`;
  document.head.appendChild(style);

  const obs=new MutationObserver(()=>setTimeout(decorate,50));
  const pages=document.getElementById('pages');
  if(pages)obs.observe(pages,{childList:true,subtree:true});
  setTimeout(decorate,200);
})();
