import { createContext, useContext, useState } from 'react';

const WelcomeContext = createContext();

export const WelcomeProvider = ({ children }) => {
  const [showWelcome, setShowWelcome] = useState(false);

  const triggerWelcome = () => {
    setShowWelcome(true);
  };

  return (
    <WelcomeContext.Provider value={{ showWelcome, setShowWelcome, triggerWelcome }}>
      {children}
    </WelcomeContext.Provider>
  );
};

export const useWelcome = () => {
  const context = useContext(WelcomeContext);
  if (!context) {
    throw new Error('useWelcome must be used within a WelcomeProvider');
  }
  return context;
}; 