import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import CashAgentPanel from "../components/CashAgentPanel";

const CashAgentRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" />;
  if (["cash-agent", "sub-cash-agent","wallet-agent"].includes(user.role)) {
    return <CashAgentPanel />;
  }
  // If not a cash agent, redirect to dashboard or home
  return <Navigate to="/admindashboard" />;
};

export default CashAgentRoute; 