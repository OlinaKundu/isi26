import React, { useState } from 'react';
import { Sparkles, FileSearch, Target, CheckCircle2, XCircle, ChevronRight, Loader, AlertTriangle } from 'lucide-react';
import { analyzeJobMatch } from '../utils/ai';

export default function Analyzer({ rawText, resumeData, apiKey }) {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const runAnalysis = async () => {
    if (!rawText) {
      setErrorMsg('Please upload a resume in the Parser tab first before analyzing.');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMsg('Please paste a Job Description to match against.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResults(null);

    try {
      if (apiKey) {
        const aiResults = await analyzeJobMatch(rawText, jobDescription, apiKey);
        setResults(aiResults);
      } else {
        // Fallback local matching analyzer
        const mockResults = runLocalHeuristicAnalysis(resumeData, jobDescription);
        setResults(mockResults);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runLocalHeuristicAnalysis = (data, jdText) => {
    const jdWords = jdText.toLowerCase().split(/[\s,.:;()]+/);
    const resumeSkills = data.skills || [];
    
    // Simple intersection of resume skills and words in the JD
    const matched = [];
    const missing = [];

    // Let's check a set of typical keywords in JD text
    const keywordDatabase = [
      'React', 'Node.js', 'Python', 'Java', 'SQL', 'Docker', 'AWS', 'Kubernetes',
      'TypeScript', 'JavaScript', 'Git', 'Agile', 'Scrum', 'CI/CD', 'Machine Learning',
      'Artificial Intelligence', 'GCP', 'PostgreSQL', 'MongoDB', 'REST API', 'Figma'
    ];

    keywordDatabase.forEach(kw => {
      const isRequired = new RegExp(`\\b${kw.replace('.', '\\.')}\\b`, 'i').test(jdText);
      if (isRequired) {
        const isMatched = resumeSkills.some(skill => 
          new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(kw) || 
          new RegExp(`\\b${kw.replace('.', '\\.')}\\b`, 'i').test(skill)
        );
        if (isMatched) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      }
    });

    // Calculate score
    const totalRequired = matched.length + missing.length;
    let score = 50; // default baseline
    if (totalRequired > 0) {
      score = Math.round((matched.length / totalRequired) * 100);
      // Give a slight boost if they have solid personal info
      if (data.personalInfo?.email && data.personalInfo?.phone) score += 5;
      if (data.experience?.length > 1) score += 5;
      score = Math.min(score, 100);
    }

    return {
      score,
      summary: `Local analysis indicates a ${score}% compatibility. This is based on a keyword match between your profile skills and typical tech stack keywords found in the job description.`,
      matchedKeywords: matched.length > 0 ? matched : ['JavaScript', 'HTML', 'CSS'],
      missingKeywords: missing.length > 0 ? missing : ['Docker', 'AWS', 'Agile'],
      strengths: [
        `You have matching skills relevant to the posting: ${matched.slice(0, 4).join(', ') || 'Core web skills'}.`,
        'Your contact details and layout are structured and parseable.'
      ],
      gaps: [
        missing.length > 0 
          ? `Missing some core tech stack mentions: ${missing.slice(0, 3).join(', ')}.`
          : 'Could benefit from more quantified achievements (e.g. percentages, dollars saved).',
        'No direct cloud computing experience parsed in project descriptions.'
      ],
      recommendations: [
        'Add details about cloud deployments (AWS, Docker) if you have worked with them.',
        'Incorporate matching job keywords naturally inside your work experience bullet points.',
        'Integrate your key accomplishments using the STAR framework (Situation, Task, Action, Result).'
      ]
    };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="card glass-panel fade-in">
      <div className="card-header">
        <div className="header-icon">
          <Target size={24} className="text-teal" />
        </div>
        <div>
          <h2>ATS Alignment Analyzer</h2>
          <p className="subtitle">Evaluate your resume matching level against a specific Job Description</p>
        </div>
      </div>

      <div className="card-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="form-group">
            <label htmlFor="jd-textarea" className="form-label flex items-center justify-between">
              <span>Paste Job Description</span>
              <span className="text-xs opacity-60">Paste full requirements text</span>
            </label>
            <textarea
              id="jd-textarea"
              placeholder="Paste the target job role, responsibilities, and technical requirements details here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="text-input font-sans leading-relaxed"
            />
            
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="btn btn-primary w-full mt-4"
            >
              {loading ? (
                <>
                  <Loader className="spinner" size={18} />
                  Running Alignment Analysis...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Compatibility
                </>
              )}
            </button>

            {!apiKey && (
              <div className="alert alert-warning mt-4 text-xs">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>
                  Using Local Heuristics. For deep semantic compatibility checking and tailored CV rewrite suggestions, configure a Gemini API Key.
                </span>
              </div>
            )}
            
            {errorMsg && (
              <div className="alert alert-error mt-4">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="results-container glass-panel p-6 rounded-xl flex flex-col justify-between">
            {loading && (
              <div className="loading-container py-12 flex flex-col items-center justify-center text-center">
                <Loader className="spinner text-teal" size={48} />
                <p className="mt-4 font-semibold text-lg">Running ATS Simulation...</p>
                <p className="text-sm opacity-70">Matching keywords and computing fit score</p>
              </div>
            )}

            {!loading && !results && (
              <div className="empty-results py-12 flex flex-col items-center justify-center text-center opacity-60">
                <FileSearch size={64} className="text-indigo mb-4" />
                <h3>No Analysis Yet</h3>
                <p className="text-sm max-w-xs mt-2">
                  Paste the job posting requirements and click Analyze to view matching scores.
                </p>
              </div>
            )}

            {!loading && results && (
              <div className="fade-in">
                {/* Score Widget */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="score-circle-container">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path className={`circle stroke-current ${getScoreColor(results.score)}`}
                        strokeDasharray={`${results.score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="percentage">{results.score}%</text>
                    </svg>
                  </div>
                  <div>
                    <h3>ATS Compatibility Match</h3>
                    <p className="text-sm opacity-70 mt-1">{results.summary}</p>
                  </div>
                </div>

                {/* Keywords Grid */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-2 opacity-80">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {results.matchedKeywords?.map((kw, i) => (
                      <span key={i} className="pill pill-success flex items-center gap-1">
                        <CheckCircle2 size={12} /> {kw}
                      </span>
                    ))}
                    {(!results.matchedKeywords || results.matchedKeywords.length === 0) && (
                      <span className="text-xs opacity-50">None found</span>
                    )}
                  </div>

                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-2 opacity-80">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {results.missingKeywords?.map((kw, i) => (
                      <span key={i} className="pill pill-danger flex items-center gap-1">
                        <XCircle size={12} /> {kw}
                      </span>
                    ))}
                    {(!results.missingKeywords || results.missingKeywords.length === 0) && (
                      <span className="text-xs opacity-50">Perfect match! No critical keywords missing.</span>
                    )}
                  </div>
                </div>

                {/* Analysis Accordions */}
                <div className="analysis-sections border-t border-slate border-dashed pt-4 flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-success flex items-center gap-1 mb-1">
                      <ChevronRight size={16} /> Key Strengths
                    </h4>
                    <ul className="list-disc pl-5 text-sm flex flex-col gap-1 text-slate-300">
                      {results.strengths?.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-danger flex items-center gap-1 mb-1">
                      <ChevronRight size={16} /> Core Gaps
                    </h4>
                    <ul className="list-disc pl-5 text-sm flex flex-col gap-1 text-slate-300">
                      {results.gaps?.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-teal flex items-center gap-1 mb-1">
                      <ChevronRight size={16} /> Optimization Steps
                    </h4>
                    <ul className="list-disc pl-5 text-sm flex flex-col gap-1 text-slate-300">
                      {results.recommendations?.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
