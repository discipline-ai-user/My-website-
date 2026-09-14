(()=>{
  'use strict';

  const KEY='discipline_ai_master_day_routine_v1';
  const RATE_KEY='discipline_ai_master_day_ratings_v1';
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
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function loadRatings(){try{return JSON.parse(localStorage.getItem(RATE_KEY)||'{}')||{};}catch(e){return {};}}
  function save(x){try{localStorage.setItem(KEY,JSON.stringify(x));}catch(e){}}
  function saveRatings(x){try{localStorage.setItem(RATE_KEY,JSON.stringify(x));}catch(e){}}
  function dayState(){const x=load(),d=today();if(!x[d])x[d]={done:{}};return {all:x,day:x[d]};}
  function mins(t){const p=t.split(':').map(Number);return p[0]*60+p[1];}
  function nowMins(){const d=new Date();return d.getHours()*60+d.getMinutes();}
  function stateFor(i){const s=SCHEDULE[i],n=nowMins(),a=mins(s[0]),b=mins(s[1]);if(s[5]==='break')return n>=a&&n<b?'live':n<a?'upcoming':'expired';return n<a?'upcoming':n<b?'live':'expired';}
  function esc(s){return String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function ratingInfo(v){return ({bad:{label:'Bad',icon:'😕',className:'bad'},good:{label:'Good',icon:'🙂',className:'good'},excellent:{label:'Excellent',icon:'🔥',className:'excellent'}})[v]||null;}
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
      .mdr-rate{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.mdr-rate button{border:1px solid rgba(255,255,255,.12);background:#111a2d;color:#fff;border-radius:10px;padding:7px 6px;font-size:11px;font-weight:800}.mdr-rate button.active{background:#2a3150;border-color:#8c97ff;box-shadow:0 0 0 1px #8c97ff44 inset}.mdr-rate button:disabled{opacity:.38;cursor:not-allowed}
      .mdr-performance{margin-top:16px;display:grid;grid-template-columns:1.3fr .7fr;gap:12px}.mdr-performance .mdr-card{min-height:120px}.mdr-score{font-size:30px;font-weight:900}.mdr-score-note{font-size:12px;opacity:.67;margin-top:4px}
      .mdr-history{display:grid;gap:8px}.mdr-hrow{display:grid;grid-template-columns:1fr 90px 90px 85px;gap:8px;padding:11px 13px;border-bottom:1px solid rgba(255,255,255,.07);font-size:13px}.mdr-empty{opacity:.55;padding:15px}
      @media(max-width:700px){.mdr-wrap{padding:4px 0 30px}.mdr-hero{padding:19px;border-radius:20px}.mdr-title{font-size:25px}.mdr-grid{grid-template-columns:1fr 1fr}.mdr-grid .mdr-card:last-child{grid-column:1/-1}.mdr-row{grid-template-columns:76px 1fr 140px 24px;gap:8px;padding:12px}.mdr-subj,.mdr-dur{font-size:11px}.mdr-hrow{grid-template-columns:1fr 55px 60px 55px;font-size:11px}.mdr-performance{grid-template-columns:1fr}.mdr-head{align-items:flex-start}.mdr-head h2{font-size:18px}}
      @media(max-width:450px){.mdr-row{grid-template-columns:68px 1fr 126px 22px}.mdr-rate button{font-size:10px;padding:7px 3px}}
    `;document.head.appendChild(st);
  }
  function dailyPerformance(day,study){
    const ratings=loadRatings()[day]||{};
    let score=0,count=0;
    study.forEach((s,i)=>{const v=ratings[String(SCHEDULE.indexOf(s))];if(v){score+=v==='bad'?1:v==='good'?2:3;count++;}});
    return count?{score:Math.round(score/count*100/3),count}:null;
  }
  function render(){
    styles();
    const {all,day}=dayState();const ratingsAll=loadRatings();
    const study=SCHEDULE.filter(s=>s[5]==='study');
    const done=study.reduce((n,s)=>n+(day.done?.[SCHEDULE.indexOf(s)]?1:0),0);const pct=Math.round(done/study.length*100);
    const rows=SCHEDULE.map((s,i)=>{
      const state=stateFor(i),checked=!!day.done?.[i],isStudy=s[5]==='study';
      const badge=state==='live'?'LIVE':state==='upcoming'?'UPCOMING':state==='expired'?'EXPIRED':'';
      const rating=ratingsAll[today()]?.[String(i)]||'';const liveOrExpired=state==='live'||state==='expired';
      return `<div class="mdr-row ${s[5]==='break'?'mdr-break ':''}${state==='live'?'live ':''}${checked?'done':''}">
        <div class="mdr-time">${esc(s[0])}–${esc(s[1])}</div>
        <div class="mdr-task">${esc(s[2])}<span class="mdr-badge">${badge}</span></div>
        <div class="mdr-rate">${isStudy?`<button type="button" data-mdr-rate="bad" data-mdr-i="${i}" class="${rating==='bad'?'active':''}" ${liveOrExpired?'':'disabled'}>😕 Bad</button><button type="button" data-mdr-rate="good" data-mdr-i="${i}" class="${rating==='good'?'active':''}" ${liveOrExpired?'':'disabled'}>🙂 Good</button><button type="button" data-mdr-rate="excellent" data-mdr-i="${i}" class="${rating==='excellent'?'active':''}" ${liveOrExpired?'':'disabled'}>🔥 Excellent</button>`:''}</div>
        <input class="mdr-check" type="checkbox" data-mdr-check="${i}" ${checked?'checked':''} ${(s[5]==='break'||state!=='live')?'disabled':''} aria-label="Complete ${esc(s[2])}">
      </div>`;
    }).join('');
    const perf=dailyPerformance(day,study);
    const scoreText=perf?`${perf.score}%`:'—';
    let level='';if(perf){level=perf.score>=85?'Excellent':perf.score>=60?'Good':'Bad';}
    const hist=Object.keys(all).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).sort().reverse().slice(0,31).map(k=>{
      const d=all[k]||{},dc=study.reduce((n,s)=>n+(d.done?.[SCHEDULE.indexOf(s)]?1:0),0),pp=Math.round(dc/study.length*100),mm=study.reduce((n,s)=>n+(d.done?.[SCHEDULE.indexOf(s)]?s[4]:0),0),rp=dailyPerformance(d,study),rl=rp?(rp.score>=85?'Excellent':rp.score>=60?'Good':'Bad'):'—';
      return `<div class="mdr-hrow"><span>${esc(k)}</span><span>${dc}/${study.length}</span><span>${rp?rp.score+'%':'—'}</span><b>${rl}</b></div>`;
    }).join('')||'<div class="mdr-empty">Abhi koi completed day history nahi hai.</div>';
    return `<div class="mdr-wrap">
      <section class="mdr-hero"><div class="mdr-kicker">Discipline AI • New System</div><div class="mdr-title">Master Day Routine</div><p class="mdr-sub">Har study block ke liye apni performance rate karo. Raat tak Jarvis tumhari routine consistency aur performance analyze kar sakta hai.</p>
        <div class="mdr-grid"><div class="mdr-card"><b>${pct}%</b><small>Today progress</small><div class="mdr-progress"><i style="width:${pct}%"></i></div></div><div class="mdr-card"><b>${done}/${study.length}</b><small>Study blocks completed</small></div><div class="mdr-card"><b>${study.reduce((n,s)=>n+s[4],0)} min</b><small>Total study time</small></div></div>
      </section>
      <div class="mdr-head"><h2>Today's Master Schedule</h2><span class="mdr-date">${esc(new Date().toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}))}</span></div>
      <div class="mdr-list">${rows}</div>
      <section class="mdr-performance"><div class="mdr-card"><div class="mdr-kicker">Routine Performance</div><div class="mdr-score">${scoreText}${perf?' • '+level:''}</div><div class="mdr-score-note">Performance is based on your Bad / Good / Excellent ratings for completed or live study blocks.</div></div><div class="mdr-card"><b>${perf?perf.count:0}</b><small>Blocks rated today</small></div></section>
      <div class="mdr-note">⚡ Live block = abhi ka scheduled time. Upcoming block ke rating buttons tabhi active honge jab block start ho. Completed block ko bhi rate kar sakte ho. Lunch ko study progress me count nahi kiya gaya.</div>
      <div class="mdr-head"><h2>31-Day History</h2><span class="mdr-date">Latest first</span></div>
      <div class="mdr-card mdr-history"><div class="mdr-hrow"><b>Date</b><b>Done</b><b>Score</b><b>Level</b></div>${hist}</div>
    </div>`;
  }
  function openMasterRoutine(){const p=document.getElementById('pages');if(!p)return false;p.innerHTML=typeof window.page==='function'?window.page('Master Day Routine','Daily schedule • live block • progress • 31-day history',render()):render();bind();const side=document.getElementById('side');if(side)side.classList.remove('open');return true;}
  function bind(){
    document.querySelectorAll('[data-mdr-check]').forEach(cb=>cb.addEventListener('change',()=>{const i=Number(cb.dataset.mdrCheck),{all,day}=dayState();if(cb.checked&&stateFor(i)!=='live'){cb.checked=false;return}day.done=day.done||{};if(cb.checked)day.done[i]=true;else delete day.done[i];all[today()]=day;save(all);openMasterRoutine();}));
    document.querySelectorAll('[data-mdr-rate]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.mdrI);if(stateFor(i)!=='live'&&stateFor(i)!=='expired')return;const all=loadRatings();all[today()]=all[today()]||{};const cur=all[today()][String(i)];if(cur===b.dataset.mdrRate)delete all[today()][String(i)];else all[today()][String(i)]=b.dataset.mdrRate;saveRatings(all);openMasterRoutine();}));
  }
  function addNav(){const nav=document.querySelector('.nav');if(!nav)return;let b=nav.querySelector('[data-master-day-routine]');if(!b){b=document.createElement('button');b.type='button';b.setAttribute('data-master-day-routine','1');b.innerHTML='📅&nbsp; Master Day Routine';nav.appendChild(b);}b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openMasterRoutine();return false;};}
  function start(){addNav();document.addEventListener('click',e=>{const b=e.target.closest?.('[data-master-day-routine]');if(b){e.preventDefault();e.stopImmediatePropagation();openMasterRoutine();}},true);new MutationObserver(addNav).observe(document.body,{childList:true,subtree:true});setInterval(()=>{if(document.getElementById('pages')?.innerHTML.includes('Master Day Routine'))openMasterRoutine();},60000);}
  window.openMasterDayRoutine=openMasterRoutine;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();