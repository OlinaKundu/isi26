import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Settings({ apiKey, setApiKey }) {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'cleared', 'error'

  useEffect(() => {
    setInputKey(apiKey || '');
  }, [apiKey]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setSaveStatus('error');
      return;
    }
    localStorage.setItem('gemini_api_key', inputKey.trim());
    setApiKey(inputKey.trim());
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setInputKey('');
    setSaveStatus('cleared');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="card glass-panel fade-in">
      <div className="card-header">
        <div className="header-icon">
          <Key size={24} className="text-teal" />
        </div>
        <div>
          <h2>API Configuration</h2>
          <p className="subtitle">Configure AI integration settings for advanced capabilities</p>
        </div>
      </div>

      <div className="card-content">
        <div className="info-box mb-6">
          <p>
            This application uses the <strong>Google Gemini API</strong> for intelligent parsing and job description matching. 
            Your API Key is stored directly on your computer's <code>localStorage</code> and is sent directly to Google's endpoints.
          </p>
          <a 
            href="https://aistudio.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-btn mt-2 inline-block"
          >
            Get a free Gemini API key from Google AI Studio &rarr;
          </a>
        </div>

        <form onSubmit={handleSave} className="form-group">
          <label htmlFor="api-key" className="form-label">
            Gemini API Key
          </label>
          <div className="input-with-button">
            <input
              id="api-key"
              type={showKey ? "text" : "password"}
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="text-input"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="icon-button"
              title={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="button-group mt-6">
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Save API Key
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-danger-outline"
              >
                <Trash2 size={18} />
                Remove Key
              </button>
            )}
          </div>
        </form>

        {saveStatus === 'success' && (
          <div className="alert alert-success mt-4">
            <CheckCircle size={18} />
            <span>API Key successfully saved! Advanced AI Features are now enabled.</span>
          </div>
        )}

        {saveStatus === 'cleared' && (
          <div className="alert alert-warning mt-4">
            <Trash2 size={18} />
            <span>API Key removed. Fallback local parsing logic is now active.</span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="alert alert-error mt-4">
            <AlertTriangle size={18} />
            <span>Please enter a valid key before saving.</span>
          </div>
        )}

        <div className="status-indicator-box mt-8 border-t border-slate border-dashed pt-6">
          <h3>Integration Status</h3>
          <div className="status-row mt-4">
            <div className={`status-dot ${apiKey ? 'active' : 'inactive'}`} />
            <div>
              <p className="font-semibold">{apiKey ? 'Advanced AI Mode Active' : 'Basic Local Fallback Mode'}</p>
              <p className="text-sm opacity-70">
                {apiKey 
                  ? 'Utilizing Gemini 1.5 Flash for high-quality resume structural parsing and deep semantic analysis.' 
                  : 'Utilizing regex rule match heuristics. Accuracy will be limited. Paste a Gemini key for professional results.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
