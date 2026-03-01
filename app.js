let currentSessionIndex = 0;
let currentBlockIndex = 0;
let blockInterval;

function formatTime(seconds){
 const hrs = Math.floor(seconds / 3600);
 const mins = Math.floor((seconds % 3600) / 60);
 const secs = seconds % 60;

 return (
  String(hrs).padStart(2,'0') + ":" +
  String(mins).padStart(2,'0') + ":" +
  String(secs).padStart(2,'0')
 );
}

function startFullDay(){
 clearInterval(blockInterval);
 currentSessionIndex = 0;
 currentBlockIndex = 0;
 startNextBlock();
}

function startNextBlock(){

 if(currentSessionIndex >= dailySessions.length){
  return;
 }

 const session = dailySessions[currentSessionIndex];

 if(currentBlockIndex >= session.length){
  currentSessionIndex++;
  currentBlockIndex = 0;
  startNextBlock();
  return;
 }

 const block = session[currentBlockIndex];

 document.getElementById("current-session").innerText = block.name;

 startTimer(block.duration);
}

function startTimer(minutes){

 clearInterval(blockInterval);

 let timeLeft = minutes * 60;

 blockInterval = setInterval(()=>{

  if(timeLeft <= 0){
   clearInterval(blockInterval);
   currentBlockIndex++;
   startNextBlock();
   return;
  }

  timeLeft--;
  document.getElementById("timer-display").innerText = formatTime(timeLeft);

 },1000);
}
