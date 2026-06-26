/**
 * Utility functions to communicate with the Google Gemini API for
 * parsing resumes and matching them against job descriptions.
 */

// Helper to make API calls to Gemini 1.5 Flash
async function callGeminiAPI(prompt, systemInstruction, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [
        { text: systemInstruction }
      ]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) {
    throw new Error("No response received from Gemini AI.");
  }

  try {
    return JSON.parse(rawText.trim());
  } catch (e) {
    console.error("Failed to parse Gemini JSON response:", rawText);
    throw new Error("Gemini returned invalid JSON structure.");
  }
}

/**
 * Parses raw resume text into a structured JSON representation.
 */
export async function parseResumeWithAI(resumeText, apiKey) {
  const systemInstruction = `You are an expert resume parser and AI recruiter. 
Your goal is to parse raw text extracted from a resume and format it as structured JSON matching the requested schema.
Be highly accurate in mapping details to correct fields. If details are missing, leave them as empty strings or arrays.
Provide clean, concise output. Do not summarize or format as markdown. Return ONLY the JSON object.`;

  const prompt = `Parse the following resume text and structure it exactly as this JSON schema:
{
  "personalInfo": {
    "name": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "location": "City, State or Country",
    "linkedin": "LinkedIn profile URL or username",
    "github": "GitHub profile URL or username",
    "website": "Personal portfolio or website URL",
    "summary": "Professional summary or profile objective paragraph"
  },
  "skills": ["Skill 1", "Skill 2", "List of technical/soft skills"],
  "experience": [
    {
      "jobTitle": "Job Title",
      "company": "Company Name",
      "location": "Job Location",
      "startDate": "Start Date (e.g. Month Year or Year)",
      "endDate": "End Date or 'Present'",
      "description": "Details of roles, achievements, responsibilities (combine into a paragraph or keep newline-separated string)"
    }
  ],
  "education": [
    {
      "degree": "Degree (e.g. B.S. in CS)",
      "school": "University or School Name",
      "location": "Location",
      "startDate": "Start Year",
      "endDate": "End Year or 'Expected 2026'",
      "description": "Details of minor, GPA, relevant course, honors"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "technologies": "Technologies used (comma-separated)",
      "description": "Project overview, key contributions, achievements"
    }
  ],
  "certifications": [
    {
      "name": "Certification Title",
      "issuer": "Issuing Organization",
      "date": "Issue Date (Month Year or Year)"
    }
  ]
}

Resume Text:
"""
${resumeText}
"""`;

  return callGeminiAPI(prompt, systemInstruction, apiKey);
}

/**
 * Matches a resume text against a Job Description and scores compatibility.
 */
export async function analyzeJobMatch(resumeText, jobDescription, apiKey) {
  const systemInstruction = `You are a professional ATS (Applicant Tracking System) optimizer and Talent Acquisition Specialist.
Analyze the provided resume against the job description.
Return a structured evaluation indicating the fit, match percentage, and actionable feedback. Return ONLY JSON.`;

  const prompt = `Analyze the compatibility of the resume text with the job description.
Provide the evaluation strictly matching the following JSON schema:
{
  "score": 85, // Numeric score between 0 and 100 representing ATS match compatibility
  "summary": "A brief overview explaining the rating and overall alignment of the candidate's background to the job.",
  "matchedKeywords": ["keyword1", "keyword2"], // Keywords from job description that are present in the resume
  "missingKeywords": ["keyword3", "keyword4"], // Critical skills, keywords, or requirements from JD that are missing from the resume
  "strengths": [
    "Highlight specific strengths based on experiences, projects, or metrics present in the resume that match the job."
  ],
  "gaps": [
    "Highlight key gaps (e.g. missing years of experience, specific technology stack, leadership skills)."
  ],
  "recommendations": [
    "Actionable bullet points on how to revise the resume (e.g., 'Incorporate Docker experience by highlighting its use in the portfolio project', 'Rewrite summary to emphasize cloud scaling')."
  ]
}

Job Description:
"""
${jobDescription}
"""

Resume Text:
"""
${resumeText}
"""`;

  return callGeminiAPI(prompt, systemInstruction, apiKey);
}
