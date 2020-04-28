// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase : {
    apiKey: "AIzaSyDh8ingqoSN93X9ru4MqOkmAKYtikhR4T0",
    authDomain: "webrtc-videocall.firebaseapp.com",
    databaseURL: "https://webrtc-videocall.firebaseio.com",
    projectId: "webrtc-videocall",
    storageBucket: "webrtc-videocall.appspot.com",
    messagingSenderId: "269633964218",
    appId: "1:269633964218:web:ecff7f0ff93d5cfc36da83"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
