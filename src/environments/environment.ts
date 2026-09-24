// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    apiKey: "AIzaSyAAneu067Y86_PMQKV4BDpDVN5cF1KxbDE",
    authDomain: "starkwizz.com",
    projectId: "starkwizz-production",
    storageBucket: "starkwizz-production.appspot.com",
    messagingSenderId: "1088999852663",
    appId: "1:1088999852663:web:84c1ecc6465d5b955d1472",
    measurementId: "G-V1NJHSTGYC"
  },
  production: true,
  version: '1.6.8.1',
  versionNumber: 1681,
  razorpayConfig: {
      key: 'rzp_live_xvAoiBHMFWAdKr'
   // key: 'rzp_test_rD4r9gTr7emaSX'
  },
  // starkwizz: {
  //   trailkey: "rzp_test_rD4r9gTr7emaSX"
  // },
  sms: ['USER_PROFILE_KYC', 'USER_PROFILE_KYC_PENDING', 'USER_REGISTRATION', 'EVENT_SUBSCRIBED', 'EVENT_SCHEDULE', 'USER_PROFILE_CHANGE_REQUEST'],
  push: ['EVENT_COMPLETED', 'USER_PROFILE_KYC_PENDING', 'USER_REGISTRATION', , 'EVENT_SUBSCRIBED', 'EVENT_SCHEDULE', 'USER_PROFILE_CHANGE_REQUEST'],
  domain: "https://starkwizzuser.web.app",
  appPlt:'WEB',

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
