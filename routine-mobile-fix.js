(function(){
  'use strict';

  function closeSidebar(){
    var side=document.getElementById('side');
    if(side) side.classList.remove('open');
  }

  // On mobile, selecting Daily Study Routine must close the drawer
  // so the complete routine page is visible.
  document.addEventListener('click',function(e){
    var target=e.target && e.target.closest ? e.target.closest('[data-routine-open="1"]') : null;
    if(target) setTimeout(closeSidebar,0);
  },true);

  // Also close it whenever the routine page is opened programmatically.
  var original=window.openRoutine;
  if(typeof original==='function'){
    window.openRoutine=function(){
      closeSidebar();
      var result=original.apply(this,arguments);
      closeSidebar();
      return result;
    };
  }else{
    setTimeout(function(){
      if(typeof window.openRoutine==='function'){
        var fn=window.openRoutine;
        window.openRoutine=function(){
          closeSidebar();
          var result=fn.apply(this,arguments);
          closeSidebar();
          return result;
        };
      }
    },1000);
  }
})();
