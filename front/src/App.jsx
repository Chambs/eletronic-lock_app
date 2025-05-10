import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import InitialPage from './pages/InitialPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage'; 

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;
