// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";

// const AdminRoute = ({ children }) => {
//   const { token, user } = useSelector((state) => state.auth);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!token || !user || !user?.role || user?.role === "user") {
//       navigate("/admin");
//     }
//   }, [token, user, navigate]);

//   return token && user?.role !== "user" ? children : null;
//   // return children;
// };

// export default AdminRoute;
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { token, user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!token || !user || !user?.role || user?.role === "user")) {
      navigate("/admin");
    }
  }, [token, user, loading, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return token && user?.role !== "user" ? children : null;
};

export default AdminRoute;
