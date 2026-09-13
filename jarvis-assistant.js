(()=>{
  'use strict';
  const BLOCKED=/\b(phonepe|upi|gpay|google pay|paytm|bank|banking|netbanking|otp|one[- ]?time password|password|pin|passcode|cvv|card number|debit card|credit card)\b/i;
  const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const state={listening:false};
  function toast(m){if(typeof window.toast==='function')window.toast(m);}
  function say(text){
    const out=document.getElementById('jarvisReply'); if(out) out.textContent=text;
    if('speechSynthesis' in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-IN';u.rate=.95;speechSynthesis.speak(u)}catch{}}
  }
  function openPage(id){const b=document.querySelector(`[data-page="${CSS.escape(id)}"]`);if(b){b.click();return true}return false}
  function runCommand(raw){
    const q=raw.trim(); if(!q)return;
    if(BLOCKED.test(q)){say('Sorry, I will never access banking, UPI, payment apps, passwords, PINs or OTPs.');return}
    const l=q.toLowerCase();
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
      say('I can navigate your study dashboard, open syllabus, PYQ, tests, wrong questions, progress and routine, and use voice input. Sensitive payment, banking, password and OTP access stays blocked.');return
    }
    say('I can control the study app and use supported phone features only. Try: open syllabus, show progress, open wrong questions, or open routine.');
  }
  function startVoice(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){say('Voice input is not supported by this browser. You can still type commands.');return}
    if(state.listening){state.rec?.stop();return}
    const r=new SR();state.rec=r;state.listening=true;r.lang='en-IN';r.interimResults=false;r.maxAlternatives=1;
    r.onstart=()=>{state.listening=true;document.getElementById('jarvisMic')?.classList.add('live');say('I am listening.');};
    r.onresult=e=>{const text=e.results?.[0]?.[0]?.transcript||'';document.getElementById('jarvisInput').value=text;runCommand(text)};
    r.onerror=()=>say('I could not hear that. Please try again.');
    r.onend=()=>{state.listening=false;document.getElementById('jarvisMic')?.classList.remove('live');};
    try{r.start()}catch{}
  }
  function inject(){
    if(document.getElementById('jarvisWidget'))return;
    const box=document.createElement('div');box.id='jarvisWidget';box.innerHTML=`<button id="jarvisFab" class="jarvis-fab" aria-label="Open AI assistant">✦</button><div id="jarvisPanel" class="jarvis-panel" hidden><div class="jarvis-head"><div><b>JARVIS</b><small>Study & phone assistant</small></div><button id="jarvisClose" class="jarvis-close">×</button></div><div class="jarvis-safe">🔒 Banking • UPI • passwords • PIN • OTP: blocked</div><div id="jarvisReply" class="jarvis-reply">Hello Sajid. I’m ready. Say or type a command.</div><div class="jarvis-actions"><button id="jarvisMic" class="jarvis-mic">🎙️ Voice</button></div><div class="jarvis-input"><input id="jarvisInput" placeholder="Try: open syllabus" autocomplete="off"><button id="jarvisSend">Send</button></div><div class="jarvis-hints"><button data-cmd="open syllabus">Syllabus</button><button data-cmd="show progress">Progress</button><button data-cmd="open wrong questions">Wrong</button><button data-cmd="open routine">Routine</button></div></div>`;
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
