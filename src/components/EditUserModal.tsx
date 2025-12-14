import React, { useState } from 'react';
import { User, Coworker, Role } from '../types';
import { DEPARTMENTS } from '../constants';
import RelationshipEditor from './RelationshipEditor';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (username: string, data: Partial<Omit<User, 'id' | 'username'>>) => void;
  allContacts: (User | Coworker)[];
  roles: Role[];
}

export default function EditUserModal({ user, onClose, onSave, allContacts, roles }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    signature: user.signature,
    isAdmin: user.isAdmin || false,
    company: user.company,
    domain: user.domain,
    age: user.age,
    role: user.role,
    department: user.department,
    reportsTo: user.reportsTo || '',
    family: user.family || {},
    relationships: user.relationships || {},
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseInt(value, 10) || 0 : value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    let passwordPayload: string | null = null;

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        return;
      }
      passwordPayload = newPassword;
    }

    onSave(user.username, { ...formData, reportsTo: formData.reportsTo || undefined, password: passwordPayload });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-200/90 dark:bg-retro-gray-800/90 rounded-lg shadow-vista w-full max-w-2xl flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
        <header className="p-3 bg-vista-header-bg border-b border-black/20 rounded-t-lg">
          <h2 className="font-bold text-lg text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Edit User: {user.username}</h2>
        </header>
        <form onSubmit={handleSave} className="flex-1 flex flex-col">
            <div className="p-4 space-y-3 overflow-y-auto max-h-[70vh] bg-white dark:bg-retro-gray-900/80">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 input-vista"/>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 input-vista"/>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Company</label>
                        <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="mt-1 input-vista"/>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Domain</label>
                        <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} className="mt-1 input-vista"/>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="mt-1 input-vista"/>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Role</label>
                        <select name="role" value={formData.role} onChange={handleInputChange} className="mt-1 select-vista">
                            {roles.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                            {!roles.some(r => r.name === formData.role) && (
                                <option key="custom-role" value={formData.role}>{formData.role} (Legacy)</option>
                            )}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Department</label>
                        <select name="department" value={formData.department} onChange={handleInputChange} className="mt-1 select-vista">
                           {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                           {!DEPARTMENTS.includes(formData.department) && <option key="custom-dept" value={formData.department}>{formData.department} (Legacy)</option>}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Reports To (Manager)</label>
                        <select name="reportsTo" value={formData.reportsTo} onChange={handleInputChange} className="mt-1 select-vista">
                            <option value="">-- No Manager --</option>
                            {allContacts.filter(c => c.email !== user.email).map(c => (
                                <option key={c.email} value={c.email}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Signature</label>
                    <textarea name="signature" value={formData.signature} onChange={handleInputChange} rows={3} className="mt-1 input-vista resize-y"/>
                </div>
                 <div className="pt-3 border-t border-slate-300 dark:border-slate-700">
                    <RelationshipEditor
                        family={formData.family}
                        relationships={formData.relationships}
                        onFamilyChange={(newFamily) => setFormData(prev => ({...prev, family: newFamily}))}
                        onRelationshipsChange={(newRelationships) => setFormData(prev => ({...prev, relationships: newRelationships}))}
                        allContacts={allContacts}
                        currentContactEmail={user.email}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isAdminEdit" name="isAdmin" checked={formData.isAdmin} onChange={handleCheckboxChange} className="vista-checkbox" />
                    <label htmlFor="isAdminEdit">Administrator Priveleges</label>
                </div>
                <div className="pt-3 border-t border-slate-300 dark:border-slate-700 space-y-2">
                    <h4 className="font-semibold">Reset Password (optional)</h4>
                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                     <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-vista" />
                     <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-vista" />
                </div>
            </div>
            <footer className="p-3 bg-vista-header-bg border-t border-black/20 flex justify-end gap-3 rounded-b-lg flex-shrink-0">
                <button type="button" onClick={onClose} className="btn-aqua-gray">Cancel</button>
                <button type="submit" className="btn-aqua">
                    Save Changes
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
}