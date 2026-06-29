import { auth, db } from "./firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create or update user document
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        name: user.displayName || "User",
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    return user;
  } catch (error) {
    console.error("Login error:", error);
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
