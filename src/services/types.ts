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
  };
  day1: {
    membresiaName: string;
    avatar: {
      age: string;
      concerns: string;
      feelings: string;
      dreams: string;
      currentSituation: string;
    };
    avatarPhrase: string;
    promise: {
      transformation: string;
      statement: string;
    };
    structure: {
      support: string;
      content: string;
      community: string;
      bonus: string;
    };
    price: string;
  };
  day2: {
    annualPrice: string;
    changes: string;
    uniqueProposal: string;
    annualStrategy: string;
    launchStrategy: string;
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
