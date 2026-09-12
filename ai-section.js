(()=>{
  const STYLE=`
  .ai-panel.ai-fullscreen{display:flex;inset:0;right:0;bottom:0;width:100vw;height:100vh;max-width:none;max-height:none;border-radius:0;z-index:200;background:#080d18;}
  .ai-panel.ai-fullscreen .ai-messages{max-width:1050px;width:100%;margin:0 auto;padding:22px 24px;}
  .ai-panel.ai-fullscreen .ai-form,.ai-panel.ai-fullscreen .ai-suggestions,.ai-panel.ai-fullscreen .ai-note{width:min(1050px,100%);margin-left:auto;margin-right:auto;}
  .ai-panel.ai-fullscreen .ai-form{padding:14px 24px;}
  .ai-panel.ai-fullscreen .ai-suggestions{padding:10px 24px;}
  .ai-panel.ai-fullscreen .ai-head{padding:18px 24px;}
  .ai-section-nav{position:relative!important;}
  .ai-section-nav.active{background:#202b45!important;color:#fff!important;}
  body.ai-fullscreen-open{overflow:hidden;}
  `;
  function addStyle(){if(document.getElementById('aiSectionStyle'))return;const s=document.createElement('style');s.id='aiSectionStyle';s.textContent=STYLE;document.head.appendChild(s)}
  function addNav(){
    const nav=document.querySelector('.nav');
    if(!nav||nav.querySelector('.ai-section-nav'))return;
    const b=document.createElement('button');
    b.type='button';b.className='ai-section-nav';b.innerHTML='✦&nbsp; AI Tutor';
    b.onclick=()=>openAI();nav.appendChild(b);
  }
  function openAI(){
    const panel=document.getElementById('aiTutor');
    const fab=document.getElementById('aiTutorFab');
    if(!panel)return;
    panel.classList.add('show','ai-fullscreen');
    fab?.classList.add('ai-hidden');
    document.body.classList.add('ai-fullscreen-open');
    document.querySelector('.ai-section-nav')?.classList.add('active');
    document.getElementById('aiInput')?.focus();
  }
  function closeAI(){
    document.getElementById('aiTutor')?.classList.remove('ai-fullscreen');
    document.getElementById('aiTutorFab')?.classList.remove('ai-hidden');
    document.body.classList.remove('ai-fullscreen-open');
    document.querySelector('.ai-section-nav')?.classList.remove('active');
  }
  function bind(){
    addStyle();addNav();
    const close=document.getElementById('aiClose');
    if(close&&!close.dataset.fullBound){close.dataset.fullBound='1';close.addEventListener('click',closeAI)}
    const fab=document.getElementById('aiTutorFab');
    if(fab&&!fab.dataset.fullBound){fab.dataset.fullBound='1';fab.addEventListener('click',()=>{if(document.getElementById('aiTutor')?.classList.contains('ai-fullscreen'))closeAI()})}
  }
  const ob=new MutationObserver(()=>setTimeout(bind,0));
  ob.observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else setTimeout(bind,50);
})();