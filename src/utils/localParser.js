/**
 * A client-side regex-based parser to extract basic details from resume text.
 * Used as a fallback when no Gemini API key is configured.
 */

// A comprehensive list of common technical and professional skills to match against
const SKILL_DATABASE = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Scala', 'Perl', 'SQL', 'HTML', 'CSS', 'Sass',
  // Frameworks & Libraries
  'React', 'Angular', 'Vue', 'Next\\.js', 'Nuxt\\.js', 'Svelte', 'Node\\.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP\\.NET', 'Rails', 'Flutter', 'React Native', 'Redux', 'GraphQL', 'Tailwind', 'Bootstrap',
  // Databases & Cloud
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Oracle', 'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Heroku', 'Netlify', 'Vercel',
  // Tools & Methodologies
  'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins', 'Jira', 'Agile', 'Scrum', 'Webpack', 'Vite', 'Babel', 'Figma', 'Linux', 'Bash',
  // AI & Data Science
  'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy', 'NLP', 'Computer Vision', 'Data Analysis', 'Tableau', 'PowerBI'
];

export function parseResumeText(text) {
  if (!text || typeof text !== 'string') {
    return getEmptyResume();
  }

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  // 1. Extract Email
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Extract Phone
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. Extract Links (LinkedIn, GitHub, Personal Site)
  // Ensure we match usernames with dots, dashes, and slashes, case-insensitively
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-\.\/]+/i;
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_\-\.\/]+/i;
  
  const linkedinMatch = text.match(linkedinRegex);
  const githubMatch = text.match(githubRegex);
  
  // Strict Website matching to avoid matching 'react.js', email domains, or generic text periods
  let website = '';
  const websiteRegex = /\b(?:https?:\/\/)?(?:www\.)[a-zA-Z0-9_.-]+\.[a-zA-Z]{2,}\b/i;
  const strictWebRegex = /\b[a-zA-Z0-9_.-]+\.(?:com|org|net|io|me|dev|edu)\b/i;

  const webMatch = text.match(websiteRegex);
  if (webMatch) {
    website = webMatch[0];
  } else {
    const websiteMatches = text.match(new RegExp(strictWebRegex, 'gi')) || [];
    const excludedWords = ['react.js', 'node.js', 'express.js', 'next.js', 'vue.js', 'nuxt.js', 'chart.js', 'tailwind.css', 'bootstrap.css', 'index.js', 'main.js', 'github.com', 'linkedin.com'];
    for (const match of websiteMatches) {
      const lowerMatch = match.toLowerCase();
      if (!excludedWords.includes(lowerMatch) && !lowerMatch.includes('@') && !lowerMatch.match(/^\d+$/)) {
        website = match;
        break;
      }
    }
  }

  // 4. Extract Name Heuristic
  let name = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      line.length > 3 &&
      line.length < 35 &&
      !line.includes('@') &&
      !line.match(/\d/) &&
      !line.includes('|') &&
      !line.includes('/') &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum')
    ) {
      name = line;
      break;
    }
  }
  if (!name) name = 'John Doe';

  // 5. Extract Skills
  const skillsSet = new Set();
  SKILL_DATABASE.forEach(skillPattern => {
    const regex = new RegExp(`\\b${skillPattern}\\b`, 'i');
    if (regex.test(text)) {
      const cleanPattern = skillPattern.replace('\\+', '+').replace('\\.', '.');
      skillsSet.add(cleanPattern);
    }
  });
  const skills = Array.from(skillsSet);

  // 6. Section Division Heuristics
  const sections = divideSections(lines);

  // Fallback for Location if it wasn't detected by section parsing
  let location = sections.location;
  if (!location) {
    // Scan the first 8 lines for location patterns like "City, ST" or "City, Country"
    for (let i = 0; i < Math.min(8, lines.length); i++) {
      const line = lines[i];
      if (line.includes('@') || line.match(/\d{4}/) || line.toLowerCase().includes('github.com') || line.toLowerCase().includes('linkedin.com')) {
        continue;
      }
      // Match "Word, Word" or "Word, Word, Word" with optional periods (e.g. San Francisco, CA or London, UK)
      const locPattern = /\b[A-Z][a-zA-Z\s\.]+,\s*[A-Z]?[a-zA-Z\s\.]+(?:,\s*[A-Z]?[a-zA-Z\s\.]+)?\b/;
      const match = line.match(locPattern);
      if (match) {
        location = match[0];
        break;
      }
      // Fallback to any line containing a comma and no digits, under 50 characters
      if (line.includes(',') && line.length < 50 && !line.match(/\d/) && line.split(',').length >= 2) {
        location = line.trim();
        break;
      }
    }
  }

  // Fallback for Professional Summary if no section header matched
  let summary = sections.summary;
  if (!summary) {
    // Look at first 12 lines for a paragraph block of text (long string of words, not contact details or headers)
    const summaryLines = [];
    const SECTION_KEYWORDS = {
      summary: /summary|objective|profile|about me/i,
      experience: /experience|employment|work history|professional background/i,
      education: /education|academic/i,
      projects: /projects|personal projects|academic projects/i,
      certifications: /certifications|certificates|licenses|awards/i
    };
    for (let i = 0; i < Math.min(12, lines.length); i++) {
      const line = lines[i];
      const isContact = line.includes('@') || line.match(phoneRegex) || line.toLowerCase().includes('linkedin.com') || line.toLowerCase().includes('github.com') || (line.includes(',') && line.length < 50);
      const isHeader = Object.values(SECTION_KEYWORDS).some(regex => regex.test(line) && line.split(/\s+/).length <= 4);
      const isSkillLine = line.split(/[\s,]+/).length > 5 && line.match(/react|python|node|javascript|html/i);
      
      if (!isContact && !isHeader && !isSkillLine && line.length > 30) {
        summaryLines.push(line);
      }
    }
    if (summaryLines.length > 0) {
      summary = summaryLines.join(' ');
    }
  }

  return {
    personalInfo: {
      name,
      email,
      phone,
      location: location || '',
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      github: githubMatch ? githubMatch[0] : '',
      website: website,
      summary: summary || 'A motivated professional with skills in ' + (skills.slice(0, 4).join(', ') || 'software development') + '.'
    },
    skills,
    experience: sections.experience || [
      {
        jobTitle: 'Software Engineer',
        company: 'Example Corp',
        location: 'San Francisco, CA',
        startDate: 'Jan 2024',
        endDate: 'Present',
        description: 'Collaborated with cross-functional teams to deliver high-quality web applications. Optimized front-end performance and integrated modern JavaScript features.'
      }
    ],
    education: sections.education || [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'State University',
        location: 'Cityville, ST',
        startDate: 'Sep 2020',
        endDate: 'May 2024',
        description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems.'
      }
    ],
    projects: sections.projects || [
      {
        title: 'Personal Portfolio Website',
        technologies: skills.slice(0, 3).join(', ') || 'React, CSS, HTML',
        description: 'Developed a custom modern single page web application displaying personal experience and qualifications. Optimized design with responsive grid layouts.'
      }
    ],
    certifications: sections.certifications || []
  };
}


