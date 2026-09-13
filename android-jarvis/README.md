# Android Jarvis foundation

This folder is the Android-app foundation for the Jarvis assistant planned for Vivo T2x 5G.

## Goals
- Hindi/Hinglish voice commands
- Open supported apps and websites through Android intents
- Connect to the Class 12 study website
- Ask for normal Android permissions only when required
- Never request or automate banking, UPI/payment, password, PIN, OTP or CVV actions

## Important
A web app cannot obtain unrestricted phone control. The Android app must use official Android APIs and user-granted permissions. Sensitive financial/credential apps remain outside Jarvis scope.