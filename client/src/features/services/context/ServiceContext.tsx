import React, { createContext, useContext, useState, useEffect } from "react";
// import { useApp } from "../../../context/AppContext";
import { categoryService } from "../services/categoryService";
import type { IServiceData } from "../services/categoryService";
import { useBranch } from "../../branch/context/BranchContext";

interface ServiceContextType {
  services: IServiceData[];
  isLoadingServices: boolean;
  loadBusinessServices: (businessId: string) => Promise<void>;
  configureInitialServices: (
    businessId: string,
    serviceNames: string[],
  ) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // const { activeBranchId } = useApp();
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
    serviceNames: string[],
  ) => {
    try {
      await categoryService.setupServices(businessId, serviceNames);
      await loadBusinessServices(businessId);
    } catch (err) {
      console.error("Failed saving workspace category mappings:", err);
      throw err;
    }
  };

  // Automatically load service lanes whenever the active branch changes
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
