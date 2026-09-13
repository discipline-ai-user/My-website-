(function(){
'use strict';
function closeMenu(){
  var side=document.getElementById('side');
  if(side) side.classList.remove('open');
}
function bind(){
  document.addEventListener('click',function(e){
    var target=e.target;
    var navButton=target&&target.closest?target.closest('#side [data-page]'):null;
    if(navButton){
      setTimeout(closeMenu,0);
      return;
    }
    var mainTarget=target&&target.closest?target.closest('.main [data-page]'):null;
    if(mainTarget){
      setTimeout(closeMenu,0);
      return;
    }
    var side=document.getElementById('side');
    var menu=document.getElementById('menuBtn');
    if(side&&side.classList.contains('open')&&target&&!side.contains(target)&&target!==menu){
      closeMenu();
    }
  },true);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
window.closeMobileMenu=closeMenu;
})();
