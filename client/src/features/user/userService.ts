import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export interface IUserData {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  role: string;
}

export const userService = {
  // ➔ Fetch or synchronize profiles with backend via Clerk Context ID
  getUserProfile: async (clerkId: string): Promise<IUserData> => {
    const response = await axios.get(`${API_URL}/profile/${clerkId}`);
    return response.data.user;
  },

  // ➔ Explicit webhook or registration synchronizer
  syncClerkUser: async (userData: Partial<IUserData>): Promise<IUserData> => {
    const response = await axios.post(`${API_URL}/sync`, userData);
    return response.data.user;
  },
};
