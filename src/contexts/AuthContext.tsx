import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

interface StoredUser {
  name: string;
  email: string;
  password: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      const u = { email: found.email, name: found.name };
      setUser(u);
      localStorage.setItem("currentUser", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === email)) return false;
    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    const u = { email, name };
    setUser(u);
    localStorage.setItem("currentUser", JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};


