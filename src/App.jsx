import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import "./App.css";
import InstallPrompt from './components/InstallPrompt';
import RedirectHandler from './components/RedirectHandler';
import WelcomeMessage from './components/WelcomeMessage/WelcomeMessage';
import usePendingRequests from './Hook/usePendingRequests';
import useManualUserDataReload from './Hook/useUserDataReload';
import { fetchSystemSettings } from "./redux/slices/systemSettingsSlice";
import { WelcomeProvider } from './UserContext/WelcomeContext';

// Separate component to handle route-based updates
const RouteChangeHandler = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { fetchPendingRequests } = usePendingRequests();

  // Memoize the user role to prevent unnecessary re-renders
  const userRole = useMemo(() => user?.role, [user?.role]);

  useEffect(() => {
    if (userRole && userRole !== "user") {
      fetchPendingRequests();
    }
  }, [location.pathname, userRole, fetchPendingRequests]);

  return null;
};

function App() {
  const { reloadUserData } = useManualUserDataReload();
  const dispatch = useDispatch();
  const pathname = useLocation().pathname;
  const { user } = useSelector((state) => state.auth);

  // Set proper canonical URL and meta tags
  useEffect(() => {
    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    // Set canonical URL based on current path
    const baseUrl = 'https://play9.live';
    if (pathname === '/' || pathname === '/home') {
      canonical.href = baseUrl;
    } else {
      canonical.href = baseUrl + pathname;
    }

    // Set basic meta tags if they don't exist
    if (!document.querySelector('meta[name="description"]')) {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = "Play9.live - Your premier destination for online casino games and sports betting. Join now for the best gaming experience!";
      document.head.appendChild(meta);
    }

    // Set robots meta
    if (!document.querySelector('meta[name="robots"]')) {
      const robots = document.createElement('meta');
      robots.name = "robots";
      robots.content = "index, follow";
      document.head.appendChild(robots);
    }
  }, [pathname]);

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

  // If user is cash-agent or sub-cash-agent, always redirect to /cash-agent
  if (user && ["cash-agent", "sub-cash-agent", "wallet-agent"].includes(user.role) && pathname !== "/cash-agent") {
    return <Navigate to="/cash-agent" replace />;
  }

  return (
    <WelcomeProvider>
      <div className="bg-gray-900">
        <RedirectHandler />
        <RouteChangeHandler />
        <WelcomeMessage />
        <Outlet />
        <InstallPrompt />
      </div>
    </WelcomeProvider>
  );
}

export default App;
