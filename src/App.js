import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import ArticleGenerator from './components/ArticleGenerator';
import About from './components/About';

function App() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="App">
      <Header onAboutClick={() => setShowAbout(true)} />
      <main className="main-container">
        <div className="hero-section">
          <h1 className="hero-title">Generate High-Quality Articles with AI</h1>
          <p className="hero-subtitle">Search, summarize, and write in one step.</p>
        </div>
        <ArticleGenerator />
      </main>
      <footer className="footer">
        <p>© 2025 Varnika. Built with AI-powered intelligence.</p>
      </footer>
      <About isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}

export default App;
