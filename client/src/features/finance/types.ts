export interface RevenueInvoice {
  id: string;
  studentName: string;
  courseCode: "Code 8" | "Code 10" | "Code 14";
  amount: number;
  paymentStatus: "Paid" | "Pending";
  branch: string;
  timestamp: string;
}

export interface BranchPerformance {
  branchName: string;
  totalCollected: number;
  pendingInvoices: number;
  activeLessonsCount: number;
}
