import { type App, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function getApp(): App {
  if (getApps().length) {
    return getApps()[0]!;
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth: Auth = new Proxy({} as Auth, {
  get: (_, prop) => Reflect.get(getAuth(getApp()), prop),
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get: (_, prop) => Reflect.get(getFirestore(getApp()), prop),
});
