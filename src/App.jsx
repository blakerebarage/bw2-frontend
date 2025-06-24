import { Outlet } from 'react-router-dom';
import "./App.css";
import WelcomeMessage from './components/WelcomeMessage/WelcomeMessage';
import { WelcomeProvider } from './UserContext/WelcomeContext';

function App() {
  

  

  return (
    <WelcomeProvider>
      <div className="bg-gray-900">
        <WelcomeMessage />
        <Outlet />
      </div>
    </WelcomeProvider>
  );
}

export default App;
