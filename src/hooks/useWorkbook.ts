import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import type { Workbook } from "../services/types";
import {
  getWorkbookByUserId,
  updateWorkbookField,
  createWorkbook,
} from "../services/firestoreService";

const DEV_WORKBOOK: Workbook = {
  id: "dev-preview",
  userId: "dev",
  userEmail: "preview@dev.com",
  userName: "Preview Dev",
  status: "in_progress",
  completionPercentage: 0,
  createdAt: new Date(),
  data: {
    day0: { motivation: "", mrh: "", idealDay: "", situacion: "", facturacionRango: "" },
    day1: {
      modelName: "",
      avatarDescription: "",
      consciousnessLevel: "",
      clientPhrases: "",
      transformation: "",
      formula: "",
      modelType: "",
      modelReason: "",
      support: "",
      content: "",
      community: "",
      progress: "",
      price: "",
    },
    day2: { annualPrice: "", changes: "", uniqueProposal: "", annualStrategy: "", launchStrategy: "", migration: "", firstClients: Array.from({ length: 10 }, () => ({ name: "", reason: "" })) },
    day3: { landingHero: "", setterQuestions: "", tools: [] },
  },
};

export const useWorkbook = (userId?: string) => {
  const { user } = useAuth();
  const [workbook, setWorkbook] = useState<Workbook | null>(
    import.meta.env.DEV && !userId ? DEV_WORKBOOK : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    if (import.meta.env.DEV && !userId) return;

    const loadWorkbook = async () => {
      try {
        let wb = await getWorkbookByUserId(userId);
        if (!wb) {
          const userEmail = user?.email || "";
          const userName = user?.displayName || "Usuario";
          wb = await createWorkbook(userId, userEmail, userName);
          if (userEmail) {
            fetch("/.netlify/functions/ghl-tag", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userEmail }),
            }).catch(() => {});
          }
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
