export interface User {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface WorkbookData {
  day0: {
    motivation: string;
    mrh: string;
    idealDay: string;
    situacion: string;
    facturacionRango: string;
  };
  day1: {
    modelName: string;
    avatarDescription: string;
    consciousnessLevel: string;
    clientPhrases: string;
    transformation: string;
    formula: string;
    modelType: string;
    modelReason: string;
    support: string;
    content: string;
    community: string;
    progress: string;
    price: string;
  };
  day2: {
    annualPrice: string;
    changes: string;
    uniqueProposal: string;
    annualStrategy: string;
    launchStrategy: string;
    migration: string;
    firstClients: Array<{ name: string; reason: string }>;
  };
  day3: {
    landingHero: string;
    setterQuestions: string;
    tools: string[];
  };
}

export interface Workbook {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userFirstName?: string;
  userLastName?: string;
  userPhone?: string;
  status: "in_progress" | "submitted";
  data: WorkbookData;
  createdAt: Date;
  submittedAt?: Date;
  completionPercentage: number;
}
