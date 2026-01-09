// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // โหลด user จาก localStorage ถ้ามี
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);

    try {
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData?.role) {
        localStorage.setItem("role", userData.role);
      } else {
        localStorage.removeItem("role");
      }
    } catch {
      // เผื่อ localStorage พังเฉย ๆ ก็ไม่ต้องทำอะไรเพิ่ม
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    } catch {}
  };

  const value = { user, login, logout };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}