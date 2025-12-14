import React, { useState, useRef } from 'react';
import { Coworker, User, Project, CompanyProfile, Role } from '../types';
import { DEPARTMENTS } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import EditUserModal from './EditUserModal';
import EditCoworkerModal from './EditCoworkerModal';
import { ReplyIcon } from './icons/ReplyIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';

const HIGH_ENGAGEMENT_PHRASE = 'synergy-maximus';

interface AdminViewProps {
  currentUser: User;
  users: (Omit<User, 'password'> & { password?: string })[];
  onDeleteUser: (username: string) => void;
  onCreateUser: (newUser: Omit<User, 'id'> & { password: string }) => boolean;
  onUpdateUser: (username: string, data: Partial<Omit<User, 'id' | 'username'>>) => void;
  globalCoworkers: Coworker[];
  onCreateCoworker: (coworker: Coworker) => void;
  onUpdateCoworker: (coworker: Coworker) => void;
  onDeleteCoworker: (id: string) => void;
  onSendBroadcast: (email: {subject: string, body: string}) => void;
  companyProfile: CompanyProfile;
  onUpdateCompanyProfile: (profile: CompanyProfile) => void;
  roles: Role[];
  onUpdateRoles: (roles: Role[]) => void;
  onTotalReset: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportData: () => void;
  onGenerateRandomCoworker: () => void;
  addNotification: (message: string) => void;
  areSoundsMuted: boolean;
  onToggleSoundsMuted: () => void;
}

const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`admin-tab-btn ${isActive ? 'active' : ''}`}
    >
        {label}
    </button>
)

const UserManagement = ({ currentUser, users, onDeleteUser, onCreateUser, onUpdateUser, setEditingUser, roles, allContacts }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', username: '', email: '', password: '', company: '', role: 'Associate', department: 'General', isAdmin: false });

    const handleCreateUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullNewUser: Omit<User, 'id'> & { password: string } = {
          ...newUser,
          age: 25, // default age
          domain: newUser.email.split('@')[1] || 'example.com',
          signature: `Best,\n${newUser.name}`
        };

        if (onCreateUser(fullNewUser)) {
            setNewUser({ name: '', username: '', email: '', password: '', company: '', role: 'Associate', department: 'General', isAdmin: false });
            setIsCreating(false);
        }
    }

    const confirmDelete = (type: 'user' | 'coworker', id: string, name: string) => {
      if (confirm(`Are you sure you want to permanently delete ${type} "${name}"? This action cannot be undone.`)) {
        if (type === 'user') {
          onDeleteUser(id);
        }
      }
    };

    return (
        <section>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="flex justify-between items-center p-2 bg-white dark:bg-retro-gray-800/50 rounded-md border border-slate-300 dark:border-slate-700">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{user.name} ({user.username}) {user.isAdmin && <span className="text-xs font-bold text-yellow-500">(Admin)</span>} {user.username === currentUser.username && <span className="text-xs font-bold text-green-500">(You)</span>}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{user.email} | {user.role} - {user.department}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditingUser(user as User)}
                        className="p-1.5 btn-aqua-gray"
                        aria-label={`Edit user ${user.username}`}
                    >
                        <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={() => confirmDelete('user', user.username, user.name)}
                      disabled={user.username === currentUser.username}
                      className="p-1.5 btn-aqua-red disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Delete user ${user.username}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            {isCreating ? (
                 <form onSubmit={handleCreateUserSubmit} className="p-4 bg-slate-100 dark:bg-retro-gray-800/50 rounded-md border border-slate-300 dark:border-slate-700 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">Create New User</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Name*" value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} required className="input-vista" />
                        <input type="email" placeholder="Email*" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} required className="input-vista" />
                        <input type="text" placeholder="Username*" value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))} required className="input-vista" />
                        <input type="password" placeholder="Password*" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} required className="input-vista" />
                        <input type="text" placeholder="Company*" value={newUser.company} onChange={e => setNewUser(p => ({...p, company: e.target.value}))} required className="input-vista" />
                         <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value}))} required className="select-vista">
                           {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                         </select>
                         <select value={newUser.department} onChange={e => setNewUser(p => ({...p, department: e.target.value}))} required className="select-vista">
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isAdmin" checked={newUser.isAdmin} onChange={e => setNewUser(p => ({...p, isAdmin: e.target.checked}))} className="vista-checkbox" />
                        <label htmlFor="isAdmin" className="text-slate-800 dark:text-slate-200">Make this user an administrator</label>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="flex items-center gap-2 btn-aqua">
                            <PlusIcon className="w-5 h-5" /> Create User
                        </button>
                        <button type="button" onClick={() => setIsCreating(false)} className="btn-aqua-gray">Cancel</button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 btn-aqua">
                    <PlusIcon className="w-5 h-5"/> Add New User
                </button>
            )}
          </div>
        </section>
    )
  }

