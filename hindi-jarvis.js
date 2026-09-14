(()=>{
'use strict';
const HINDI={
 'गद्यखंड':['बातचीत','उसने कहा था','संपूर्ण क्रांति','अर्थनारीश्वर','रोज','एक लेख और एक पत्र','ओ सदानीरा','सिपाही की माँ','प्रेम और समाज','जूठन','हँसते हुए मेरा अकेलापन','तिरिछ','शिक्षा'],
 'काव्यखंड':['कड़बक','पद','पद','छप्पय','कवित्त','तुमुल कोलाहल कलह में','पुत्र-वियोग','उषा','जन-जन का चेहरा एक','अधिनायक','प्यारे नन्हें बेटे को','हार-जीत','गाँव का घर'],
 'प्रतिपूर्ति':['रस्सी का टुकड़ा','क्लर्क की मौत','पैगनी']
};
function speakHindi(text){const o=document.getElementById('jarvisReply');if(o)o.textContent=text;if('speechSynthesis'in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='hi-IN';u.rate=.94;speechSynthesis.speak(u)}catch{}}}
function answerHindi(q){const l=String(q||'').toLowerCase();if(!/(hindi|हिंदी|हिन्दी)/i.test(l)||!/(syllabus|chapter|chapters|list|batao|बताओ|पाठ|सिलेबस)/i.test(l))return false;let out='Hindi syllabus mein 29 पाठ हैं:\n\n';for(const [sec,items] of Object.entries(HINDI))out+=`${sec} (${items.length}):\n${items.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\n`;speakHindi(out.trim());return true}
function boot(){document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement?.id==='jarvisInput'){if(answerHindi(document.activeElement.value)){e.preventDefault();e.stopImmediatePropagation()}}},true);document.getElementById('jarvisSend')?.addEventListener('click',e=>{if(answerHindi(document.getElementById('jarvisInput')?.value)){e.preventDefault();e.stopImmediatePropagation()}},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();