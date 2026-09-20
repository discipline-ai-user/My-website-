(()=>{'use strict';
const KEY='discipline_ai_jarvis_memory_v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const write=m=>{try{localStorage.setItem(KEY,JSON.stringify(m))}catch{}};
const base=()=>{const m=read();return Object.assign({createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),facts:{},preferences:{},goals:[],recentTopics:[],notes:[]},m)};
function remember(key,value,type='fact'){const m=base();if(type==='preference')m.preferences[key]=value;else if(type==='goal'){m.goals=m.goals.filter(x=>x.key!==key);m.goals.unshift({key,value,at:new Date().toISOString()});m.goals=m.goals.slice(0,30)}else{m.facts[key]=value}m.updatedAt=new Date().toISOString();write(m);return m}
function forget(key){const m=base();delete m.facts[key];delete m.preferences[key];m.goals=m.goals.filter(x=>x.key!==key);m.updatedAt=new Date().toISOString();write(m)}
function addTopic(topic){const m=base();m.recentTopics=[topic,...m.recentTopics.filter(x=>x!==topic)].slice(0,20);m.updatedAt=new Date().toISOString();write(m)}
function context(){const m=base();let tests=[];let routine={};let ratings={};try{tests=JSON.parse(localStorage.getItem('discipline_ai_tests_v4')||'[]')}catch{}try{routine=JSON.parse(localStorage.getItem('discipline_ai_master_day_routine_v1')||'{}')}catch{}try{ratings=JSON.parse(localStorage.getItem('discipline_ai_master_day_ratings_v1')||'{}')}catch{}const d=new Date().toISOString().slice(0,10);return{memory:m,tests:routineTests(tests),todayRoutine:routine[d]||{},todayRatings:ratings[d]||{}}}
function routineTests(ts){return{count:ts.length,last:ts.length?ts[ts.length-1]:null}}
function answer(q){const l=q.toLowerCase().trim();let m=base();
let x=l.match(/^(?:remember|yaad rakhna|yaad rakho|save)\s*[:,-]?\s*(.+)$/i);
if(x){const text=x[1].trim();const p=text.match(/^(?:my|meri|mera|mere)\s+(.+?)\s+(?:is|hai|hain)\s+(.+)$/i);if(p)remember(p[1].trim(),p[2].trim());else remember('note_'+Date.now(),text);return 'Yaad rakh liya. Ye information tumhare browser ke local Jarvis memory mein save hui hai.'}
if(/^(?:what do you remember|tumhe kya yaad hai|meri memory|memory dikhao)/.test(l)){m=base();const facts=Object.entries(m.facts).map(([k,v])=>k+': '+v);const prefs=Object.entries(m.preferences).map(([k,v])=>k+': '+v);return (facts.length||prefs.length)?'Mujhe ye saved hai: '+[...facts,...prefs].slice(0,20).join('; '):'Abhi koi custom memory saved nahi hai.'}
if(/^(?:forget|bhool jao|yaad se hatao)\s+(.+)/.test(l)){const k=l.replace(/^(?:forget|bhool jao|yaad se hatao)\s+/,'').trim();forget(k);return 'Theek hai, us custom memory ko local Jarvis memory se hata diya.'}
if(/^(?:my|meri|mera|mere)\s+(study|padhai|goal|target)/.test(l)){const c=context();return 'Tumhari current study memory: '+c.tests.count+' completed tests, aaj ke routine data available, aur saved custom memory '+(Object.keys(m.facts).length+Object.keys(m.preferences).length)+' items.'}
return null}
window.JarvisMemory={remember,forget,addTopic,context,answer};
})();