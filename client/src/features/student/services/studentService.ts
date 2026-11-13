import type { IUserData } from "../../user/userService";
import axios from "axios";
import type { IQueueItem } from "../../queue/services/queueService";
import type { ILessonHistoryItem } from "../components/dashboard/LessonHistoryList";

const BASE_API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://amehlo-app.onrender.com/api";

export interface IStudentSyncPayload {
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
}

export interface IEnrollmentPayload {
  studentClerkId: string;
  goal: "learners" | "drivers";
  code: string;
  lessonsCount: number;
}

export interface IEnrollmentData {
  _id: string;
  studentClerkId: string;
  goal: "learners" | "drivers";
  code: string;
  isPaid: boolean;
  totalLessons: number;
  lessonsSpent: number;
  lessonsRemaining: number;
  status: "active" | "completed";
  createdAt: string;
}

export interface IStudentJoinQueuePayload {
  studentClerkId: string;
  branchId: string;
  serviceId: string;
  isRemoteJoin: boolean;
  preferredWorkerId?: string | null;
}

export interface ISearchedStudent {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  enrollment?: IEnrollmentData | null;
}

export interface IDrivingSchoolOption {
  _id: string;
  name: string;
}

export interface IAdminCreateStudentPayload {
  name: string;
  email: string;
  phone?: string;
  companyId: string;
  branchId?: string;
}

export const studentService = {
  // ➔ Locks role = "student" in MongoDB
  syncStudentUser: async (payload: IStudentSyncPayload): Promise<IUserData> => {
    const response = await axios.post(
      `${BASE_API_URL}/users/sync-student`,
      payload,
    );
    return response.data.user;
  },

  // ➔ Saves 3-step onboarding selection with isPaid = false
  createEnrollment: async (
    payload: IEnrollmentPayload,
  ): Promise<IEnrollmentData> => {
    const response = await axios.post(`${BASE_API_URL}/enrollments`, payload);
    return response.data.enrollment;
  },

  // ➔ Fetches active enrollment wallet for the student
  getStudentEnrollment: async (
    clerkId: string,
  ): Promise<IEnrollmentData | null> => {
    const response = await axios.get(
      `${BASE_API_URL}/enrollments/student/${clerkId}`,
    );
    return response.data.enrollment || null;
  },

  // ➔ Flips isPaid = true in MongoDB (Test payment trigger for now)
  payForEnrollment: async (enrollmentId: string): Promise<IEnrollmentData> => {
    const response = await axios.patch(
      `${BASE_API_URL}/enrollments/${enrollmentId}/pay`,
    );
    return response.data.enrollment;
  },

  // ➔ Verified Student Queue Join (No manual name/phone/email required!)
  joinStudentQueue: async (
    payload: IStudentJoinQueuePayload,
  ): Promise<IQueueItem> => {
    const response = await axios.post(`${BASE_API_URL}/queue/join`, payload);
    return response.data.ticket;
  },

  // ➔ Fetch active queue ticket from MongoDB
  getStudentActiveTicket: async (
    clerkId: string,
  ): Promise<IQueueItem | null> => {
    const response = await axios.get(
      `${BASE_API_URL}/queue/student/${clerkId}`,
    );
    return response.data.ticket || null;
  },

  // ➔ Confirm physical arrival when scanning wall QR poster
  confirmStudentArrival: async (ticketId: string): Promise<IQueueItem> => {
    const response = await axios.post(
      `${BASE_API_URL}/queue/${ticketId}/arrive`,
    );
    return response.data.ticket;
  },

  // ➔ Leave queue cleanly
  leaveStudentQueue: async (ticketId: string): Promise<void> => {
    await axios.delete(`${BASE_API_URL}/queue/${ticketId}/ghost`);
  },

  // Inside studentService object:
  searchCompanyStudents: async (
    companyId: string,
    query: string,
  ): Promise<ISearchedStudent[]> => {
    const response = await axios.get(
      `${BASE_API_URL}/users/company/${companyId}/students`,
      { params: { q: query } },
    );
    return response.data.students;
  },

  // Inside studentService object:
  getStudentLessonHistory: async (
    clerkId: string,
  ): Promise<ILessonHistoryItem[]> => {
    const response = await axios.get(
      `${BASE_API_URL}/queue/student/${clerkId}/history`,
    );
    return response.data.history || [];
  },

  // Inside studentService:
  getAvailableCompanies: async (): Promise<IDrivingSchoolOption[]> => {
    const response = await axios.get(`${BASE_API_URL}/companies`);
    return response.data.companies || [];
  },

  assignStudentSchool: async (
    clerkId: string,
    companyId: string,
    branchId?: string,
  ): Promise<IUserData> => {
    const response = await axios.patch(
      `${BASE_API_URL}/users/${clerkId}/assign-school`,
      { companyId, branchId },
    );
    return response.data.user;
  },

  // Inside studentService object:
  adminCreateStudent: async (
    payload: IAdminCreateStudentPayload,
  ): Promise<IUserData> => {
    const response = await axios.post(
      `${BASE_API_URL}/users/admin-create-student`,
      payload,
    );
    return response.data.user;
  },
};
