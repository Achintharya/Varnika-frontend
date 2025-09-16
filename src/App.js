import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import ArticleGenerator from './components/ArticleGenerator';
import About from './components/About';
import MyArticles from './components/MyArticles';

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [showMyArticles, setShowMyArticles] = useState(false);

  return (
    <div className="App">
      <Header 
        onAboutClick={() => setShowAbout(true)} 
        onMyArticlesClick={() => setShowMyArticles(true)}
      />
      <main className="main-container">
        <div className="hero-section">
          <h2 className="hero-title">Generate High-Quality Articles with AI</h2>
          <p className="hero-subtitle">Search, summarize, and write in one step.</p>
        </div>
        <ArticleGenerator />
      </main>
      <footer className="footer">
        <p>© 2025 Akṣarajña. Built with ❤️ by Achintharya.</p>
      </footer>
      <About isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <MyArticles isOpen={showMyArticles} onClose={() => setShowMyArticles(false)} />
    </div>
  );
}

export default App;
