import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from 'react-router-dom';
import "./App.css";
import InstallPrompt from './components/InstallPrompt';
import WelcomeMessage from './components/WelcomeMessage/WelcomeMessage';
import usePendingRequests from './Hook/usePendingRequests';
import useManualUserDataReload from './Hook/useUserDataReload';
import { fetchSystemSettings } from "./redux/slices/systemSettingsSlice";
import { WelcomeProvider } from './UserContext/WelcomeContext';

// Separate component to handle route-based updates
const RouteChangeHandler = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { refetch: fetchPendingRequests } = usePendingRequests();

  useEffect(() => {
    if (user?.role && user.role !== "user") {
      fetchPendingRequests();
    }
  }, [location.pathname, user?.role, fetchPendingRequests]);

  return null;
};

function App() {
  
const { reloadUserData } = useManualUserDataReload();
const dispatch = useDispatch();
const pathname = useLocation().pathname
  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dispatch(fetchSystemSettings()).unwrap();
        await reloadUserData();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
  }, [dispatch, reloadUserData]);

  // Call loadInitialData when pathname is "/game" or "/"
  useEffect(() => {
    if (pathname === "/game" || pathname === "/") {
      const loadInitialData = async () => {
        try {
          await dispatch(fetchSystemSettings()).unwrap();
          await reloadUserData();
        } catch (error) {
          console.error('Error loading initial data:', error);
        }
      };
      loadInitialData();
    }
  }, [pathname, dispatch, reloadUserData]);

  return (
    
      <WelcomeProvider>
        <div className="bg-gray-900">
          <RouteChangeHandler />
          <WelcomeMessage />
          <Outlet />
          <InstallPrompt />
        </div>
      </WelcomeProvider>
    
  );
}

export default App;
