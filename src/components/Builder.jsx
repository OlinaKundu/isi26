import React, { useState } from 'react';
import { User, Briefcase, GraduationCap, Code, Award, Plus, Trash2, Printer, Layers } from 'lucide-react';
import ResumeTemplates from './ResumeTemplates';

export default function Builder({ resumeData, setResumeData }) {
  const [activeSection, setActiveSection] = useState('personal');
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [skillInput, setSkillInput] = useState('');

  // Handle simple input changes
  const handlePersonalInfoChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  // Skill Add & Delete
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (!resumeData.skills.includes(skillInput.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Handle array item changes (Experience, Education, Projects, Certs)
  const handleArrayItemChange = (section, index, field, value) => {
    setResumeData(prev => {
      const updatedList = [...prev[section]];
      updatedList[index] = { ...updatedList[index], [field]: value };
      return { ...prev, [section]: updatedList };
    });
  };

  const addArrayItem = (section, emptyObject) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], emptyObject]
    }));
  };

  const removeArrayItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Launch browser native print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="builder-container fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: EDITOR PANEL (xl:col-span-5) */}
        <div className="xl:col-span-5 flex flex-col gap-4 no-print">
          
          {/* Section Navigation Tabs */}
          <div className="section-tabs glass-panel p-2 rounded-xl flex gap-1 flex-wrap">
            <button 
              onClick={() => setActiveSection('personal')}
              className={`tab-btn flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border-0 ${activeSection === 'personal' ? 'tab-active' : 'tab-inactive'}`}
            >
              <User size={14} /> Personal
            </button>
            <button 
              onClick={() => setActiveSection('experience')}
              className={`tab-btn flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border-0 ${activeSection === 'experience' ? 'tab-active' : 'tab-inactive'}`}
            >
              <Briefcase size={14} /> Experience ({resumeData.experience?.length || 0})
            </button>
            <button 
              onClick={() => setActiveSection('education')}
              className={`tab-btn flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border-0 ${activeSection === 'education' ? 'tab-active' : 'tab-inactive'}`}
            >
              <GraduationCap size={14} /> Education ({resumeData.education?.length || 0})
            </button>
            <button 
              onClick={() => setActiveSection('projects')}
              className={`tab-btn flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border-0 ${activeSection === 'projects' ? 'tab-active' : 'tab-inactive'}`}
            >
              <Code size={14} /> Projects ({resumeData.projects?.length || 0})
            </button>
            <button 
              onClick={() => setActiveSection('certifications')}
              className={`tab-btn flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border-0 ${activeSection === 'certifications' ? 'tab-active' : 'tab-inactive'}`}
            >
              <Award size={14} /> Certs ({resumeData.certifications?.length || 0})
            </button>
          </div>

          {/* Edit Cards */}
          <div className="glass-panel p-6 rounded-xl">
            {/* PERSONAL INFO */}
            {activeSection === 'personal' && (
              <div className="form-section fade-in">
                <h3 className="mb-4 text-lg font-bold border-b border-slate pb-2 text-teal">Personal & Contact Info</h3>
                
                <div className="form-group mb-4">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="text-input" 
                    value={resumeData.personalInfo.name || ''} 
                    onChange={e => handlePersonalInfoChange('name', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="text-input" 
                      value={resumeData.personalInfo.email || ''} 
                      onChange={e => handlePersonalInfoChange('email', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      value={resumeData.personalInfo.phone || ''} 
                      onChange={e => handlePersonalInfoChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Location (City, State, Country)</label>
                  <input 
                    type="text" 
                    className="text-input" 
                    value={resumeData.personalInfo.location || ''} 
                    onChange={e => handlePersonalInfoChange('location', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="form-group">
                    <label className="form-label text-xs">LinkedIn URL</label>
                    <input 
                      type="text" 
                      className="text-input text-xs" 
                      value={resumeData.personalInfo.linkedin || ''} 
                      onChange={e => handlePersonalInfoChange('linkedin', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">GitHub URL</label>
                    <input 
                      type="text" 
                      className="text-input text-xs" 
                      value={resumeData.personalInfo.github || ''} 
                      onChange={e => handlePersonalInfoChange('github', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Website URL</label>
                    <input 
                      type="text" 
                      className="text-input text-xs" 
                      value={resumeData.personalInfo.website || ''} 
                      onChange={e => handlePersonalInfoChange('website', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Professional Summary</label>
                  <textarea 
                    rows={6}
                    className="text-input text-sm" 
                    value={resumeData.personalInfo.summary || ''} 
                    onChange={e => handlePersonalInfoChange('summary', e.target.value)}
                  />
                </div>

                <h3 className="mt-8 mb-4 text-lg font-bold border-b border-slate pb-2 text-indigo">Skills & Expertise</h3>
                <form onSubmit={handleAddSkill} className="form-group mb-4">
                  <label className="form-label">Add Skill Badge</label>
                  <div className="input-with-button">
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. React, Docker, Python..." 
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                    />
                    <button type="submit" className="icon-button-success" title="Add skill">
                      <Plus size={18} />
                    </button>
                  </div>
                </form>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {resumeData.skills?.map((skill, index) => (
                    <span key={index} className="pill pill-interactive">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="pill-remove-btn ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {(!resumeData.skills || resumeData.skills.length === 0) && (
                    <p className="text-xs opacity-50 italic">No skills listed yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* WORK EXPERIENCE */}
            {activeSection === 'experience' && (
              <div className="form-section fade-in">
                <div className="flex items-center justify-between mb-4 border-b border-slate pb-2">
                  <h3 className="text-lg font-bold text-teal">Work Experience</h3>
                  <button 
                    onClick={() => addArrayItem('experience', { jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' })}
                    className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Role
                  </button>
                </div>

                {resumeData.experience?.map((exp, index) => (
                  <div key={index} className="item-card border border-slate rounded-lg p-4 mb-4 relative">
                    <button 
                      onClick={() => removeArrayItem('experience', index)}
                      className="absolute top-4 right-4 text-danger hover:text-danger-light bg-transparent border-0 cursor-pointer"
                      title="Delete experience"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Job Title</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={exp.jobTitle || ''} 
                          onChange={e => handleArrayItemChange('experience', index, 'jobTitle', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Company</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={exp.company || ''} 
                          onChange={e => handleArrayItemChange('experience', index, 'company', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Location</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={exp.location || ''} 
                          onChange={e => handleArrayItemChange('experience', index, 'location', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Start Date</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={exp.startDate || ''} 
                          onChange={e => handleArrayItemChange('experience', index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">End Date</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={exp.endDate || ''} 
                          onChange={e => handleArrayItemChange('experience', index, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs font-semibold">Description / Key Achievements</label>
                      <textarea 
                        rows={4}
                        className="text-input text-xs leading-normal" 
                        value={exp.description || ''} 
                        onChange={e => handleArrayItemChange('experience', index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EDUCATION */}
            {activeSection === 'education' && (
              <div className="form-section fade-in">
                <div className="flex items-center justify-between mb-4 border-b border-slate pb-2">
                  <h3 className="text-lg font-bold text-teal">Education</h3>
                  <button 
                    onClick={() => addArrayItem('education', { degree: '', school: '', location: '', startDate: '', endDate: '', description: '' })}
                    className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Degree
                  </button>
                </div>

                {resumeData.education?.map((edu, index) => (
                  <div key={index} className="item-card border border-slate rounded-lg p-4 mb-4 relative">
                    <button 
                      onClick={() => removeArrayItem('education', index)}
                      className="absolute top-4 right-4 text-danger hover:text-danger-light bg-transparent border-0 cursor-pointer"
                      title="Delete education"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Degree / Major</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={edu.degree || ''} 
                          onChange={e => handleArrayItemChange('education', index, 'degree', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">School / University</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={edu.school || ''} 
                          onChange={e => handleArrayItemChange('education', index, 'school', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Location</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={edu.location || ''} 
                          onChange={e => handleArrayItemChange('education', index, 'location', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Start Date</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={edu.startDate || ''} 
                          onChange={e => handleArrayItemChange('education', index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">End Date</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={edu.endDate || ''} 
                          onChange={e => handleArrayItemChange('education', index, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Additional Details (GPA, Honors, Minors)</label>
                      <textarea 
                        rows={2}
                        className="text-input text-xs" 
                        value={edu.description || ''} 
                        onChange={e => handleArrayItemChange('education', index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PROJECTS */}
            {activeSection === 'projects' && (
              <div className="form-section fade-in">
                <div className="flex items-center justify-between mb-4 border-b border-slate pb-2">
                  <h3 className="text-lg font-bold text-teal">Projects</h3>
                  <button 
                    onClick={() => addArrayItem('projects', { title: '', technologies: '', description: '' })}
                    className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Project
                  </button>
                </div>

                {resumeData.projects?.map((proj, index) => (
                  <div key={index} className="item-card border border-slate rounded-lg p-4 mb-4 relative">
                    <button 
                      onClick={() => removeArrayItem('projects', index)}
                      className="absolute top-4 right-4 text-danger hover:text-danger-light bg-transparent border-0 cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Project Title</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={proj.title || ''} 
                          onChange={e => handleArrayItemChange('projects', index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Technologies Used</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          placeholder="e.g. React, Node.js, SQL"
                          value={proj.technologies || ''} 
                          onChange={e => handleArrayItemChange('projects', index, 'technologies', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Description</label>
                      <textarea 
                        rows={3}
                        className="text-input text-xs" 
                        value={proj.description || ''} 
                        onChange={e => handleArrayItemChange('projects', index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CERTIFICATIONS */}
            {activeSection === 'certifications' && (
              <div className="form-section fade-in">
                <div className="flex items-center justify-between mb-4 border-b border-slate pb-2">
                  <h3 className="text-lg font-bold text-teal">Certifications & Awards</h3>
                  <button 
                    onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '' })}
                    className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Certification
                  </button>
                </div>

                {resumeData.certifications?.map((cert, index) => (
                  <div key={index} className="item-card border border-slate rounded-lg p-4 mb-4 relative">
                    <button 
                      onClick={() => removeArrayItem('certifications', index)}
                      className="absolute top-4 right-4 text-danger hover:text-danger-light bg-transparent border-0 cursor-pointer"
                      title="Delete certification"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-3 gap-3 mb-2">
                      <div className="form-group col-span-2">
                        <label className="form-label text-xs">Certification Name</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={cert.name || ''} 
                          onChange={e => handleArrayItemChange('certifications', index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Date</label>
                        <input 
                          type="text" 
                          className="text-input text-xs" 
                          value={cert.date || ''} 
                          onChange={e => handleArrayItemChange('certifications', index, 'date', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label text-xs">Issuing Organization / Issuer</label>
                      <input 
                        type="text" 
                        className="text-input text-xs" 
                        value={cert.issuer || ''} 
                        onChange={e => handleArrayItemChange('certifications', index, 'issuer', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW PANEL (xl:col-span-7) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="preview-toolbar glass-panel p-4 rounded-xl flex items-center justify-between no-print gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-indigo" />
              <label htmlFor="template-select" className="text-sm font-semibold">Select Design Template:</label>
              <select
                id="template-select"
                value={activeTemplate}
                onChange={e => setActiveTemplate(e.target.value)}
                className="select-input"
              >
                <option value="modern">Modern Tech (Dual Column)</option>
                <option value="classic">Classic Executive (Traditional)</option>
                <option value="minimalist">Creative Minimal (Border Accent)</option>
              </select>
            </div>

            <button 
              onClick={handlePrint}
              className="btn btn-primary flex items-center gap-1.5"
            >
              <Printer size={18} />
              Print / Save PDF
            </button>
          </div>

          {/* Dynamic Resume Sheet Wrapper */}
          <div className="resume-preview-sheet shadow-2xl rounded-xl overflow-hidden bg-white text-slate-800 p-8 border border-slate">
            <ResumeTemplates templateName={activeTemplate} data={resumeData} />
          </div>
          
          <p className="text-center text-xs opacity-50 no-print">
            Pro Tip: Click "Print / Save PDF" and set Destination to "Save as PDF" to download your polished resume document!
          </p>
        </div>

      </div>
    </div>
  );
}
