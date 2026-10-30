import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAOBD47yofh9ZWoje5wLuSmSf_CueEvfqg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'makani-pakistan.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'makani-pakistan',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'makani-pakistan.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '699903942139',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:699903942139:web:03d14892f75f9ff398bf5e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Z5K0VFTYMM',
};

export const ADMIN_EMAIL = 'xylofydigitalagency@gmail.com';

// Check if actual configuration has been provided
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your-api-key-here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-project-id'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { app, auth, db, storage, googleProvider };

// ---------------- Cloudinary (unsigned upload) ----------------
export const CLOUDINARY_CLOUD_NAME = 'blvue3z4';
export const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Sirf image file upload karen (JPG / PNG / WEBP).');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image 10MB se chhoti honi chahiye.');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  form.append('folder', 'makani');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || 'Image upload fail ho gayi. Dobara try karen.');
  }
  return data.secure_url as string;
}
