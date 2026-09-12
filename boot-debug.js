(()=>{
  const show=(title,detail)=>{
    const root=document.getElementById('root');
    if(!root||root.children.length)return;
    root.innerHTML=`<div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#070b16;color:#fff;font-family:system-ui,Arial"><div style="width:min(680px,100%);background:#10182a;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:22px;box-shadow:0 20px 60px #0008"><div style="font-size:13px;color:#9b8eff;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Discipline AI</div><h2 style="margin:8px 0">Website startup error</h2><p style="color:#9aa8c3;line-height:1.5">Dashboard load nahi ho paaya. Error neeche diya hai.</p><pre style="white-space:pre-wrap;word-break:break-word;background:#080d18;padding:14px;border-radius:12px;color:#ffb4bd">${String(title)}\n${String(detail||'')}</pre><button onclick="location.reload()" style="border:0;border-radius:10px;padding:11px 16px;background:#6d5dfc;color:#fff;font-weight:700">Reload</button></div></div>`;
  };
  window.addEventListener('error',e=>show(e.message||'JavaScript error',`${e.filename||''}${e.lineno?`:${e.lineno}`:''}`));
  window.addEventListener('unhandledrejection',e=>show('Unhandled promise rejection',e.reason?.stack||e.reason||''));
  setTimeout(()=>{const root=document.getElementById('root');if(root&&!root.children.length)show('app.js did not render the dashboard','No dashboard DOM was created after startup.');},1800);
})();