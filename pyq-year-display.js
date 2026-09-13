(()=>{
const TEST_KEY='discipline_ai_tests_v4',PYQ_KEY='discipline_ai_pyqs_v3';
const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}};
function yearsOf(q){return Array.isArray(q?.years)?q.years.map(String).map(x=>x.trim()).filter(Boolean):[]}
function decorateQuestions(list){return (Array.isArray(list)?list:[]).map(q=>{const years=yearsOf(q);if(!years.length||String(q.text||'').includes('🗓️ Asked in:'))return q;return {...q,text:`${q.text}\n\n🗓️ Asked in: ${years.join(', ')}`};});}
const oldSave=window.savePyq;
if(oldSave){window.savePyq=async function(){const before=load(PYQ_KEY,[]).map(p=>p.id);await oldSave();setTimeout(()=>{try{const pyqs=load(PYQ_KEY,[]);let changed=false;pyqs.forEach(p=>{if(!before.includes(p.id)){const qs=decorateQuestions(p.questions);if(qs.some((q,i)=>q.text!==p.questions?.[i]?.text)){p.questions=qs;changed=true}}});if(changed)localStorage.setItem(PYQ_KEY,JSON.stringify(pyqs));}catch{}},80);};}
const oldStart=window.startQuestionTest;
if(oldStart){window.startQuestionTest=function(subject,chapter,questions,mins,...rest){const qs=decorateQuestions(questions);const result=oldStart(subject,chapter,qs,mins,...rest);try{const pyqs=load(PYQ_KEY,[]);const p=pyqs.find(x=>x.subject===subject&&x.chapter===chapter&&Array.isArray(x.questions)&&x.questions.length===qs.length);if(p&&typeof currentTest==='object'&&currentTest){currentTest.sourceType='pyq';currentTest.sourcePyqId=p.id;currentTest.parentPyqId=p.id;currentTest.pyqName=p.name||`${subject} — ${chapter} PYQ`;}}catch{}return result;};}
})();