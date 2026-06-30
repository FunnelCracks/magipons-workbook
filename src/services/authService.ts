import { auth, db } from "./firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  await signInWithRedirect(auth, googleProvider);
};

export const handleRedirectResult = async () => {
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
};

export const createOrUpdateUserDocument = async (user: any) => {
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        name: user.displayName || "User",
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const checkAdminStatus = async (email: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, "admins", email));
    return adminDoc.exists();
  } catch {
    return false;
  }
};
