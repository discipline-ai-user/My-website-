(function(){
  'use strict';

  function isMobile(){
    return window.matchMedia && window.matchMedia('(max-width:700px)').matches;
  }

  function closeSidebar(){
    var side=document.getElementById('side');
    if(!side || !isMobile()) return;
    side.classList.remove('open');
    // Fallback for any cached/overridden drawer CSS.
    side.style.transform='translateX(-100%)';
  }

  function restoreDesktop(){
    var side=document.getElementById('side');
    if(side && !isMobile()) side.style.transform='';
  }

  // Capture phase runs before the routine button's own stopPropagation().
  document.addEventListener('click',function(e){
    var target=e.target && e.target.closest ? e.target.closest('[data-routine-open="1"]') : null;
    if(target) closeSidebar();
  },true);

  // Extra fallback for touch taps on Android browsers.
  document.addEventListener('touchend',function(e){
    var target=e.target && e.target.closest ? e.target.closest('[data-routine-open="1"]') : null;
    if(target) setTimeout(closeSidebar,0);
  },true);

  // Close whenever the routine page is opened programmatically.
  function wrap(){
    if(typeof window.openRoutine!=='function' || window.openRoutine.__mobileFixed) return;
    var original=window.openRoutine;
    var wrapped=function(){
      closeSidebar();
      var result=original.apply(this,arguments);
      closeSidebar();
      return result;
    };
    wrapped.__mobileFixed=true;
    window.openRoutine=wrapped;
  }

  wrap();
  setTimeout(wrap,100);
  setTimeout(wrap,500);
  setTimeout(wrap,1200);
  window.addEventListener('resize',restoreDesktop);
})();
