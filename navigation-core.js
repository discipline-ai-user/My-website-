(function(){
  'use strict';

  function closeMenu(){
    var side=document.getElementById('side');
    if(side) side.classList.remove('open');
  }

  function navigate(id){
    if(!id) return false;
    var fn=window.show;
    if(typeof fn!=='function') return false;
    try{
      fn(id);
      closeMenu();
      return true;
    }catch(e){
      try{
        if(typeof show==='function'){
          show(id);
          closeMenu();
          return true;
        }
      }catch(ignore){}
    }
    return false;
  }

  function menuToggle(){
    var side=document.getElementById('side');
    if(!side) return;
    side.classList.toggle('open');
  }

  function bind(){
    document.addEventListener('click',function(e){
      var target=e.target;
      if(!target) return;

      var menu=target.closest ? target.closest('#menuBtn') : null;
      if(menu){
        e.preventDefault();
        e.stopImmediatePropagation();
        menuToggle();
        return;
      }

      var button=target.closest ? target.closest('[data-page]') : null;
      if(!button) return;

      var id=button.getAttribute('data-page');
      if(!id) return;

      if(navigate(id)){
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },true);
  }

  function start(){
    try{ bind(); }catch(e){}
    setTimeout(function(){
      try{ if(typeof show==='function') window.show=show; }catch(e){}
    },0);
    setTimeout(function(){
      try{ if(typeof show==='function') window.show=show; }catch(e){}
    },1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
