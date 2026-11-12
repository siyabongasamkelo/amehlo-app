import axios from "axios";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/services"
    : "https://amehlo-app.onrender.com/api/services";

export interface IServiceData {
  _id: string;
  businessId: string;
  name: string;
  createdAt: string;
}

export const categoryService = {
  setupServices: async (
    businessId: string,
    services: string[],
  ): Promise<void> => {
    await axios.post(`${API_URL}/setup`, { businessId, services });
  },

  // ➔ Updated to query via branchId so both owners and workers clear the matching loop seamlessly
  getBusinessServices: async (branchId: string): Promise<IServiceData[]> => {
    const response = await axios.get(`${API_URL}/branch/${branchId}`);

    return response.data.services;
  },
};
