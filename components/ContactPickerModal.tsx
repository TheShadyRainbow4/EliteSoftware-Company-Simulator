import React, { useState } from 'react';
import { Coworker } from '../types';
import { PlusIcon } from './icons/PlusIcon';

interface ContactPickerModalProps {
    contacts: Coworker[];
    existingRecipients: string[];
    onClose: () => void;
    onSelect: (selectedEmails: string[]) => void;
}

export default function ContactPickerModal({ contacts, existingRecipients, onClose, onSelect }: ContactPickerModalProps) {
    const [selected, setSelected] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggleSelection = (email: string) => {
        setSelected(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const handleConfirm = () => {
        onSelect(selected);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-200/90 dark:bg-retro-gray-800/90 rounded-lg shadow-vista w-full max-w-md flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
                <header className="p-3 bg-vista-header-bg border-b border-black/20 rounded-t-lg">
                    <h2 className="font-bold text-lg text-slate-800" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}>Select Contacts</h2>
                </header>
                
                <div className="p-3 bg-white dark:bg-retro-gray-900/80">
                    <input
                        type="search"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-vista w-full"
                    />
                </div>

                <div className="flex-1 p-3 bg-white dark:bg-retro-gray-900/80 overflow-y-auto h-80">
                    <ul className="space-y-1">
                        {filteredContacts.map(contact => {
                            const isExisting = existingRecipients.includes(contact.email);
                            const isSelected = selected.includes(contact.email);
                            return (
                                <li key={contact.email}>
                                    <label className={`flex items-center gap-3 p-2 rounded-md transition-colors ${isExisting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700'} ${isSelected ? 'bg-vista-blue-light dark:bg-vista-blue-dark/50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isExisting}
                                            onChange={() => handleToggleSelection(contact.email)}
                                            className="vista-checkbox"
                                        />
                                        <div>
                                            <div className="font-semibold">{contact.name}</div>
                                            <div className="text-xs text-slate-600 dark:text-slate-400">{contact.email}</div>
                                        </div>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <footer className="p-3 bg-vista-header-bg border-t border-black/20 flex justify-end gap-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="btn-aqua-gray">Cancel</button>
                    <button type="button" onClick={handleConfirm} disabled={selected.length === 0} className="flex items-center gap-2 btn-aqua disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlusIcon className="w-5 h-5" />
                        Add ({selected.length})
                    </button>
                </footer>
            </div>
        </div>
    );
}