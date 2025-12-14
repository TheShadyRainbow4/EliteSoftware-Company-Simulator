import React, { useState } from 'react';
import { User, Coworker } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface RelationshipEditorProps {
    family: { [key: string]: string };
    relationships: { [email: string]: 'friendly' | 'neutral' | 'rival' };
    onFamilyChange: (family: { [key: string]: string }) => void;
    onRelationshipsChange: (relationships: { [email: string]: 'friendly' | 'neutral' | 'rival' }) => void;
    allContacts: (User | Coworker)[];
    currentContactEmail: string;
}

const RelationshipEditor: React.FC<RelationshipEditorProps> = ({
    family,
    relationships,
    onFamilyChange,
    onRelationshipsChange,
    allContacts,
    currentContactEmail
}) => {
    const [newFamilyMember, setNewFamilyMember] = useState({ relation: '', name: '' });
    const [newRelationship, setNewRelationship] = useState({ email: '', type: 'neutral' as 'friendly' | 'neutral' | 'rival' });

    const handleAddFamilyMember = () => {
        if (newFamilyMember.relation && newFamilyMember.name) {
            onFamilyChange({ ...family, [newFamilyMember.relation.toLowerCase()]: newFamilyMember.name });
            setNewFamilyMember({ relation: '', name: '' });
        }
    };

    const handleRemoveFamilyMember = (relation: string) => {
        const newFamily = { ...family };
        delete newFamily[relation];
        onFamilyChange(newFamily);
    };

    const handleAddRelationship = () => {
        if (newRelationship.email && !relationships[newRelationship.email]) {
            onRelationshipsChange({ ...relationships, [newRelationship.email]: newRelationship.type });
            setNewRelationship({ email: '', type: 'neutral' });
        }
    };
    
    const handleRemoveRelationship = (email: string) => {
        const newRelationships = { ...relationships };
        delete newRelationships[email];
        onRelationshipsChange(newRelationships);
    };

    const availableContacts = allContacts.filter(c => c.email !== currentContactEmail && !relationships[c.email]);

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Family & Connections</h4>
                <div className="space-y-2">
                    {Object.entries(family).map(([relation, name]) => (
                        <div key={relation} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-retro-gray-800 rounded-md">
                            <span className="text-sm capitalize">{relation}: {name}</span>
                            <button type="button" onClick={() => handleRemoveFamilyMember(relation)} className="p-1 btn-aqua-red !py-0.5" aria-label={`Remove ${name}`}>
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                    <input type="text" value={newFamilyMember.relation} onChange={e => setNewFamilyMember(p => ({...p, relation: e.target.value}))} placeholder="Relation (e.g., spouse)" className="input-vista"/>
                    <input type="text" value={newFamilyMember.name} onChange={e => setNewFamilyMember(p => ({...p, name: e.target.value}))} placeholder="Name" className="input-vista"/>
                    <button type="button" onClick={handleAddFamilyMember} className="btn-aqua p-2"><PlusIcon className="w-4 h-4"/></button>
                </div>
            </div>
            
             <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Workplace Relationships</h4>
                <div className="space-y-2">
                    {Object.entries(relationships).map(([email, type]) => (
                        <div key={email} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-retro-gray-800 rounded-md">
                            <span className="text-sm">{allContacts.find(c=>c.email === email)?.name || email}: <span className="capitalize font-semibold">{type}</span></span>
                            <button type="button" onClick={() => handleRemoveRelationship(email)} className="p-1 btn-aqua-red !py-0.5" aria-label={`Remove relationship with ${email}`}>
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                    <select value={newRelationship.email} onChange={e => setNewRelationship(p => ({...p, email: e.target.value}))} className="select-vista flex-grow">
                        <option value="">Select a contact...</option>
                        {availableContacts.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
                    </select>
                    <select value={newRelationship.type} onChange={e => setNewRelationship(p => ({...p, type: e.target.value as any}))} className="select-vista">
                        <option value="friendly">Friendly</option>
                        <option value="neutral">Neutral</option>
                        <option value="rival">Rival</option>
                    </select>
                    <button type="button" onClick={handleAddRelationship} className="btn-aqua p-2"><PlusIcon className="w-4 h-4"/></button>
                </div>
            </div>
        </div>
    );
};

export default RelationshipEditor;