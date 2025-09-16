import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_BASE_URL from '../config/api';
import './MyArticles.css';

function MyArticles({ isOpen, onClose }) {
  const [articles, setArticles] = useState([]);
  const [sources, setSources] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedArticleContent, setSelectedArticleContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchArticles();
      fetchSources();
    }
  }, [isOpen]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles`);
      setArticles(response.data.articles || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const fetchSources = async () => {
    try {
      // Try sources.md first, then fall back to sources.txt
      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/api/articles/sources.md`);
      } catch {
        response = await axios.get(`${API_BASE_URL}/api/articles/sources.txt`);
      }
      setSources(response.data);
    } catch (err) {
      console.error('Error fetching sources:', err);
    }
  };

  const handleViewArticle = async (filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles/${filename}`);
      let content = response.data;
      
      // Strip markdown code block wrapper if present
      if (content.startsWith('```markdown\n') && content.endsWith('\n```')) {
        content = content.slice(12, -4); // Remove ```markdown\n from start and \n``` from end
      } else if (content.startsWith('```markdown') && content.endsWith('```')) {
        content = content.slice(11, -3); // Remove ```markdown from start and ``` from end
      }
      
      console.log('Processed content (first 200 chars):', content.substring(0, 200)); // Debug log
      setSelectedArticle(filename);
      setSelectedArticleContent(content);
    } catch (err) {
      console.error('Error loading article:', err);
    }
  };

  const handleDownloadArticle = async (filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles/${filename}`);
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading article:', err);
    }
  };

  const handleDeleteArticle = async (filename) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${filename.replace('article_', '').replace(/_/g, ' ').replace(/\d{8}\.md/, '').replace('.md', '').trim()}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/articles/${filename}`);
      // Refresh the articles list after successful deletion
      fetchArticles();
      // Show success message (optional)
      console.log(`Article ${filename} deleted successfully`);
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article. Please try again.');
    }
  };

  const handleDownloadSources = () => {
    const blob = new Blob([sources], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sources.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="my-articles-overlay" onClick={onClose}>
      <div className="my-articles-modal" onClick={(e) => e.stopPropagation()}>
        <button className="my-articles-close" onClick={onClose}>×</button>
        
        <h2 className="my-articles-title">My Articles</h2>
        
        <div className="my-articles-content">
          {selectedArticle ? (
            <div className="article-viewer">
              <div className="article-viewer-header">
                <h3>{selectedArticle.replace('article_', '').replace(/_/g, ' ').replace(/\d{8}\.md/, '').replace(/\d{8}_\d{6}\.txt/, '').replace('.md', '').replace('.txt', '').trim()}</h3>
                <button className="back-btn" onClick={() => setSelectedArticle(null)}>
                  ← Back to List
                </button>
              </div>
              <div className="article-viewer-content">
                {selectedArticle && selectedArticle.endsWith('.md') ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedArticleContent}</ReactMarkdown>
                ) : (
                  <pre>{selectedArticleContent}</pre>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="articles-section">
                <h3>📚 Generated Articles</h3>
                {articles.length > 0 ? (
                  <div className="articles-grid">
                    {articles.map((articleFile, index) => {
                      const displayName = articleFile.filename
                        .replace('article_', '')
                        .replace(/_/g, ' ')
                        .replace(/\d{8}\.md/, '')
                        .replace(/\d{8}_\d{6}\.txt/, '')
                        .replace('.md', '')
                        .replace('.txt', '')
                        .trim();
                      const date = new Date(articleFile.modified);
                      
                      return (
                        <div key={index} className="article-card">
                          <div className="article-card-header">
                            <h4>{displayName || 'Untitled Article'}</h4>
                            <span className="article-date">
                              {date.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="article-card-actions">
                            <button 
                              className="card-btn view-btn" 
                              onClick={() => handleViewArticle(articleFile.filename)}
                              title="View article"
                            >
                              👁️ View
                            </button>
                            <button 
                              className="card-btn download-btn" 
                              onClick={() => handleDownloadArticle(articleFile.filename)}
                              title="Download article"
                            >
                              ⬇️
                            </button>
                            <button 
                              className="card-btn delete-btn" 
                              onClick={() => handleDeleteArticle(articleFile.filename)}
                              title="Delete article"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="empty-message">No articles generated yet.</p>
                )}
              </div>

              <div className="sources-section">
                <h3>🔗 Research Sources</h3>
                {sources ? (
                  <div className="sources-wrapper">
                    <div className="sources-preview">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{sources}</ReactMarkdown>
                    </div>
                    <button 
                      className="action-btn download-sources-btn"
                      onClick={handleDownloadSources}
                    >
                      ⬇️ Download Sources
                    </button>
                  </div>
                ) : (
                  <p className="empty-message">No sources available yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyArticles;
