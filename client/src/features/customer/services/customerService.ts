import axios from "axios";
import type { IQueueItem } from "../../queue/services/queueService";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://amehlo-app.onrender.com/api";

export interface IStaffData {
  clerkId: string;
  name: string;
  email: string;
  assignedBranchId: string;
}

export const customerService = {
  // ➔ FETCH AVAILABLE SPECIALISTS ASSIGNED TO THIS BRANCH TERMINAL
  getBranchWorkers: async (branchId: string): Promise<IStaffData[]> => {
    const response = await axios.get(
      `${API_URL}/users/branch/${branchId}/staff`,
    );
    return response.data.staff || [];
  },

  // ➔ REGISTER A GUEST CUSTOMER WITH SERVICE LANE AND PREFERRED WORKER BINDS
  joinQueueFromMobile: async (
    branchId: string,
    name: string,
    phone: string,
    serviceId: string,
    email?: string,
    isRemoteJoin: boolean = true,
    preferredWorkerId: string | null = null, // ➔ 🎯 Captures favorite specialist selection
  ): Promise<IQueueItem> => {
    const response = await axios.post(`${API_URL}/queue/join`, {
      branchId,
      name,
      phone,
      serviceId,
      email,
      isRemoteJoin,
      preferredWorkerId, // ➔ Forwards directly to your upgraded backend controller stage
    });
    return response.data.ticket;
  },

  confirmPhysicalArrival: async (ticketId: string): Promise<any> => {
    const response = await axios.post(`${API_URL}/queue/${ticketId}/arrive`);
    return response.data;
  },

  leaveQueueFromMobile: async (ticketId: string): Promise<void> => {
    await axios.delete(`${API_URL}/queue/${ticketId}/ghost`);
  },
};
