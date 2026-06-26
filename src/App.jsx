import React, { useState, useEffect } from 'react';
import { Upload, Target, FileText, Settings as SettingsIcon, Brain } from 'lucide-react';
import Parser from './components/Parser';
import Builder from './components/Builder';
import Analyzer from './components/Analyzer';
import Settings from './components/Settings';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState('parser');
  const [rawText, setRawText] = useState('');
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      phone: '(555) 123-4567',
      location: 'Seattle, WA',
      linkedin: 'https://linkedin.com/in/alex-mercer',
      github: 'https://github.com/alex-mercer',
      website: 'https://alexmercer.dev',
      summary: 'Passionate and results-driven Software Engineer with 3+ years of experience designing and implementing scalable web applications. Adept at frontend optimization and cloud architecture integrations.'
    },
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS', 'SQL', 'Git', 'HTML', 'CSS'],
    experience: [
      {
        jobTitle: 'Software Engineer',
        company: 'CloudTech Solutions',
        location: 'Seattle, WA',
        startDate: 'Jun 2022',
        endDate: 'Present',
        description: '• Developed and maintained React-based web platforms, increasing page loading speeds by 35%.\n• Built microservices in Node.js and containerized applications using Docker for deployment on AWS ECS.\n• Collaborated with UX designers to establish unified component systems and styled interfaces.'
      },
      {
        jobTitle: 'Junior Developer',
        company: 'PixelForge Studio',
        location: 'Portland, OR',
        startDate: 'Jan 2021',
        endDate: 'May 2022',
        description: '• Handled full-stack development using PostgreSQL, Express, and React.\n• Streamlined testing workflows by integrating Jest tests, reducing production bugs by 15%.\n• Configured CI/CD automation deployment workflows via GitHub Actions.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Washington',
        location: 'Seattle, WA',
        startDate: '2017',
        endDate: '2021',
        description: 'GPA: 3.8/4.0. Graduated with Honors. Coursework: Advanced Algorithms, Cloud Infrastructure, Database Systems.'
      }
    ],
    projects: [
      {
        title: 'ATS Resume Matcher',
        technologies: 'React, Node.js, NLP Engine',
        description: 'Designed a real-time analyzer tool scanning resumes against vacancy descriptions. Programmed visual keyword alignment metrics and suggestions.'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Developer – Associate',
        issuer: 'Amazon Web Services',
        date: 'Oct 2024'
      }
    ]
  });

  // Load API Key from environment or LocalStorage on mount
  useEffect(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    const savedKey = localStorage.getItem('gemini_api_key');
    if (envKey) {
      setApiKey(envKey);
    } else if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleParseComplete = (newData) => {
    setResumeData(newData);
    // Switch automatically to builder to review results
    setActiveTab('builder');
  };

  return (
    <div className="app-wrapper">
      
      {/* HEADER SECTION (no-print) */}
      <header className="app-header no-print">
        <div className="header-logo flex items-center gap-2">
          <div className="logo-icon-bg">
            <Brain size={20} className="text-teal" />
          </div>
          <h1>ResuAI <span className="logo-tag">ATS Copilot</span></h1>
        </div>
        <div className="header-actions">
          <div className="api-badge flex items-center gap-1.5">
            <div className={`status-dot ${apiKey ? 'active' : 'inactive'}`} />
            <span className="text-xs font-semibold">
              {apiKey ? 'AI Engines Configured' : 'Local Sandbox Mode'}
            </span>
          </div>
        </div>
      </header>

      {/* DASHBOARD CORE GRID */}
      <div className="dashboard-layout">
        
        {/* SIDEBAR NAVIGATION (no-print) */}
        <aside className="sidebar no-print">
          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab('parser')}
              className={`nav-item ${activeTab === 'parser' ? 'active' : ''}`}
            >
              <Upload size={20} />
              <span>Resume Parser</span>
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`nav-item ${activeTab === 'builder' ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>Resume Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`nav-item ${activeTab === 'analyzer' ? 'active' : ''}`}
            >
              <Target size={20} />
              <span>ATS Matcher</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <SettingsIcon size={20} />
              <span>Settings</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <p className="text-xs opacity-60">ResuAI Suite v1.0.0</p>
            <p className="text-[10px] opacity-40 mt-1">Hands-on AI/ML project</p>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="workspace">
          {activeTab === 'parser' && (
            <Parser
              apiKey={apiKey}
              onParseComplete={handleParseComplete}
              rawText={rawText}
              setRawText={setRawText}
            />
          )}

          {activeTab === 'builder' && (
            <Builder
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
          )}

          {activeTab === 'analyzer' && (
            <Analyzer
              rawText={rawText}
              resumeData={resumeData}
              apiKey={apiKey}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              apiKey={apiKey}
              setApiKey={setApiKey}
            />
          )}
        </main>
      </div>
    </div>
  );
}