const CoworkerManagement = ({ globalCoworkers, setEditingCoworker, onDeleteCoworker, onGenerateRandomCoworker }) => {

    const confirmDelete = (type: 'user' | 'coworker', id: string, name: string) => {
        if (confirm(`Are you sure you want to permanently delete ${type} "${name}"? This action cannot be undone.`)) {
            if (type === 'coworker') {
              onDeleteCoworker(id);
            }
        }
    };

    return (
        <section>
            <div className="space-y-2">
            {globalCoworkers.map(coworker => (
              <div key={coworker.id} className="flex justify-between items-center p-2 bg-white dark:bg-retro-gray-800/50 rounded-md border border-slate-300 dark:border-slate-700">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{coworker.name} <span className="text-xs font-normal text-sky-600 dark:text-sky-400">(AI)</span> {coworker.isAdmin && <span className="text-xs font-bold text-yellow-500">(Admin)</span>}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{coworker.email} | {coworker.role} - {coworker.department}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditingCoworker(coworker)}
                        className="p-1.5 btn-aqua-gray"
                        aria-label={`Edit coworker ${coworker.name}`}
                    >
                        <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={() => confirmDelete('coworker', coworker.id, coworker.name)}
                      className="p-1.5 btn-aqua-red"
                      aria-label={`Delete coworker ${coworker.name}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
           <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => setEditingCoworker({} as Coworker)} className="flex items-center gap-2 btn-aqua">
                    <PlusIcon className="w-5 h-5"/> Add New AI Coworker
                </button>
                <button onClick={onGenerateRandomCoworker} className="flex items-center gap-2 btn-aqua">
                    <MagicWandIcon className="w-5 h-5"/> Generate Random AI
                </button>
           </div>
        </section>
    )
}

const SettingsManagement = ({ companyProfile, onUpdateCompanyProfile, onTotalReset, onImportData, onExportData, areSoundsMuted, onToggleSoundsMuted }) => {
    const [newRule, setNewRule] = useState('');
    const importFileRef = useRef<HTMLInputElement>(null);

    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRule.trim()) {
            onUpdateCompanyProfile({
                ...companyProfile,
                rules: [...companyProfile.rules, newRule.trim()]
            });
            setNewRule('');
        }
    }

    const handleDeleteRule = (index: number) => {
        onUpdateCompanyProfile({
            ...companyProfile,
            rules: companyProfile.rules.filter((_, i) => i !== index)
        });
    }

    const handleTaglineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateCompanyProfile({
            ...companyProfile,
            tagline: e.target.value
        });
    }

    return (
        <section className="space-y-6">
            <div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100 bg-slate-200 dark:bg-retro-gray-800 p-2 rounded-md border border-slate-300 dark:border-slate-700">Secret Phrase</h3>
                <p className="text-xs my-2 text-slate-700 dark:text-slate-300">Start any message, post, or comment with the following phrase to trigger a longer, more detailed AI response for that conversation.</p>
                <div className="p-2 bg-slate-200 dark:bg-retro-gray-800 rounded-md border border-slate-300 dark:border-slate-700">
                    <code className="font-mono font-bold text-vista-blue-dark dark:text-vista-blue-mid">{HIGH_ENGAGEMENT_PHRASE}</code>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100 bg-slate-200 dark:bg-retro-gray-800 p-2 rounded-md border border-slate-300 dark:border-slate-700">Sound Settings</h3>
                <label className="flex items-center gap-2 cursor-pointer p-2">
                    <input type="checkbox" checked={areSoundsMuted} onChange={onToggleSoundsMuted} className="vista-checkbox" />
                    <span>Mute All Notifications</span>
                </label>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100 bg-slate-200 dark:bg-retro-gray-800 p-2 rounded-md border border-slate-300 dark:border-slate-700">Company Tagline</h3>
                <p className="text-xs my-2 text-slate-700 dark:text-slate-300">This tagline will be known by all AI coworkers.</p>
                <input
                    type="text"
                    value={companyProfile.tagline}
                    onChange={handleTaglineChange}
                    className="input-vista"
                    placeholder="e.g., Synergizing Tomorrow, Today."
                />
            </div>

            <div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100 bg-slate-200 dark:bg-retro-gray-800 p-2 rounded-md border border-slate-300 dark:border-slate-700">Company Rules</h3>
                <p className="text-xs my-2 text-slate-700 dark:text-slate-300">A list of official (or unofficial) rules that AI coworkers will adhere to and may comment on.</p>

                <ul className="space-y-2 mb-4">
                    {companyProfile.rules.map((rule, index) => (
                        <li key={index} className="flex justify-between items-center p-2 bg-slate-200 dark:bg-retro-gray-800 rounded-md border border-slate-300 dark:border-slate-700">
                            <span className="text-sm text-retro-gray-900 dark:text-slate-100">{rule}</span>
                            <button onClick={() => handleDeleteRule(index)} className="p-1 btn-aqua-red" aria-label="Delete rule">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>

                <form onSubmit={handleAddRule} className="flex gap-2">
                    <input
                        type="text"
                        value={newRule}
                        onChange={e => setNewRule(e.target.value)}
                        className="input-vista flex-grow"
                        placeholder="Add a new rule..."
                    />
                    <button type="submit" className="btn-aqua flex items-center gap-1.5">
                        <PlusIcon className="w-4 h-4" /> Add
                    </button>
                </form>
            </div>

             <div className="mt-8 pt-6 border-t border-slate-400/30">
                 <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100 bg-slate-200 dark:bg-retro-gray-800 p-2 rounded-md border border-slate-300 dark:border-slate-700">Data Management</h3>
                 <p className="text-xs my-2 text-slate-700 dark:text-slate-300">Save your company's state to a file or load it in another browser.</p>
                 <div className="p-4 mt-2 bg-slate-100 dark:bg-retro-gray-800/50 border border-slate-300 dark:border-slate-700 rounded-md flex flex-wrap gap-4 items-center">
                    <button onClick={onExportData} className="btn-aqua">Export All Data</button>
                    <button onClick={() => importFileRef.current?.click()} className="btn-aqua-gray">Import Data</button>
                    <input type="file" accept=".json" ref={importFileRef} onChange={onImportData} className="hidden" />
                 </div>
            </div>

             <div className="mt-8 pt-6 border-t border-red-500/30">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
                <div className="p-4 mt-2 bg-red-100/50 dark:bg-red-900/20 border border-red-500/50 rounded-md">
                    <h4 className="font-bold text-red-800 dark:text-red-200">Total Company Reset</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        This will permanently delete all users, AI coworkers, projects, and email history.
                        This action is irreversible and will restore the application to its factory default state.
                    </p>
                    <div className="mt-4">
                        <button
                            onClick={onTotalReset}
                            className="btn-aqua-red"
                        >
                            Reset All Company Data
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

const Broadcast = ({ onSendBroadcast }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) {
            alert('Please provide a subject and body for the broadcast.');
            return;
        }
        onSendBroadcast({subject, body});
        setSubject('');
        setBody('');
    }

    return (
        <section>
            <p className="text-xs mb-2 text-slate-700 dark:text-slate-300">Send an email message to all users, including administrators. It will appear as a new thread in their inboxes.</p>
            <form onSubmit={handleSend} className="bg-white dark:bg-retro-gray-800/50 rounded-md border border-slate-300 dark:border-slate-700 flex flex-col">
                 <div className="p-3 space-y-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center border-b border-slate-200 dark:border-slate-700 pb-1">
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mr-2">To:</label>
                        <input type="text" readOnly value="All Users" className="w-full p-1 bg-transparent focus:outline-none text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex items-center">
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mr-2">Subject:</label>
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="[Company Broadcast] Subject" className="input-vista bg-transparent font-bold !p-0 !border-none !shadow-none" />
                    </div>
                </div>
                <div className="flex-1 p-3">
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full h-48 bg-transparent focus:outline-none resize-y text-retro-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Compose your broadcast message... e.g. Does anyone have a stapler I can borrow? [TASK: write a song about staplers]"
                    />
                </div>
                <footer className="p-3 border-t border-slate-300 dark:border-slate-700 flex justify-end gap-3 rounded-b-lg bg-slate-100 dark:bg-retro-gray-900/50">
                    <button type="submit" className="flex items-center gap-2 btn-aqua">
                        <ReplyIcon className="w-5 h-5 -rotate-90" />
                        Send Broadcast
                    </button>
                </footer>
            </form>
        </section>
    )
}

const RoleManagement = ({ roles, onUpdateRoles }) => {
    const [newRoleName, setNewRoleName] = useState('');
    const [editingRole, setEditingRole] = useState<{id: string, name: string} | null>(null);

    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoleName.trim() && !roles.some(r => r.name.toLowerCase() === newRoleName.trim().toLowerCase())) {
            onUpdateRoles([...roles, { id: `role-${Date.now()}`, name: newRoleName.trim() }]);
            setNewRoleName('');
        }
    };

    const handleDeleteRole = (id: string) => {
        if (confirm("Are you sure you want to delete this role? This will not affect existing users with this role, but you won't be able to assign it anymore.")) {
            onUpdateRoles(roles.filter(r => r.id !== id));
        }
    };

    const handleUpdateRole = () => {
        if (editingRole && editingRole.name.trim()) {
            onUpdateRoles(roles.map(r => r.id === editingRole.id ? { ...r, name: editingRole.name.trim() } : r));
            setEditingRole(null);
        }
    };

    return (
        <section>
            <p className="text-xs mb-4 text-slate-700 dark:text-slate-300">Manage the job titles available across the company. These roles will appear in dropdowns when editing users and AI staff.</p>
            <ul className="space-y-2 mb-4">
                {roles.map(role => (
                    <li key={role.id} className="flex justify-between items-center p-2 bg-slate-200 dark:bg-retro-gray-800 rounded-md border border-slate-300 dark:border-slate-700">
                        {editingRole?.id === role.id ? (
                            <input
                                type="text"
                                value={editingRole.name}
                                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                                className="input-vista flex-grow mr-2"
                                autoFocus
                            />
                        ) : (
                            <span className="text-sm text-retro-gray-900 dark:text-slate-100">{role.name}</span>
                        )}
                        <div className="flex gap-2">
                            {editingRole?.id === role.id ? (
                                <>
                                    <button onClick={handleUpdateRole} className="btn-aqua text-sm">Save</button>
                                    <button onClick={() => setEditingRole(null)} className="btn-aqua-gray text-sm">Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setEditingRole({ ...role })} className="p-1.5 btn-aqua-gray" aria-label="Edit role">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 btn-aqua-red" aria-label="Delete role">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleAddRole} className="flex gap-2">
                <input
                    type="text"
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    className="input-vista flex-grow"
                    placeholder="Add a new role name..."
                />
                <button type="submit" className="btn-aqua flex items-center gap-1.5">
                    <PlusIcon className="w-4 h-4" /> Add Role
                </button>
            </form>
        </section>
    );
};


export default function AdminView({
    currentUser,
    users,
    onDeleteUser,
    onCreateUser,
    onUpdateUser,
    globalCoworkers,
    onCreateCoworker,
    onUpdateCoworker,
    onDeleteCoworker,
    onSendBroadcast,
    companyProfile,
    onUpdateCompanyProfile,
    roles,
    onUpdateRoles,
    onTotalReset,
    onImportData,
    onExportData,
    onGenerateRandomCoworker,
    addNotification,
    areSoundsMuted,
    onToggleSoundsMuted
}: AdminViewProps) {

  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCoworker, setEditingCoworker] = useState<Coworker | null>(null);

  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'ai-staff', label: 'AI Staff' },
    { id: 'roles', label: 'Roles' },
    { id: 'broadcast', label: 'Broadcast' },
    { id: 'settings', label: 'Company Settings' },
  ];

  const renderContent = () => {
    switch(activeTab) {
        case 'users':
            return <UserManagement
                        currentUser={currentUser}
                        users={users}
                        onDeleteUser={onDeleteUser}
                        onCreateUser={onCreateUser}
                        onUpdateUser={onUpdateUser}
                        setEditingUser={setEditingUser}
                        roles={roles}
                        allContacts={[...users, ...globalCoworkers]}
                    />;
        case 'ai-staff':
            return <CoworkerManagement
                        globalCoworkers={globalCoworkers}
                        onDeleteCoworker={onDeleteCoworker}
                        setEditingCoworker={setEditingCoworker}
                        onGenerateRandomCoworker={onGenerateRandomCoworker}
                    />;
        case 'roles':
            return <RoleManagement roles={roles} onUpdateRoles={onUpdateRoles} />;
        case 'broadcast':
            return <Broadcast onSendBroadcast={onSendBroadcast} />;
        case 'settings':
            return <SettingsManagement
                        companyProfile={companyProfile}
                        onUpdateCompanyProfile={onUpdateCompanyProfile}
                        onTotalReset={onTotalReset}
                        onImportData={onImportData}
                        onExportData={onExportData}
                        areSoundsMuted={areSoundsMuted}
                        onToggleSoundsMuted={onToggleSoundsMuted}
                    />;
        default:
            return null;
    }
  }

  return (
    <div className="flex flex-col h-full bg-transparent shadow-inner-dark rounded-md overflow-y-auto border border-black/30">
        {editingUser && (
            <EditUserModal
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={onUpdateUser}
                allContacts={[...users, ...globalCoworkers]}
                roles={roles}
            />
        )}
        {editingCoworker && (
            <EditCoworkerModal
                coworker={editingCoworker}
                onClose={() => setEditingCoworker(null)}
                onSave={editingCoworker.id ? onUpdateCoworker : onCreateCoworker}
                allContacts={[...users, ...globalCoworkers]}
                roles={roles}
            />
        )}
        <header className="p-4 bg-vista-header-bg border-b border-black/20 flex-shrink-0">
             <h2 className="text-xl font-bold text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Admin Console</h2>
        </header>

        <div className="px-2 pt-2 bg-gradient-to-b from-slate-200 to-slate-300 border-b border-black/20 flex gap-1 flex-wrap">
            {tabs.map(tab => (
                 <TabButton key={tab.id} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
            ))}
        </div>

        <div className="p-4 flex-grow bg-white dark:bg-retro-gray-900">
            {renderContent()}
        </div>
    </div>
  );
}