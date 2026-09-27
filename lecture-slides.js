(()=>{'use strict';
function esc(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
function inject(){
 const page=document.getElementById('lectureSlidesTool'); if(!page)return;
 if(document.getElementById('lsMount'))return;
 const mount=document.createElement('div'); mount.id='lsMount';
 page.appendChild(mount);
 const videoInput=document.getElementById('lsVideo'), start=document.getElementById('lsStart'), reset=document.getElementById('lsReset'), status=document.getElementById('lsStatus'), results=document.getElementById('lsResults');
 let currentUrl='', working=false;
 function setStatus(x){status.textContent=x}
 function resetAll(){results.innerHTML='';setStatus(''); if(currentUrl){URL.revokeObjectURL(currentUrl);currentUrl='';}}
 function captureAt(video,t){
   return new Promise(resolve=>{
     const c=document.createElement('canvas'); c.width=video.videoWidth||1280;c.height=video.videoHeight||720;
     const ctx=c.getContext('2d',{willReadFrequently:true}); const old=video.currentTime;
     const done=()=>{video.removeEventListener('seeked',done);ctx.drawImage(video,0,0,c.width,c.height);resolve({t,canvas:c,data:c.toDataURL('image/jpeg',0.94)});};
     video.addEventListener('seeked',done,{once:true}); video.currentTime=Math.min(t,Math.max(0,video.duration-0.05));
   });
 }
 function metric(a,b){
   if(!a||!b)return 999;
   const w=Math.min(a.canvas.width,b.canvas.width),h=Math.min(a.canvas.height,b.canvas.height);
   const ca=a.canvas.getContext('2d',{willReadFrequently:true}),cb=b.canvas.getContext('2d',{willReadFrequently:true});
   const aw=ca.getImageData(0,0,w,h).data,bw=cb.getImageData(0,0,w,h).data;
   let sum=0, n=0;
   const sx=Math.max(1,Math.floor(w/80)),sy=Math.max(1,Math.floor(h/45));
   for(let y=0;y<h;y+=sy)for(let x=0;x<w;x+=sx){const i=(y*w+x)*4;sum+=Math.abs(aw[i]-bw[i])+Math.abs(aw[i+1]-bw[i+1])+Math.abs(aw[i+2]-bw[i+2]);n++;}
   return sum/(n*3*255);
 }
 function quality(frame){
   const c=frame.canvas,ctx=c.getContext('2d',{willReadFrequently:true}),w=c.width,h=c.height;
   const data=ctx.getImageData(0,0,w,h).data; let edge=0,ink=0,n=0;
   const sx=Math.max(1,Math.floor(w/120)),sy=Math.max(1,Math.floor(h/68));
   for(let y=1;y<h-1;y+=sy)for(let x=1;x<w-1;x+=sx){
     const p=((y*w+x)*4),r=data[p],g=data[p+1],b=data[p+2],lum=.299*r+.587*g+.114*b;
     const q=(((y+1)*w+x)*4),lum2=.299*data[q]+.587*data[q+1]+.114*data[q+2];
     const d=Math.abs(lum-lum2); edge+=d; if(lum<150)ink++;n++;
   }
   return edge/n + ink/n*80;
 }
 async function extract(){
   if(working)return; const file=videoInput.files?.[0];
   if(!file){setStatus('⚠️ Pehle lecture video choose karo.');return;}
   working=true;start.disabled=true;results.innerHTML='';
   try{
     const url=URL.createObjectURL(file); currentUrl=url;
     const video=document.createElement('video');video.src=url;video.preload='auto';video.muted=true;video.playsInline=true;
     await new Promise((res,rej)=>{video.onloadedmetadata=()=>res();video.onerror=()=>rej(new Error('Video read nahi hua.'))});
     const step=Math.max(.5,Number(document.getElementById('lsSample').value)||2);
     const stable=Math.max(1,Number(document.getElementById('lsStable').value)||6);
     const gap=Math.max(3,Number(document.getElementById('lsGap').value)||10);
     const candidates=[];
     let prev=null,stableSince=null,lastAccepted=-Infinity,best=null;
     const total=Math.max(0,video.duration-0.1);
     for(let t=0;t<=total;t+=step){
       const f=await captureAt(video,t);
       if(prev){
         const d=metric(prev,f);
         if(d<0.018){
           if(stableSince===null)stableSince=t;
           if(t-(stableSince||t)>=stable){
             if(!best||quality(f)>quality(best))best=f;
           }
         }else{
           if(best && best.t-lastAccepted>=gap){
             candidates.push(best);lastAccepted=best.t;
           }
           stableSince=t;best=null;
         }
       }else{
         stableSince=t;
       }
       prev=f;
       setStatus('⏳ '+Math.min(100,Math.round(t/Math.max(1,total)*100))+'% — completed board states detect ho rahe hain…');
     }
     if(best && best.t-lastAccepted>=gap)candidates.push(best);
     if(!candidates.length && prev)candidates.push(prev);
     const unique=[];
     for(const f of candidates){
       if(!unique.length || metric(unique[unique.length-1],f)>0.012)unique.push(f);
     }
     render(unique);
     setStatus('✅ '+unique.length+' candidate completed slides mile. Har page ko review karke PDF download kar sakte ho.');
   }catch(e){setStatus('❌ '+(e.message||'Extraction failed'))}
   finally{working=false;start.disabled=false;}
 }
 function render(frames){
   results.innerHTML='';
   const toolbar=document.createElement('div');toolbar.className='card';
   toolbar.innerHTML='<div class="section"><h3>Detected completed boards</h3><button class="btn" id="lsPdf">📄 Download PDF</button></div><p class="muted">Galat/adhura frame ke liye Remove dabao. Sir ke board ka final state rakhna hai.</p>';
   results.appendChild(toolbar);
   const grid=document.createElement('div');grid.className='cr-chapters';
   frames.forEach((f,i)=>{
     const card=document.createElement('div');card.className='card';
     card.innerHTML='<img style="width:100%;border-radius:12px;display:block;background:#000" src="'+f.data+'" alt="Slide '+(i+1)+'"><div class="section" style="margin-top:10px"><b>Slide '+(i+1)+'</b><div class="actions"><span class="pill">'+f.t.toFixed(1)+'s</span><button class="btn secondary lsRemove">Remove</button></div></div>';
     card.querySelector('.lsRemove').onclick=()=>{card.remove();};
     grid.appendChild(card);
   });
   results.appendChild(grid);
   toolbar.querySelector('#lsPdf').onclick=()=>downloadPdf();
 }
 function downloadPdf(){
   const imgs=[...results.querySelectorAll('img')]; if(!imgs.length){setStatus('⚠️ Koi slide nahi hai.');return;}
   const c=document.createElement('canvas'),ctx=c.getContext('2d'); const pdfParts=[];
   // Build a minimal multi-page PDF via raster images encoded as JPEG in a browser Blob is non-trivial.
   // Use print-friendly HTML as a reliable browser-native PDF path.
   const win=window.open('','_blank');
   if(!win){setStatus('⚠️ PDF ke liye popup allow karo.');return;}
   win.document.write('<!doctype html><html><head><title>Lecture Slides</title><style>@page{size:A4 portrait;margin:8mm}body{margin:0;font-family:Arial}section{page-break-after:always;height:280mm;display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100%;object-fit:contain}</style></head><body>');
   imgs.forEach(img=>win.document.write('<section><img src="'+img.src+'"></section>'));
   win.document.write('</body></html>');win.document.close();setTimeout(()=>win.print(),500);
 }
 start.onclick=extract;reset.onclick=resetAll;
}
const mo=new MutationObserver(inject);mo.observe(document.body,{childList:true,subtree:true});setTimeout(inject,600);
window.LectureSlideExtractor={init:inject};
})();