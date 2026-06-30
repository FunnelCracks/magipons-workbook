import { useState, useEffect } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { user, loading, error };
};