function divideSections(lines) {
  const sections = {
    summary: '',
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    location: ''
  };

  let currentSection = '';
  let currentBlockText = [];
  const sectionContent = {};

  // Simple keywords to identify transitions
  const SECTION_KEYWORDS = {
    summary: /summary|objective|profile|about me/i,
    experience: /experience|employment|work history|professional background/i,
    education: /education|academic/i,
    projects: /projects|personal projects|academic projects/i,
    certifications: /certifications|certificates|licenses|awards/i
  };

  // Scan lines and group them under section headers
  lines.forEach(line => {
    let matchedHeader = false;
    for (const [key, regex] of Object.entries(SECTION_KEYWORDS)) {
      if (regex.test(line) && line.split(/\s+/).length <= 4) {
        if (currentSection && currentBlockText.length > 0) {
          sectionContent[currentSection] = (sectionContent[currentSection] || []).concat(currentBlockText);
        }
        currentSection = key;
        currentBlockText = [];
        matchedHeader = true;
        break;
      }
    }

    if (!matchedHeader) {
      if (currentSection) {
        currentBlockText.push(line);
      } else {
        // Try to identify location from early lines
        if (line.match(/[a-zA-Z]+,\s*[A-Z]{2}\b/) && !sections.location) {
          sections.location = line;
        }
      }
    }
  });

  // Flush remaining block
  if (currentSection && currentBlockText.length > 0) {
    sectionContent[currentSection] = (sectionContent[currentSection] || []).concat(currentBlockText);
  }

  // Parse Experience Section
  if (sectionContent.experience) {
    sections.experience = parseExperienceBlocks(sectionContent.experience);
  }
  // Parse Education Section
  if (sectionContent.education) {
    sections.education = parseEducationBlocks(sectionContent.education);
  }
  // Parse Summary Section
  if (sectionContent.summary) {
    sections.summary = sectionContent.summary.join(' ');
  }
  // Parse Projects Section
  if (sectionContent.projects) {
    sections.projects = parseProjectBlocks(sectionContent.projects);
  }
  // Parse Certifications
  if (sectionContent.certifications) {
    sections.certifications = sectionContent.certifications
      .filter(line => line.length > 5)
      .map(line => ({ name: line, date: '', issuer: '' }));
  }

  return sections;
}

