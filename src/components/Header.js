import React from 'react';
import './Header.css';

function Header({ onAboutClick, onMyArticlesClick }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">Varnika</span>
        </div>
        <nav className="nav">
          <a href="/" className="nav-link active">Home</a>
          <button onClick={onMyArticlesClick} className="nav-link nav-button">My Articles</button>
          <button onClick={onAboutClick} className="nav-link nav-button">About</button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
