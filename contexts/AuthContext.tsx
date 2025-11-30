"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, getUserData } from "@/lib/api/auth";
import { User } from "@/types";

interface AuthContextType {
  user: any | null; // User object from PHP API
  userData: User | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const data = await getUserData(currentUser.id.toString());
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setUser(null);
      setUserData(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const data = await getUserData(currentUser.id.toString());
          setUserData(data);
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Check auth state periodically (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

