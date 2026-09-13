(()=>{
  'use strict';
  const BLOCKED=/\b(phonepe|upi|gpay|google pay|paytm|bank|banking|netbanking|otp|one[- ]?time password|password|pin|passcode|cvv|card number|debit card|credit card)\b/i;
  const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const state={listening:false};
  function toast(m){if(typeof window.toast==='function')window.toast(m)}
  function say(text){
    const out=document.getElementById('jarvisReply');if(out)out.textContent=text;
    if('speechSynthesis' in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-IN';u.rate=.95;speechSynthesis.speak(u)}catch{}}
  }
  function openPage(id){const b=document.querySelector(`[data-page="${CSS.escape(id)}"]`);if(b){b.click();return true}return false}
  function records(){return Array.isArray(window.tests)?window.tests:[]}
  function pyqRecords(){return records().filter(t=>t.sourceType==='pyq')}
  function analyze(){
    const ts=records();if(!ts.length){say('Abhi koi completed test record nahi hai. Test dene ke baad main subject aur chapter wise analysis karunga.');return}
    const avg=Math.round(ts.reduce((a,t)=>a+Number(t.percent||0),0)/ts.length);
    const correct=ts.reduce((a,t)=>a+Number(t.score||0),0);
    const total=ts.reduce((a,t)=>a+Number(t.total||0),0);
    const wrong=ts.reduce((a,t)=>a+Math.max(0,Number(t.total||0)-Number(t.score||0)-(t.answers||[]).filter(x=>x===null).length),0);
    const skipped=ts.reduce((a,t)=>a+(t.answers||[]).filter(x=>x===null).length,0);
    const bySubject={};const byChapter={};
    ts.forEach(t=>{
      const s=t.subject||'Unknown',c=t.chapter||'Unknown';
      bySubject[s]??={n:0,sum:0,correct:0,total:0};bySubject[s].n++;bySubject[s].sum+=Number(t.percent||0);bySubject[s].correct+=Number(t.score||0);bySubject[s].total+=Number(t.total||0);
      const k=s+' → '+c;byChapter[k]??={n:0,sum:0,correct:0,total:0};byChapter[k].n++;byChapter[k].sum+=Number(t.percent||0);byChapter[k].correct+=Number(t.score||0);byChapter[k].total+=Number(t.total||0);
    });
    const subjects=Object.entries(bySubject).map(([s,v])=>[s,Math.round(v.sum/v.n)]).sort((a,b)=>b[1]-a[1]);
    const chapters=Object.entries(byChapter).map(([s,v])=>[s,Math.round(v.sum/v.n)]).sort((a,b)=>a[1]-b[1]);
    const best=subjects[0],weak=chapters[0];
    let msg=`Full analysis: ${ts.length} tests, ${avg}% overall average, ${correct}/${total} correct, ${wrong} wrong, ${skipped} unanswered.`;
    if(best)msg+=` Best subject: ${best[0]} ${best[1]}%.`;
    if(weak)msg+=` Weakest chapter: ${weak[0]} ${weak[1]}%.`;
    if(subjects.length>1)msg+=' Subject scores: '+subjects.map(x=>x[0]+' '+x[1]+'%').join(', ')+'.';
    if(chapters.length>1)msg+=' Priority chapters: '+chapters.slice(0,3).map(x=>x[0]+' '+x[1]+'%').join(', ')+'.';
    say(msg);
  }
  function subjectAnalysis(name){
    const ts=records().filter(t=>String(t.subject||'').toLowerCase().includes(name.toLowerCase()));
    if(!ts.length){say(`${name} ka koi test record abhi nahi mila.`);return}
    const avg=Math.round(ts.reduce((a,t)=>a+Number(t.percent||0),0)/ts.length);
    const total=ts.reduce((a,t)=>a+Number(t.total||0),0),correct=ts.reduce((a,t)=>a+Number(t.score||0),0);
    const m={};ts.forEach(t=>{const c=t.chapter||'Unknown';m[c]??={n:0,sum:0};m[c].n++;m[c].sum+=Number(t.percent||0)});
    const cs=Object.entries(m).map(([c,v])=>[c,Math.round(v.sum/v.n)]).sort((a,b)=>a[1]-b[1]);
    say(`${name}: ${ts.length} tests, ${avg}% average, ${correct}/${total} correct. `+(cs.length?`Chapter-wise: ${cs.map(x=>x[0]+' '+x[1]+'%').join(', ')}.`:''));
  }
  function chapterAnalysis(q){
    const ts=records().filter(t=>String(t.chapter||'').toLowerCase().includes(q.toLowerCase()));
    if(!ts.length){say(`"${q}" chapter ka test record nahi mila.`);return}
    const avg=Math.round(ts.reduce((a,t)=>a+Number(t.percent||0),0)/ts.length);
    const latest=ts.slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    say(`${latest.subject||''} → ${latest.chapter||q}: ${ts.length} attempts, ${avg}% average. Latest score ${latest.score}/${latest.total} (${latest.percent}%).`);
  }
  function runCommand(raw){
    const q=raw.trim();if(!q)return;
    if(BLOCKED.test(q)){say('Sorry, I will never access banking, UPI, payment apps, passwords, PINs or OTPs.');return}
    const l=q.toLowerCase();
    if(/\b(analy[sz]e|analysis|performance|report|record|score|result|marks)\b/.test(l)&&(/test|subject|chapter|performance|record|result|score|marks/.test(l))){
      const sm=l.match(/(?:subject|physics|chemistry|mathematics|maths|english)\s*(?:analysis)?/);
      if(/\bphysics\b/.test(l)){subjectAnalysis('Physics');return}
      if(/\bchemistry\b/.test(l)){subjectAnalysis('Chemistry');return}
      if(/\b(mathematics|maths)\b/.test(l)){subjectAnalysis('Mathematics');return}
      if(/\benglish\b/.test(l)){subjectAnalysis('English');return}
      const cm=l.match(/chapter\s+(?:analysis\s+of\s+)?(.+)/);if(cm){chapterAnalysis(cm[1].replace(/[?.,]+$/,''));return}
      analyze();return
    }
    if(/\b(syllabus|chapters?)\b/.test(l)){openPage('syllabus');say('Opening your Class 12 syllabus.');return}
    if(/\b(progress|performance)\b/.test(l)){openPage('progress');say('Opening your progress.');return}
    if(/\b(wrong|mistakes?)\b/.test(l)){openPage('wrong');say('Opening wrong questions.');return}
    if(/\b(history|previous tests?)\b/.test(l)){openPage('pyqhistory');say('Opening your PYQ history.');return}
    if(/\b(settings?)\b/.test(l)){openPage('settings');say('Opening settings.');return}
    if(/\b(home|dashboard)\b/.test(l)){openPage('dashboard');say('Opening dashboard.');return}
    if(/\b(pyq)\b/.test(l)){openPage('pyq');say('Opening PYQ tools.');return}
    if(/\b(mock|test)\b/.test(l)){openPage('mock');say('Opening the test area.');return}
    if(/\b(focus|routine|study)\b/.test(l)){openPage('routine');say('Opening your study routine.');return}
    if(/^help\b|what can you do|commands/.test(l)){
      say('Main tumhare completed test records se overall, subject-wise aur chapter-wise performance analyze kar sakta hoon. Syllabus, PYQ, history, wrong questions, progress aur routine bhi open kar sakta hoon.');return
    }
    say('Try: "mera test analysis karo", "Physics analysis", "Chemistry analysis", "chapter analysis of Current Electricity", ya "show my records".');
  }
  function startVoice(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){say('Voice input is not supported by this browser. You can still type commands.');return}
    if(state.listening){state.rec?.stop();return}
    const r=new SR();state.rec=r;state.listening=true;r.lang='en-IN';r.interimResults=false;r.maxAlternatives=1;
    r.onstart=()=>{state.listening=true;document.getElementById('jarvisMic')?.classList.add('live');say('I am listening.');};
    r.onresult=e=>{const text=e.results?.[0]?.[0]?.transcript||'';document.getElementById('jarvisInput').value=text;runCommand(text)};
    r.onerror=()=>say('I could not hear that. Please try again.');r.onend=()=>{state.listening=false;document.getElementById('jarvisMic')?.classList.remove('live')};try{r.start()}catch{}
  }
  function inject(){
    if(document.getElementById('jarvisWidget'))return;
    const box=document.createElement('div');box.id='jarvisWidget';box.innerHTML=`<button id="jarvisFab" class="jarvis-fab" aria-label="Open AI assistant">✦</button><div id="jarvisPanel" class="jarvis-panel" hidden><div class="jarvis-head"><div><b>JARVIS</b><small>Study & Test Intelligence</small></div><button id="jarvisClose" class="jarvis-close">×</button></div><div class="jarvis-safe">🔒 Banking • UPI • passwords • PIN • OTP: blocked</div><div id="jarvisReply" class="jarvis-reply">Hello Sajid. Main tumhare test records ko subject aur chapter wise analyze kar sakta hoon.</div><div class="jarvis-actions"><button id="jarvisMic" class="jarvis-mic">🎙️ Voice</button></div><div class="jarvis-input"><input id="jarvisInput" placeholder="Try: mera test analysis karo" autocomplete="off"><button id="jarvisSend">Send</button></div><div class="jarvis-hints"><button data-cmd="mera test analysis karo">📊 Analysis</button><button data-cmd="Physics analysis">Physics</button><button data-cmd="Chemistry analysis">Chemistry</button><button data-cmd="show my records">Records</button></div></div>`;
    document.body.appendChild(box);
    document.getElementById('jarvisFab').onclick=()=>{const p=document.getElementById('jarvisPanel');p.hidden=!p.hidden};
    document.getElementById('jarvisClose').onclick=()=>document.getElementById('jarvisPanel').hidden=true;
    document.getElementById('jarvisSend').onclick=()=>runCommand(document.getElementById('jarvisInput').value);
    document.getElementById('jarvisInput').addEventListener('keydown',e=>{if(e.key==='Enter')runCommand(e.target.value)});
    document.getElementById('jarvisMic').onclick=startVoice;
    box.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>{document.getElementById('jarvisInput').value=b.dataset.cmd;runCommand(b.dataset.cmd)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
