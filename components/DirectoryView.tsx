import React from 'react';
import { Coworker, User } from '../types';

interface DirectoryViewProps {
  allContacts: (User | Coworker)[];
}

export default function DirectoryView({ allContacts }: DirectoryViewProps) {

  return (
    <div className="flex flex-col h-full bg-white dark:bg-retro-gray-900 shadow-inner-dark rounded-md border border-black/30 overflow-hidden">
      <header className="p-4 bg-vista-header-bg border-b border-black/20 flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Company Directory</h2>
        <p className="text-sm text-slate-700" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>All users and AI coworkers in the simulation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 overflow-y-auto">
        {allContacts.map(contact => {
          const isUser = 'username' in contact;
          const manager = contact.reportsTo ? allContacts.find(c => c.email === contact.reportsTo) : null;
          return (
             <div key={contact.email} className="p-4 rounded-md bg-slate-100 dark:bg-retro-gray-800 shadow-md border border-slate-200 dark:border-slate-700 relative flex flex-col">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-vista-blue-light text-vista-blue-dark dark:bg-vista-blue-dark dark:text-vista-blue-light">
                    {isUser ? 'User' : 'AI Coworker'}
                </div>
                <h3 className="font-bold text-lg text-vista-blue-dark dark:text-vista-blue-mid pr-16">{contact.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{contact.email}</p>
                <div className="text-xs mt-3 space-y-1 border-t border-slate-200 dark:border-slate-700 pt-2 text-slate-700 dark:text-slate-300">
                  <p><strong>Role:</strong> {contact.role}</p>
                  <p><strong>Department:</strong> {contact.department}</p>
                  {manager && <p><strong>Reports To:</strong> {manager.name}</p>}
                </div>
                {'personality' in contact && contact.personality && (
                    <p className="mt-2 italic text-sm text-slate-700 dark:text-slate-300">"{contact.personality}"</p>
                )}
                 <div className="mt-auto pt-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap border-t border-dashed pt-2"><strong>Signature:</strong><br/>{contact.signature}</p>
                 </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
