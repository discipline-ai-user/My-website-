(()=>{'use strict';
const DB='discipline_ai_study_library_v1',STORE='resources',NOTE_KEY='discipline_ai_class_notes_v1',DONE_KEY='discipline_ai_class_done_v1';
const SUBJECTS=(window.DisciplineLibrary&&window.DisciplineLibrary.subjects)||{
 Physics:['Electric Charges and Fields','Electrostatic Potential and Capacitance','Current Electricity','Moving Charges and Magnetism','Magnetism and Matter','Electromagnetic Induction','Alternating Current','Electromagnetic Waves','Ray Optics and Optical Instruments','Wave Optics','Dual Nature of Radiation and Matter','Atoms','Nuclei','Semiconductor Electronics'],
 Chemistry:['Solutions','Electrochemistry','Chemical Kinetics','d- and f-Block Elements','Coordination Compounds','Haloalkanes and Haloarenes','Alcohols, Phenols and Ethers','Aldehydes, Ketones and Carboxylic Acids','Amines','Biomolecules, Polymers and Chemistry in Everyday Life'],
 Mathematics:['Relations and Functions','Inverse Trigonometric Functions','Matrices','Determinants','Continuity and Differentiability','Application of Derivatives','Integrals','Application of Integrals','Differential Equations','Vector Algebra','Three Dimensional Geometry','Linear Programming','Probability'],
 English:['Indian Civilization and Culture','Bharat is My Home','A Pinch of Snuff','I Have a Dream','Ideas that have Helped Mankind','The Artist','A Child Born','How Free is the Press','The Earth','India Through a Traveller’s Eyes','A Marriage Proposal','Sweetest Love I do not Goe','Song of Myself','Now the Leaves are Falling Fast','An Epitaph','The Soldier','Macavity: The Mystery Cat','Fire-Hymn','Snake','My Grandmother’s House'],
 Hindi:['बातचीत','उसने कहा था','संपूर्ण क्रांति','अर्थनारीश्वर','रोज','एक लेख और एक पत्र','ओ सदानीरा','सिपाही की माँ','प्रेम और समाज','जूठन','हँसते हुए मेरा अकेलापन','तिरिछ','शिक्षा','कड़बक','पद — सूरदास','पद — तुलसीदास','छप्पय','कवित्त','तुमुल कोलाहल कलह में','पुत्र-वियोग','उषा','जन-जन का चेहरा एक','अधिनायक','प्यारे नन्हें बेटे को','हार-जीत','गाँव का घर','रस्सी का टुकड़ा','क्लर्क की मौत','पैगनी'],
 'English Grammar':['Tenses','Narration (Direct and Indirect Speech)','Voice (Active and Passive)','Modals','Articles','Prepositions','Conjunctions','Subject-Verb Agreement','Parts of Speech','Transformation of Sentences','Question Tags','Adjective','Adverb']
};
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const ytId=url=>{try{const u=new URL(url);if(u.hostname.includes('youtu.be'))return u.pathname.slice(1).split('/')[0];if(u.searchParams.get('v'))return u.searchParams.get('v');const m=u.pathname.match(/\/embed\/([^/]+)/);if(m)return m[1];const live=u.pathname.match(/\/live\/([^/]+)/);if(live)return live[1];const shorts=u.pathname.match(/\/shorts\/([^/]+)/);return shorts?shorts[1]:''}catch{return''}};
const openDB=()=>new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const all=async()=>{const db=await openDB();return new Promise((res,rej)=>{const q=db.transaction(STORE,'readonly').objectStore(STORE).getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})};
const put=async x=>{const db=await openDB();return new Promise((res,rej)=>{const q=db.transaction(STORE,'readwrite').objectStore(STORE).add(x);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})};
const notes=()=>{try{return JSON.parse(localStorage.getItem(NOTE_KEY))||{}}catch{return{}}};
const done=()=>{try{return JSON.parse(localStorage.getItem(DONE_KEY))||{}}catch{return{}}};
const saveNotes=x=>localStorage.setItem(NOTE_KEY,JSON.stringify(x));
const saveDone=x=>localStorage.setItem(DONE_KEY,JSON.stringify(x));
const key=(s,c)=>s+'::'+c;
let items=[],state={subject:'Physics',chapter:'',tab:'all',openResource:null};
function css(){
 if(document.getElementById('classroomCss'))return;
 const st=document.createElement('style');st.id='classroomCss';st.textContent=`
.classroom-wrap{margin-top:16px}.cr-top{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}.cr-xp{font-weight:800}.cr-tabs,.cr-subtabs{display:flex;gap:8px;overflow:auto;padding:8px 0}.cr-tabs button,.cr-subtabs button{white-space:nowrap}.cr-tabs .active,.cr-subtabs .active{background:var(--accent,#6d5dfc);color:#fff}.cr-chapters,.cr-subjects{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.cr-chapter,.cr-subject{cursor:pointer;transition:.18s}.cr-chapter:hover,.cr-subject:hover{transform:translateY(-2px)}.cr-chapter h3,.cr-subject h3{margin:0 0 7px}.cr-meta{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--muted,#8f98ad)}.cr-bar{height:7px;border-radius:99px;background:rgba(127,127,127,.18);overflow:hidden;margin:10px 0}.cr-bar i{display:block;height:100%;background:var(--accent,#6d5dfc)}.cr-room{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(250px,.7fr);gap:14px}.cr-player,.cr-list,.cr-note{min-width:0}.cr-video{width:100%;aspect-ratio:16/9;border:0;border-radius:14px;background:#000}.cr-pdf{width:100%;height:72vh;border:0;border-radius:14px;background:#111}.cr-resource{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border:1px solid rgba(127,127,127,.16);border-radius:12px;margin:8px 0}.cr-resource.active{outline:2px solid var(--accent,#6d5dfc)}.cr-resource small{display:block;color:var(--muted,#8f98ad);margin-top:3px}.cr-note textarea{width:100%;min-height:420px;resize:vertical}.cr-banner{padding:12px 14px;border-radius:12px;background:rgba(109,93,252,.10);margin:12px 0}.cr-empty{text-align:center;padding:30px 12px;color:var(--muted,#8f98ad)}.cr-actions{display:flex;gap:8px;flex-wrap:wrap}.cr-check{display:flex;gap:8px;align-items:center}.cr-form{display:grid;gap:10px}.cr-form .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.seq,.cr-num{font-size:11px;font-weight:800;letter-spacing:.08em;color:var(--muted,#8f98ad)}.cr-room-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.cr-room-action{padding:14px;border:1px solid rgba(127,127,127,.16);border-radius:12px;cursor:pointer}.cr-room-action small{display:block;color:var(--muted,#8f98ad);margin-top:5px}@media(max-width:800px){.cr-room{grid-template-columns:1fr}.cr-form .row{grid-template-columns:1fr}.cr-pdf{height:65vh}.cr-room-actions{grid-template-columns:1fr 1fr}}`;
 document.head.appendChild(st);
}
function dashboardCard(){
 const p=document.getElementById('pages');if(!p||document.getElementById('classroomCard'))return;
 const card=document.createElement('div');card.id='classroomCard';card.className='card classroom-wrap';
 card.innerHTML='<div class="cr-top"><div><h3>🎓 Study Classroom</h3><p class="muted">Lecture, PDF, notes, DPP aur progress — isi website ke andar.</p></div><button class="btn" id="openClassroomBtn">Open Classroom</button></div>';
 p.prepend(card);document.getElementById('openClassroomBtn').onclick=()=>openClassroom();
}
async function openClassroom(subject=state.subject,chapter=''){
 state.subject=subject;state.chapter=chapter||'';state.tab='all';state.openResource=null;
 const p=document.getElementById('pages');if(!p)return;css();
 try{items=await all()}catch(e){items=[]}
 renderClassroom(p);
}
function chapterResources(s,c){return items.filter(x=>x.subject===s&&x.chapter===c)}
function kindOf(x){return x.kind||(x.type==='youtube'?'lecture':'notes')}
function count(c,kind){return chapterResources(state.subject,c).filter(x=>kindOf(x)===kind).length}
function completion(c,kind){const d=done()[key(state.subject,c)]||{};return Number(d[kind]||0)}
function classroomHome(){
 const subjectNames=Object.keys(SUBJECTS);
 const cs=SUBJECTS[state.subject]||[];
 return `<section class="page active"><div class="eyebrow">Discipline AI • Study Classroom</div>
 <div class="cr-top"><div><h1 class="title">🎓 Study Classroom</h1><p class="sub">Pehle subject select karo, phir chapter sequence me class workspace kholo.</p></div><div class="cr-xp">⚡ XP ${calcXP()}</div></div>
 <div class="card cr-banner">📚 <b>Complete Study Sequence:</b> Subject → Chapter → Lecture → Notes → DPP → Test → Revision → Progress</div>
 <h2 style="margin:18px 0 8px">1. Select Subject</h2>
 <div class="cr-subjects">${subjectNames.map((s,i)=>`<div class="card cr-subject" data-cr-sub="${esc(s)}"><div class="seq">SUBJECT ${String(i+1).padStart(2,'0')}</div><h3>${esc(s)}</h3><div class="cr-meta"><span>${(SUBJECTS[s]||[]).length} chapters/topics</span><span>Open →</span></div></div>`).join('')}</div>
 <h2 style="margin:24px 0 8px">2. ${esc(state.subject)} — Chapter Sequence</h2>
 <div class="cr-chapters">${cs.map((c,i)=>{const ls=count(c,'lecture'),dp=count(c,'dpp-pdf')+count(c,'dpp-video'),ld=completion(c,'lecture'),dd=completion(c,'dpp');const pct=Math.round(((ls?Math.min(ld,ls)/ls:0)+(dp?Math.min(dd,dp)/dp:0))/((ls?1:0)+(dp?1:0)||1)*100);return `<div class="card cr-chapter" data-cr-chapter="${esc(c)}"><div class="cr-num">CHAPTER ${String(i+1).padStart(2,'0')}</div><h3>${esc(c)}</h3><div class="cr-meta"><span>🎥 Lectures ${ld}/${ls}</span><span>📝 DPP ${dd}/${dp}</span></div><div class="cr-bar"><i style="width:${pct}%"></i></div><div class="cr-meta"><span>${pct}% progress</span><span>Open →</span></div></div>`}).join('')}</div></section>`;
}
function calcXP(){let xp=0;Object.values(done()).forEach(v=>{xp+=Number(v.xp||0)});return xp}
function renderClassroom(p){
 p.innerHTML=state.chapter?classroomRoom():classroomHome();
 if(!state.chapter){
   document.querySelectorAll('[data-cr-sub]').forEach(b=>b.onclick=()=>openClassroom(b.dataset.crSub,''));
   document.querySelectorAll('[data-cr-chapter]').forEach(b=>b.onclick=()=>openClassroom(state.subject,b.dataset.crChapter));
 }else bindRoom();
 window.scrollTo({top:0,behavior:'smooth'});
}
function classroomRoom(){
 const rs=chapterResources(state.subject,state.chapter);
 const lectures=rs.filter(x=>kindOf(x)==='lecture'),notesRs=rs.filter(x=>kindOf(x)==='notes'),dppPdf=rs.filter(x=>kindOf(x)==='dpp-pdf'),dppVideo=rs.filter(x=>kindOf(x)==='dpp-video');
 const allRs=state.tab==='lectures'?lectures:state.tab==='notes'?notesRs:state.tab==='dpps'?[...dppPdf,...dppVideo]:state.tab==='dpp-pdfs'?dppPdf:state.tab==='dpp-videos'?dppVideo:rs;
 const first=state.openResource||(allRs[0]?.uid||allRs[0]?.id);
 const selected=rs.find(x=>String(x.uid||x.id)===String(first))||allRs[0];
 return `<section class="page active"><div class="cr-top"><div><button class="btn secondary" id="crBack">← ${esc(state.subject)}</button><h1 class="title" style="margin-top:10px">${esc(state.chapter)}</h1><p class="sub">🎥 ${lectures.length} lectures • 📄 ${notesRs.length} notes • 📝 ${dppPdf.length+dppVideo.length} DPP</p></div><div class="cr-xp">⚡ XP ${calcXP()}</div></div>
 <div class="card cr-banner">Study here. <b>Watch → Notes → DPP → Mark complete.</b> Tumhara chapter workspace isi page par rahega.</div>
 <div class="cr-room-actions"><div class="cr-room-action" data-cr-action="class"><b>🎥 Class Lecture</b><small>Video class yahin attend karo</small></div><div class="cr-room-action" data-cr-action="notes"><b>📝 Chapter Notes</b><small>Notes padho aur apne notes likho</small></div><div class="cr-room-action" data-cr-action="test"><b>🧠 Chapter Test</b><small>Isi chapter ka test do</small></div><div class="cr-room-action" data-cr-action="dpp"><b>📚 DPP Practice</b><small>DPP solve karo</small></div></div>
 <div class="cr-subtabs">${[['all','All'],['lectures','Lectures'],['notes','Notes'],['dpps','DPPs'],['dpp-pdfs','DPP PDFs'],['dpp-videos','DPP Videos'],['test','Test']].map(t=>`<button class="btn ${state.tab===t[0]?'active':''}" data-cr-tab="${t[0]}">${t[1]}</button>`).join('')}</div>
 <div class="cr-actions" style="margin:8px 0 14px"><button class="btn" id="addMaterial">➕ Add Class Material</button><button class="btn secondary" id="openNotes">📝 My Notes</button></div>
 <div class="cr-room"><div class="cr-player">${viewer(selected)}</div><div class="card cr-list"><h3>${labelForTab(state.tab)}</h3>${allRs.length?allRs.map(x=>resourceRow(x,selected)).join(''):'<div class="cr-empty">Is tab me abhi material nahi hai.<br><br>Add Class Material se lecture/PDF/DPP add karo.</div>'}</div></div>
 <div id="crNoteBox"></div></section>`;
}
function labelForTab(t){return({all:'Class Material',lectures:'Lectures',notes:'Notes',dpps:'DPPs','dpp-pdfs':'DPP PDFs','dpp-videos':'DPP Videos',test:'Chapter Test'})[t]||'Class Material'}
function resourceRow(x,sel){
 const k=kindOf(x),isDone=(done()[key(state.subject,state.chapter)]||{})[k==='dpp-pdf'||k==='dpp-video'?'dpp':'lecture']||0;
 return `<div class="cr-resource ${sel&&String(sel.uid||sel.id)===String(x.uid||x.id)?'active':''}"><div style="min-width:0"><b>${k==='lecture'?'🎥':k==='notes'?'📄':'📝'} ${esc(x.title||'Untitled')}</b><small>${esc(x.fileName||'')} ${x.duration?'• '+esc(x.duration):''}</small></div><div class="cr-actions"><button class="btn secondary cr-open" data-rid="${esc(x.uid||x.id)}">Open</button></div></div>`;
}
function viewer(x){
 if(!x)return '<div class="card cr-empty"><div style="font-size:40px">📚</div><h3>Classroom ready</h3><p>Add your lecture/PDF/DPP to start studying.</p></div>';
 const k=kindOf(x),dk=k==='dpp-pdf'||k==='dpp-video'?'dpp':'lecture',d=done()[key(state.subject,state.chapter)]||{},checked=Number(d[dk]||0)>0;
 if(k==='lecture'||k==='dpp-video'){
   const id=ytId(x.url);if(!id)return '<div class="card cr-empty">Valid YouTube URL nahi mila.</div>';
   return `<div class="card"><iframe class="cr-video" src="https://www.youtube.com/embed/${encodeURIComponent(id)}?playsinline=1&rel=0" title="${esc(x.title||'Lecture')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><h3 style="margin-top:12px">${esc(x.title||'Lecture')}</h3><label class="cr-check"><input id="crComplete" type="checkbox" ${checked?'checked':''}> Mark as completed</label><p class="muted">Agar kisi video owner ne embedding disable ki hai, video yahan play nahi hoga.</p></div>`;
 }
 if(x.blob){const u=URL.createObjectURL(x.blob);setTimeout(()=>{try{URL.revokeObjectURL(u)}catch{}},120000);return `<div class="card"><iframe class="cr-pdf" src="${u}" title="${esc(x.title||'PDF')}"></iframe><h3 style="margin-top:12px">${esc(x.title||'PDF')}</h3><label class="cr-check"><input id="crComplete" type="checkbox" ${checked?'checked':''}> Mark as completed</label></div>`}
 return '<div class="card cr-empty">PDF file available nahi hai. Browser storage me file dobara add karni padegi.</div>';
}
function bindRoom(){
 document.getElementById('crBack')?.addEventListener('click',()=>openClassroom(state.subject));
 document.querySelectorAll('[data-cr-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.crTab;renderClassroom(document.getElementById('pages'))});
 document.querySelectorAll('[data-cr-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.crAction;if(a==='class'){state.tab='lectures';renderClassroom(document.getElementById('pages'));return}if(a==='notes'){showNotes();return}if(a==='dpp'){state.tab='dpps';renderClassroom(document.getElementById('pages'));return}if(a==='test'){if(typeof window.startQuestionTest==='function'){window.startQuestionTest(state.subject,state.chapter,10,15,'classroom')}else{alert('Test Center abhi load nahi hua. Page refresh karke try karo.')}}});
 document.querySelectorAll('.cr-open').forEach(b=>b.onclick=()=>{state.openResource=b.dataset.rid;renderClassroom(document.getElementById('pages'))});
 document.getElementById('crComplete')?.addEventListener('change',e=>markComplete(e.target.checked));
 document.getElementById('openNotes')?.addEventListener('click',()=>showNotes());
 document.getElementById('addMaterial')?.addEventListener('click',()=>showAddMaterial());
}
function markComplete(on){
 const allDone=done(),k=key(state.subject,state.chapter),d=allDone[k]||{lecture:0,dpp:0,xp:0};const rs=chapterResources(state.subject,state.chapter);const x=rs.find(v=>String(v.uid||v.id)===String(state.openResource));const kind=x&&(kindOf(x)==='dpp-pdf'||kindOf(x)==='dpp-video')?'dpp':'lecture';if(on){d[kind]=Math.max(1,Number(d[kind]||0));d.xp=Math.max(Number(d.xp||0),Number(d.lecture||0)+Number(d.dpp||0))*10}else{d[kind]=0;d.xp=Math.max(0,Number(d.lecture||0)+Number(d.dpp||0))*10}allDone[k]=d;saveDone(allDone);renderClassroom(document.getElementById('pages'))}
function showNotes(){
 const p=document.getElementById('pages'),n=notes(),k=key(state.subject,state.chapter);
 const box=document.createElement('div');box.className='card cr-note';box.innerHTML='<div class="section"><div><h3>📝 My Notes — '+esc(state.chapter)+'</h3><p class="muted">Notes isi browser me auto-save honge.</p></div><button class="btn secondary" id="closeNotes">Close</button></div><textarea id="myChapterNotes" class="input" placeholder="Aaj class me kya padha? Formula, doubts, examples...">'+esc(n[k]||'')+'</textarea><div class="cr-actions" style="margin-top:10px"><button class="btn" id="saveChapterNotes">Save Notes</button></div>';
 p.appendChild(box);document.getElementById('saveChapterNotes').onclick=()=>{const z=notes();z[k]=document.getElementById('myChapterNotes').value;saveNotes(z);document.getElementById('saveChapterNotes').textContent='✅ Saved';setTimeout(()=>document.getElementById('saveChapterNotes').textContent='Save Notes',1000)};document.getElementById('closeNotes').onclick=()=>box.remove();box.scrollIntoView({behavior:'smooth'});
}
function showAddMaterial(){
 const p=document.getElementById('pages');
 if(document.getElementById('classMaterialForm')){document.getElementById('classMaterialForm').scrollIntoView({behavior:'smooth'});return;}
 const box=document.createElement('div');box.id='classMaterialForm';box.className='card cr-note';
 const currentSubject=state.subject||'Physics', currentChapter=state.chapter||'';
 box.innerHTML=`<div class="section"><div><h3>➕ Add Class</h3><p class="muted">Lecture ko subject aur chapter ke andar save karo. Save ke baad wahi chapter automatically open hoga.</p></div><button class="btn secondary" id="closeAdd">Close</button></div>
 <div class="cr-form">
 <div class="row"><label>Subject<select id="matSubject" class="select">${Object.keys(SUBJECTS).map(s=>`<option value="${esc(s)}" ${s===currentSubject?'selected':''}>${esc(s)}</option>`).join('')}</select></label>
 <label>Chapter<select id="matChapter" class="select"></select></label></div>
 <div class="row"><label>Lecture No.<input id="matLectureNo" class="input" type="number" min="1" placeholder="1"></label><label>Duration<input id="matDuration" class="input" placeholder="e.g. 52 min"></label></div>
 <label>Lecture Title<input id="matTitle" class="input" placeholder="e.g. Electric Current — Lecture 01"></label>
 <label>Type<select id="matType" class="select"><option value="lecture">🎥 Class Lecture — YouTube</option><option value="notes">📄 Notes — PDF</option><option value="dpp-pdf">📝 DPP — PDF</option><option value="dpp-video">🎥 DPP — Video</option></select></label>
 <label id="matUrlWrap">YouTube URL<input id="matUrl" class="input" placeholder="https://youtube.com/live/..."></label>
 <label id="matFileWrap" style="display:none">PDF file<input id="matFile" type="file" accept="application/pdf"></label>
 <button class="btn" id="saveMaterial">Save to Classroom</button></div>`;
 p.appendChild(box);
 const sub=box.querySelector('#matSubject'),ch=box.querySelector('#matChapter'),t=box.querySelector('#matType'),uw=box.querySelector('#matUrlWrap'),fw=box.querySelector('#matFileWrap');
 const fill=()=>{const list=SUBJECTS[sub.value]||[];ch.innerHTML='<option value="">Select Chapter</option>'+list.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');if(sub.value===currentSubject&&currentChapter&&list.includes(currentChapter))ch.value=currentChapter};
 fill();sub.onchange=fill;
 t.onchange=()=>{const isPdf=t.value==='notes'||t.value==='dpp-pdf';uw.style.display=isPdf?'none':'block';fw.style.display=isPdf?'block':'none'};t.onchange();
 box.querySelector('#closeAdd').onclick=()=>box.remove();
 box.querySelector('#saveMaterial').onclick=async()=>{
   const subject=sub.value,chapter=ch.value,kind=t.value,title=box.querySelector('#matTitle').value.trim()||'Untitled';
   if(!chapter)return alert('Subject ke andar chapter select karo.');
   const x={subject,chapter,title,kind,createdAt:new Date().toISOString(),uid:(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random())};
   const no=box.querySelector('#matLectureNo').value.trim(),dur=box.querySelector('#matDuration').value.trim();
   if(no)x.lectureNo=Number(no);if(dur)x.duration=dur;
   if(kind==='lecture'||kind==='dpp-video'){x.type='youtube';x.url=box.querySelector('#matUrl').value.trim();if(!ytId(x.url))return alert('Valid YouTube URL add karo.')}
   else{x.type='pdf';const f=box.querySelector('#matFile').files[0];if(!f)return alert('PDF choose karo.');x.fileName=f.name;x.mime=f.type;x.blob=f}
   await put(x);items=await all();box.remove();state.subject=subject;state.chapter=chapter;state.tab=kind==='lecture'||kind==='dpp-video'?(kind==='lecture'?'lectures':'dpp-videos'):(kind==='notes'?'notes':'dpp-pdfs');state.openResource=x.uid;renderClassroom(document.getElementById('pages'));
 };
}

const ob=new MutationObserver(()=>{css();dashboardCard()});ob.observe(document.body,{childList:true,subtree:true});setTimeout(()=>{css();dashboardCard()},900);
window.DisciplineClassroom={open:openClassroom};
})();