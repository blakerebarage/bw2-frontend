import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token || !user?.username) {
      // Disconnect socket if no user or token
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get the backend URL
    const backendUrl = import.meta.env.VITE_BASE_API_URL;
    
    if (!backendUrl) {
      console.error('VITE_BASE_API_URL is not set!');
      return;
    }

    // Create socket connection
    const newSocket = io(backendUrl, {
      auth: {
        token: token,
        username: user.username
      },
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000, // Increase timeout
      forceNew: true, // Force new connection
    });

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      console.log('🆔 Socket ID:', newSocket.id);
      setIsConnected(true);
      
      // Join user-specific room using the correct event name
      newSocket.emit('join_user_room', { username: user.username });
      console.log('👤 Joining user room:', `user_${user.username}`);
      
      // For admin/super-admin, join admin room to receive all updates
      if (user.role === "admin" || user.role === "super-admin") {
        newSocket.emit('join_admin_room', { role: user.role });
        console.log('👑 Joining admin room for role:', user.role);
      }
      
      // For wallet agents, join wallet agent room to receive their specific updates
      if (user.role === "wallet-agent") {
        newSocket.emit('join_wallet_agent_room', { username: user.username });
        console.log('💼 Joining wallet agent room for:', user.username);
      }
      
      // Also join referral code room for recharge request events
      if (user.referralCode) {
        console.log('🔗 Joining referral room:', `ref_code_${user.referralCode}`);
        console.log('👤 User details:', { 
          username: user.username, 
          referralCode: user.referralCode, 
          role: user.role 
        });
        
        // Try the standard room join event
        newSocket.emit('join_room', { room: `ref_code_${user.referralCode}` });
        console.log('📤 Emitted join_room event for:', `ref_code_${user.referralCode}`);
        
        // Try the correct event name that matches backend
        newSocket.emit('join_referral_code_room', { referralCode: user.referralCode });
        console.log('📤 Emitted join_referral_code_room event for:', user.referralCode);
        
        // Keep the alternative for compatibility
        newSocket.emit('join_ref_code_room', { referralCode: user.referralCode });
        console.log('📤 Emitted join_ref_code_room event for:', user.referralCode);
      } else {
        console.log('⚠️ No referralCode found for user:', user.username);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected on attempt:', attemptNumber);
      setIsConnected(true);
      
      // Rejoin user-specific room after reconnection
      newSocket.emit('join_user_room', { username: user.username });
      
      // Rejoin admin room after reconnection
      if (user.role === "admin" || user.role === "super-admin") {
        newSocket.emit('join_admin_room', { role: user.role });
      }
      
      // Rejoin wallet agent room after reconnection
      if (user.role === "wallet-agent") {
        newSocket.emit('join_wallet_agent_room', { username: user.username });
      }
      
      // Rejoin referral code room after reconnection
      if (user.referralCode) {
        newSocket.emit('join_room', { room: `ref_code_${user.referralCode}` });
      }
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
      setIsConnected(false);
    });

    // Listen for room join confirmation
    newSocket.on('room_joined', (data) => {
      console.log('✅ Room joined successfully:', data);
    });

    // Listen for referral code room join confirmation
    newSocket.on('referral_room_joined', (data) => {
      console.log('✅ Referral code room joined successfully:', data);
    });

    // Listen for any room join events
    newSocket.on('room_join_success', (data) => {
      console.log('✅ Room join success:', data);
    });

    // Listen for any errors
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Listen for any message events (debugging)
    newSocket.on('message', (data) => {
      console.log('📨 Socket message received:', data);
    });

    // Listen for transport changes
    newSocket.on('upgrade', () => {
      console.log('⬆️ Socket upgraded to WebSocket');
    });

    newSocket.on('upgradeError', (error) => {
      console.error('❌ Socket upgrade error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.username]);

  const value = {
    socket,
    isConnected,
    user: user?.username
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 