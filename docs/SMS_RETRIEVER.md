SMS Retriever Integration (automatic OTP read)

Overview
- This project now includes client-side support for Android SMS Retriever API to automatically read one-time SMS verification codes without prompting the user each time.
- The cloud function that sends SMS now appends the app hash so the SMS Retriever can match messages to your app.

Steps to enable and test

1) Install the Cordova plugin and Ionic wrapper
 - npm install cordova-plugin-sms-retriever @awesome-cordova-plugins/sms-retriever
 - npx cap sync android

2) Add the app hash to your Cloud Functions config
 - Compute your app hash (see "Generating app hash" below)
 - Set it in Firebase functions config:
   firebase functions:config:set app.hash="YOUR_APP_HASH"
 - Deploy functions: firebase deploy --only functions

3) Build and run on a real Android device
 - npx cap open android
 - Build and run the app on device (SMS Retriever requires Play Services)

4) Send OTP SMS using the same message format
 - The message must contain your OTP and the app hash line at the end. Example format used by this project:
   "%LOGIN_CODE% is your verification code for %APP_NAME%."
   When sending, the function will prepend the required prefix and append the hash automatically, so the real message will look like:

   <#> 123456 is your verification code for MyApp.
   FA+9qCX9VSu

Generating app hash
- Follow Google docs: https://developers.google.com/identity/sms-retriever/verify#computing_your_apps_hash
- A simple Node script to compute the hash locally is available in many repos. It requires your package name and the signing certificate's SHA-256 fingerprint.

Implementation notes
- We added the following changes in the repo:
  - `verify-otp.component.ts` — starts the SMS Retriever listener (`SMSRetriever`) and extracts the OTP with a regex; fills inputs and auto-submits.
  - `app.module.ts` — registers `SMSRetriever` provider.
  - `functions/sms.ts` — appends `<#>` prefix and app hash to outgoing messages.
  - `android/app/build.gradle` — adds `com.google.android.gms:play-services-auth-api-phone` dependency.

Troubleshooting
- SMS Retriever works only on Android with Google Play Services.
- If OTP doesn't get filled: check that SMS actually includes the app hash (last line), the device has Play Services, and the message format matches.
- Use the log (logcat or plugin console logs) to print the computed app hash and message received.

Security and privacy
- SMS Retriever doesn't require SMS permissions and only matches messages that contain the specific app hash, preserving privacy.

Contact
- If you want, I can add an automated unit/integration test or a helper script to compute the app hash for your keystore.