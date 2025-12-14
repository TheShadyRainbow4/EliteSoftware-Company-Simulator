import React, { useState, useEffect, useMemo } from 'react';
import { User, Coworker, Thread, Email } from '../types';
import { ReplyIcon } from './icons/ReplyIcon';
import { PlusIcon } from './icons/PlusIcon';
import ContactPickerModal from './ContactPickerModal';

interface ComposeEmailProps {
  user: User;
  contacts: Coworker[];
  onClose: () => void;
  onSend: (email: Omit<Email, 'id' | 'timestamp' | 'from'>) => void;
  mode: 'new' | 'reply';
  thread: Thread | null;
}

const RecipientInput = ({ label, recipients, onRecipientsChange, onAddClick }) => {
    const [inputValue, setInputValue] = useState('');

    const handleRemoveRecipient = (email: string) => {
        onRecipientsChange(recipients.filter(r => r !== email));
    };

    const handleAddRecipient = (email: string) => {
        const trimmedEmail = email.trim();
        if (trimmedEmail && !recipients.includes(trimmedEmail)) {
            onRecipientsChange([...recipients, trimmedEmail]);
        }
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', 'Tab', ','].includes(e.key)) {
            e.preventDefault();
            handleAddRecipient(inputValue);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text');
        const emails = paste.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
        if (emails.length > 0) {
            const newRecipients = Array.from(new Set([...recipients, ...emails]));
            onRecipientsChange(newRecipients);
        }
    };


    return (
        <div className="flex items-start border-b border-slate-300 dark:border-slate-700 pb-1">
            <div className="flex items-center h-[28px]">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mr-2">{label}:</label>
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-1 p-1">
                {recipients.map(email => (
                    <div key={email} className="flex items-center gap-1 bg-vista-blue-light text-vista-blue-dark dark:bg-vista-blue-dark dark:text-vista-blue-light text-xs font-semibold rounded-full px-2 py-0.5">
                        <span>{email}</span>
                        <button type="button" onClick={() => handleRemoveRecipient(email)} className="font-bold text-lg leading-none">&times;</button>
                    </div>
                ))}
                <input
                    type="email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className="flex-grow bg-transparent focus:outline-none text-retro-gray-900 dark:text-slate-100 placeholder:text-gray-500 min-w-[120px]"
                    placeholder={recipients.length === 0 ? "Type or add contacts" : ""}
                />
            </div>
            <button type="button" onClick={onAddClick} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 ml-1">
                <PlusIcon className="w-4 h-4 text-slate-500"/>
            </button>
        </div>
    )
};


export default function ComposeEmail({ user, contacts, onClose, onSend, mode, thread }: ComposeEmailProps) {
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);

  const [pickerState, setPickerState] = useState<{ open: boolean; field: 'to' | 'cc' | 'bcc' } | null>(null);

  const allRecipients = useMemo(() => [...to, ...cc, ...bcc], [to, cc, bcc]);

  useEffect(() => {
    if (mode === 'reply' && thread) {
      const lastEmail = thread.emails[thread.emails.length - 1];

      const toRecipients = new Set([lastEmail.from]);
      const ccRecipients = new Set(lastEmail.cc || []);

      // Add all original `to` recipients to the new `to` field
      lastEmail.to.forEach(r => toRecipients.add(r));

      // Don't reply to self
      toRecipients.delete(user.email);
      ccRecipients.delete(user.email);

      setTo(Array.from(toRecipients));
      setCc(Array.from(ccRecipients));
      if (ccRecipients.size > 0) {
        setShowCcBcc(true);
      }

      const originalSubject = thread.emails[0].subject;
      setSubject(originalSubject.startsWith('Re: ') ? originalSubject : `Re: ${originalSubject}`);

      const replyQuote = `\n\n\n--- On ${new Date(lastEmail.timestamp).toLocaleString()}, ${lastEmail.from} wrote: ---\n> ${lastEmail.body.split('\n').join('\n> ')}`;
      setBody(replyQuote);

    }
  }, [mode, thread, user.email]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (to.length === 0 || !subject.trim() || !body.trim()) {
      alert('Please fill in To, Subject, and Body fields.');
      return;
    }
    onSend({
      to,
      cc,
      bcc,
      subject,
      body,
      signature: user.signature,
    });
  };

  const handleSelectContacts = (selected: string[]) => {
      if (!pickerState) return;
      if (pickerState.field === 'to') setTo(prev => Array.from(new Set([...prev, ...selected])));
      if (pickerState.field === 'cc') setCc(prev => Array.from(new Set([...prev, ...selected])));
      if (pickerState.field === 'bcc') setBcc(prev => Array.from(new Set([...prev, ...selected])));
      setPickerState(null);
  }

  return (
    <>
      {pickerState?.open && (
          <ContactPickerModal
              contacts={contacts}
              existingRecipients={allRecipients}
              onClose={() => setPickerState(null)}
              onSelect={handleSelectContacts}
          />
      )}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-slate-200/90 dark:bg-retro-gray-800/90 rounded-lg shadow-vista w-full max-w-2xl flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
          <header className="p-3 bg-vista-header-bg border-b border-black/20 rounded-t-lg flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>{mode === 'new' ? 'New Message' : 'Reply'}</h2>
            {!showCcBcc && <button type="button" onClick={() => setShowCcBcc(true)} className="text-xs font-semibold text-slate-600 hover:underline">CC/BCC</button>}
          </header>
          <form onSubmit={handleSend} className="flex-1 flex flex-col">
              <div className="p-3 space-y-2 border-b border-slate-300 dark:border-slate-700 bg-white dark:bg-retro-gray-900/80">
                  <RecipientInput label="To" recipients={to} onRecipientsChange={setTo} onAddClick={() => setPickerState({ open: true, field: 'to' })} />
                  {showCcBcc && (
                    <>
                        <RecipientInput label="CC" recipients={cc} onRecipientsChange={setCc} onAddClick={() => setPickerState({ open: true, field: 'cc' })} />
                        <RecipientInput label="BCC" recipients={bcc} onRecipientsChange={setBcc} onAddClick={() => setPickerState({ open: true, field: 'bcc' })} />
                    </>
                  )}
                   <div className="flex items-center">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mr-2">Subject:</label>
                      <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email Subject" className="w-full p-1 bg-transparent font-bold focus:outline-none text-retro-gray-900 dark:text-slate-100" />
                  </div>
              </div>
              <div className="flex-1 p-3 bg-white dark:bg-retro-gray-900/80">
                  <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full h-64 p-1 bg-transparent focus:outline-none resize-none text-retro-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Compose your email... Try asking an AI for help with a task, e.g., [TASK: write a PowerShell script to find large files]"
                      autoFocus={mode === 'reply'}
                  />
                   <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-600 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
                      {user.signature}
                   </div>
              </div>
              <footer className="p-3 bg-vista-header-bg border-t border-black/20 flex justify-end gap-3 rounded-b-lg">
                  <button type="button" onClick={onClose} className="btn-aqua-gray">Cancel</button>
                  <button type="submit" className="flex items-center gap-2 btn-aqua">
                      <ReplyIcon className="w-5 h-5" />
                      Send
                  </button>
              </footer>
          </form>
        </div>
      </div>
    </>
  );
}