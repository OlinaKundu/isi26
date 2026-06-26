import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Eye, ChevronRight } from 'lucide-react';
import { parseResumeText } from '../utils/localParser';
import { parseResumeWithAI } from '../utils/ai';

export default function Parser({ apiKey, onParseComplete, rawText, setRawText }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loadingState, setLoadingState] = useState(''); // 'reading', 'parsing', ''
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef(null);

  // Dynamically load PDF.js from CDN to avoid Vite worker loader issues
  const loadPdfJS = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = (e) => reject(new Error('Failed to load PDF processing library from CDN.'));
      document.head.appendChild(script);
    });
  };

  const processPDF = async (file) => {
    setLoadingState('reading');
    setErrorMsg('');
    setSuccessMsg('');
    setFileName(file.name);

    try {
      if (file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const pdfjs = await loadPdfJS();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              // Maintain spacing in line elements
              let lastY = null;
              let pageText = '';
              for (const item of textContent.items) {
                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                  pageText += '\n';
                }
                pageText += item.str + ' ';
                lastY = item.transform[5];
              }
              fullText += pageText + '\n';
            }
            
            if (!fullText.trim()) {
              throw new Error("PDF file appears to be empty or contains scanned images (OCR not supported locally).");
            }
            
            setRawText(fullText);
            await parseExtractedText(fullText);
          } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'Error reading pages from PDF.');
            setLoadingState('');
          }
        };
        fileReader.readAsArrayBuffer(file);
      } else if (file.type === 'text/plain') {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
          const text = e.target.result;
          setRawText(text);
          await parseExtractedText(text);
        };
        fileReader.readAsText(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or plain text file.');
      }
    } catch (err) {
      setErrorMsg(err.message);
      setLoadingState('');
    }
  };

  const parseExtractedText = async (text) => {
    setLoadingState('parsing');
    try {
      let parsedData;
      if (apiKey) {
        // Parse using Gemini AI
        parsedData = await parseResumeWithAI(text, apiKey);
        setSuccessMsg('Successfully parsed with Gemini AI!');
      } else {
        // Fallback local regex parsing
        parsedData = parseResumeText(text);
        setSuccessMsg('Successfully parsed using local regex parser!');
      }
      onParseComplete(parsedData);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Parsing failed: ${err.message}. Initializing editable empty form.`);
      // Return empty structured template
      onParseComplete(parseResumeText(''));
    } finally {
      setLoadingState('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPDF(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processPDF(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="card glass-panel fade-in">
      <div className="card-header">
        <div className="header-icon">
          <Upload size={24} className="text-teal" />
        </div>
        <div>
          <h2>Upload & Parse Resume</h2>
          <p className="subtitle">Upload your CV to automatically extract fields, skills, and work history</p>
        </div>
      </div>

      <div className="card-content">
        <div 
          className={`drag-drop-zone ${dragActive ? 'active' : ''} ${loadingState ? 'disabled' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={loadingState ? null : onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            disabled={loadingState !== ''}
          />
          
          {loadingState === 'reading' && (
            <div className="loading-state">
              <Loader className="spinner text-teal" size={48} />
              <p className="mt-4 font-semibold text-lg">Extracting text from PDF...</p>
              <p className="text-sm opacity-70">Running client-side PDF.js worker</p>
            </div>
          )}

          {loadingState === 'parsing' && (
            <div className="loading-state">
              <Loader className="spinner text-indigo" size={48} />
              <p className="mt-4 font-semibold text-lg">Structuring CV sections...</p>
              <p className="text-sm opacity-70">
                {apiKey ? 'Analyzing semantics with Gemini 1.5 Flash API' : 'Running regex heuristic matches'}
              </p>
            </div>
          )}

          {!loadingState && (
            <div className="upload-prompt text-center">
              <div className="pulse-icon-container">
                <FileText size={48} className="text-indigo" />
              </div>
              <p className="mt-4 font-semibold text-lg">Drag & drop your resume file here</p>
              <p className="text-sm opacity-70 mb-4">Supports PDF or TXT formats</p>
              <button type="button" className="btn btn-secondary">
                Browse Files
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="alert alert-error mt-4">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success mt-4">
            <CheckCircle size={18} />
            <div>
              <p className="font-semibold">{successMsg}</p>
              <p className="text-xs opacity-85">Processed file: {fileName}</p>
            </div>
          </div>
        )}

        {rawText && (
          <div className="mt-6 border-t border-slate border-dashed pt-4">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="flex items-center text-teal hover:underline text-sm font-semibold gap-1 bg-transparent border-0 cursor-pointer"
            >
              <Eye size={16} />
              {showRawText ? 'Hide Raw Extracted Text' : 'View Raw Extracted Text'}
            </button>
            
            {showRawText && (
              <div className="raw-text-container mt-3">
                <pre>{rawText}</pre>
              </div>
            )}
            
            <div className="info-box-success mt-4">
              <p className="flex items-center gap-2">
                <ChevronRight size={16} className="text-indigo" />
                Next Step: Navigate to the <strong>Resume Builder</strong> tab to review and edit extracted fields, or <strong>ATS Matcher</strong> to score compatibility.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
