import React from 'react';

export default function ResumeTemplates({ templateName, data }) {
  const { personalInfo = {}, skills = [], experience = [], education = [], projects = [], certifications = [] } = data;

  // Helper to format lines of description with bullet points if newline is detected
  const renderDescription = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length <= 1) return <p>{text}</p>;
    return (
      <ul className="template-bullets">
        {lines.map((line, i) => (
          <li key={i}>{line.replace(/^[•\s*-]+/, '')}</li>
        ))}
      </ul>
    );
  };

  // Render LinkedIn, GitHub and Website link labels cleanly
  const cleanLink = (url) => {
    if (!url) return '';
    return url.replace(/https?:\/\/(?:www\.)?/, '');
  };

  // ================= MODERN TECH TEMPLATE =================
  const renderModern = () => (
    <div className="template-modern">
      {/* Header */}
      <div className="tm-header">
        <h1 className="tm-name">{personalInfo.name || 'Your Name'}</h1>
        <p className="tm-title">{experience[0]?.jobTitle || 'Professional Title'}</p>
      </div>

      <div className="tm-body">
        {/* Left Side Column */}
        <div className="tm-sidebar">
          <div className="tm-section">
            <h3 className="tm-section-title">Contact</h3>
            <div className="tm-contact-info">
              {personalInfo.email && <p><strong>Email:</strong> {personalInfo.email}</p>}
              {personalInfo.phone && <p><strong>Phone:</strong> {personalInfo.phone}</p>}
              {personalInfo.location && <p><strong>Location:</strong> {personalInfo.location}</p>}
              {personalInfo.linkedin && <p><strong>LinkedIn:</strong> <span className="tm-link">{cleanLink(personalInfo.linkedin)}</span></p>}
              {personalInfo.github && <p><strong>GitHub:</strong> <span className="tm-link">{cleanLink(personalInfo.github)}</span></p>}
              {personalInfo.website && <p><strong>Website:</strong> <span className="tm-link">{cleanLink(personalInfo.website)}</span></p>}
            </div>
          </div>

          <div className="tm-section">
            <h3 className="tm-section-title">Skills</h3>
            <div className="tm-skills-list">
              {skills.map((skill, i) => (
                <span key={i} className="tm-skill-tag">{skill}</span>
              ))}
              {skills.length === 0 && <p className="italic-text">No skills added</p>}
            </div>
          </div>

          {education.length > 0 && (
            <div className="tm-section">
              <h3 className="tm-section-title">Education</h3>
              {education.map((edu, i) => (
                <div key={i} className="tm-edu-item">
                  <p className="tm-edu-degree">{edu.degree}</p>
                  <p className="tm-edu-school">{edu.school}</p>
                  <p className="tm-edu-date">{edu.startDate} - {edu.endDate}</p>
                  {edu.description && <p className="tm-edu-desc">{edu.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Column */}
        <div className="tm-main">
          {personalInfo.summary && (
            <div className="tm-section">
              <h3 className="tm-section-title">Profile Summary</h3>
              <p className="tm-summary">{personalInfo.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="tm-section">
              <h3 className="tm-section-title">Work Experience</h3>
              {experience.map((exp, i) => (
                <div key={i} className="tm-exp-item">
                  <div className="tm-exp-header">
                    <div>
                      <span className="tm-exp-title">{exp.jobTitle}</span>
                      <span className="tm-exp-company"> | {exp.company}</span>
                    </div>
                    <span className="tm-exp-date">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  {exp.location && <p className="tm-exp-location">{exp.location}</p>}
                  <div className="tm-exp-desc">{renderDescription(exp.description)}</div>
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="tm-section">
              <h3 className="tm-section-title">Projects</h3>
              {projects.map((proj, i) => (
                <div key={i} className="tm-proj-item">
                  <div className="tm-proj-header">
                    <span className="tm-proj-title">{proj.title}</span>
                    {proj.technologies && <span className="tm-proj-tech">[{proj.technologies}]</span>}
                  </div>
                  <div className="tm-proj-desc">{renderDescription(proj.description)}</div>
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div className="tm-section">
              <h3 className="tm-section-title">Certifications</h3>
              <div className="tm-certs-grid">
                {certifications.map((cert, i) => (
                  <div key={i} className="tm-cert-item">
                    <span className="tm-cert-name">{cert.name}</span>
                    {cert.issuer && <span className="tm-cert-issuer"> - {cert.issuer}</span>}
                    {cert.date && <span className="tm-cert-date"> ({cert.date})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ================= CLASSIC EXECUTIVE TEMPLATE =================
  const renderClassic = () => (
    <div className="template-classic">
      {/* Header Centered */}
      <div className="tc-header">
        <h1 className="tc-name">{personalInfo.name || 'Your Name'}</h1>
        <div className="tc-contact-bar">
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="tc-links-bar">
          {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noreferrer">{cleanLink(personalInfo.linkedin)}</a>}
          {personalInfo.github && <a href={personalInfo.github} target="_blank" rel="noreferrer">{cleanLink(personalInfo.github)}</a>}
          {personalInfo.website && <a href={personalInfo.website} target="_blank" rel="noreferrer">{cleanLink(personalInfo.website)}</a>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="tc-section">
          <p className="tc-summary">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="tc-section">
          <h2 className="tc-section-title">Professional Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="tc-item">
              <div className="tc-item-header">
                <div>
                  <strong className="tc-role">{exp.jobTitle}</strong>, <span className="tc-company">{exp.company}</span>
                </div>
                <span className="tc-date">{exp.startDate} – {exp.endDate}</span>
              </div>
              {exp.location && <p className="tc-location">{exp.location}</p>}
              <div className="tc-desc">{renderDescription(exp.description)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="tc-section">
          <h2 className="tc-section-title">Key Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="tc-item">
              <div className="tc-item-header">
                <strong className="tc-proj-title">{proj.title}</strong>
                {proj.technologies && <span className="tc-proj-tech">{proj.technologies}</span>}
              </div>
              <div className="tc-desc">{renderDescription(proj.description)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="tc-section">
          <h2 className="tc-section-title">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="tc-item">
              <div className="tc-item-header">
                <div>
                  <strong className="tc-degree">{edu.degree}</strong> – <span className="tc-school">{edu.school}</span>
                </div>
                <span className="tc-date">{edu.startDate} – {edu.endDate}</span>
              </div>
              {edu.location && <p className="tc-location">{edu.location}</p>}
              {edu.description && <p className="tc-edu-desc">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="tc-section">
          <h2 className="tc-section-title">Skills & Certifications</h2>
          <p className="tc-skills-text">
            <strong>Technical Expertise:</strong> {skills.join(', ')}
          </p>
          {certifications.length > 0 && (
            <p className="tc-certs-text mt-1">
              <strong>Certifications:</strong> {certifications.map(c => `${c.name}${c.issuer ? ` (${c.issuer})` : ''}`).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ================= CREATIVE MINIMALIST TEMPLATE =================
  const renderMinimalist = () => (
    <div className="template-minimalist">
      {/* Top Grid Info */}
      <div className="tmi-header-grid">
        <div>
          <h1 className="tmi-name">{personalInfo.name || 'Your Name'}</h1>
          <p className="tmi-title">{experience[0]?.jobTitle || 'Professional Role'}</p>
        </div>
        <div className="tmi-contact text-right">
          {personalInfo.email && <p>{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.location && <p>{personalInfo.location}</p>}
          <div className="tmi-links mt-2">
            {personalInfo.linkedin && <span className="tmi-link">{cleanLink(personalInfo.linkedin)}</span>}
            {personalInfo.github && <span className="tmi-link"> | {cleanLink(personalInfo.github)}</span>}
          </div>
        </div>
      </div>

      {personalInfo.summary && (
        <div className="tmi-section border-t border-slate-300 pt-4">
          <p className="tmi-summary">{personalInfo.summary}</p>
        </div>
      )}

      <div className="tmi-grid">
        {/* Left Side: Experience & Projects */}
        <div className="tmi-col-main">
          {experience.length > 0 && (
            <div className="tmi-section">
              <h2 className="tmi-title-section">Work Experience</h2>
              {experience.map((exp, i) => (
                <div key={i} className="tmi-item">
                  <div className="tmi-item-header">
                    <div>
                      <span className="tmi-bold">{exp.jobTitle}</span>
                      <span className="tmi-light"> at {exp.company}</span>
                    </div>
                    <span className="tmi-date">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="tmi-desc">{renderDescription(exp.description)}</div>
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="tmi-section">
              <h2 className="tmi-title-section">Projects</h2>
              {projects.map((proj, i) => (
                <div key={i} className="tmi-item">
                  <div className="tmi-item-header">
                    <span className="tmi-bold">{proj.title}</span>
                    <span className="tmi-tech-badge">{proj.technologies}</span>
                  </div>
                  <div className="tmi-desc">{renderDescription(proj.description)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Skills, Edu, Certs */}
        <div className="tmi-col-side">
          <div className="tmi-section">
            <h2 className="tmi-title-section">Skills</h2>
            <div className="tmi-skills-wrap">
              {skills.map((skill, i) => (
                <span key={i} className="tmi-skill-chip">{skill}</span>
              ))}
            </div>
          </div>

          {education.length > 0 && (
            <div className="tmi-section">
              <h2 className="tmi-title-section">Education</h2>
              {education.map((edu, i) => (
                <div key={i} className="tmi-side-item">
                  <p className="tmi-bold-small">{edu.degree}</p>
                  <p className="tmi-school-small">{edu.school}</p>
                  <p className="tmi-date-small">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div className="tmi-section">
              <h2 className="tmi-title-section">Certifications</h2>
              {certifications.map((cert, i) => (
                <div key={i} className="tmi-side-item">
                  <p className="tmi-bold-small text-xs">{cert.name}</p>
                  <p className="tmi-school-small text-xs opacity-75">{cert.issuer} ({cert.date})</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (templateName) {
    case 'classic':
      return renderClassic();
    case 'minimalist':
      return renderMinimalist();
    case 'modern':
    default:
      return renderModern();
  }
}
