let voiceEnabled = true;

function speak(text){
 if(!voiceEnabled) return;

 const speech = new SpeechSynthesisUtterance(text);
 speech.lang = "en-US";
 speech.rate = 1;
 speech.pitch = 1;
 window.speechSynthesis.speak(speech);
}

function announceSession(name){
 speak(name + " started. Stay focused.");
}

function announceBreak(){
 speak("Session completed. Take a short break.");
}
