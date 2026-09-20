(()=>{'use strict';
/*
 Discipline AI — Advanced Study Brain
 Client-side intelligence layer: memory, next-task, mistakes, revision, analytics, XP/streaks,
 library search and JARVIS commands. No private-device/app access.
*/
const BKEY='discipline_ai_study_brain_v1', TKEY='discipline_ai_tests_v4', RKEY='discipline_ai_master_day_routine_v1', RATE='discipline_ai_master_day_ratings_v1', LIBDB='discipline_ai_study_library_v1';
const SUBJECTS={
 Physics:['Electric Charges and Fields','Electrostatic Potential and Capacitance','Current Electricity','Moving Charges and Magnetism','Magnetism and Matter','Electromagnetic Induction','Alternating Current','Electromagnetic Waves','Ray Optics and Optical Instruments','Wave Optics','Dual Nature of Radiation and Matter','Atoms','Nuclei','Semiconductor Electronics'],
 Chemistry:['Solutions','Electrochemistry','Chemical Kinetics','d- and f-Block Elements','Coordination Compounds','Haloalkanes and Haloarenes','Alcohols, Phenols and Ethers','Aldehydes, Ketones and Carboxylic Acids','Amines','Biomolecules, Polymers and Chemistry in Everyday Life'],
 Mathematics:['Relations and Functions','Inverse Trigonometric Functions','Matrices','Determinants','Continuity and Differentiability','Application of Derivatives','Integrals','Application of Integrals','Differential Equations','Vector Algebra','Three Dimensional Geometry','Linear Programming','Probability'],
 English:['Indian Civilization and Culture','Bharat is My Home','A Pinch of Snuff','I Have a Dream','Ideas that have Helped Mankind','The Artist','A Child Born','How Free is the Press','The Earth','India Through a Traveller’s Eyes','A Marriage Proposal','Sweetest Love I do not Goe','Song of Myself','Now the Leaves are Falling Fast','Ode to Autumn','An Epitaph','The Soldier','Macavity: The Mystery Cat','Fire-Hymn','Snake','My Grandmother’s House'],
 Hindi:['बातचीत','उसने कहा था','संपूर्ण क्रांति','अर्थनारीश्वर','रोज','एक लेख और एक पत्र','ओ सदानीरा','सिपाही की माँ','प्रेम और समाज','जूठन','हँसते हुए मेरा अकेलापन','तिरिछ','शिक्षा','कड़बक','पद — सूरदास','पद — तुलसीदास','छप्पय','कवित्त','तुमुल कोलाहल कलह में','पुत्र-वियोग','उषा','जन-जन का चेहरा एक','अधिनायक','प्यारे नन्हें बेटे को','हार-जीत','गाँव का घर','रस्सी का टुकड़ा','क्लर्क की मौत','पैगनी'],
 'English Grammar':['Tenses','Narration (Direct and Indirect Speech)','Voice (Active and Passive)','Modals','Articles','Prepositions','Conjunctions','Subject-Verb Agreement','Parts of Speech','Transformation of Sentences','Question Tags','Adjective','Adverb']
};
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const tests=()=>read(TKEY,[]);
const brain=()=>{const b=read(BKEY,{});return Object.assign({createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),topics:{},revisions:{},xp:0,streak:0,lastActive:null,achievements:[],preferences:{},chat:[]},b)};
function save(b){b.updatedAt=new Date().toISOString();write(BKEY,b)}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g,' ').trim()}
function dayKey(d=new Date()){return d.toISOString().slice(0,10)}
function addDays(date,n){const d=new Date(date);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function chapterKey(subject,chapter){return norm(subject)+'::'+norm(chapter)}
function allChapters(){return Object.entries(SUBJECTS).flatMap(([s,cs])=>cs.map(c=>({subject:s,chapter:c})))}
function analyzeChapter(subject,chapter){
 const ts=tests().filter(t=>norm(t.subject)===norm(subject)&&norm(t.chapter).includes(norm(chapter)));
 const total=ts.reduce((a,t)=>a+Number(t.total||0),0),correct=ts.reduce((a,t)=>a+Number(t.score||0),0),attempts=ts.length;
 const accuracy=total?Math.round(correct/total*100):0;
 const latest=ts.slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;
 let avgTime=0, samples=0;
 ts.forEach(t=>{const q=t.questions||[];(t.answers||[]).forEach((ans,i)=>{if(ans!==null&&q[i]){const sec=Number(q[i].timeSpent||q[i].seconds||0);if(sec>0){avgTime+=sec;samples++}}})});
 const key=chapterKey(subject,chapter),b=brain(),rev=b.revisions[key]||{};
 return {attempts,total,correct,accuracy,latest,avgTime:samples?Math.round(avgTime/samples):0,revision:rev};
}
function refreshTopics(){
 const b=brain(),seen={};
 tests().forEach(t=>{
   const k=chapterKey(t.subject,t.chapter),s=seen[k]||{subject:t.subject,chapter:t.chapter,tests:0,total:0,correct:0,last:null,wrong:0};
   s.tests++;s.total+=Number(t.total||0);s.correct+=Number(t.score||0);s.wrong+=Math.max(0,Number(t.total||0)-Number(t.score||0)-(t.answers||[]).filter(x=>x===null).length);if(!s.last||new Date(t.date)>new Date(s.last))s.last=t.date;seen[k]=s;
 });
 Object.values(seen).forEach(s=>{const k=chapterKey(s.subject,s.chapter),old=b.topics[k]||{};b.topics[k]=Object.assign(old,s,{accuracy:s.total?Math.round(s.correct/s.total*100):0,lastTest:s.last})});
 save(b);return b;
}
function ensureRevision(subject,chapter,completedAt=new Date()){
 const b=brain(),k=chapterKey(subject,chapter),r=b.revisions[k]||{subject,chapter,completed:0,done:[]};
 const n=Number(r.completed||0)+1;r.completed=n;r.lastStudy=new Date(completedAt).toISOString();r.due=[1,3,7].map(x=>addDays(completedAt,x));r.nextDue=r.due[0];b.revisions[k]=r;save(b)
}
function markRevision(subject,chapter){
 const b=brain(),k=chapterKey(subject,chapter),r=b.revisions[k]||{subject,chapter,completed:0,done:[]};
 const today=dayKey();r.done=Array.isArray(r.done)?r.done:[];if(!r.done.includes(today))r.done.push(today);
 const future=r.due?.filter(x=>x>today)||[];r.nextDue=future[0]||addDays(today,7);r.lastRevision=today;r.revisionCount=(r.revisionCount||0)+1;b.revisions[k]=r;addXP(15,'revision');save(b)
}
function dueRevisions(){
 const b=brain(),today=dayKey();
 return Object.values(b.revisions).filter(r=>r.nextDue&&r.nextDue<=today).sort((a,c)=>String(a.nextDue).localeCompare(String(c.nextDue)))
}
function mistakeProfile(){
 const map={};tests().forEach(t=>(t.questions||[]).forEach((q,i)=>{
   const chosen=(t.answers||[])[i],correct=Number(q?.answer);
   if(chosen===null||correct<0||chosen===correct)return;
   const text=String(q.text||q.question||'').replace(/🗓️ Asked in:.*/s,'').trim();
   const words=norm(text).split(' ').filter(x=>x.length>4).slice(0,6).join(' ');
   const key=norm(t.subject)+'::'+norm(t.chapter)+'::'+(words||String(q.originalNumber||i+1));
   map[key]??={subject:t.subject,chapter:t.chapter,label:words||('Question '+(q.originalNumber||i+1)),count:0,last:t.date,question:text};
   map[key].count++;map[key].last=t.date;
 }));
 return Object.values(map).sort((a,b)=>b.count-a.count);
}
function whyWeak(subject,chapter){
 const ts=tests().filter(t=>norm(t.subject)===norm(subject)&&norm(t.chapter).includes(norm(chapter)));
 if(!ts.length)return {reason:'no-data',text:'Abhi is chapter ka test data nahi hai.'};
 let wrong=0,total=0,skipped=0,time=0,timeN=0;
 ts.forEach(t=>{total+=Number(t.total||0);wrong+=Math.max(0,Number(t.total||0)-Number(t.score||0)-(t.answers||[]).filter(x=>x===null).length);skipped+=(t.answers||[]).filter(x=>x===null).length;(t.questions||[]).forEach(q=>{const s=Number(q.timeSpent||q.seconds||0);if(s>0){time+=s;timeN++}})});
 const acc=total?Math.round((total-wrong-skipped)/total*100):0;
 const reasons=[];if(acc<60)reasons.push('low accuracy');if(skipped)reasons.push('questions skipped');if(ts.length<2)reasons.push('low practice');const r=brain().revisions[chapterKey(subject,chapter)];if(r?.nextDue&&r.nextDue<dayKey())reasons.push('revision gap');if(timeN&&time/timeN>120)reasons.push('high time per attempted question');
 return {reason:reasons.join(', ')||'mixed',text:reasons.length?'Main reasons: '+reasons.join(', ')+'.':'No major weak-signal found from current records.',accuracy:acc,tests:ts.length,wrong,skipped,avgTime:timeN?Math.round(time/timeN):0};
}
function nextTask(){
 const due=dueRevisions();if(due.length)return {type:'revision',subject:due[0].subject,chapter:due[0].chapter,why:'revision due'};
 const b=refreshTopics(),seen=new Set(Object.values(b.topics).map(x=>chapterKey(x.subject,x.chapter)));
 const weak=Object.values(b.topics).filter(x=>x.tests).sort((a,c)=>a.accuracy-c.accuracy)[0];
 if(weak&&weak.accuracy<80)return {type:'practice',subject:weak.subject,chapter:weak.chapter,why:'accuracy '+weak.accuracy+'%'};
 const untested=allChapters().find(x=>!seen.has(chapterKey(x.subject,x.chapter)));
 if(untested)return {type:'new',...untested,why:'not tested yet'};
 const r=window.DisciplineBrain?.routineNow?.();return r?.task?{type:'routine',...r.task,why:'master routine'}:{type:'study',subject:'Physics',chapter:'Current Electricity',why:'default study focus'};
}
function addXP(n,reason){const b=brain();b.xp=Number(b.xp||0)+Number(n||0);const today=dayKey();if(b.lastActive!==today){const prev=b.lastActive;if(prev===addDays(today,-1))b.streak=Number(b.streak||0)+1;else b.streak=1;b.lastActive=today}const levels=[['First Study',1],['Test Taker',100],['Revision Pro',250],['Discipline Master',500],['Study Legend',1000]];levels.forEach(([name,x])=>{if(b.xp>=x&&!b.achievements.includes(name))b.achievements.push(name)});save(b)}
function recordActivity(){addXP(5,'activity')}
function xpInfo(){const b=brain(),level=b.xp<100?'Starter':b.xp<250?'Test Taker':b.xp<500?'Revision Pro':b.xp<1000?'Discipline Master':'Study Legend';return {xp:b.xp,level,streak:b.streak,achievements:b.achievements}}
async function libraryFind(subject,chapter,type){
 try{const db=await new Promise((res,rej)=>{const r=indexedDB.open(LIBDB,1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});const rows=await new Promise((res,rej)=>{const q=db.transaction('resources','readonly').objectStore('resources').getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});return rows.filter(x=>(!subject||norm(x.subject)===norm(subject))&&(!chapter||norm(x.chapter).includes(norm(chapter)))&&(!type||x.type===type))}catch{return[]}
}
async function libraryCommand(subject,chapter,type){
 const rows=await libraryFind(subject,chapter,type);
 if(!rows.length)return 'Library me '+[chapter||subject||'is topic',type||'resources'].join(' ke ')+' abhi saved nahi hain.';
 if(type==='youtube'){const x=rows[0];window.open(x.url,'_blank');return 'Lecture open kar diya: '+x.title}
 if(type==='pdf'){const x=rows[0];if(x.blob){const u=URL.createObjectURL(x.blob);window.open(u,'_blank');setTimeout(()=>URL.revokeObjectURL(u),60000);return 'PDF open kar diya: '+x.title}return 'PDF mila, lekin browser me file data available nahi hai.'}
 return rows.map(x=>(x.type==='youtube'?'🎥 ':'📄 ')+x.title).join('\n');
}
function parseChapter(q,subject){
 const list=subject?SUBJECTS[subject]||[]:allChapters().map(x=>x.chapter);
 const l=norm(q);return list.find(c=>l.includes(norm(c)))||list.find(c=>norm(c).split(' ').filter(w=>w.length>4).some(w=>l.includes(w)))||null;
}
function studyBrainAnswer(raw){
 const q=String(raw||'').trim(),l=q.toLowerCase();if(!q)return null;
 const b0=brain();b0.chat=Array.isArray(b0.chat)?b0.chat:[];b0.chat.unshift({at:new Date().toISOString(),q:q});b0.chat=b0.chat.slice(0,30);save(b0);
 if(/^(haan|ha|yes|okay|ok|continue|theek hai|kar do)$/i.test(q)&&b0.chat[1]?.q){
   const prev=b0.chat[1].q;
   if(/(lecture|youtube|video)/i.test(prev)){const s=['Physics','Chemistry','Mathematics','English','Hindi','English Grammar'].find(x=>new RegExp(x,'i').test(prev));const c=parseChapter(prev,s);if(c){libraryCommand(s,c,'youtube').then(x=>window.JarvisBrainSay?.(x));return '__ASYNC__'}}
   if(/(pdf|notes)/i.test(prev)){const s=['Physics','Chemistry','Mathematics','English','Hindi','English Grammar'].find(x=>new RegExp(x,'i').test(prev));const c=parseChapter(prev,s);if(c){libraryCommand(s,c,'pdf').then(x=>window.JarvisBrainSay?.(x));return '__ASYNC__'}}
 }
 const b=refreshTopics();
 if(/\b(remember|yaad rakho|save)\b/.test(l)&&/\b(my|meri|mera|mere)\b/.test(l)){const text=q.replace(/^.*?\b(?:remember|yaad rakho|save)\b\s*/i,'');b.preferences.note=text;save(b);return 'Yaad rakh liya. Ye Study Brain ki local memory me save hai.'}
 if(/\b(memory|yaad|remember)\b/.test(l)&&/(show|dikhao|kya|what)/.test(l)){const m=Object.entries(b.preferences).map(([k,v])=>k+': '+v);return m.length?'Saved study memory: '+m.join('; '):'Abhi custom study memory saved nahi hai.'}
 if(/(aaj|today).*(kya|what).*(padhu|padhna|study)|what should i study/.test(l)){const n=nextTask();return 'Aaj ka recommended task: '+n.subject+' → '+n.chapter+' ('+n.type+'). Reason: '+n.why+'.'}
 if(/(next task|agla task|ab kya padhu|what.*next)/.test(l)){const n=nextTask();return 'Next task: '+n.subject+' → '+n.chapter+'. Reason: '+n.why+'.'}
 if(/(revision due|revision.*due|kiski revision|revise.*today)/.test(l)){const d=dueRevisions();return d.length?'Revision due: '+d.slice(0,6).map(x=>x.subject+' → '+x.chapter+' ('+x.nextDue+')').join('; '):'Aaj koi revision due nahi hai.'}
 if(/(revision|revise).*(mark|complete|done|ho gaya)/.test(l)){const subject=['Physics','Chemistry','Mathematics','English','Hindi'].find(s=>new RegExp(s,'i').test(q));const c=parseChapter(q,subject);if(subject&&c){markRevision(subject,c);return 'Revision complete mark kar diya: '+subject+' → '+c+'.'}return 'Subject aur chapter ka naam bhi bolo, jaise: Current Electricity revision complete.'}
 if(/(wrong|mistake).*(repeat|repeated|baar baar|again|same|intelligence|analysis)/.test(l)){const m=mistakeProfile().filter(x=>x.count>1);return m.length?'Repeated mistakes: '+m.slice(0,5).map(x=>x.subject+' → '+x.chapter+' — '+x.count+'× ('+x.label+')').join('; '):'Abhi repeated mistake pattern nahi mila.'}
 if(/(why.*weak|weak.*why|kyun weak|kamzor.*kyu|reason.*weak)/.test(l)){const subject=['Physics','Chemistry','Mathematics','English','Hindi'].find(s=>new RegExp(s,'i').test(q));const c=parseChapter(q,subject);if(subject&&c){const w=whyWeak(subject,c);return subject+' → '+c+': '+w.text+' Accuracy '+w.accuracy+'%, tests '+w.tests+'.'}return 'Subject + chapter bolo, jaise: Why is Current Electricity weak?'}
 if(/(start|shuru|begin).*(test|quiz)|test.*start|quiz.*start/.test(l)){
 const subject=['Physics','Chemistry','Mathematics','English','Hindi'].find(s=>new RegExp(s,'i').test(q)),ch=parseChapter(q,subject);
 if(subject&&ch&&typeof window.startQuestionTest==='function'){window.startQuestionTest(subject,ch,10,15,'brain');return 'Test start kar raha hoon: '+subject+' → '+ch+'.'}
 return 'Test start karne ke liye subject + chapter bolo, jaise: Current Electricity ka test start karo.';
}
if(/(analytics|analytics report|real analysis|study analytics|dashboard analysis)/.test(l)){openBrainReport();return 'Advanced Study Analytics open kar diya.'}
 if(/(xp|level|streak|achievement)/.test(l)){const x=xpInfo();return 'Level: '+x.level+' · XP: '+x.xp+' · Streak: '+x.streak+' days · Achievements: '+(x.achievements.join(', ')||'none')+'.'}
 if(/(library|lecture|pdf|notes)/.test(l)){let subject=['Physics','Chemistry','Mathematics','English','Hindi','English Grammar'].find(s=>new RegExp(s,'i').test(q));const c=parseChapter(q,subject);const type=/lecture|youtube|video/.test(l)?'youtube':/pdf|notes/.test(l)?'pdf':null;if(/open|kholo|dikhao|show/.test(l)){libraryCommand(subject,c,type).then(x=>window.JarvisBrainSay?.(x));return '__ASYNC__'}return libraryCommand(subject,c,type).then(x=>x)}
 if(/(performance|analysis|score|accuracy).*(chapter|topic)/.test(l)){const subject=['Physics','Chemistry','Mathematics','English','Hindi'].find(s=>new RegExp(s,'i').test(q));const c=parseChapter(q,subject);if(subject&&c){const a=analyzeChapter(subject,c);return subject+' → '+c+': '+a.accuracy+'% accuracy, '+a.attempts+' tests, '+a.correct+'/'+a.total+' correct. '+(a.latest?'Last test '+a.latest.percent+'%.':'No latest test.')}} 
 if(/(study health|padhai status|meri padhai|overall study)/.test(l)){const ts=tests(),total=ts.reduce((a,t)=>a+Number(t.total||0),0),correct=ts.reduce((a,t)=>a+Number(t.score||0),0),x=xpInfo();return 'Study status: '+ts.length+' tests, '+(total?Math.round(correct/total*100):0)+'% test accuracy, '+dueRevisions().length+' revisions due, '+x.streak+' day streak, '+x.xp+' XP.'}
 return null;
}
function openBrainReport(){
 let p=document.getElementById('jarvisPanel');if(!p)return;
 let r=document.getElementById('studyBrainReport');if(!r){r=document.createElement('div');r.id='studyBrainReport';p.insertBefore(r,p.querySelector('.jarvis-input')||null)}
 const b=refreshTopics(),x=xpInfo(),due=dueRevisions(),mist=mistakeProfile().filter(m=>m.count>1),weak=Object.values(b.topics).filter(t=>t.tests).sort((a,c)=>a.accuracy-c.accuracy).slice(0,5);
 r.innerHTML='<div class="sbr"><b>🧠 Advanced Study Brain</b><div class="sbr-grid"><span><strong>'+x.xp+'</strong><small>XP</small></span><span><strong>'+x.streak+'</strong><small>Day Streak</small></span><span><strong>'+due.length+'</strong><small>Revision Due</small></span><span><strong>'+mist.length+'</strong><small>Repeated Mistakes</small></span></div><div><b>🎯 Next Task</b><p>'+esc((()=>{const n=nextTask();return n.subject+' → '+n.chapter+' · '+n.why})())+'</p></div><div><b>❌ Weak Signals</b><p>'+esc(weak.length?weak.map(t=>t.subject+' → '+t.chapter+' '+t.accuracy+'%').join(' · '):'Not enough test data')+'</p></div><div><b>🔄 Revision</b><p>'+esc(due.length?due.slice(0,5).map(r=>r.subject+' → '+r.chapter+' ('+r.nextDue+')').join(' · '):'No revision due')+'</p></div><div><b>🏆 Achievements</b><p>'+esc(x.achievements.join(' · ')||'Complete study/test/revision activity to unlock.')+'</p></div></div>';
}
window.DisciplineBrain={answer:studyBrainAnswer,refresh:refreshTopics,dueRevisions,nextTask,xpInfo,markRevision,ensureRevision,mistakeProfile,whyWeak,openReport:openBrainReport,routineNow:()=>{const s=window.DisciplineMasterRoutine;return s?.now?s.now():null}};
window.JarvisBrainSay=(t)=>{const o=document.getElementById('jarvisReply');if(o)o.textContent=t;if('speechSynthesis'in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=/[\u0900-\u097f]/.test(String(t))?'hi-IN':'en-IN';u.rate=.94;speechSynthesis.speak(u)}catch{}}};
function inject(){
 const hook=()=>{
  const panel=document.getElementById('jarvisPanel');if(!panel)return setTimeout(hook,300);
  if(document.getElementById('studyBrainStyle'))return;
  const st=document.createElement('style');st.id='studyBrainStyle';st.textContent='.sbr{margin:0 12px 10px;padding:10px;border:1px solid rgba(110,170,255,.2);border-radius:13px;background:#0b1424;color:#eef4ff;font-size:12px}.sbr-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:8px 0}.sbr-grid span{background:#14213a;border-radius:8px;padding:7px;text-align:center}.sbr-grid strong{display:block;font-size:16px}.sbr-grid small{color:#91a0ba}.sbr p{margin:5px 0 0;color:#aebbd0;line-height:1.4}@media(max-width:560px){.sbr-grid{grid-template-columns:repeat(2,1fr)}}';document.head.appendChild(st);
  const btn=document.createElement('button');btn.id='studyBrainBtn';btn.className='jarvis-mic';btn.textContent='🧠 Study Brain';btn.style.margin='0 12px 10px';btn.onclick=openBrainReport;panel.querySelector('.jarvis-actions')?.appendChild(btn);
  const input=document.getElementById('jarvisInput');if(!input)return;
  const run=async()=>{const q=input.value.trim();if(!q)return;const ans=studyBrainAnswer(q);if(ans&&ans!=='__ASYNC__'){if(ans instanceof Promise){JarvisBrainSay(await ans)}else JarvisBrainSay(ans)}};
  input.addEventListener('keydown',async e=>{if(e.key==='Enter'){const q=input.value;const a=studyBrainAnswer(q);if(a){e.preventDefault();e.stopImmediatePropagation();if(a instanceof Promise)JarvisBrainSay(await a);else if(a!=='__ASYNC__')JarvisBrainSay(a)}}},true);
  document.getElementById('jarvisSend')?.addEventListener('click',async e=>{const q=input.value,a=studyBrainAnswer(q);if(a){e.preventDefault();e.stopImmediatePropagation();if(a instanceof Promise)JarvisBrainSay(await a);else if(a!=='__ASYNC__')JarvisBrainSay(a)}},true);
  // Activity/test observer
  let sig='';setInterval(()=>{const ts=tests(),s=JSON.stringify(ts.map(t=>[t.id,t.percent,t.date]));if(s!==sig){sig=s;refreshTopics();if(ts.length)addXP(10,'test');}},4000);
 };
 hook();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();