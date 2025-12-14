import React, { useState } from 'react';
import { Project, User, Coworker } from '../types';

interface ProjectEditModalProps {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => void;
  allContacts: (User | Coworker)[];
}

export default function ProjectEditModal({ project, onClose, onSave, allContacts }: ProjectEditModalProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    brief: project.brief,
    status: project.status,
    deadline: project.deadline ? project.deadline.substring(0, 16) : '',
    completionRecipientEmail: project.completionRecipientEmail || '',
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>(project.memberEmails);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (email: string) => {
    setSelectedMembers(prev =>
        prev.includes(email) ? prev.filter(m => m !== email) : [...prev, email]
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length < 1) {
        alert("A project must have at least one member.");
        return;
    }
    onSave({
      ...project,
      ...formData,
      memberEmails: selectedMembers,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      completionRecipientEmail: formData.completionRecipientEmail || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-200/90 dark:bg-retro-gray-800/90 rounded-lg shadow-vista w-full max-w-2xl flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
        <header className="p-3 bg-vista-header-bg border-b border-black/20 rounded-t-lg">
          <h2 className="font-bold text-lg text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Edit Project: {project.name}</h2>
        </header>
        <form onSubmit={handleSave} className="flex-1 flex flex-col">
            <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh] bg-white dark:bg-retro-gray-900/80">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Project Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 input-vista"/>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="mt-1 select-vista">
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Deadline (Optional)</label>
                        <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleInputChange} className="mt-1 input-vista"/>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Recipient for Final Work</label>
                        <select name="completionRecipientEmail" value={formData.completionRecipientEmail} onChange={handleInputChange} className="mt-1 select-vista">
                            <option value="">-- Select Recipient --</option>
                            {allContacts.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Project Brief</label>
                    <textarea name="brief" value={formData.brief} onChange={handleInputChange} rows={4} className="mt-1 input-vista resize-y"/>
                </div>
                 <div>
                    <h5 className="font-bold mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400">Project Members</h5>
                    <div className="max-h-48 overflow-y-auto p-2 border rounded-md bg-white dark:bg-slate-700/50 space-y-1">
                        {allContacts.map(contact => (
                            <label key={contact.email} className="flex items-center gap-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800">
                                <input type="checkbox" checked={selectedMembers.includes(contact.email)} onChange={() => handleMemberToggle(contact.email)} className="vista-checkbox"/>
                                <span>{contact.name} <span className="text-xs text-slate-500">({contact.email})</span></span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <footer className="p-3 bg-vista-header-bg border-t border-black/20 flex justify-end gap-3 rounded-b-lg flex-shrink-0">
                <button type="button" onClick={onClose} className="btn-aqua-gray">Cancel</button>
                <button type="submit" className="btn-aqua">
                    Save Changes & Notify
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
}