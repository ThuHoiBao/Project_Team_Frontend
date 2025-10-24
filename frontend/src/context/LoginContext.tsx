// src/context/LoginModalContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoginModalContextType {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export const LoginModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <LoginModalContext.Provider value={{ isLoginOpen, openLogin, closeLogin }}>
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = (): LoginModalContextType => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal must be used within a LoginModalProvider");
  }
  return context;
};
