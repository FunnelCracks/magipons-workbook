import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import type { Workbook } from "./types";

export const createWorkbook = async (
  userId: string,
  userEmail: string,
  userName: string
): Promise<Workbook> => {
  const newWorkbookRef = doc(collection(db, "workbooks"));
  const workbookData = {
    userId,
    userEmail,
    userName,
    status: "in_progress" as const,
    data: {
      day0: { motivation: "", mrh: "", idealDay: "" },
      day1: {
        membresiaName: "",
        avatar: {
          age: "",
          concerns: "",
          feelings: "",
          dreams: "",
          currentSituation: "",
        },
        avatarPhrase: "",
        promise: { transformation: "", statement: "" },
        structure: { support: "", content: "", community: "", bonus: "" },
        price: "",
      },
      day2: {
        annualPrice: "",
        changes: "",
        uniqueProposal: "",
        annualStrategy: "",
        launchStrategy: "",
      },
    },
    createdAt: serverTimestamp(),
    completionPercentage: 0,
  };

  await setDoc(newWorkbookRef, workbookData);
  return {
    id: newWorkbookRef.id,
    ...workbookData,
    createdAt: new Date(),
  } as Workbook;
};

export const getWorkbookByUserId = async (
  userId: string
): Promise<Workbook | null> => {
  try {
    const q = query(
      collection(db, "workbooks"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Workbook;
  } catch (error) {
    console.error("Error fetching workbook:", error);
    return null;
  }
};

export const updateWorkbookField = async (
  workbookId: string,
  fieldPath: string,
  value: unknown
): Promise<void> => {
  try {
    const workbookRef = doc(db, "workbooks", workbookId);

    // Firebase v9 supports dot notation directly in updateDoc
    const updateObj: Record<string, unknown> = {
      [fieldPath]: value,
      lastUpdated: serverTimestamp(),
    };

    await updateDoc(workbookRef, updateObj);
  } catch (error) {
    console.error("Error updating workbook:", error);
    throw error;
  }
};

export const submitWorkbook = async (workbookId: string): Promise<void> => {
  try {
    const workbookRef = doc(db, "workbooks", workbookId);
    await updateDoc(workbookRef, {
      status: "submitted",
      submittedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error submitting workbook:", error);
    throw error;
  }
};

export const getAllWorkbooks = async (): Promise<Workbook[]> => {
  try {
    const q = query(
      collection(db, "workbooks"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Workbook[];
  } catch (error) {
    console.error("Error fetching workbooks:", error);
    return [];
  }
};

// Utility function to calculate completion percentage
const calculateCompletion = (
  _fieldPath: string,
  _value: Record<string, unknown>
): number => {
  // This is a simplified version - in production, calculate based on all fields
  return 0; // Will be improved later
};
