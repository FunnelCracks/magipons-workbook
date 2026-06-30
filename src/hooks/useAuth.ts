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
    let mounted = true;
    let authUnsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && mounted) {
          await createOrUpdateUserDocument(result.user);
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      }

      if (!mounted) return;

      authUnsubscribe = auth.onAuthStateChanged(
        (firebaseUser) => {
          if (!mounted) return;
          setUser(firebaseUser);
          setLoading(false);
        },
        (err) => {
          if (!mounted) return;
          setError(err.message);
          setLoading(false);
        }
      );
    };

    init();

    return () => {
      mounted = false;
      authUnsubscribe?.();
    };
  }, []);

  return { user, loading, error };
};
