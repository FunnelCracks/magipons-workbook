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

export const calculateCompletionPercentage = (data: any): number => {
  const fields = [
    data.day0?.motivation,
    data.day0?.mrh,
    data.day0?.idealDay,
    data.day1?.membresiaName,
    data.day1?.avatar?.age,
    data.day1?.avatar?.concerns,
    data.day1?.avatar?.feelings,
    data.day1?.avatar?.dreams,
    data.day1?.avatar?.currentSituation,
    data.day1?.avatarPhrase,
    data.day1?.promise?.transformation,
    data.day1?.promise?.statement,
    data.day1?.structure?.support,
    data.day1?.structure?.content,
    data.day1?.structure?.community,
    data.day1?.structure?.bonus,
    data.day1?.price,
    data.day2?.annualPrice,
    data.day2?.changes,
    data.day2?.uniqueProposal,
    data.day2?.annualStrategy,
    data.day2?.launchStrategy,
  ];

  const completed = fields.filter((f) => f && String(f).trim() !== "").length;
  return Math.round((completed / fields.length) * 100);
};

export const updateWorkbookField = async (
  workbookId: string,
  fieldPath: string,
  value: unknown,
  fullData?: any
): Promise<void> => {
  try {
    const workbookRef = doc(db, "workbooks", workbookId);

    const updateObj: Record<string, unknown> = {
      [fieldPath]: value,
      lastUpdated: serverTimestamp(),
    };

    if (fullData) {
      updateObj.completionPercentage = calculateCompletionPercentage(fullData);
    }

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
