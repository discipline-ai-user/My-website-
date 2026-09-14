(()=>{
'use strict';
const HINDI_SYLLABUS={
  'गद्यखंड':[
    ['बातचीत','बालकृष्ण भट्ट'],
    ['उसने कहा था','चंद्रधर शर्मा गुलेरी'],
    ['संपूर्ण क्रांति','जयप्रकाश नारायण'],
    ['अर्थनारीश्वर','रामधारी सिंह दिनकर'],
    ['रोज','सच्चिदानंद हीरानंद वात्स्यायन अज्ञेय'],
    ['एक लेख और एक पत्र','भगत सिंह'],
    ['ओ सदानीरा','जगदीशचंद्र माथुर'],
    ['सिपाही की माँ','मोहन राकेश'],
    ['प्रेम और समाज','नामवर सिंह'],
    ['जूठन','ओमप्रकाश वाल्मीकि'],
    ['हँसते हुए मेरा अकेलापन','मलयज'],
    ['तिरिछ','उदय प्रकाश'],
    ['शिक्षा','जे. कृष्णमूर्ति']
  ],
  'काव्यखंड':[
    ['कड़बक','मलिक मुहम्मद जायसी'],
    ['पद','सूरदास'],
    ['पद','तुलसीदास'],
    ['छप्पय','नाभादास'],
    ['कवित्त','भूषण'],
    ['तुमुल कोलाहल कलह में','जयशंकर प्रसाद'],
    ['पुत्र-वियोग','सुभद्रा कुमारी चौहान'],
    ['उषा','शमशेर बहादुर सिंह'],
    ['जन-जन का चेहरा एक','गजानन माधव मुक्तिबोध'],
    ['अधिनायक','रघुवीर सहाय'],
    ['प्यारे नन्हें बेटे को','विनोद कुमार शुक्ल'],
    ['हार-जीत','अशोक वाजपेयी'],
    ['गाँव का घर','ज्ञानेंद्रपति']
  ],
  'प्रतिपूर्ति':[
    ['रस्सी का टुकड़ा','गाइ-डि मोपासां'],
    ['क्लर्क की मौत','अंतोन चेखव'],
    ['पैगनी','हेनरी लोपेज']
  ]
};
const ALL_HINDI=[...HINDI_SYLLABUS['गद्यखंड'],...HINDI_SYLLABUS['काव्यखंड'],...HINDI_SYLLABUS['प्रतिपूर्ति']];
function hindiText(){return `Hindi syllabus mein ${ALL_HINDI.length} पाठ हैं:\n\nगद्यखंड (${HINDI_SYLLABUS['गद्यखंड'].length}):\n${HINDI_SYLLABUS['गद्यखंड'].map((x,i)=>`${i+1}. ${x[0]} — ${x[1]}`).join('\n')}\n\nकाव्यखंड (${HINDI_SYLLABUS['काव्यखंड'].length}):\n${HINDI_SYLLABUS['काव्यखंड'].map((x,i)=>`${i+1}. ${x[0]} — ${x[1]}`).join('\n')}\n\nप्रतिपूर्ति (${HINDI_SYLLABUS['प्रतिपूर्ति'].length}):\n${HINDI_SYLLABUS['प्रतिपूर्ति'].map((x,i)=>`${i+1}. ${x[0]} — ${x[1]}`).join('\n')}`}
function speak(t){const o=document.getElementById('jarvisReply');if(o)o.textContent=t;if('speechSynthesis'in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='hi-IN';u.rate=.94;speechSynthesis.speak(u)}catch{}}}
function isHindi(q){return /(hindi|हिंदी|हिन्दी|vyakaran|हिन्दी साहित्य|हिंदी साहित्य)/i.test(q)}
function addJarvis(){const old=window.__disciplineHindiJarvis;if(old)return;window.__disciplineHindiJarvis=true;document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement?.id==='jarvisInput'){const q=document.activeElement.value||'';if(isHindi(q)&&/(syllabus|chapter|chapters|list|batao|बताओ|पाठ|सिलेबस|syllabus batao)/i.test(q)){e.preventDefault();e.stopImmediatePropagation();speak(hindiText())}}},true);document.getElementById('jarvisSend')?.addEventListener('click',e=>{const q=document.getElementById('jarvisInput')?.value||'';if(isHindi(q)&&/(syllabus|chapter|chapters|list|batao|बताओ|पाठ|सिलेबस|syllabus batao)/i.test(q)){e.preventDefault();e.stopImmediatePropagation();speak(hindiText())}},true)}
function addSyllabus(){const card=document.querySelector('.syllabus-card');if(!card||document.getElementById('hindi-syllabus-card'))return;const box=document.createElement('div');box.id='hindi-syllabus-card';box.className='syllabus-card';box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><h3 style="margin:0">🇮🇳 Hindi</h3><p style="margin:5px 0 0;opacity:.75">${ALL_HINDI.length} पाठ · गद्यखंड 13 · काव्यखंड 13 · प्रतिपूर्ति 3</p></div><button id="hindi-syllabus-toggle" class="chapter-test">📚 View Syllabus</button></div><div id="hindi-syllabus-details" style="display:none;margin-top:12px">${Object.entries(HINDI_SYLLABUS).map(([sec,items])=>`<div style="margin-top:12px"><b>${sec} (${items.length})</b>${items.map((x,i)=>`<div style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,.08)">${i+1}. ${x[0]} <span style="opacity:.7">— ${x[1]}</span></div>`).join('')}</div>`).join('')}</div>`;card.parentNode.insertBefore(box,card);box.querySelector('#hindi-syllabus-toggle').onclick=()=>{const d=box.querySelector('#hindi-syllabus-details');d.style.display=d.style.display==='none'?'block':'none';box.querySelector('#hindi-syllabus-toggle').textContent=d.style.display==='none'?'📚 View Syllabus':'🔼 Hide Syllabus'} }
function boot(){addJarvis();addSyllabus();setTimeout(boot,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
