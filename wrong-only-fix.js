(()=>{
const KEY='discipline_ai_tests_v4';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function bind(){
 const title=document.querySelector('.page.active .title');
 if(!title||!title.textContent.includes('Wrong Questions'))return;
 document.querySelectorAll('.retry').forEach(old=>{
  if(old.dataset.wrongOnlyFixed==='1')return;
  const id=old.dataset.id;
  const fresh=old.cloneNode(true);
  fresh.dataset.wrongOnlyFixed='1';
  old.replaceWith(fresh);
  fresh.onclick=()=>{
   const t=load().find(x=>String(x.id)===String(id));
   if(!t){toast('Test record nahi mila.');return;}
   const qs=Array.isArray(t.wrongQuestions)&&t.wrongQuestions.length?t.wrongQuestions:(Array.isArray(t.questions)?t.questions.filter((q,i)=>q?.answer>=0&&t.answers?.[i]!==q.answer):[]);
   if(!qs.length){toast('Is test me koi wrong question nahi mila. 🎉');return;}
   if(typeof startQuestionTest!=='function'){toast('Test start nahi ho pa raha.');return;}
   startQuestionTest(t.subject,t.chapter+' • Wrong Questions',qs,15,t.sourceType||'generated',t.sourcePyqId||null);
   try{
    if(typeof currentTest==='object'&&currentTest){
     currentTest.sourceType='wrong-questions';
     currentTest.sourcePyqId=t.sourcePyqId||null;
     currentTest.parentPyqId=t.parentPyqId||t.sourcePyqId||null;
     currentTest.pyqName=t.pyqName||null;
     currentTest.isWrongTest=true;
     currentTest.originalTestId=t.id;
    }
   }catch{}
  };
 });
}
const pages=document.getElementById('pages');
if(pages){new MutationObserver(()=>setTimeout(bind,40)).observe(pages,{childList:true,subtree:true});}
setTimeout(bind,250);
})();