import axios from "axios";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/services"
    : "https://amehlo-app.onrender.com/api/services";

export interface IServiceData {
  _id: string;
  businessId: string;
  name: string;
  price: number;
  createdAt: string;
}

export interface IServiceSetupInput {
  name: string;
  price: number;
}

export const categoryService = {
  setupServices: async (
    businessId: string,
    services: (string | IServiceSetupInput)[],
  ): Promise<void> => {
    await axios.post(`${API_URL}/setup`, { businessId, services });
  },

  updateServicePrice: async (
    serviceId: string,
    price: number,
  ): Promise<IServiceData> => {
    const response = await axios.patch(`${API_URL}/${serviceId}/price`, {
      price,
    });
    return response.data.service;
  },

  getBusinessServices: async (branchId: string): Promise<IServiceData[]> => {
    const response = await axios.get(`${API_URL}/branch/${branchId}`);
    return response.data.services;
  },
};
