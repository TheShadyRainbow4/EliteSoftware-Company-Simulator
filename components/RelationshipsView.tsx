import React from 'react';
import { Coworker, User } from '../types';

interface RelationshipsViewProps {
  allContacts: (User | Coworker)[];
}

const RelationshipCard = ({ contact, allContacts }: { contact: User | Coworker, allContacts: (User | Coworker)[] }) => {
    const family = ('family' in contact && contact.family) ? contact.family : null;
    const relationships = ('relationships' in contact && contact.relationships) ? contact.relationships : null;

    // Don't render cards for contacts with no specified relationships or family
    if (!family && !relationships) return null;

    const relationshipIcons = {
        friendly: '😊',
        rival: '😠',
        neutral: '😐'
    };

    return (
        <div className="p-4 rounded-md bg-slate-100 dark:bg-retro-gray-800 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col h-full">
            <h3 className="font-bold text-lg text-vista-blue-dark dark:text-vista-blue-mid">{contact.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{contact.role}</p>

            {family && Object.keys(family).length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-1">Family & Connections</h4>
                    <ul className="text-sm list-disc list-inside text-slate-600 dark:text-slate-300">
                        {Object.entries(family).map(([relation, name]) => (
                            <li key={relation}><span className="capitalize">{relation}:</span> {name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {relationships && Object.keys(relationships).length > 0 && (
                 <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-1">Workplace Relationships</h4>
                     <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
                        {Object.entries(relationships).map(([email, type]) => {
                            const otherPerson = allContacts.find(c => c.email === email);
                            return (
                                <li key={email} className="flex items-center gap-2">
                                    <span>{relationshipIcons[type]}</span>
                                    <span>{type.charAt(0).toUpperCase() + type.slice(1)} with <strong>{otherPerson?.name || email}</strong></span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function RelationshipsView({ allContacts }: RelationshipsViewProps) {
  const contactsWithConnections = allContacts.filter(c => ('family' in c && c.family) || ('relationships' in c && c.relationships));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-retro-gray-900 shadow-inner-dark rounded-md border border-black/30 overflow-hidden">
      <header className="p-4 bg-vista-header-bg border-b border-black/20 flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Company Relationships</h2>
        <p className="text-sm text-slate-700" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>An inside look at the personal and professional connections at EliteSoftware.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 overflow-y-auto">
        {contactsWithConnections.map(contact => (
          <RelationshipCard key={contact.email} contact={contact} allContacts={allContacts} />
        ))}
         {contactsWithConnections.length === 0 && (
             <p className="col-span-full text-center text-slate-500 dark:text-slate-400 p-8">No specific relationships or family details have been defined for any AI coworkers yet.</p>
         )}
      </div>
    </div>
  );
}