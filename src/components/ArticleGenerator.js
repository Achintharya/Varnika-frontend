import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_BASE_URL from '../config/api';
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
  const [generatedArticles, setGeneratedArticles] = useState([]);
  const [sources, setSources] = useState([]);
  const [currentArticleFilename, setCurrentArticleFilename] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // URL extraction states
  const [newUrls, setNewUrls] = useState(['']);
  const [showUrlExtraction, setShowUrlExtraction] = useState(false);

  // Article type options
  const articleTypeOptions = [
    { value: 'detailed', label: 'Detailed Article' },
    { value: 'summarized', label: 'Summarized Article' },
    { value: 'points', label: 'Bullet Points' }
  ];

  // Fetch articles and sources on component mount
  useEffect(() => {
    fetchArticles();
    fetchSources();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Poll for job status
  useEffect(() => {
    if (jobId && loading) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/jobs/${jobId}`);
          const job = response.data;
          
          setProgress(job.progress);
          setProgressMessage(job.message);
          
          if (job.status === 'completed') {
            // Fetch the article content
            const articleResponse = await axios.get(`${API_BASE_URL}/api/articles/${job.result.filename}`);
            let content = articleResponse.data;
            
            // Strip markdown code block wrapper if present
            if (content.startsWith('```markdown\n') && content.endsWith('\n```')) {
              content = content.slice(12, -4);
            } else if (content.startsWith('```markdown') && content.endsWith('```')) {
              content = content.slice(11, -3);
            }
            
            setArticle(content);
            setCurrentArticleFilename(job.result.filename);
            setLoading(false);
            setShowOutput(true);
            setJobId(null);
            // Refresh articles list
            fetchArticles();
            fetchSources();
          } else if (job.status === 'failed') {
            setError(job.error || 'Article generation failed');
            setLoading(false);
            setJobId(null);
          }
        } catch (err) {
          console.error('Error checking job status:', err);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [jobId, loading]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles`);
      setGeneratedArticles(response.data.articles || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const fetchSources = async () => {
    try {
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

  const handleGenerate = async () => {
    // Check if we have URLs or topic
    const validUrls = newUrls.filter(url => url.trim() && (url.startsWith('http://') || url.startsWith('https://')));
    const hasUrls = validUrls.length > 0;
    const hasTopic = query.trim();

    if (!hasTopic && !hasUrls) {
      setError('Enter a topic or provide URLs to extract from');
      return;
    }

    setError('');
    setLoading(true);
    setProgress(0);
    setProgressMessage('Starting article generation...');
    setShowOutput(false);
    setArticle('');

    try {
      let response;
      
      if (hasUrls) {
        // Generate article from URLs
        response = await axios.post(`${API_BASE_URL}/api/generate/from-urls`, {
          urls: validUrls,
          query: hasTopic ? query.trim() : 'Article from URLs',
          article_type: articleType
        });
      } else {
        // Generate article from topic
        response = await axios.post(`${API_BASE_URL}/api/generate`, {
          query: query,
          article_type: articleType,
          skip_search: false
        });
      }

      setJobId(response.data.job_id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start article generation');
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(article);
    const button = document.querySelector('.copy-btn');
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([article], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `article_${query.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCloseArticle = () => {
    setShowOutput(false);
    setArticle('');
  };

  // URL extraction functions
  const addUrlField = () => {
    setNewUrls([...newUrls, '']);
  };

  const removeUrlField = (index) => {
    const updatedUrls = newUrls.filter((_, i) => i !== index);
    setNewUrls(updatedUrls.length > 0 ? updatedUrls : ['']);
  };

  const updateUrl = (index, value) => {
    const updatedUrls = [...newUrls];
    updatedUrls[index] = value;
    setNewUrls(updatedUrls);
  };

  const toggleUrlExtraction = () => {
    setShowUrlExtraction(!showUrlExtraction);
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

        {/* Extract from URLs Button */}
        <button
          type="button"
          className="url-toggle-btn"
          onClick={toggleUrlExtraction}
          disabled={loading}
        >
          🔗 Extract from URLs
          <span className={`toggle-arrow ${showUrlExtraction ? 'open' : ''}`}>▼</span>
        </button>

        {/* Collapsible URL Extraction Section */}
        {showUrlExtraction && (
          <div className="url-extraction-section">
            <div className="url-form">
              <div className="form-group">
                <label>URLs to Extract:</label>
                <div className="urls-container">
                  {newUrls.map((url, index) => (
                    <div key={index} className="url-input-row">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateUrl(index, e.target.value)}
                        placeholder="https://example.com"
                        className="url-input"
                        disabled={loading}
                      />
                      {newUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrlField(index)}
                          className="remove-url-btn"
                          disabled={loading}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addUrlField}
                  className="add-url-btn"
                  disabled={loading}
                >
                  + Add Another URL
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="select-group">
          <div className="custom-dropdown">
            <div 
              className={`dropdown-header ${dropdownOpen ? 'open' : ''} ${loading ? 'disabled' : ''}`}
              onClick={() => !loading && setDropdownOpen(!dropdownOpen)}
            >
              <span className="dropdown-selected">
                {articleTypeOptions.find(opt => opt.value === articleType)?.label}
              </span>
              <span className="dropdown-arrow">▼</span>
            </div>
            {dropdownOpen && (
              <div className="dropdown-options">
                {articleTypeOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`dropdown-option ${articleType === option.value ? 'selected' : ''}`}
                    onClick={() => {
                      setArticleType(option.value);
                      setDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
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
              <button className="action-btn close-btn" onClick={handleCloseArticle}>
                ✖️ Close
              </button>
            </div>
          </div>
          <div className="article-content">
            {currentArticleFilename && currentArticleFilename.endsWith('.md') ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article}</ReactMarkdown>
            ) : (
              <pre>{article}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleGenerator;
