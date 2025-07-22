import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Not logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Logged in, but not authorized
    return <Navigate to="/" replace />;
  }

  if (["cash-agent", "sub-cash-agent", "wallet-agent"].includes(user?.role)) {
    return <Navigate to="/cash-agent" replace />;
  }

  // Authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 