/* Safe Jarvis command router
   Financial/payment apps, passwords, PINs and OTPs are intentionally blocked.
   This file only exposes normal browser/in-app actions; Android/iOS permissions are still enforced by the OS.
*/
(function(){
  const blocked=/(bank|banking|phonepe|phone pe|upi|paytm|gpay|google pay|payment|debit|credit|wallet|password|passcode|pin|otp|one time password|cvv|transaction)/i;
  const openUrl=(url)=>{ try{ window.open(url,'_blank','noopener,noreferrer'); }catch(e){} };
  const speak=(text)=>{ try{ if('speechSynthesis' in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text));} }catch(e){} };
  const result=(ok,message)=>{ speak(message); if(typeof window.toast==='function') window.toast(message); return {ok,message}; };

  window.JarvisCommands={
    run(command){
      const q=String(command||'').trim();
      if(!q) return result(false,'Command nahi mili.');
      if(blocked.test(q)) return result(false,'Security ke liye banking, payment, UPI, password, PIN aur OTP actions allowed nahi hain.');

      // Study website navigation
      if(/(study|preparation|website).*(open|khol|kholo)|website.*(open|khol)/i.test(q)){
        document.querySelector('[data-page="dashboard"]')?.click();
        return result(true,'Study website khol diya.');
      }
      if(/(syllabus|chapter)/i.test(q) && /(open|khol|dikha)/i.test(q)){
        document.querySelector('[data-page="syllabus"]')?.click();
        return result(true,'Syllabus khol diya.');
      }
      if(/(routine|schedule|study plan)/i.test(q) && /(open|khol|dikha)/i.test(q)){
        document.querySelector('[data-page="routine"]')?.click();
        return result(true,'Study routine khol diya.');
      }
      if(/(progress|performance)/i.test(q) && /(open|khol|dikha)/i.test(q)){
        document.querySelector('[data-page="progress"]')?.click();
        return result(true,'Progress khol diya.');
      }
      if(/(wrong|galat).*(question|questions)/i.test(q)){
        document.querySelector('[data-page="wrong"]')?.click();
        return result(true,'Wrong questions khol diya.');
      }

      // YouTube class search/open. The browser cannot guarantee a specific video without
      // a YouTube API/search result, so open a precise YouTube search instead of guessing.
      if(/youtube/i.test(q) && /(class|lecture|sir|video|course|padh)/i.test(q)){
        let search=q.replace(/jarvis/ig,'').replace(/youtube/ig,'').replace(/(par|pe|me|mein|the|a|hai|laga|lagao|chala|chalao|karo|do|de|kholo|open|class|lecture|sir|video|padhai)/ig,' ').replace(/\s+/g,' ').trim();
        if(!search) search='Class 12 Bihar Board Science';
        openUrl('https://www.youtube.com/results?search_query='+encodeURIComponent(search));
        return result(true,'YouTube par class search khol diya.');
      }

      // Normal website URL
      const urlMatch=q.match(/https?:\/\/[^\s]+/i);
      if(urlMatch){ openUrl(urlMatch[0]); return result(true,'Website open kar diya.'); }

      return result(false,'Ye command abhi supported nahi hai. Tum YouTube class, study website, syllabus, routine, progress ya wrong questions bol sakte ho.');
    }
  };
})();