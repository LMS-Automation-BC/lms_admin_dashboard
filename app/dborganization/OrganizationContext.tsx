'use client';
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";



interface OrganizationContextType {
  organization: Organization | null;
  setOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  loading: boolean;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch organization from Electron IPC
  const refreshOrganization = async () => {
  setLoading(true);
  try {
    const response = await fetch('https://brookes-jobs-hxgbhghvajeyefb7.canadacentral-01.azurewebsites.net/api/organization'); // Adjust if deployed
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const org = await response.json();
    setOrganization(org);
  } catch (error) {
    console.error("Failed to fetch organization", error);
    setOrganization(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    refreshOrganization();
  }, []);

  return (
    <OrganizationContext.Provider
      value={{ organization, setOrganization, loading, refreshOrganization }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

// Custom hook to use organization context
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};
