(function(){
  'use strict';

  var KEY = 'discipline_ai_day_routine_v6';
  var defaults = [
    {id:'1',time:'10:00',end:'10:30',task:'English previous chapter revision',subject:'English',mins:30},
    {id:'2',time:'10:30',end:'11:30',task:'English core study',subject:'English',mins:60},
    {id:'3',time:'11:35',end:'12:00',task:'Math previous chapter revision',subject:'Math',mins:25},
    {id:'4',time:'12:00',end:'13:30',task:'Math core chapter study',subject:'Math',mins:90},
    {id:'5',time:'13:30',end:'14:00',task:'Lunch',subject:'Break',mins:0,break:true},
    {id:'6',time:'14:00',end:'14:15',task:'Physics previous day / chapter revision',subject:'Physics',mins:15},
    {id:'7',time:'14:15',end:'16:00',task:'Physics core study',subject:'Physics',mins:105},
    {id:'8',time:'16:00',end:'16:20',task:'Chemistry previous chapter / day revision',subject:'Chemistry',mins:20},
    {id:'9',time:'16:20',end:'18:00',task:'Chemistry core study',subject:'Chemistry',mins:100},
    {id:'10',time:'18:20',end:'18:30',task:'Revision',subject:'Revision',mins:10},
    {id:'11',time:'18:30',end:'19:30',task:'Physics Chapter 3',subject:'Physics',mins:60}
  ];

  function pad(n){ return String(n).padStart(2,'0'); }
  function dateKey(d){ d=d||new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function dateFromKey(k){ var a=k.split('-').map(Number); return new Date(a[0],a[1]-1,a[2]); }
  function addDays(k,n){ var d=dateFromKey(k); d.setDate(d.getDate()+n); return dateKey(d); }
  function escapeHtml(v){ return String(v==null?'':v).replace(/[&<>\"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]; }); }
  function pretty(k){ return dateFromKey(k).toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'short',year:'numeric'}); }
  function time12(t){ var a=String(t).split(':').map(Number); var h=a[0],m=a[1]; return (h%12||12)+':'+pad(m)+' '+(h>=12?'PM':'AM'); }
  function nowMinutes(){ var d=new Date(); return d.getHours()*60+d.getMinutes(); }
  function state(item){
    if(item.break) return 'break';
    var a=String(item.time).split(':').map(Number), b=String(item.end||item.time).split(':').map(Number);
    var now=nowMinutes(), start=a[0]*60+a[1], end=b[0]*60+b[1];
    if(now<start) return 'upcoming';
    if(now>=end) return 'expired';
    return 'live';
  }
  function stateText(s){ return s==='live'?'🟢 Live now':s==='upcoming'?'🔒 Not started':'⏰ Time over'; }
  function cloneDefaults(){ return defaults.map(function(x){ return Object.assign({},x); }); }
  function load(){
    try{
      var x=JSON.parse(localStorage.getItem(KEY)||'null');
      if(x && x.items && x.items.length) return x;
      var old=JSON.parse(localStorage.getItem('discipline_ai_day_routine_v5')||localStorage.getItem('discipline_ai_day_routine_v4')||'null');
      return {items:old&&old.items&&old.items.length?old.items:cloneDefaults(),done:old&&old.done?old.done:{},history:old&&old.history?old.history:{}};
    }catch(e){ return {items:cloneDefaults(),done:{},history:{}}; }
  }
  function save(x){ localStorage.setItem(KEY,JSON.stringify(x)); }
  function getDayDone(x,k){ x.done=x.done||{}; x.done[k]=x.done[k]||{}; return x.done[k]; }
  function stats(x,k){
    var done=getDayDone(x,k), items=x.items.filter(function(i){return !i.break;});
    var completed=items.filter(function(i){return !!done[i.id];});
    var planned=items.reduce(function(n,i){return n+(Number(i.mins)||0);},0);
    var study=completed.reduce(function(n,i){return n+(Number(i.mins)||0);},0);
    return {done:completed.length,total:items.length,planned:planned,study:study,pct:items.length?Math.round(completed.length/items.length*100):0};
  }
  function record(x,k){ var s=stats(x,k); x.history=x.history||{}; x.history[k]={date:k,items:Object.assign({},getDayDone(x,k)),studyMins:s.study,plannedMins:s.planned,completed:s.done,total:s.total,progress:s.pct}; }
  function historyHtml(x){
    var today=dateKey(), html='<div class="history-list">';
    for(var n=0;n<31;n++){
      var k=addDays(today,-n), s=stats(x,k);
      html+='<div class="history-row '+(k===today?'current':'')+'"><div><b>'+escapeHtml(pretty(k))+(k===today?' • Today':'')+'</b><small>'+s.done+'/'+s.total+' blocks • '+s.study+' min study</small></div><div class="history-right"><b>'+s.pct+'%</b><div class="mini-progress"><i style="width:'+s.pct+'%"></i></div></div></div>';
    }
    return html+'</div>';
  }
  function render(){
    var x=load(), k=dateKey(), done=getDayDone(x,k), s=stats(x,k), html='';
    record(x,k); save(x);
    html+='<div class="routine-hero card"><div><div class="eyebrow">'+escapeHtml(pretty(k))+'</div><h2 style="margin:4px 0">📅 Daily Study Routine</h2><p class="muted">🕒 <b>Live time: '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+'</b></p><p class="muted">⏱️ Checkbox sirf scheduled time ke andar active rahega.</p></div><div class="routine-circle"><strong>'+s.pct+'%</strong><span>Today</span></div></div>';
    html+='<div class="grid stats routine-stats"><div class="card stat"><span>Study Blocks</span><b>'+s.done+'/'+s.total+'</b></div><div class="card stat"><span>Study Completed</span><b>'+s.study+' min</b></div><div class="card stat"><span>Planned Study</span><b>'+s.planned+' min</b></div></div>';
    html+='<div class="card"><div class="section"><div><h3>📅 Today\'s Schedule</h3><p class="muted">🟢 Live = active • 🔒 Not started • ⏰ Time over</p></div></div><div class="routine-list">';
    x.items.forEach(function(i){
      var st=state(i), locked=st!=='live'||i.break, checked=!!done[i.id];
      html+='<div class="routine-item '+(i.break?'break-item ':'')+(checked?'done ':'')+st+'"><label class="routine-check"><input type="checkbox" data-routine="'+escapeHtml(i.id)+'" '+(checked?'checked ':'')+(locked?'disabled':'')+'><span></span></label><div class="routine-time">'+time12(i.time)+'–'+time12(i.end)+'</div><div class="routine-info"><b>'+escapeHtml(i.task)+'</b><small>'+escapeHtml(i.subject)+(i.mins?' • '+i.mins+' min':'')+(i.break?' • Break':' • '+stateText(st))+'</small></div></div>';
    });
    html+='</div></div>';
    html+='<div class="card routine-summary"><div class="section"><div><h3>📊 Today\'s Progress</h3><p class="muted">'+s.done+' of '+s.total+' study blocks completed</p></div><b>'+s.pct+'%</b></div><div class="progress"><i style="width:'+s.pct+'%"></i></div><p><b>'+s.study+' min</b> study completed out of <b>'+s.planned+' min</b> planned.</p></div>';
    html+='<div class="card"><div class="section"><div><h3>📈 Date-wise Progress History</h3><p class="muted">Last 31 days — har date ka record separately saved.</p></div></div>'+historyHtml(x)+'</div>';
    return html;
  }
  function openRoutine(){
    var p=document.getElementById('pages');
    if(!p) return false;
    p.innerHTML=page('Daily Study Routine','Real-time routine • checkbox sirf scheduled time ke andar active rahega.',render());
    bind();
    return true;
  }
  window.openRoutine=openRoutine;
  function bind(){
    var x=load(), k=dateKey(), done=getDayDone(x,k);
    document.querySelectorAll('[data-routine]').forEach(function(c){
      c.onchange=function(){
        var item=x.items.find(function(i){return String(i.id)===String(c.dataset.routine);});
        if(!item) return;
        if(state(item)!=='live'){
          c.checked=!!done[item.id];
          if(typeof toast==='function') toast(state(item)==='upcoming'?'⏳ Ye study block abhi start nahi hua hai.':'⏰ Is study block ka time khatam ho gaya hai.');
          return;
        }
        if(c.checked) done[item.id]=true; else delete done[item.id];
        record(x,k); save(x); openRoutine();
      };
    });
  }
  function ensureNav(){
    var nav=document.querySelector('.nav');
    if(!nav || nav.querySelector('[data-routine-open="1"]')) return;
    var b=document.createElement('button');
    b.type='button'; b.dataset.routineOpen='1'; b.innerHTML='📅&nbsp; Daily Study Routine';
    b.onclick=function(e){e.preventDefault();e.stopPropagation();openRoutine();};
    nav.appendChild(b);
  }
  var style=document.createElement('style');
  style.textContent='.routine-hero{display:flex;justify-content:space-between;align-items:center;gap:18px}.routine-circle{width:110px;height:110px;border-radius:50%;display:grid;place-items:center;background:var(--p);position:relative}.routine-circle:after{content:"";position:absolute;inset:8px;border-radius:50%;background:#0c1425}.routine-circle strong,.routine-circle span{position:relative;z-index:1}.routine-circle span{position:absolute;margin-top:48px;font-size:10px}.routine-list,.history-list{display:grid;gap:8px}.routine-item{display:grid;grid-template-columns:30px 125px 1fr;align-items:center;gap:8px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.08)}.routine-item.live{border-color:rgba(36,209,139,.35)}.routine-item.done{opacity:.62}.routine-item.done .routine-info b{text-decoration:line-through}.routine-item.upcoming,.routine-item.expired{opacity:.72}.routine-check input{display:none}.routine-check span{display:block;width:20px;height:20px;border:2px solid #68738d;border-radius:6px}.routine-check input:checked+span{background:var(--p);border-color:var(--p)}.routine-check input:disabled+span{opacity:.4}.routine-time{font-weight:800;font-size:12px;white-space:nowrap}.routine-info small,.history-row small{display:block;color:var(--muted);margin-top:4px}.history-row{display:flex;justify-content:space-between;gap:15px;align-items:center;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:12px}.history-right{text-align:right;min-width:100px}.mini-progress{height:6px;background:#202a40;border-radius:99px;overflow:hidden;margin-top:5px}.mini-progress i{display:block;height:100%;background:var(--p)}@media(max-width:700px){.routine-item{grid-template-columns:30px 110px 1fr}.routine-hero{align-items:flex-start}.routine-circle{width:90px;height:90px}.history-row{align-items:flex-start}}';
  document.head.appendChild(style);
  var oldShow=typeof show==='function'?show:null;
  if(oldShow){ window.show=function(id,scroll){ if(id==='routine') return openRoutine(); return oldShow(id,scroll); }; }
  function refresh(){ ensureNav(); var p=document.getElementById('pages'); if(p&&p.querySelector('.routine-hero')) openRoutine(); }
  var observer=new MutationObserver(ensureNav); observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(ensureNav,100); setTimeout(ensureNav,500); setTimeout(ensureNav,1200);
  setInterval(refresh,60000);
})();
