import { Link } from 'react-router-dom';
import './PageStyles.css';
import lockIcon from '../assets/lock-icon.png'; 

function HomePage() {
  return (
    <div className="page">
      <img src={lockIcon} alt="Lock Icon" className="lock-icon" />
      <h1>Eletronic Lock App</h1>
      <p>Controle sua fechadura eletrônica de forma prática e segura!</p>
      <Link to="/login" className="page-button">
        Sign in
      </Link>
    </div>
  );
}

export default HomePage;
