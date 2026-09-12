(()=>{
  if(typeof setupSyllabus!=='function') return;
  setupSyllabus=function(){
    document.querySelectorAll('.chapter-test').forEach(b=>b.addEventListener('click',()=>{
      show('pyq');
      setTimeout(()=>{
        if(typeof fillPyqChapters==='function' && $('pyqSubject')){
          $('pyqSubject').value=b.dataset.subject;
          fillPyqChapters();
          if($('pyqChapter')) $('pyqChapter').value=b.dataset.chapter;
        }
      },0);
    }));
  };
})();