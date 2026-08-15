import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);

  if (token === null) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
