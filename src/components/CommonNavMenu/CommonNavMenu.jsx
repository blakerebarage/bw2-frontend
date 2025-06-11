import { logout } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import HeadingNavbar from "../HeadingNavbar/HeadingNavbar";

const CommonNavMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const handleLogout = () => {
    dispatch(logout());
    addToast("Logout successful", {
      appearance: "success",
      autoDismiss: true,
    });
    navigate("/");
  };
 

  return (
    <div>
      <div>
        <div className=" bg-gray-800  ">
          <HeadingNavbar handleLogout={handleLogout}></HeadingNavbar>
        </div>
        
      </div>
    </div>
  );
};

export default CommonNavMenu;
