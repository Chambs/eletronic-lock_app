import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Sign in</Link>
        <Link to="/signup" className="nav-link">Sign up</Link> 
      </nav>
    </header>
  );
}

export default Header;
