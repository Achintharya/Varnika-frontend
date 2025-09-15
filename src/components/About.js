import React from 'react';
import './About.css';

function About({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button className="about-close" onClick={onClose}>×</button>
        
        <h2 className="about-title">About Vārnika</h2>
        
        <div className="about-content">
          <section>
            <h3>🚀 What is Vārnika?</h3>
            <p>
              Varnika is an intelligent article generation system that transforms your ideas into 
              well-researched, professionally written content. Simply enter a topic, and watch as 
              Varnika searches the web, analyzes information, and creates comprehensive articles 
              tailored to your needs.
            </p>
          </section>

          <section>
            <h3>✨ How It Works</h3>
            <ol>
              <li><strong>Search & Discover:</strong> Enter any topic you're interested in</li>
              <li><strong>Web Research:</strong> Varnika automatically searches and extracts relevant information from trusted sources</li>
              <li><strong>Smart Summarization:</strong> Advanced AI analyzes and summarizes the collected data</li>
              <li><strong>Article Generation:</strong> Creates polished, well-structured articles in your chosen format</li>
            </ol>
          </section>

          <section>
            <h3>🎯 Key Features</h3>
            <ul>
              <li>✅ <strong>Multiple Article Types:</strong> Choose between detailed articles, summaries, or bullet points</li>
              <li>✅ <strong>Real-time Progress:</strong> Watch your article being created step by step</li>
              <li>✅ <strong>One-Click Actions:</strong> Copy, download, or regenerate articles instantly</li>
              <li>✅ <strong>Smart Fallbacks:</strong> Robust system that works even when some services are unavailable</li>
            </ul>
          </section>

          <section>
            <h3>🛠️ Technology Stack</h3>
            <p>
              Vārnika combines cutting-edge technologies to deliver high-quality content:
            </p>
            <ul>
              <li>🔹 <strong>Frontend:</strong> React with modern, responsive design</li>
              <li>🔹 <strong>Backend:</strong> FastAPI for lightning-fast processing</li>
              <li>🔹 <strong>AI Models:</strong> Powered by Mistral and Groq LLMs</li>
              <li>🔹 <strong>Web Extraction:</strong> Smart content extraction from multiple sources</li>
            </ul>
          </section>

          <section>
            <h3>💡 Use Cases</h3>
            <p>Perfect for:</p>
            <ul>
              <li>📝 Content creators needing quick, quality articles</li>
              <li>🎓 Students researching topics for assignments</li>
              <li>💼 Professionals creating reports and documentation</li>
              <li>📚 Anyone curious about learning new topics</li>
            </ul>
          </section>

          <section>
            <h3>🌟 Why Choose Vārnika?</h3>
            <ul>
              <li>⚡ <strong>Fast:</strong> Generate articles in seconds, not hours</li>
              <li>🎯 <strong>Accurate:</strong> Based on real web sources, no hallucinations</li>
              <li>🔄 <strong>Flexible:</strong> Multiple output formats to suit your needs</li>
              <li>🆓 <strong>Open Source:</strong> Transparent and community-driven</li>
            </ul>
          </section>

          <section className="about-footer">
            <p>
              <strong>Varnika</strong> - Transforming information into insight, one article at a time.
            </p>
            <p className="about-version">Version 1.0.0 | Built with ❤️ and AI</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default About;
