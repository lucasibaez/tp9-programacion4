import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactElement;
  rol?: "ADMIN" | "CONSULTA";
};

export default function PrivateRoute({ children, rol }: Props) {

  const { token, user } = useAuth();

 
  if (!token) {
    return <Navigate to="/login" />;
  }

  
  if (rol && user?.rol !== rol) {
    return <Navigate to="/" />;
  }

  return children;
}