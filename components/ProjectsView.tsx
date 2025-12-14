import React, { useState } from 'react';
import { Project, User, Coworker } from '../types';
import ProjectEditModal from './ProjectEditModal';
import { PencilIcon } from './icons/PencilIcon';
import { EyeIcon } from './icons/EyeIcon';
import { ProjectIcon } from './icons/ProjectIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface ProjectsViewProps {
  currentUser: User;
  projects: Project[];
  allContacts: (User | Coworker)[];
  onCreateProject: (project: Omit<Project, 'id' | 'status' | 'threadId'>) => Promise<void>;
  onUpdateProject: (project: Project) => void;
  onNavigateToThread: (threadId?: string) => void;
  onGenerateRandomProject: () => void;
  addNotification: (message: string) => void;
}

const NewProjectForm = ({ allContacts, onCreateProject, onCancel }) => {
    const [newProject, setNewProject] = useState({ name: '', brief: '', deadline: '', completionRecipientEmail: '' });
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const handleMemberToggle = (email: string) => {
        setSelectedMembers(prev =>
            prev.includes(email) ? prev.filter(m => m !== email) : [...prev, email]
        );
    }

    const handleCreateProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.name || !newProject.brief || selectedMembers.length < 2) {
            alert("Please provide a project name, brief, and select at least two members.");
            return;
        }
        await onCreateProject({
            name: newProject.name,
            brief: newProject.brief,
            memberEmails: selectedMembers,
            deadline: newProject.deadline || undefined,
            completionRecipientEmail: newProject.completionRecipientEmail || undefined,
        });
        onCancel();
    }

    return (
        <form onSubmit={handleCreateProjectSubmit} className="p-4 bg-slate-100 dark:bg-retro-gray-800/50 rounded-md border border-slate-300 dark:border-slate-700 space-y-4">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Project</h4>
            <input type="text" placeholder="Project Name*" value={newProject.name} onChange={e => setNewProject(p => ({...p, name: e.target.value}))} required className="input-vista" />
            <textarea placeholder="Project Brief*" value={newProject.brief} onChange={e => setNewProject(p => ({...p, brief: e.target.value}))} required rows={4} className="input-vista resize-y" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Deadline (Optional)</label>
                    <input type="datetime-local" value={newProject.deadline} onChange={e => setNewProject(p => ({...p, deadline: e.target.value}))} className="mt-1 input-vista"/>
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Recipient for Final Work</label>
                    <select value={newProject.completionRecipientEmail} onChange={e => setNewProject(p => ({...p, completionRecipientEmail: e.target.value}))} className="mt-1 select-vista">
                        <option value="">-- Select Recipient --</option>
                        {allContacts.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <h5 className="font-bold mb-2 text-slate-800 dark:text-slate-100">Assign Members</h5>
                <div className="max-h-48 overflow-y-auto p-2 border rounded-md bg-white dark:bg-slate-700/50 space-y-1">
                    {allContacts.map(contact => (
                        <label key={contact.email} className="flex items-center gap-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800">
                            <input type="checkbox" checked={selectedMembers.includes(contact.email)} onChange={() => handleMemberToggle(contact.email)} className="vista-checkbox"/>
                            <span className="text-slate-800 dark:text-slate-200">{contact.name} <span className="text-xs text-slate-500">({contact.email})</span></span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
                <button type="submit" className="flex items-center gap-2 btn-aqua">
                    <ProjectIcon className="w-5 h-5" /> Create & Kick Off Project
                </button>
                <button type="button" onClick={onCancel} className="btn-aqua-gray">Cancel</button>
            </div>
        </form>
    )
};


export default function ProjectsView({ currentUser, projects, allContacts, onCreateProject, onUpdateProject, onNavigateToThread, onGenerateRandomProject, addNotification }: ProjectsViewProps) {
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const userIsAdmin = currentUser.isAdmin || false;

    const projectsForUser = userIsAdmin
        ? projects
        : projects.filter(p => p.memberEmails.includes(currentUser.email));

    const statusColor = {
        'Active': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'On Hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-retro-gray-900 shadow-inner-dark rounded-md border border-black/30 overflow-hidden">
            {editingProject && (
                <ProjectEditModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSave={onUpdateProject}
                    allContacts={allContacts}
                />
            )}
            <header className="p-4 bg-vista-header-bg border-b border-black/20 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Company Projects</h2>
                <p className="text-sm text-slate-700" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>
                    {userIsAdmin ? 'Manage all company projects.' : 'A list of projects you are a member of.'}
                </p>
            </header>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {projectsForUser.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                        {userIsAdmin ? "No projects have been created yet." : "You are not currently assigned to any projects."}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {projectsForUser.map(p => (
                            <div key={p.id} className="p-3 bg-white dark:bg-retro-gray-800/50 rounded-md border border-slate-300 dark:border-slate-700 flex justify-between items-center">
                               <div>
                                    <h4 className="font-bold text-vista-blue-dark dark:text-vista-blue-mid">{p.name}</h4>
                                   <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">Members: {p.memberEmails.length}</p>
                                   <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-2 ${statusColor[p.status]}`}>{p.status}</span>
                               </div>
                               <div className="flex gap-2">
                                   <button onClick={() => onNavigateToThread(p.threadId)} className="flex items-center gap-1.5 btn-aqua-gray text-sm" disabled={!p.threadId}>
                                       <EyeIcon className="w-4 h-4"/> View Thread
                                   </button>
                                   {userIsAdmin && (
                                       <button onClick={() => setEditingProject(p)} className="flex items-center gap-1.5 btn-aqua-gray text-sm">
                                           <PencilIcon className="w-4 h-4"/> Details
                                       </button>
                                   )}
                               </div>
                            </div>
                        ))}
                    </div>
                )}

                {userIsAdmin && (
                    <div className="mt-6">
                        {isCreating ? (
                            <NewProjectForm allContacts={allContacts} onCreateProject={onCreateProject} onCancel={() => setIsCreating(false)} />
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 btn-aqua">
                                    <ProjectIcon className="w-5 h-5"/> New Project
                                </button>
                                <button onClick={onGenerateRandomProject} className="flex items-center gap-2 btn-aqua">
                                    <MagicWandIcon className="w-5 h-5"/> Generate Random Project
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
