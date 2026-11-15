import React, { createContext, useContext, useState, useEffect } from "react";
import { categoryService } from "../services/categoryService";
import type {
  IServiceData,
  IServiceSetupInput,
} from "../services/categoryService";
import { useBranch } from "../../branch/context/BranchContext";

interface ServiceContextType {
  services: IServiceData[];
  isLoadingServices: boolean;
  loadBusinessServices: (businessId: string) => Promise<void>;
  configureInitialServices: (
    businessId: string,
    services: (string | IServiceSetupInput)[],
  ) => Promise<void>;
  updateServicePrice: (serviceId: string, price: number) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activeBranchId } = useBranch();

  const [services, setServices] = useState<IServiceData[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(false);

  const loadBusinessServices = async (businessId: string) => {
    setIsLoadingServices(true);
    try {
      const data = await categoryService.getBusinessServices(businessId);
      setServices(data);
    } catch (err) {
      console.error("Failed fetching configured workflow operations:", err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const configureInitialServices = async (
    businessId: string,
    serviceItems: (string | IServiceSetupInput)[],
  ) => {
    try {
      await categoryService.setupServices(businessId, serviceItems);
      await loadBusinessServices(businessId);
    } catch (err) {
      console.error("Failed saving workspace category mappings:", err);
      throw err;
    }
  };

  const updateServicePrice = async (serviceId: string, price: number) => {
    const updated = await categoryService.updateServicePrice(serviceId, price);
    setServices((prev) => prev.map((s) => (s._id === serviceId ? updated : s)));
  };

  useEffect(() => {
    if (activeBranchId) {
      loadBusinessServices(activeBranchId);
    } else {
      setServices([]);
    }
  }, [activeBranchId]);

  return (
    <ServiceContext.Provider
      value={{
        services,
        isLoadingServices,
        loadBusinessServices,
        configureInitialServices,
        updateServicePrice,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
};
