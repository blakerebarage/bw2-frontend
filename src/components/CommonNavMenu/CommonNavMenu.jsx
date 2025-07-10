import { logout } from "@/redux/slices/authSlice";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import HeadingNavbar from "../HeadingNavbar/HeadingNavbar";

const CommonNavMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToasts();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    addToast("Logout successful", {
      appearance: "success",
      autoDismiss: true,
    });
    navigate("/");
  }, [dispatch, navigate, addToast]);

  return (
    <div className="sticky top-0 z-50">
      <div>
        <div className="bg-gray-800">
          <HeadingNavbar handleLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
};

export default CommonNavMenu;
