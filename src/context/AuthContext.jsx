// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ✅ hooks อยู่ใน function component เท่านั้น
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const value = { user, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ custom hook ใช้ใน component อื่น
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // ถ้าเรียกนอก <AuthProvider> จะเตือนชัด ๆ
    throw new Error("useAuth ต้องถูกใช้ภายใน <AuthProvider> เท่านั้น");
  }
  return ctx;
}