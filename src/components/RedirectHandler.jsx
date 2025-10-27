import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const RedirectHandler = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Handle role-based redirects
    if (token && user?.role) {
      const currentPath = window.location.pathname;
      
      if (user.role === 'cash-agent' && !currentPath.startsWith('/cash-agent')) {
        navigate('/cash-agent', { replace: true });
      } else if (user.role === 'wallet-agent' && !currentPath.startsWith('/wallet-agent')) {
        navigate('/wallet-agent', { replace: true });
      } else if (user.role === 'sub-cash-agent' && !currentPath.startsWith('/sub-cash-agent')) {
        navigate('/sub-cash-agent', { replace: true });
      }
    }
  }, [user, token, navigate]);

  return null;
};

export default RedirectHandler;

