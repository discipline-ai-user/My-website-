(()=>{'use strict';
function today(){return new Date().toISOString().slice(0,10)}
function add(){
 const pages=document.getElementById('pages');if(!pages||document.getElementById('dashMasterStudy'))return;
 const card=document.createElement('div');card.id='dashMasterStudy';card.className='card';card.style.marginTop='16px';
 card.innerHTML='<div class="section"><div><h3>📅 Daily Master Study</h3><p class="muted">Aaj ke routine ka progress, score aur accuracy.</p></div><button class="btn" id="openMasterDash">Open Master Routine</button></div><div class="grid stats" id="dashMasterStats"></div>';
 pages.appendChild(card);render();document.getElementById('openMasterDash')?.addEventListener('click',()=>window.openMasterDayRoutine?.());
}
function render(){
 const out=document.getElementById('dashMasterStats');if(!out)return;
 let s={},r={};try{s=JSON.parse(localStorage.getItem('discipline_ai_master_day_routine_v1')||'{}');r=JSON.parse(localStorage.getItem('discipline_ai_master_day_ratings_v1')||'{}')}catch{}
 const day=s[today()]||{},rv=r[today()]||{},vals=Object.values(rv),done=Object.values(day.done||{}).filter(Boolean).length;
 const score=vals.length?Math.round(vals.reduce((n,v)=>n+(v==='bad'?1:v==='good'?2:3),0)/vals.length/3*100):0;
 const avg=vals.length?Math.round(vals.reduce((n,v)=>n+(v==='bad'?1:v==='good'?2:3),0)/vals.length*10)/10:0;
 out.innerHTML='<div class="card stat"><span>Routine Progress</span><b>'+done+' blocks</b></div><div class="card stat"><span>Daily Score</span><b>'+score+'%</b></div><div class="card stat"><span>Accuracy</span><b>'+score+'%</b></div><div class="card stat"><span>Rating</span><b>'+avg+'/3</b></div>';
}
new MutationObserver(add).observe(document.body,{childList:true,subtree:true});setTimeout(add,500);window.refreshDashboardMasterStudy=render;
})();