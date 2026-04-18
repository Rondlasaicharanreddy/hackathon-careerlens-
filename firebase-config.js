// firebase-config.js — CareerLens Firebase SDK Integration
// Initializes Firebase and exports auth/firestore helpers

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// ── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyD_ZD57_kOiG1KgIrPdXQPjXKXmuykDb_M",
  authDomain: "career-lens-dd173.firebaseapp.com",
  projectId: "career-lens-dd173",
  storageBucket: "career-lens-dd173.firebasestorage.app",
  messagingSenderId: "545532656802",
  appId: "1:545532656802:web:f11e414df97d6b1079ebfb",
  measurementId: "G-9B55Z2C45H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ── Auth Helpers ─────────────────────────────────────────────────────────────

/** Sign in with Google popup */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserProfile(result.user);
  return result.user;
}

/** Create account with email & password */
export async function registerWithEmail(name, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await ensureUserProfile(result.user, name);
  return result.user;
}

/** Sign in with email & password */
export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/** Sign out */
export async function logout() {
  await signOut(auth);
}

/** Listen to auth state changes */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Firestore Helpers ────────────────────────────────────────────────────────

/** Create user profile doc if it doesn't exist */
export async function ensureUserProfile(firebaseUser, displayName = null) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const name = displayName || firebaseUser.displayName || firebaseUser.email.split("@")[0];
    await setDoc(ref, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: name,
      photoURL: firebaseUser.photoURL || null,
      createdAt: serverTimestamp(),
      careerProfile: null
    });
  }
}

/** Get user profile from Firestore */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/** Save user's career profile / simulation state */
export async function saveCareerProfile(uid, profileData) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    careerProfile: profileData,
    lastUpdated: serverTimestamp()
  });
}

/** Save a simulation result */
export async function saveSimulation(uid, simulationData) {
  const colRef = collection(db, "careerProfiles");
  return await addDoc(colRef, {
    userId: uid,
    ...simulationData,
    savedAt: serverTimestamp()
  });
}

/** Get all saved simulations for a user */
export async function getUserSimulations(uid) {
  const q = query(collection(db, "careerProfiles"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
