(()=>{
const TEST_KEY='discipline_ai_tests_v4';
const load=()=>{try{return JSON.parse(localStorage.getItem(TEST_KEY)||'[]')}catch{return[]}};
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function records(subject,chapter){return load().filter(t=>String(t.subject||'')===String(subject||'')&&String(t.chapter||'')===String(chapter||'')).sort((a,b)=>new Date(b.date)-new Date(a.date));}
function openHistory(subject,chapter){
 const old=document.getElementById('chapterHistoryModal');if(old)old.remove();
 const rows=records(subject,chapter);
 const body=rows.length?rows.map((t,i)=>`<div class="ch-history-row"><div><b>#${rows.length-i} ${esc(t.sourceType==='pyq'?'PYQ Test':'Test')}</b><div class="muted">${new Date(t.date).toLocaleString()} • ${esc(t.pyqName||'')}</div></div><div class="ch-history-score"><b>${t.score}/${t.total}</b><span>${t.percent}%</span></div></div>`).join(''):'<div class="empty">Is chapter ka abhi koi previous test record nahi hai.</div>';
 const modal=document.createElement('div');modal.id='chapterHistoryModal';modal.innerHTML=`<div class="ch-history-backdrop"><div class="card ch-history-modal"><div class="section"><div><h2 style="margin:0">📊 Previous Test Records</h2><p class="muted" style="margin:5px 0">${esc(subject)} • ${esc(chapter)}</p></div><button type="button" class="btn secondary" id="closeChapterHistory">✕ Close</button></div><div class="ch-history-list">${body}</div></div></div>`;document.body.appendChild(modal);
 modal.querySelector('#closeChapterHistory').onclick=()=>modal.remove();modal.querySelector('.ch-history-backdrop').onclick=e=>{if(e.target===e.currentTarget)modal.remove()};
}
function decorate(){
 const title=document.querySelector('.page.active .title');
 if(!title||!title.textContent.includes('Class 12 Syllabus'))return;
 document.querySelectorAll('.chapter-test').forEach(btn=>{
  if(btn.dataset.historyAdded==='1')return;
  const subject=btn.dataset.subject||'',chapter=btn.dataset.chapter||'';
  const n=records(subject,chapter).length;
  const wrap=btn.parentElement||btn.closest('.actions');
  if(!wrap)return;
  const b=document.createElement('button');b.type='button';b.className='pill chapter-history';b.dataset.historyAdded='1';b.textContent=n?`📊 Previous Tests (${n})`:'📊 Previous Tests';b.title='Is chapter ke previous test records dekho';b.onclick=()=>openHistory(subject,chapter);wrap.appendChild(b);
  btn.dataset.historyAdded='1';
 });
}
const style=document.createElement('style');style.textContent=`.chapter-history{margin-left:7px}.ch-history-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px}.ch-history-modal{width:min(760px,100%);max-height:88vh;overflow:hidden}.ch-history-list{max-height:68vh;overflow:auto;margin-top:12px}.ch-history-row{display:flex;justify-content:space-between;gap:15px;align-items:center;padding:14px 4px;border-bottom:1px solid rgba(255,255,255,.08)}.ch-history-score{text-align:right}.ch-history-score b{display:block;font-size:18px}.ch-history-score span{color:var(--muted);font-size:12px}@media(max-width:600px){.chapter-history{margin-left:0;margin-top:6px}.ch-history-row{align-items:flex-start}.ch-history-score{min-width:62px}}`;
document.head.appendChild(style);
const pages=document.getElementById('pages');if(pages)new MutationObserver(()=>setTimeout(decorate,40)).observe(pages,{childList:true,subtree:true});setTimeout(decorate,300);
})();