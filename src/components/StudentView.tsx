import React, { useState } from 'react';
import { Search, FileText, Download, BookOpen, Eye, X } from 'lucide-react';
import { Paper } from '../types';

interface StudentViewProps {
  papers: Paper[];
}

export default function StudentView({ papers }: StudentViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);

  // Get unique years and subjects from papers for the filters
  const availableYears = ['All Years', ...new Set(papers.map(p => p.year))].sort((a, b) => b.localeCompare(a));
  const availableSubjects = ['All Subjects', ...new Set(papers.map(p => p.subject))].sort();

  const filteredPapers = React.useMemo(() => {
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
    
    return papers.filter(paper => {
      const matchesType = selectedType === 'All' || paper.type === selectedType;
      const matchesYear = selectedYear === 'All Years' || paper.year === selectedYear;
      const matchesSubject = selectedSubject === 'All Subjects' || paper.subject === selectedSubject;
      
      if (searchWords.length === 0) return matchesType && matchesYear && matchesSubject;

      const paperContent = [
        paper.subject,
        paper.branch,
        paper.year,
        paper.semester,
        paper.type,
      ].join(' ').toLowerCase();

      const matchesSearch = searchWords.every(word => paperContent.includes(word));
      
      return matchesSearch && matchesType && matchesYear && matchesSubject;
    });
  }, [papers, searchTerm, selectedType, selectedYear, selectedSubject]);

  const handleDownload = (e: React.MouseEvent, url: string, fileName?: string) => {
    if (url === '#') {
      e.preventDefault();
      return;
    }
    
    // For Supabase storage URLs, we can append ?download= to force download
    // This is more reliable than just target="_blank"
    if (url.includes('supabase.co/storage')) {
      e.preventDefault();
      const downloadUrl = url.includes('?') 
        ? `${url}&download=${fileName || ''}` 
        : `${url}?download=${fileName || ''}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName || 'paper.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      {/* Hero Section */}
      <div className="bg-brand-dark px-4 md:px-8 py-10 md:py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-yellow/30 text-brand-yellow text-xs font-bold tracking-wider mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            PREVIOUS YEAR PAPERS
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight">
            Get ready for exams <br />
            with <span className="text-brand-yellow">past papers.</span>
          </h1>

          <p className="text-slate-400 text-lg mb-10 max-w-2xl">
            Browse, filter and download Mid-Term & Semester exam papers — powered by local data
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
              <input
                type="text"
                placeholder="Search subject, branch, year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e293b]/80 backdrop-blur-sm border border-slate-700 rounded-lg py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#1e293b]/80 backdrop-blur-sm border border-slate-700 rounded-lg py-3.5 px-4 text-white focus:outline-none focus:border-brand-yellow transition-colors appearance-none min-w-[160px] cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 tracking-wider">TYPE:</span>
            <div className="flex flex-wrap gap-2">
              {['All', 'Mid-Term', 'Semester'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedType === type
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'Mid-Term' && <FileText className={`w-3.5 h-3.5 ${selectedType === type ? 'text-orange-400' : 'text-orange-500'}`} />}
                  {type === 'Semester' && <FileText className={`w-3.5 h-3.5 ${selectedType === type ? 'text-blue-400' : 'text-blue-500'}`} />}
                  {type}
                </button>
              ))}
            </div>
          </div>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white border border-slate-300 rounded-md py-2 px-4 text-sm text-slate-700 focus:outline-none focus:border-brand-yellow cursor-pointer"
          >
            {availableSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow bg-brand-cream px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900">Available Papers</h2>
            <div className="w-12 h-px bg-slate-300"></div>
          </div>

          {filteredPapers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPapers.map(paper => (
                <div key={paper.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-brand-yellow/50 transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      paper.type === 'Mid-Term' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {paper.type}
                    </div>
                    <span className="text-slate-400 text-sm font-medium bg-slate-50 px-2 py-1 rounded">{paper.year}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{paper.subject}</h3>
                  <p className="text-slate-500 text-sm mb-6">{paper.branch} • {paper.semester} Semester</p>
                  
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => setPreviewPaper(paper)}
                      className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, paper.url, paper.fileName)}
                      className="flex-1 py-2.5 rounded-lg bg-brand-yellow text-slate-900 font-medium text-sm flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No papers found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setSelectedYear('All Years');
                  setSelectedSubject('All Subjects');
                }}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 md:p-8">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-full max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200 bg-slate-50 gap-4">
              <div className="w-full sm:w-auto pr-8 sm:pr-0">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{previewPaper.subject}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-sm text-slate-500">{previewPaper.year} • {previewPaper.type} • {previewPaper.branch}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={(e) => handleDownload(e, previewPaper.url, previewPaper.fileName)}
                  className="flex-1 sm:flex-none justify-center px-4 py-2 bg-brand-yellow text-slate-900 rounded-lg text-sm font-medium hover:bg-yellow-400 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors absolute top-3 right-3 sm:static"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex-grow bg-slate-100 p-2 md:p-4 overflow-hidden">
              {previewPaper.url === '#' ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-white rounded-lg border border-slate-300">
                  <FileText className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="text-lg font-medium text-slate-700 mb-2">Placeholder Paper</p>
                  <p>Upload a real PDF in the Admin view to see the preview here.</p>
                </div>
              ) : previewPaper.fileName && !previewPaper.fileName.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-white rounded-lg border border-slate-300 p-6 text-center">
                  <FileText className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="text-lg font-medium text-slate-700 mb-2">Preview Not Available</p>
                  <p className="mb-6">Preview is only available for PDF files. Please download the file to view it.</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button 
                      onClick={(e) => handleDownload(e, previewPaper.url, previewPaper.fileName)}
                      className="px-6 py-2.5 bg-brand-yellow text-slate-900 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </button>
                    <a 
                      href={previewPaper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Open in New Tab
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative group">
                  <iframe
                    src={`${previewPaper.url}#toolbar=0`}
                    title="PDF Preview"
                    className="w-full h-full rounded-lg border border-slate-300 shadow-sm bg-white"
                  />
                  {/* Fallback overlay for mobile or browsers that block inline PDFs */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none sm:hidden">
                    <p className="text-slate-600 font-medium mb-2">Having trouble viewing?</p>
                    <a 
                      href={previewPaper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto px-4 py-2 bg-brand-yellow text-slate-900 rounded-lg text-sm font-medium hover:bg-yellow-400 transition-colors"
                    >
                      Open in New Tab
                    </a>
                  </div>
                  {/* Desktop "Open in New Tab" floating button */}
                  <div className="absolute bottom-4 right-4 hidden sm:block">
                    <a 
                      href={previewPaper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-lg hover:bg-white transition-all flex items-center gap-2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Open Full View
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
