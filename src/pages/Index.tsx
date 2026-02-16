import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default Index;
