# Socket.IO Frontend Setup

This document describes the Socket.IO implementation in the frontend for real-time OTP updates.

## Overview

The frontend now uses Socket.IO to receive real-time updates for OTP (One-Time Password) events instead of polling the API every 30 seconds.

## Components

### 1. SocketContext (`src/contexts/SocketContext.jsx`)
- Manages the Socket.IO connection
- Automatically connects when user is authenticated
- Handles reconnection logic
- Joins user-specific rooms for targeted updates

### 2. useOtpSocket Hook (`src/Hook/useOtpSocket.js`)
- Custom hook for handling OTP-specific socket events
- Listens for `active_otp_update`, `otp_expired`, and `otp_completed` events
- Manages OTP state and notifications
- Includes API fallback when socket is not connected

### 3. Updated OtpDisplay Component (`src/components/OtpDisplay.jsx`)
- Now uses real-time socket updates instead of API polling
- Shows socket connection status
- Displays real-time OTP updates

### 4. useRechargeSocket Hook (`src/Hook/useRechargeSocket.js`)
- Custom hook for handling recharge request socket events
- Listens for `recharge_request_update` events
- Manages recharge request state and real-time updates
- Includes API fallback when socket is not connected

### 5. Updated usePendingRequests Hook (`src/Hook/usePendingRequests.js`)
- Now uses real-time socket updates for recharge requests
- Automatically updates pending deposit counts via socket events
- Falls back to API polling when socket is not connected

## Socket Events

### Backend Events (from your backend)
```javascript
io.to(`user_${userUsername}`).emit("active_otp_update", payload);
```

### Frontend Event Listeners
- `active_otp_update`: Receives new OTP data
- `otp_expired`: Notifies when OTP expires
- `otp_completed`: Notifies when OTP transaction is completed
- `recharge_request_update`: Receives updated recharge request data

## Configuration

### Environment Variables
Make sure your `.env` file includes:
```
VITE_BASE_API_URL=your_backend_url
```

### Socket Connection Options
- **Transports**: WebSocket with polling fallback
- **Reconnection**: Enabled with 5 attempts
- **Reconnection Delay**: 1 second
- **Authentication**: Uses JWT token and username

## Usage

### Basic Socket Usage
```javascript
import { useSocket } from '../contexts/SocketContext';

const MyComponent = () => {
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    if (socket) {
      socket.on('custom_event', (data) => {
       
      });
    }
  }, [socket]);
};
```

### OTP Socket Usage
```javascript
import useOtpSocket from '../Hook/useOtpSocket';

const MyComponent = () => {
  const { activeOtpData, hasNewOtp, isSocketConnected } = useOtpSocket();
  
  // Use the OTP data as needed
};
```

### Recharge Request Socket Usage
```javascript
import useRechargeSocket from '../Hook/useRechargeSocket';

const MyComponent = () => {
  const { rechargeData, hasNewRecharge, isSocketConnected } = useRechargeSocket();
  
  // Use the recharge data as needed
};
```

## Backend Integration

Your backend should emit events to user-specific rooms:

```javascript
// Example backend code for OTP
io.to(`user_${username}`).emit("active_otp_update", {
  timestamp: new Date().toISOString(),
  data: {
    otp: "123456",
    amount: 1000,
    cashAgentUsername: "agent_name",
    expiresAt: "2024-01-01T12:00:00.000Z",
    otpId: "otp_id",
    type: "new_otp",
    userUsername: "username"
  }
});

// Example backend code for Recharge Requests
io.to(`ref_code_${referralCode}`).emit("recharge_request_update", {
  timestamp: new Date().toISOString(),
  data: [
    {
      _id: "request_id",
      status: "pending",
      amount: 1000,
      username: "user_name",
      referralCode: "REF_CODE",
      // ... other recharge request data
    }
  ]
});
```

## Fallback Behavior

If Socket.IO connection fails:
1. The app falls back to the original API polling method
2. OTP updates are checked every 30 seconds via API
3. Connection status is shown to users

## Security

- Socket connection requires valid JWT token
- User-specific rooms prevent cross-user data access
- Authentication is handled via socket auth middleware

## Troubleshooting

### Common Issues

1. **Socket not connecting**
   - Check if user is authenticated
   - Verify `VITE_BASE_API_URL` is correct
   - Check browser console for connection errors

2. **Events not received**
   - Ensure backend is emitting to correct room (`user_${username}`)
   - Check if user is in the correct room
   - Verify event names match between frontend and backend

3. **OTP not showing**
   - Check if user role is authorized (`super-admin`, `admin`, `agent`, `user`)
   - Verify OTP data structure matches expected format
   - Check if `showOtpDisplay` state is true

### Debug Commands

```javascript
// In browser console
// Check socket connection
window.socket = document.querySelector('[data-socket]')?.__socket;

// Test socket events
if (window.socket) {
  window.socket.emit('test_event', { data: 'test' });
}
```

## Production Considerations

- Socket connection is optimized for production use
- Error handling includes graceful fallbacks
- Reconnection logic ensures reliable connections
- API polling provides backup when socket fails 