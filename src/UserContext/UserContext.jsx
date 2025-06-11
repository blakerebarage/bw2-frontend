import { createContext, useContext, useState } from "react";
import { useSelector } from "react-redux";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <UserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
