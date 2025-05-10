import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/InitialPage';
import SignupPage from './pages/SignupPage';
import ProtectedHomePage from './pages/HomePage'; 

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<ProtectedHomePage />} />
      </Routes>
    </div>
  );
}

export default App;
