import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArticleGenerator.css';

function ArticleGenerator() {
  const [query, setQuery] = useState('');
  const [articleType, setArticleType] = useState('detailed');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [article, setArticle] = useState('');
  const [error, setError] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  // Poll for job status
  useEffect(() => {
    if (jobId && loading) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/jobs/${jobId}`);
          const job = response.data;
          
          setProgress(job.progress);
          setProgressMessage(job.message);
          
          if (job.status === 'completed') {
            // Fetch the article content
            const articleResponse = await axios.get(`/api/articles/${job.result.filename}`);
            setArticle(articleResponse.data);
            setLoading(false);
            setShowOutput(true);
            setJobId(null);
          } else if (job.status === 'failed') {
            setError(job.error || 'Article generation failed');
            setLoading(false);
            setJobId(null);
          }
        } catch (err) {
          console.error('Error checking job status:', err);
        }
      }, 2000); // Poll every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [jobId, loading]);

  const handleGenerate = async () => {
    if (!query.trim()) {
      setError('Please enter a topic');
      return;
    }

    setError('');
    setLoading(true);
    setProgress(0);
    setProgressMessage('Starting article generation...');
    setShowOutput(false);
    setArticle('');

    try {
      const response = await axios.post('/api/generate', {
        query: query,
        article_type: articleType,
        skip_search: false
      });

      setJobId(response.data.job_id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start article generation');
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(article);
    // Show a temporary success message
    const button = document.querySelector('.copy-btn');
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([article], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `article_${query.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="generator-card">
      <div className="form-section">
        <div className="input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Enter your topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={loading}
          />
        </div>
        
        <div className="select-group">
          <select
            className="article-type-select"
            value={articleType}
            onChange={(e) => setArticleType(e.target.value)}
            disabled={loading}
          >
            <option value="detailed">Detailed Article</option>
            <option value="summarized">Summarized Article</option>
            <option value="points">Bullet Points</option>
          </select>
        </div>

        <button
          className={`generate-btn ${loading ? 'loading' : ''}`}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Article'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-message">
            <span className="loading-dots">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </span>
            {progressMessage}
          </div>
        </div>
      )}

      {showOutput && article && (
        <div className="output-section">
          <div className="output-header">
            <h3>Generated Article</h3>
            <div className="output-actions">
              <button className="action-btn copy-btn" onClick={handleCopy}>
                📋 Copy
              </button>
              <button className="action-btn download-btn" onClick={handleDownload}>
                ⬇️ Download
              </button>
              <button className="action-btn regenerate-btn" onClick={handleRegenerate}>
                🔄 Regenerate
              </button>
            </div>
          </div>
          <div className="article-content">
            <pre>{article}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleGenerator;