// Sub-parsers to structure experience, education, projects using rough line-based rules
function parseExperienceBlocks(lines) {
  const experiences = [];
  let currentExp = null;

  lines.forEach(line => {
    // Detect new role line based on dates or job titles
    const dateRegex = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|\d{4})[-–—\s]+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|\d{4})/i;
    const isDateLine = dateRegex.test(line);
    const hasJobKeyword = /(engineer|developer|manager|intern|analyst|architect|specialist|lead|consultant|officer)/i.test(line);

    if ((hasJobKeyword || isDateLine) && line.split(/\s+/).length <= 10 && line.length < 80) {
      if (currentExp) {
        experiences.push(currentExp);
      }
      
      // Attempt to extract dates
      const dateMatch = line.match(dateRegex);
      const dates = dateMatch ? dateMatch[0] : '';
      let cleanTitleLine = line.replace(dates, '').trim().replace(/^[,\s•|]+|[,\s•|]+$/g, '');
      
      // Attempt to split company vs title (e.g. "Software Engineer at Google" or "Google | Software Engineer")
      let company = 'Company Name';
      let jobTitle = cleanTitleLine;
      
      const splitDelim = cleanTitleLine.match(/\s+(?:at|@)\s+|[|•,-]/);
      if (splitDelim) {
        const parts = cleanTitleLine.split(splitDelim[0]);
        if (parts.length >= 2) {
          jobTitle = parts[0].trim();
          company = parts[1].trim();
        }
      }

      currentExp = {
        jobTitle,
        company,
        location: '',
        startDate: dates.split(/[-–—]/)[0]?.trim() || '',
        endDate: dates.split(/[-–—]/)[1]?.trim() || '',
        description: ''
      };
    } else if (currentExp) {
      // Append description line
      currentExp.description = (currentExp.description ? currentExp.description + '\n' : '') + line;
    }
  });

  if (currentExp) {
    experiences.push(currentExp);
  }

  return experiences.length > 0 ? experiences : null;
}

function parseEducationBlocks(lines) {
  const educationList = [];
  let currentEdu = null;

  lines.forEach(line => {
    const isDegreeLine = /(bachelor|master|phd|degree|b\.s|b\.a|b\.tech|m\.s|m\.b\.a|graduate|diploma|university|college|school)/i.test(line);
    
    if (isDegreeLine && line.split(/\s+/).length <= 12 && line.length < 90) {
      if (currentEdu) {
        educationList.push(currentEdu);
      }

      // Try to find dates
      const dateRegex = /(?:19|20)\d{2}/g;
      const dateMatches = line.match(dateRegex) || [];
      const startDate = dateMatches[0] || '';
      const endDate = dateMatches[1] || '';
      
      let cleanDegreeLine = line.replace(/(?:19|20)\d{2}/g, '').trim().replace(/^[,\s•|]+|[,\s•|]+$/g, '');
      let school = 'University';
      let degree = cleanDegreeLine;

      const splitDelim = cleanDegreeLine.match(/\s+from\s+|[|•,-]/i);
      if (splitDelim) {
        const parts = cleanDegreeLine.split(splitDelim[0]);
        if (parts.length >= 2) {
          degree = parts[0].trim();
          school = parts[1].trim();
        }
      }

      currentEdu = {
        degree,
        school,
        location: '',
        startDate,
        endDate,
        description: ''
      };
    } else if (currentEdu) {
      currentEdu.description = (currentEdu.description ? currentEdu.description + '\n' : '') + line;
    }
  });

  if (currentEdu) {
    educationList.push(currentEdu);
  }

  return educationList.length > 0 ? educationList : null;
}

function parseProjectBlocks(lines) {
  const projects = [];
  let currentProj = null;

  lines.forEach(line => {
    // Detect project title: short line, first letter uppercase, doesn't start with bullet
    const isTitle = line.length > 3 && line.length < 50 && /^[A-Z]/.test(line) && !line.startsWith('•') && !line.startsWith('-');
    
    if (isTitle && !line.toLowerCase().includes('key achievement') && !line.toLowerCase().includes('responsibility')) {
      if (currentProj) {
        projects.push(currentProj);
      }
      currentProj = {
        title: line,
        technologies: '',
        description: ''
      };
    } else if (currentProj) {
      // If line contains colon and lists technology terms, set technologies
      if (line.toLowerCase().includes('technolog') || line.toLowerCase().includes('stack') || line.match(/react|python|node|aws|javascript|docker/i) && line.length < 60 && line.includes(':')) {
        currentProj.technologies = line.split(':')[1]?.trim() || line;
      } else {
        currentProj.description = (currentProj.description ? currentProj.description + '\n' : '') + line;
      }
    }
  });

  if (currentProj) {
    projects.push(currentProj);
  }

  return projects.length > 0 ? projects : null;
}

function getEmptyResume() {
  return {
    personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: []
  };
}
