import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">Varnika</span>
        </div>
        <nav className="nav">
          <a href="/" className="nav-link active">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="nav-link">Docs</a>
          <a href="https://github.com/Achintharya/Varnika" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
