import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import type { Workbook } from "../services/types";
import {
  getWorkbookByUserId,
  updateWorkbookField,
  createWorkbook,
} from "../services/firestoreService";

export const useWorkbook = (userId?: string) => {
  const { user } = useAuth();
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadWorkbook = async () => {
      try {
        let wb = await getWorkbookByUserId(userId);
        if (!wb) {
          // Create new workbook if none exists
          const userEmail = user?.email || "";
          const userName = user?.displayName || "Usuario";
          wb = await createWorkbook(userId, userEmail, userName);
        }
        setWorkbook(wb);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadWorkbook();
  }, [userId, user]);

  const updateField = async (fieldPath: string, value: unknown, fullData?: any) => {
    if (!workbook) return;
    try {
      await updateWorkbookField(workbook.id, fieldPath, value, fullData);
      setWorkbook((prev) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
              },
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return { workbook, loading, error, updateField };
};
