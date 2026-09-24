import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lavni.starkwizz',
  appName: 'Starkwizz',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    hostname: 'starkwizz.com'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 5000,
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP",
      androidSplashResourceName: "splash",
      splashFullScreen: false,
      splashImmersive: false
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["phone"]
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
