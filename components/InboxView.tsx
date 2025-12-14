import React, { useState, useRef, useEffect } from 'react';
import { Thread, Email, User } from '../types';
import { ReplyIcon } from './icons/ReplyIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CodeBlock } from './CodeBlock';
import { CloseIcon } from './icons/CloseIcon';

interface InboxViewProps {
  currentUser: User;
  threads: Thread[];
  selectedThread: Thread | null;
  onSelectThread: (id: string | null) => void;
  onDeleteThread: (id: string) => void;
  onComposeReply: () => void;
  isLoading: boolean;
  error: string | null;
}

const ThreadList = ({
  currentUser,
  threads,
  selectedThreadId,
  onSelectThread,
  onDeleteThread,
}) => (
  <div className="bg-white dark:bg-retro-gray-900 flex flex-col h-full">
    <div className="p-2 border-b border-black/20 flex-shrink-0 bg-vista-header-bg">
      <h2 className="font-bold text-base px-1 text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Inbox</h2>
    </div>
    <ul className="overflow-y-auto h-full">
      {threads.map(thread => {
        const lastEmail = thread.emails[thread.emails.length - 1];
        const isSelected = thread.id === selectedThreadId;
        const isCcOnly = currentUser && lastEmail.cc?.includes(currentUser.email) && !lastEmail.to.includes(currentUser.email);
        
        return (
          <li
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`p-2 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors relative group ${
              isSelected 
                ? 'bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700' 
                : isCcOnly
                ? 'bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-800/40'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <p className={`font-bold truncate text-sm ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>{lastEmail.from}</p>
            <p className={`truncate text-sm ${isSelected ? 'text-blue-100' : 'text-slate-600 dark:text-slate-200'}`}>{lastEmail.subject}</p>
            <p className={`text-xs truncate ${isSelected ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}>{lastEmail.body}</p>
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteThread(thread.id); }}
                className="absolute top-1/2 -translate-y-1/2 right-2 p-1 btn-aqua-red opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete thread"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);

const RichBodyRenderer = ({ email }: { email: Email }) => {
    // Split the text by code blocks, keeping the delimiters
    const parts = email.body.split(/(```(?:[\w-]+)?\n[\s\S]+?\n```)/g);

    return (
        <>
            {parts.map((part, index) => {
                const codeBlockMatch = part.match(/^```([\w-]+)?\n([\s\S]+?)\n```$/);
                if (codeBlockMatch) {
                    const language = codeBlockMatch[1] || 'text';
                    const code = codeBlockMatch[2];
                    return <CodeBlock key={index} language={language} code={code} />;
                }
                // This ensures that quoted text from replies is also styled correctly
                const isQuote = part.startsWith('>');
                return (
                    <div key={index} className={`whitespace-pre-wrap break-words text-sm ${isQuote ? 'text-slate-600 dark:text-slate-400 italic' : 'text-retro-gray-800 dark:text-retro-gray-200'}`}>
                        {part}
                    </div>
                );
            })}
            {email.attachments && email.attachments.map((attachment, index) => (
                attachment.type === 'image' && (
                    <div key={`att-${index}`} className="mt-4 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-retro-gray-800">
                        <img 
                            src={`data:image/png;base64,${attachment.data}`} 
                            alt="AI Generated Attachment"
                            className="max-w-full h-auto rounded-md"
                        />
                    </div>
                )
            ))}
        </>
    );
};

const ThreadDetail = ({
  currentUser,
  thread,
  onComposeReply,
  isLoading,
  isMobile,
  onBack,
  onClose,
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.emails]);

  const lastEmail = thread.emails[thread.emails.length - 1];
  const isCcOnly = currentUser && lastEmail.cc?.includes(currentUser.email) && !lastEmail.to.includes(currentUser.email);
  const subject = thread.emails[0]?.subject || 'No Subject';

  return (
    <div className="flex flex-col h-full">
      <div className={`p-2 border-b border-black/20 flex-shrink-0 space-y-2 ${isCcOnly ? 'bg-vista-header-observe-bg' : 'bg-vista-header-bg'}`}>
        <div className="flex justify-between items-start">
            <div>
                {isMobile && <button onClick={onBack} className="text-vista-blue-dark dark:text-vista-blue-mid mb-2 font-semibold">&larr; Back</button>}
                <h3 className="font-bold text-lg truncate px-1 text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>{subject}</h3>
            </div>
            {!isMobile && (
                <button onClick={onClose} className="p-1.5 btn-aqua-gray rounded-md" aria-label="Close thread">
                    <CloseIcon className="w-4 h-4"/>
                </button>
            )}
        </div>
        <div className="flex items-center gap-2 px-1">
             <button
                onClick={onComposeReply}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 btn-aqua text-sm"
            >
                <ReplyIcon className="w-4 h-4" />
                Reply
            </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
        {thread.emails.map(email => (
          <div key={email.id} className="bg-white dark:bg-retro-gray-900/70 rounded-md border border-black/20 shadow-lg overflow-hidden">
             <div className="px-3 py-2 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-retro-gray-700 dark:to-retro-gray-800 border-b border-black/20 text-xs text-slate-800 dark:text-slate-200" style={{textShadow: '0 1px 0 rgba(255,255,255,0.4)'}}>
                <p className="break-words"><strong>From:</strong> {email.from}</p>
                <p className="break-words"><strong>To:</strong> {email.to.join(', ')}</p>
                {email.cc && email.cc.length > 0 && <p className="break-words"><strong>CC:</strong> {email.cc.join(', ')}</p>}
                <p className="break-words"><strong>Date:</strong> {new Date(email.timestamp).toLocaleString()}</p>
            </div>
            <div className="p-3">
                <RichBodyRenderer email={email} />
                {email.signature && <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-600 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-400">{email.signature}</div>}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 p-4 h-[52px]">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vista-blue-dark"></div>
                <span>A coworker is typing...</span>
            </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};


export default function InboxView({ currentUser, threads, selectedThread, onSelectThread, onDeleteThread, onComposeReply, isLoading, error }: InboxViewProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    if (isMobile) {
      if (selectedThread) {
        return <ThreadDetail currentUser={currentUser} thread={selectedThread} onComposeReply={onComposeReply} isLoading={isLoading} isMobile={true} onBack={() => onSelectThread(null)} onClose={() => onSelectThread(null)} />;
      }
      return <ThreadList currentUser={currentUser} threads={threads} selectedThreadId={selectedThread?.id || null} onSelectThread={onSelectThread} onDeleteThread={onDeleteThread} />;
    }

    return (
        <>
            <div className="w-1/3 max-w-sm flex-shrink-0 border-r border-black/20">
                <ThreadList currentUser={currentUser} threads={threads} selectedThreadId={selectedThread?.id || null} onSelectThread={onSelectThread} onDeleteThread={onDeleteThread} />
            </div>
            <div className="flex-1 flex flex-col bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/60 dark:to-green-950/60 min-w-0">
                {selectedThread ? (
                    <ThreadDetail currentUser={currentUser} thread={selectedThread} onComposeReply={onComposeReply} isLoading={isLoading} isMobile={false} onBack={() => {}} onClose={() => onSelectThread(null)}/>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400 p-4 text-center bg-white dark:bg-retro-gray-900">
                        {isLoading ? 'Loading emails...' : threads.length > 0 ? 'Select a thread to read.' : 'No emails yet. Send one to start a conversation!'}
                    </div>
                )}
            </div>
        </>
    );
  };
  
  return (
    <div className="flex-1 bg-white dark:bg-retro-gray-900 shadow-inner-dark rounded-md overflow-hidden border border-black/30 flex">
        {error && <div className="p-4 bg-red-100 text-red-800 border-b-2 border-red-300 absolute top-0 left-0 right-0 z-10">{error}</div>}
        {renderContent()}
    </div>
  );
}