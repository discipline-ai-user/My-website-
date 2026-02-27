function showDailySummary(){

 if(attentionScore >= 90){
  eliteStreak++;
 } else {
  eliteStreak = 0;
 }

 if(eliteStreak >= 3){
  activateStrictMode();
 }

 document.getElementById("dailySummaryScreen").style.display="block";

 document.getElementById("dailySummaryContent").innerText =
 "Score: "+attentionScore+
 " | Elite Streak: "+eliteStreak+
 " | Strict Mode: "+strictMode;
}
