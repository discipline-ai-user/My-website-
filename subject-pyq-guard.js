(()=>{
'use strict';
const PYQ_KEY='discipline_ai_pyqs_v3';
const load=()=>{try{return JSON.parse(localStorage.getItem(PYQ_KEY)||'[]')}catch{return[]}};
function refresh(){
 const s=document.getElementById('pyqSubject'),c=document.getElementById('pyqChapter');
 if(!s)return;
 const subject=s.value||''; const chapter=c?.value||''; const map=new Map(load().map(p=>[String(p.id),p]));
 document.querySelectorAll('.saved-start').forEach(btn=>{
   const p=map.get(String(btn.dataset.id));
   const row=btn.closest('.chapter');
   if(!row)return;
   const ok=!!p && String(p.subject||'')===subject && (!chapter || String(p.chapter||'')===chapter);
   row.style.display=ok?'':'none';
 });
}
function wire(){
 const s=document.getElementById('pyqSubject'),c=document.getElementById('pyqChapter');
 if(s&&!s.dataset.subjectGuard){s.dataset.subjectGuard='1';s.addEventListener('change',()=>setTimeout(refresh,30));}
 if(c&&!c.dataset.subjectGuard){c.dataset.subjectGuard='1';c.addEventListener('change',()=>setTimeout(refresh,30));}
 refresh();
}
const oldShow=window.show;
if(oldShow){window.show=function(p){const r=oldShow.apply(this,arguments);if(p==='pyq')setTimeout(wire,100);return r};}
const ob=new MutationObserver(()=>wire());
ob.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
