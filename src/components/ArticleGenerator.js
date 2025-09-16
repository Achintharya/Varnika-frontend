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
              content = content.slice(12, -4); // Remove ```markdown\n from start and \n``` from end
            } else if (content.startsWith('```markdown') && content.endsWith('```')) {
              content = content.slice(11, -3); // Remove ```markdown from start and ``` from end
            }
            
            setArticle(content);
            setCurrentArticleFilename(job.result.filename);
            console.log('Article filename:', job.result.filename); // Debug log
            console.log('Filename ends with .md?', job.result.filename.endsWith('.md')); // Debug log
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
      }, 2000); // Poll every 2 seconds
      
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

  const handleArticleClick = async (filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles/${filename}`);
      setArticle(response.data);
      setCurrentArticleFilename(filename);
      setShowOutput(true);
      // Extract query from filename
      const queryMatch = filename.match(/article_(.+?)_\d+\.txt/);
      if (queryMatch) {
        setQuery(queryMatch[1].replace(/_/g, ' '));
      }
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

  const handleGenerate = async () => {
    if (!query.trim()) {
      setError('Enter Topic');
      return;
    }

    setError('');
    setLoading(true);
    setProgress(0);
    setProgressMessage('Starting article generation...');
    setShowOutput(false);
    setArticle('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate`, {
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
            {console.log('Rendering - currentArticleFilename:', currentArticleFilename)}
            {console.log('Is .md file?', currentArticleFilename && currentArticleFilename.endsWith('.md'))}
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
