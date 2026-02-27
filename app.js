let currentSessionIndex = 0;
let currentBlockIndex = 0;
let blockInterval;

function startFullDay(){
 currentSessionIndex = 0;
 currentBlockIndex = 0;
 startNextBlock();
}

function startNextBlock(){

 if(currentSessionIndex >= dailySessions.length){
  showDailySummary();
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

 handleBlockType(block.type);
 startTimer(block.duration);
}

function startTimer(minutes){

 let timeLeft = minutes * 60;

 blockInterval = setInterval(()=>{

  if(timeLeft <= 0){
   clearInterval(blockInterval);
   currentBlockIndex++;
   startNextBlock();
   return;
  }

  timeLeft--;
  document.getElementById("timer-display").innerText = timeLeft;

 },1000);
}

function handleBlockType(type){

 if(type === "study"){
  attentionTrackingActive = true;
  startCamera();
 } else {
  attentionTrackingActive = false;
  stopCamera();
 }
}
