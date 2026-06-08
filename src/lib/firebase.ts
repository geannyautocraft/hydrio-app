import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCLeMAs7M0MFt51i9vam1Sv3t5i8O-pktg',
  authDomain: 'hydrio-smart.firebaseapp.com',
  projectId: 'hydrio-smart',
  storageBucket: 'hydrio-smart.firebasestorage.app',
  messagingSenderId: '231744510793',
  appId: '1:231744510793:web:50436c6033ac1dd9805898',
  measurementId: 'G-3JQL6BTWZ9',
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth: Auth = initializeAuth(firebaseApp, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});

export const firestore: Firestore = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
