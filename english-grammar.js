(()=>{
'use strict';
const GRAMMAR=['Tenses','Narration (Direct and Indirect Speech)','Voice (Active and Passive)','Modals','Articles','Prepositions','Conjunctions','Subject-Verb Agreement','Parts of Speech','Transformation of Sentences','Question Tags','Adjective','Adverb'];
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function addGrammar(){
 const root=document.querySelector('.syllabus-card');
 if(!root||document.getElementById('english-grammar-card'))return;
 const english=[...root.querySelectorAll('details.subject')].find(d=>d.querySelector('summary')?.textContent.includes('English'));
 if(english){
   const sections=english.querySelectorAll('.stc-section');
   if(sections.length>1){sections[sections.length-1].remove();}
   const summary=english.querySelector('summary');
   if(summary)summary.innerHTML='English <span class="muted">(21 chapters)</span>';
 }
 const card=document.createElement('details');
 card.id='english-grammar-card';card.className='subject';
 card.innerHTML='<summary>✍️ English Grammar <span class="muted">(13 topics)</span></summary><div class="chapters"><div class="stc-section"><div class="stc-section-title">English Grammar — 13 Topics</div>'+GRAMMAR.map((x,i)=>'<div class="stc-item">'+(i+1)+'. '+esc(x)+'</div>').join('')+'</div></div>';
 root.appendChild(card);
 const boxes=root.querySelectorAll('.stc-box');
 boxes.forEach(b=>{if(b.querySelector('h3')?.textContent.trim()==='English'){const m=b.querySelector('.muted');if(m)m.textContent='21 chapters';}});
}
function boot(){addGrammar();setTimeout(boot,800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
