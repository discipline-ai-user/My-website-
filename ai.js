let attentionTrackingActive = false;
let cameraRunning = false;
let attentionScore = 100;
let strictMode = false;

let warningActive = false;
let warningStartTime = null;
let lastPenaltyTime = 0;

const videoElement = document.getElementById("cameraFeed");

const faceMesh = new FaceMesh({
 locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
 maxNumFaces:1,
 refineLandmarks:true,
 minDetectionConfidence:0.7,
 minTrackingConfidence:0.7
});

const camera = new Camera(videoElement,{
 onFrame:async()=>{
  await faceMesh.send({image:videoElement});
 },
 width:320,
 height:240
});

function startCamera(){
 if(!cameraRunning){
  camera.start();
  cameraRunning=true;
 }
}

function stopCamera(){
 if(cameraRunning){
  camera.stop();
  cameraRunning=false;
 }
}

let frameCount=0;

faceMesh.onResults(results=>{

 if(!attentionTrackingActive) return;

 frameCount++;
 if(frameCount%5!==0) return;

 if(!results.multiFaceLandmarks.length){
  processAIEvent();
 }
});

function processAIEvent(){

 if(Date.now()-lastPenaltyTime < 3000) return;

 if(!warningActive){

  warningActive=true;
  warningStartTime=Date.now();

  if(navigator.vibrate){
   navigator.vibrate(150);
  }

  return;
 }

 let elapsed = Date.now()-warningStartTime;

 let correctionWindow = strictMode ? 1000 : 2000;

 if(elapsed > correctionWindow){

  attentionScore -= 20;
  if(attentionScore < 0) attentionScore=0;

  warningActive=false;
  lastPenaltyTime=Date.now();
 }
}
