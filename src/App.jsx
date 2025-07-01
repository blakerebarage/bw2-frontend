import useManualUserDataReload from '@/Hook/useUserDataReload';
import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from 'react-router-dom';
import "./App.css";
import InstallPrompt from './components/InstallPrompt';
import WelcomeMessage from './components/WelcomeMessage/WelcomeMessage';
import usePendingRequests from './Hook/usePendingRequests';
import { fetchSystemSettings } from "./redux/slices/systemSettingsSlice";
import { WelcomeProvider } from './UserContext/WelcomeContext';

function App() {
  const { user } = useSelector((state) => state.auth)
  const { reloadUserData } = useManualUserDataReload();
  const dispatch = useDispatch();
  const { refetch: fetchPendingRequests } = usePendingRequests();
  const pathname = useLocation();
  
  useEffect(() => {
    reloadUserData();
    dispatch(fetchSystemSettings());
    if(user?.role === "user") return;
    fetchPendingRequests();
  }, [reloadUserData, dispatch, user?.role, pathname]);

  return (
    <WelcomeProvider>
      <div className="bg-gray-900">
        <WelcomeMessage />
        <Outlet />
        <InstallPrompt />
      </div>
    </WelcomeProvider>
  );
}

export default App;
