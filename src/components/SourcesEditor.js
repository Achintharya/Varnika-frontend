import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './SourcesEditor.css';

function SourcesEditor({ isOpen, onClose, onSourcesUpdated }) {
  const [sources, setSources] = useState('');
  const [originalSources, setOriginalSources] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchSources();
    }
  }, [isOpen]);

  useEffect(() => {
    setHasChanges(sources !== originalSources);
  }, [sources, originalSources]);

  // Focus textarea when modal opens and data is loaded
  useEffect(() => {
    if (isOpen && !isLoading && textareaRef.current) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading]);

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      // Try sources.md first, then fall back to sources.txt
      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/api/articles/sources.md`);
      } catch {
        response = await axios.get(`${API_BASE_URL}/api/articles/sources.txt`);
      }
      const sourcesContent = response.data || '';
      setSources(sourcesContent);
      setOriginalSources(sourcesContent);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setSources('');
      setOriginalSources('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/api/sources`, {
        content: sources
      });
      setOriginalSources(sources);
      setHasChanges(false);
      onSourcesUpdated && onSourcesUpdated();
      alert('Sources updated successfully!');
    } catch (err) {
      console.error('Error saving sources:', err);
      alert('Failed to save sources. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (hasChanges && !window.confirm('Are you sure you want to discard your changes?')) {
      return;
    }
    setSources(originalSources);
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all sources? This action cannot be undone.')) {
      return;
    }
    
    setIsSaving(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/sources`);
      setSources('');
      setOriginalSources('');
      setHasChanges(false);
      onSourcesUpdated && onSourcesUpdated();
      alert('Sources cleared successfully!');
    } catch (err) {
      console.error('Error clearing sources:', err);
      alert('Failed to clear sources. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="sources-editor-overlay" onClick={handleClose}>
      <div className="sources-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sources-editor-header">
          <h2>Edit Research Sources</h2>
          <button className="sources-editor-close" onClick={handleClose}>×</button>
        </div>

        <div className="sources-editor-content">
          {/* Manual Editor Section */}
          <div className="manual-editor-section">
            <h3>📝 Edit Sources</h3>
            {isLoading ? (
              <div className="loading-state">Loading sources...</div>
            ) : (
              <>
                <div className="editor-container">
                  <textarea
                    ref={textareaRef}
                    value={sources}
                    onChange={(e) => setSources(e.target.value)}
                    onKeyDown={(e) => {
                      // Ensure space and enter work properly
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.stopPropagation();
                      }
                    }}
                    placeholder="Enter your research sources in Markdown format...

Example:
## Topic Name
- [Source 1](https://example.com)
- [Source 2](https://example2.com)

## Another Topic
- [Source 3](https://example3.com)"
                    className="sources-textarea"
                    disabled={isSaving}
                    spellCheck={false}
                  />
                </div>

                <div className="editor-actions">
                  <div className="action-group">
                    <button
                      onClick={handleSave}
                      className="save-btn"
                      disabled={!hasChanges || isSaving}
                    >
                      {isSaving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="reset-btn"
                      disabled={!hasChanges || isSaving}
                    >
                      🔄 Reset
                    </button>
                  </div>
                  <button
                    onClick={handleClear}
                    className="clear-btn"
                    disabled={isSaving}
                  >
                    🗑️ Clear All
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SourcesEditor;
