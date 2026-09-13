/* Jarvis safety policy: never automate banking, UPI, payment, password, PIN or OTP actions. */
window.JARVIS_SAFE_POLICY={
  blocked:/bank|banking|phonepe|phone pe|upi|paytm|gpay|google pay|payment|debit|credit|wallet|password|passcode|pin|otp|cvv|transaction/i,
  allowedCategories:['study website','YouTube search','syllabus','study routine','progress','wrong questions','normal websites','voice input','user-approved files/photos/camera/microphone/location/notifications where the OS permits']
};