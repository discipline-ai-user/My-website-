(()=>{
const ACTIVE_KEY='discipline_ai_active_test_v1';
function saveActive(){try{if(typeof currentTest==='object'&&currentTest?.questions?.length)localStorage.setItem(ACTIVE_KEY,JSON.stringify({test:currentTest,index:qIndex,answers,timeLeft}));}catch{}}
function clearActive(){try{localStorage.removeItem(ACTIVE_KEY)}catch{}}
function restore(){try{const raw=localStorage.getItem(ACTIVE_KEY);if(!raw)return;const d=JSON.parse(raw);if(!d?.test?.questions?.length)return;const box=document.createElement('div');box.className='card';box.style.marginBottom='15px';box.innerHTML=`<div class="section"><div><h3 style="margin:0">⏸️ Test in progress</h3><p class="muted" style="margin:4px 0">${esc(d.test.subject)} • ${esc(d.test.chapter)} • ${Number(d.index)+1}/${d.test.questions.length}</p></div><button type="button" class="btn" id="resumeTestBtn">Resume Test</button></div><p class="muted" style="margin:0">Your answers and remaining time are saved on this device.</p>`;const pages=document.getElementById('pages');if(pages&&document.querySelector('.page.active')?.querySelector('.title')?.textContent?.includes('Good evening'))pages.prepend(box);box.querySelector('#resumeTestBtn').onclick=()=>{currentTest=d.test;qIndex=Math.max(0,Math.min(Number(d.index)||0,currentTest.questions.length-1));answers=Array.isArray(d.answers)?d.answers:new Array(currentTest.questions.length).fill(null);timeLeft=Math.max(0,Number(d.timeLeft)||0);if(timeLeft<=0){clearActive();toast('Is test ka timer khatam ho chuka tha.');return}showTest();startTimer()};}catch{}}
function setupSidebarClose(){
 const style=document.createElement('style');style.textContent=`@media(max-width:850px){#side{will-change:transform}.sidebar-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.42);backdrop-filter:blur(2px);z-index:9;display:none}.sidebar-backdrop.show{display:block}#side{z-index:20}}`;document.head.appendChild(style);
 const side=document.getElementById('side');const menu=document.getElementById('menuBtn');if(!side||!menu)return;
 let backdrop=document.querySelector('.sidebar-backdrop');if(!backdrop){backdrop=document.createElement('div');backdrop.className='sidebar-backdrop';document.body.appendChild(backdrop)}
 const sync=()=>backdrop.classList.toggle('show',side.classList.contains('open'));
 const close=()=>{side.classList.remove('open');backdrop.classList.remove('show')};
 menu.addEventListener('click',()=>setTimeout(sync,0));
 backdrop.addEventListener('click',close);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.getElementById('pages')?.addEventListener('click',e=>{if(side.classList.contains('open')&&!e.target.closest('#side')&&!e.target.closest('#menuBtn'))close()});
 const observer=new MutationObserver(()=>{const s=document.getElementById('side'),m=document.getElementById('menuBtn');if(!s||!m)return;if(!m.dataset.sidebarBound){m.dataset.sidebarBound='1';m.addEventListener('click',()=>setTimeout(sync,0))}sync()});observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
}
const oldShowTest=typeof showTest==='function'?showTest:null;
if(oldShowTest){showTest=function(){saveActive();return oldShowTest()}}
const oldStart=typeof startQuestionTest==='function'?startQuestionTest:null;
if(oldStart){startQuestionTest=function(subject,chapter,questions,mins){clearActive();const r=oldStart(subject,chapter,questions,mins);saveActive();return r}}
const oldFinish=typeof finishTest==='function'?finishTest:null;
if(oldFinish){finishTest=function(auto){clearActive();return oldFinish(auto)}}
window.addEventListener('beforeunload',saveActive);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(restore,80);setTimeout(setupSidebarClose,100)});else{setTimeout(restore,80);setTimeout(setupSidebarClose,100)}
})();