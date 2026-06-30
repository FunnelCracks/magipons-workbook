import { useState, useEffect } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { getRedirectResult } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { createOrUpdateUserDocument } from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          createOrUpdateUserDocument(result.user).catch(console.error);
        }
      })
      .catch(console.error);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        createOrUpdateUserDocument(user).catch(console.error);
      }
      setUser(user);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading, error };
};
