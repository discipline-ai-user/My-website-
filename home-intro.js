(()=>{
const profilePhoto='/sajid-khan.jpg';
const introHtml=`<div class="home-intro card"><div class="home-profile"><img src="${profilePhoto}" alt="Md Sajid Khan"><div><div class="eyebrow">👋 My Introduction</div><h2>Md Sajid Khan</h2><p class="muted">Class 12th • Science • Bihar Board • English Medium</p></div></div><div class="home-motivation"><span>🚀 Motivation</span><strong>“Aaj ki mehnat, kal ki pehchaan banegi. Seekhte raho, practice karte raho, aur apna AI future khud build karo.”</strong></div></div>`;
function add(){const p=document.querySelector('.page.active');if(!p||!p.querySelector('.title')?.textContent?.includes('Good evening'))return;if(p.querySelector('.home-intro'))return;const title=p.querySelector('.title');if(title)title.insertAdjacentHTML('afterend',introHtml)}
new MutationObserver(()=>setTimeout(add,0)).observe(document.getElementById('pages')||document.body,{childList:true,subtree:true});add();
})();