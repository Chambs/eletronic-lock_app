import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import InitialPage from './pages/InitialPage';
import SignupPage from './pages/SignupPage';
import LockSelectPage from './pages/LockSelectPage';
import HomePage from './pages/HomePage'; 
import LockControlPage from './pages/LockControlPage';
import RegisterLockPage from './pages/RegisterLockPage';
import JoinLockPage from './pages/JoinLockPage';
import LogsPage from './pages/LogsPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<LockSelectPage />} />
        <Route path="/home/:cod" element={<HomePage />} />
        <Route path="/lock-control" element={<LockControlPage />} />
        <Route path="/register-lock" element={<RegisterLockPage />} />
        <Route path="/join-lock" element={<JoinLockPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </div>
  );
}

export default App;
