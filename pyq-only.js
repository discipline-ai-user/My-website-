(()=>{
  'use strict';

  const KEEP='pyq';
  let routineReady=false;

  function qs(s){return document.querySelector(s)}

  function removeExtraNav(){
    const nav=qs('.nav');
    if(!nav)return;
    nav.querySelectorAll('button').forEach(b=>{
      const id=b.getAttribute('data-page');
      const routine=b.getAttribute('data-routine-open')==='1';
      const text=(b.textContent||'').trim();
      if(routine || /My Day Routine/i.test(text)) b.remove();
      else if(id && id!==KEEP) b.remove();
      else if(/Dashboard|Settings|Mock|History|Wrong|Weak|Practice|Progress|AI Tutor|My Tests|Syllabus/i.test(text) && id!==KEEP) b.remove();
    });

    if(!nav.querySelector('#dailyRoutineOnly')){
      const b=document.createElement('button');
      b.type='button';
      b.id='dailyRoutineOnly';
      b.innerHTML='📅&nbsp; Daily Study Routine';
      b.onclick=()=>{
        if(typeof window.openRoutine==='function') window.openRoutine();
        else if(typeof openRoutine==='function') openRoutine();
        else alert('Daily Study Routine abhi load ho rahi hai.');
      };
      nav.appendChild(b);
    }
  }

  function cleanTop(){
    document.querySelectorAll('.top [data-page]').forEach(b=>{
      if(b.getAttribute('data-page')!=='pyq')b.remove();
    });
  }

  function cleanResult(){
    const page=qs('#pages .page');
    if(!page)return;
    const title=(page.querySelector('.title')?.textContent||'').toLowerCase();
    if(!title.includes('result') && !page.querySelector('.result-main'))return;
    page.querySelectorAll('[data-page]').forEach(b=>{
      if(b.getAttribute('data-page')!=='pyq')b.remove();
    });
    if(!page.querySelector('#backToPyq')){
      const box=page.querySelector('.actions')||page;
      const b=document.createElement('button');
      b.type='button';b.className='btn secondary';b.id='backToPyq';b.textContent='📚 Back to PYQ Tests';
      b.onclick=()=>{if(typeof window.show==='function')window.show('pyq')};
      box.appendChild(b);
    }
  }

  function analysisPrompt(t){
    const questions=Array.isArray(t?.questions)?t.questions:[];
    const answers=Array.isArray(t?.answers)?t.answers:[];
    const rows=questions.map((q,i)=>({
      no:i+1,
      question:q?.question||q?.text||q?.q||'',
      options:q?.options||[],
      correct:q?.answer??q?.correctAnswer??q?.correct??q?.answerIndex??'',
      student:answers[i]??null
    }));
    return `You are a Class 12 Bihar Board Science PYQ performance analyst. Analyze this student's PYQ test in simple Hinglish. Do not invent facts or questions. Give: 1) score/accuracy summary, 2) likely weak concepts based only on the supplied questions and answers, 3) question numbers that need revision, 4) a short 3-step improvement plan, 5) what to revise first. Keep it concise and practical. Subject: ${t?.subject||''}. Chapter: ${t?.chapter||''}. Score: ${t?.score||0}/${t?.total||0} (${t?.percent||0}%). Data: ${JSON.stringify(rows).slice(0,50000)}`;
  }

  async function runAnalysis(t,button,box){
    button.disabled=true;
    button.textContent='⏳ AI analysis...';
    box.innerHTML='<div class="card" style="margin-top:14px"><b>🤖 AI Analysis</b><p class="muted">Tumhare answers ko chapter-wise analyze kar raha hoon...</p></div>';
    try{
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:analysisPrompt(t)}]})});
      const d=await r.json();
      if(!r.ok)throw Error(d.error||'AI analysis failed');
      const safe=String(d.reply||'Analysis nahi mila.').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
      box.innerHTML=`<div class="card" style="margin-top:14px"><h3>🤖 AI Analysis</h3><div style="line-height:1.7;white-space:normal">${safe.replace(/\n/g,'<br>')}</div></div>`;
      button.textContent='🔄 Re-analyze with AI';
      button.disabled=false;
    }catch(e){
      box.innerHTML=`<div class="card" style="margin-top:14px"><b>⚠️ AI analysis unavailable</b><p class="muted">${String(e?.message||'Try again.')}</p></div>`;
      button.textContent='🤖 Analyze with AI';
      button.disabled=false;
    }
  }

  function addAnalysis(t){
    const page=qs('#pages .page');
    if(!page || page.dataset.pyqAnalysisAdded)return;
    const title=(page.querySelector('.title')?.textContent||'').toLowerCase();
    if(!title.includes('result') && !page.querySelector('.result-main'))return;
    page.dataset.pyqAnalysisAdded='1';
    const actions=page.querySelector('.actions')||page;
    const b=document.createElement('button');
    b.type='button';b.className='btn';b.id='aiAnalysisBtn';b.textContent='🤖 Analyze with AI';
    const box=document.createElement('div');box.id='aiAnalysisBox';
    actions.appendChild(b);
    actions.parentNode?.appendChild(box);
    b.onclick=()=>runAnalysis(t,b,box);
  }

  function patchResult(){
    const fn=window.showResult;
    if(typeof fn!=='function' || fn.__pyqOnly)return;
    const wrapped=function(t,auto){
      fn(t,auto);
      setTimeout(()=>{removeExtraNav();cleanTop();cleanResult();addAnalysis(t)},30);
    };
    wrapped.__pyqOnly=true;
    window.showResult=wrapped;
  }

  function boot(){
    removeExtraNav();cleanTop();patchResult();
    try{if(typeof window.show==='function')window.show(KEEP)}catch(e){}
    setTimeout(()=>{removeExtraNav();cleanTop();patchResult()},150);
    setTimeout(()=>{removeExtraNav();cleanTop();patchResult()},800);
    setTimeout(()=>{removeExtraNav();cleanTop();patchResult()},1800);
    const ob=new MutationObserver(()=>{
      removeExtraNav();cleanTop();cleanResult();patchResult();
    });
    ob.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
