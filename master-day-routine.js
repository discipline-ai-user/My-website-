(()=>{
  'use strict';

  const KEY='discipline_ai_master_day_routine_v1';
  const SCHEDULE=[
    ['10:00','10:30','English previous chapter revision','English',30,'study'],
    ['10:30','11:30','English core study','English',60,'study'],
    ['11:35','12:00','Math previous chapter revision','Math',25,'study'],
    ['12:00','13:30','Math core chapter study','Math',90,'study'],
    ['13:30','14:00','Lunch','Break',0,'break'],
    ['14:00','14:15','Physics previous day / chapter revision','Physics',15,'study'],
    ['14:15','16:00','Physics core study','Physics',105,'study'],
    ['16:00','16:20','Chemistry previous chapter / day revision','Chemistry',20,'study'],
    ['16:20','18:00','Chemistry core study','Chemistry',100,'study'],
    ['18:20','18:30','Revision','Revision',10,'study'],
    ['18:30','19:30','Physics Chapter 3','Physics',60,'study']
  ];

  function today(){return new Date().toISOString().slice(0,10);}
  function load(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}
  }
  function save(x){try{localStorage.setItem(KEY,JSON.stringify(x));}catch(e){}}
  function dayState(){
    const x=load(), d=today();
    if(!x[d]) x[d]={done:{}};
    return {all:x,day:x[d]};
  }
  function mins(t){const p=t.split(':').map(Number);return p[0]*60+p[1];}
  function nowMins(){const d=new Date();return d.getHours()*60+d.getMinutes();}
  function stateFor(i){
    const s=SCHEDULE[i], n=nowMins(), a=mins(s[0]), b=mins(s[1]);
    if(s[5]==='break') return n>=a&&n<b?'live':n<a?'upcoming':'expired';
    return n<a?'upcoming':n<b?'live':'expired';
  }
  function esc(s){return String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function styles(){
    if(document.getElementById('masterRoutineStyles'))return;
    const st=document.createElement('style');st.id='masterRoutineStyles';
    st.textContent=`
      .mdr-wrap{max-width:1100px;margin:0 auto;padding:10px 4px 40px;color:var(--text,#eef2ff)}
      .mdr-hero{background:linear-gradient(135deg,#111a35,#0c1225);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:24px;margin-bottom:18px;box-shadow:0 16px 45px rgba(0,0,0,.18)}
      .mdr-kicker{font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.65;font-weight:800}.mdr-title{font-size:32px;font-weight:900;margin:6px 0}.mdr-sub{opacity:.72;margin:0;line-height:1.5}
      .mdr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.mdr-card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:16px}.mdr-card b{font-size:24px}.mdr-card small{display:block;opacity:.62;margin-top:4px}
      .mdr-progress{height:10px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:10px}.mdr-progress>i{display:block;height:100%;background:#7c8cff;border-radius:99px;transition:width .25s}
      .mdr-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:22px 0 10px}.mdr-head h2{margin:0;font-size:21px}.mdr-date{opacity:.65;font-size:13px}
      .mdr-list{display:grid;gap:9px}.mdr-row{display:grid;grid-template-columns:92px 1fr 95px 90px;align-items:center;gap:12px;padding:14px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);border-radius:16px}.mdr-row.live{border-color:#7c8cff;box-shadow:0 0 0 1px rgba(124,140,255,.16) inset}.mdr-row.done{opacity:.72}.mdr-time{font-weight:800;font-size:13px}.mdr-task{font-weight:700}.mdr-subj{opacity:.68;font-size:13px}.mdr-dur{font-size:12px;opacity:.65}.mdr-check{width:22px;height:22px;accent-color:#7c8cff;justify-self:end}.mdr-badge{display:inline-block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-left:7px;opacity:.7}.mdr-break{opacity:.6;border-style:dashed}.mdr-break .mdr-task{font-weight:600}.mdr-note{margin-top:14px;padding:14px 16px;border-radius:15px;background:rgba(124,140,255,.08);border:1px solid rgba(124,140,255,.15);font-size:13px;opacity:.82;line-height:1.5}
      .mdr-history{display:grid;gap:8px}.mdr-hrow{display:grid;grid-template-columns:1fr 100px 100px 80px;gap:8px;padding:11px 13px;border-bottom:1px solid rgba(255,255,255,.07);font-size:13px}.mdr-empty{opacity:.55;padding:15px}
      @media(max-width:700px){.mdr-wrap{padding:4px 0 30px}.mdr-hero{padding:19px;border-radius:20px}.mdr-title{font-size:25px}.mdr-grid{grid-template-columns:1fr 1fr}.mdr-grid .mdr-card:last-child{grid-column:1/-1}.mdr-row{grid-template-columns:76px 1fr 60px 24px;gap:8px;padding:12px}.mdr-subj,.mdr-dur{font-size:11px}.mdr-hrow{grid-template-columns:1fr 60px 60px 55px;font-size:11px}.mdr-head{align-items:flex-start}.mdr-head h2{font-size:18px}}
    `;document.head.appendChild(st);
  }
  function render(){
    styles();
    const {all,day}=dayState();
    const study=SCHEDULE.filter(s=>s[5]==='study');
    const done=study.reduce((n,s,i)=>n+(day.done?.[SCHEDULE.indexOf(s)]?1:0),0);
    const pct=Math.round(done/study.length*100);
    const live=SCHEDULE.findIndex(s=>stateFor(SCHEDULE.indexOf(s))==='live');
    const rows=SCHEDULE.map((s,i)=>{
      const state=stateFor(i), checked=!!day.done?.[i], disabled=s[5]==='break'||state!=='live';
      const badge=state==='live'?'LIVE':state==='upcoming'?'UPCOMING':state==='expired'?'EXPIRED':'';
      return `<div class="mdr-row ${s[5]==='break'?'mdr-break ':''}${state==='live'?'live ':''}${checked?'done':''}">
        <div class="mdr-time">${esc(s[0])}–${esc(s[1])}</div>
        <div class="mdr-task">${esc(s[2])}<span class="mdr-badge">${badge}</span></div>
        <div class="mdr-subj">${esc(s[3])}<br><span class="mdr-dur">${s[4]?s[4]+' min':''}</span></div>
        <input class="mdr-check" type="checkbox" data-mdr-check="${i}" ${checked?'checked':''} ${disabled?'disabled':''} aria-label="Complete ${esc(s[2])}">
      </div>`;
    }).join('');
    const hist=Object.keys(all).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).sort().reverse().slice(0,31).map(k=>{
      const d=all[k]||{}, dc=study.reduce((n,s)=>n+(d.done?.[SCHEDULE.indexOf(s)]?1:0),0), pp=Math.round(dc/study.length*100), mm=study.reduce((n,s)=>n+(d.done?.[SCHEDULE.indexOf(s)]?s[4]:0),0);
      return `<div class="mdr-hrow"><span>${esc(k)}</span><span>${dc}/${study.length}</span><span>${mm} min</span><b>${pp}%</b></div>`;
    }).join('')||'<div class="mdr-empty">Abhi koi completed day history nahi hai.</div>';
    return `<div class="mdr-wrap">
      <section class="mdr-hero"><div class="mdr-kicker">Discipline AI • New System</div><div class="mdr-title">Master Day Routine</div><p class="mdr-sub">A simple daily study command center. Sirf current live study block ka checkbox active rahega.</p>
        <div class="mdr-grid"><div class="mdr-card"><b>${pct}%</b><small>Today progress</small><div class="mdr-progress"><i style="width:${pct}%"></i></div></div><div class="mdr-card"><b>${done}/${study.length}</b><small>Study blocks completed</small></div><div class="mdr-card"><b>${study.reduce((n,s)=>n+s[4],0)} min</b><small>Total study time</small></div></div>
      </section>
      <div class="mdr-head"><h2>Today's Master Schedule</h2><span class="mdr-date">${esc(new Date().toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}))}</span></div>
      <div class="mdr-list">${rows}</div>
      <div class="mdr-note">⚡ Live block = abhi ka scheduled time. Upcoming aur expired blocks ka checkbox disabled hai. Lunch ko study progress me count nahi kiya gaya.</div>
      <div class="mdr-head"><h2>31-Day History</h2><span class="mdr-date">Latest first</span></div>
      <div class="mdr-card mdr-history"><div class="mdr-hrow"><b>Date</b><b>Done</b><b>Minutes</b><b>%</b></div>${hist}</div>
    </div>`;
  }
  function openMasterRoutine(){
    const p=document.getElementById('pages');if(!p)return false;
    p.innerHTML=typeof window.page==='function'?window.page('Master Day Routine','Daily schedule • live block • progress • 31-day history',render()):render();
    bind();
    const side=document.getElementById('side');if(side)side.classList.remove('open');
    return true;
  }
  function bind(){
    document.querySelectorAll('[data-mdr-check]').forEach(cb=>cb.addEventListener('change',()=>{
      const i=Number(cb.dataset.mdrCheck), {all,day}=dayState();
      if(cb.checked && stateFor(i)!=='live'){cb.checked=false;return;}
      day.done=day.done||{}; if(cb.checked)day.done[i]=true; else delete day.done[i];
      all[today()]=day;save(all);openMasterRoutine();
    }));
  }
  function addNav(){
    const nav=document.querySelector('.nav');if(!nav)return;
    let b=nav.querySelector('[data-master-day-routine]');
    if(!b){b=document.createElement('button');b.type='button';b.setAttribute('data-master-day-routine','1');b.innerHTML='📅&nbsp; Master Day Routine';nav.appendChild(b);}
    b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openMasterRoutine();return false;};
  }
  function start(){
    addNav();
    document.addEventListener('click',e=>{const b=e.target.closest?.('[data-master-day-routine]');if(b){e.preventDefault();e.stopImmediatePropagation();openMasterRoutine();}},true);
    new MutationObserver(addNav).observe(document.body,{childList:true,subtree:true});
    setInterval(()=>{if(document.getElementById('pages')?.innerHTML.includes('Master Day Routine'))openMasterRoutine();},60000);
  }
  window.openMasterDayRoutine=openMasterRoutine;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
