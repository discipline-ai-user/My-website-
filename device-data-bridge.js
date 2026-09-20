(()=>{'use strict';
const K='discipline_ai_device_context_v1';
const safe=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}};
function snapshot(){const d={time:new Date().toISOString(),online:navigator.onLine!==false,visibility:document.visibilityState||'visible',screen:{width:screen.width||0,height:screen.height||0,dpr:devicePixelRatio||1},battery:null};return d}
async function refresh(){const d=snapshot();try{if(navigator.getBattery){const b=await navigator.getBattery();d.battery={level:Math.round(b.level*100),charging:!!b.charging}}}catch{};try{localStorage.setItem(K,JSON.stringify(d))}catch{}}
window.disciplineDeviceContext=()=>safe(K,snapshot());refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
})();