import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Edit2, Trash2, Loader2, Tag, Search } from 'lucide-react';
import { Paper } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface AdminViewProps {
  papers: Paper[];
  onAddPaper: (paper: Omit<Paper, 'id' | 'createdAt'>) => void;
  onDeletePaper: (id: string) => void;
  onEditPaper: (id: string, updates: Partial<Paper>) => void;
}

export default function AdminView({ papers, onAddPaper, onDeletePaper, onEditPaper }: AdminViewProps) {
  const [formData, setFormData] = useState({
    subject: '',
    year: '',
    type: 'Mid-Term',
    branch: '',
    semester: '1st',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [editTagInput, setEditTagInput] = useState('');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPapers = React.useMemo(() => {
    const searchWords = adminSearchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (searchWords.length === 0) return papers;

    return papers.filter(paper => {
      const paperContent = [
        paper.subject,
        paper.branch,
        paper.year,
        paper.semester,
        paper.type,
        ...(paper.tags || [])
      ].join(' ').toLowerCase();
      return searchWords.every(word => paperContent.includes(word));
    });
  }, [papers, adminSearchTerm]);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent, isEdit: boolean) => {
    if (e.type === 'keypress' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (e.type === 'keypress') e.preventDefault();

    const input = isEdit ? editTagInput : tagInput;
    const setInput = isEdit ? setEditTagInput : setTagInput;
    const currentPaper = isEdit ? editingPaper : formData;
    const setPaper = isEdit ? (val: any) => setEditingPaper(val) : (val: any) => setFormData(val);

    if (input.trim() && currentPaper) {
      const newTag = input.trim().toLowerCase();
      const currentTags = currentPaper.tags || [];
      if (!currentTags.includes(newTag)) {
        setPaper({ ...currentPaper, tags: [...currentTags, newTag] });
      }
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string, isEdit: boolean) => {
    const currentPaper = isEdit ? editingPaper : formData;
    const setPaper = isEdit ? (val: any) => setEditingPaper(val) : (val: any) => setFormData(val);

    if (currentPaper) {
      setPaper({
        ...currentPaper,
        tags: (currentPaper.tags || []).filter(t => t !== tagToRemove)
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.year || !selectedFile) {
      toast.error("Please fill all required fields and select a file.");
      return;
    }
    
    setIsUploading(true);
    try {
      let fileToSave = selectedFile;
      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        fileToSave = new File([selectedFile], selectedFile.name, { type: 'application/pdf' });
      }
      
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('papers')
        .upload(fileName, fileToSave);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('papers')
        .getPublicUrl(fileName);
      
      onAddPaper({ ...formData, url: publicUrl, fileName: selectedFile.name });
      
      setFormData({
        subject: '',
        year: '',
        type: 'Mid-Term',
        branch: '',
        semester: '1st',
        tags: [],
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Error uploading file: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-grow bg-brand-dark px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Upload Area */}
          <div 
            className="border border-dashed border-slate-600 rounded-2xl p-6 md:p-12 flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer bg-[#1e293b]/30 relative"
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center w-full max-w-sm mx-auto">
                <div className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-5 flex items-center gap-5 shadow-lg mb-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedFile.name.toLowerCase().endsWith('.pdf') 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="flex-grow text-left overflow-hidden">
                    <h3 className="text-base font-medium text-slate-200 truncate mb-1" title={selectedFile.name}>
                      {selectedFile.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-white transition-colors px-4 md:px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm w-full"
                >
                  <X className="w-4 h-4" /> Remove & Select Another
                </button>
              </div>
            ) : (
              <>
                <FileText className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-200 mb-2">Click or drag & drop file here</h3>
                <p className="text-sm text-slate-500">PDF, DOC, DOCX, PNG, JPG • Max 3MB</p>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">SUBJECT NAME *</label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">YEAR *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2024"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">EXAM TYPE *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3.5 px-4 text-white focus:outline-none focus:border-brand-yellow transition-colors appearance-none cursor-pointer"
              >
                <option value="Mid-Term">Mid-Term</option>
                <option value="Semester">Semester</option>
                <option value="Important">Important Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">BRANCH / DEPARTMENT</label>
              <input
                type="text"
                placeholder="e.g. CSE, ECE, MECH"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">SEMESTER</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3.5 px-4 text-white focus:outline-none focus:border-brand-yellow transition-colors appearance-none cursor-pointer"
              >
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
                <option value="3rd">3rd Semester</option>
                <option value="4th">4th Semester</option>
                <option value="5th">5th Semester</option>
                <option value="6th">6th Semester</option>
                <option value="7th">7th Semester</option>
                <option value="8th">8th Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">TAGS / KEYWORDS</label>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-grow">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Add tags (e.g. calculus, unit1)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => handleAddTag(e, false)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-yellow transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => handleAddTag(e, false)}
                  className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag, false)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-brand-yellow hover:bg-yellow-400 text-slate-900 font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg mt-4 disabled:opacity-70"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading to Supabase...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                Upload to Vault
              </>
            )}
          </button>
        </form>

        {/* Existing Papers List */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-serif font-bold text-white">Manage Papers</h2>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-grow sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-yellow" />
                <input
                  type="text"
                  placeholder="Search papers..."
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-yellow transition-colors"
                />
              </div>
              <div className="px-3 py-1 bg-[#1e293b] rounded-full text-sm text-slate-400 whitespace-nowrap">
                {filteredPapers.length} of {papers.length}
              </div>
            </div>
          </div>

          {filteredPapers.length > 0 ? (
            <div className="space-y-4">
              {filteredPapers.map((paper) => (
                <div key={paper.id} className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-500 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">{paper.subject}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="bg-slate-800 px-2 py-0.5 rounded">{paper.year}</span>
                        <span>•</span>
                        <span className={paper.type === 'Mid-Term' ? 'text-orange-400' : 'text-blue-400'}>{paper.type}</span>
                        <span>•</span>
                        <span>{paper.branch}</span>
                        <span>•</span>
                        <span>{paper.semester} Sem</span>
                      </div>
                      {paper.tags && paper.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {paper.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-500 text-[10px] rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button 
                      onClick={() => setEditingPaper({ ...paper })}
                      className="p-2 text-slate-400 hover:text-brand-yellow hover:bg-brand-yellow/10 rounded-lg transition-colors"
                      title="Edit Paper"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPaperToDelete(paper.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-[#1e293b]/30">
              <p className="text-slate-500">No papers uploaded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {paperToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Paper?</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this paper? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPaperToDelete(null)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeletePaper(paperToDelete);
                  setPaperToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Paper Modal */}
      {editingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Paper</h3>
              <button onClick={() => setEditingPaper(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onEditPaper(editingPaper.id, {
                  subject: editingPaper.subject,
                  year: editingPaper.year,
                  type: editingPaper.type,
                  branch: editingPaper.branch,
                  semester: editingPaper.semester,
                  tags: editingPaper.tags
                });
                setEditingPaper(null);
              }}
              className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">SUBJECT NAME</label>
                <input
                  type="text"
                  required
                  value={editingPaper.subject}
                  onChange={(e) => setEditingPaper({ ...editingPaper, subject: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">YEAR</label>
                <input
                  type="text"
                  required
                  value={editingPaper.year}
                  onChange={(e) => setEditingPaper({ ...editingPaper, year: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">EXAM TYPE</label>
                <select
                  value={editingPaper.type}
                  onChange={(e) => setEditingPaper({ ...editingPaper, type: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-yellow transition-colors appearance-none cursor-pointer"
                >
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Semester">Semester</option>
                  <option value="Important">Important Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">BRANCH / DEPARTMENT</label>
                <input
                  type="text"
                  value={editingPaper.branch}
                  onChange={(e) => setEditingPaper({ ...editingPaper, branch: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">SEMESTER</label>
                <select
                  value={editingPaper.semester}
                  onChange={(e) => setEditingPaper({ ...editingPaper, semester: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-yellow transition-colors appearance-none cursor-pointer"
                >
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="3rd">3rd Semester</option>
                  <option value="4th">4th Semester</option>
                  <option value="5th">5th Semester</option>
                  <option value="6th">6th Semester</option>
                  <option value="7th">7th Semester</option>
                  <option value="8th">8th Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">TAGS</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyPress={(e) => handleAddTag(e, true)}
                    className="flex-grow bg-[#0f172a] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-yellow"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddTag(e, true)}
                    className="px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editingPaper.tags || []).map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-[10px] rounded">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag, true)} className="hover:text-white">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setEditingPaper(null)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-yellow hover:bg-yellow-400 text-slate-900 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
