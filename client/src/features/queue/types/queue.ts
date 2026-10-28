export interface MasterProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappNo: string;
  gender: "Male" | "Female" | "Other";
  drivingSchool: string;
  branch: string;
  masterSelfieUrl: string;
  lessonsAvailable: number;
  paymentStatus: "Paid" | "Pending";
  overallScore: number;
  preferredInstructorDefault?: string;
  defaultCourseCode: string; // e.g., "Code 8", "Code 10", "Code 14"
}

export interface QueueItem {
  id: string; // Active Session Token ID
  profile: MasterProfile;
  position: number;
  status: "Active" | "Up Next" | "Waiting";
  elapsed?: string;
  estWait?: string;
  assignedInstructor: string;
  targetCourseCode: string;
  isPremium: boolean;
  waitingForPreferredInstructor: boolean;
}
