/// <reference types="vite/client" />

interface FirebaseAppletConfigShape {
  projectId?: string;
  appId?: string;
  apiKey?: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

declare const __FIREBASE_APPLET_CONFIG__: FirebaseAppletConfigShape;
