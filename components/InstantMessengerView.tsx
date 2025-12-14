import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Coworker, IMConversation, IMMessage } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { ReplyIcon } from './icons/ReplyIcon';

const NewConversationModal = ({ allContacts, currentUser, onClose, onCreateConversation }) => {
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    
    const handleToggle = (email: string) => {
        setSelectedEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
    };

    const handleCreate = () => {
        if (selectedEmails.length > 0) {
            onCreateConversation(selectedEmails);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-200/90 dark:bg-retro-gray-800/90 rounded-lg shadow-vista w-full max-w-md flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
                <header className="p-3 bg-vista-header-bg border-b border-black/20 rounded-t-lg">
                    <h2 className="font-bold text-lg text-slate-800" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}>New Message</h2>
                </header>
                <div className="flex-1 p-3 bg-white dark:bg-retro-gray-900/80 overflow-y-auto h-80">
                    <ul className="space-y-1">
                        {allContacts.filter(c => c.email !== currentUser.email).map(contact => (
                            <li key={contact.email}>
                                <label className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 ${selectedEmails.includes(contact.email) ? 'bg-vista-blue-light dark:bg-vista-blue-dark/50' : ''}`}>
                                    <input type="checkbox" checked={selectedEmails.includes(contact.email)} onChange={() => handleToggle(contact.email)} className="vista-checkbox" />
                                    <div>
                                        <div className="font-semibold text-retro-gray-900 dark:text-slate-100">{contact.name}</div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">{contact.email}</div>
                                    </div>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
                <footer className="p-3 bg-vista-header-bg border-t border-black/20 flex justify-end gap-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="btn-aqua-gray">Cancel</button>
                    <button type="button" onClick={handleCreate} disabled={selectedEmails.length === 0} className="flex items-center gap-2 btn-aqua disabled:opacity-50">
                        Start Chat
                    </button>
                </footer>
            </div>
        </div>
    );
};

const ConversationList = ({ conversations, allContacts, currentUser, onSelect, selectedConversationId, onNewConversation }) => {
    const getConversationTitle = (convo: IMConversation) => {
        if (convo.groupName) return convo.groupName;
        const otherParticipants = convo.participantEmails.filter(email => email !== currentUser.email);
        if (otherParticipants.length === 1) {
            return allContacts.find(c => c.email === otherParticipants[0])?.name || 'Unknown';
        }
        return otherParticipants.map(email => allContacts.find(c => c.email === email)?.name.split(' ')[0] || 'Unknown').join(', ');
    };

    return (
        <div className="bg-white dark:bg-retro-gray-900 flex flex-col h-full border-r border-black/20">
            <div className="p-2 border-b border-black/20 flex-shrink-0 bg-vista-header-bg flex justify-between items-center">
                <h2 className="font-bold text-base px-1 text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Messenger</h2>
                <button onClick={onNewConversation} className="p-1.5 btn-aqua-gray rounded-full" aria-label="New Conversation">
                    <PlusIcon className="w-4 h-4"/>
                </button>
            </div>
            <ul className="overflow-y-auto h-full">
                {conversations.map(convo => (
                    <li key={convo.id} onClick={() => onSelect(convo.id)} className={`p-2 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ${selectedConversationId === convo.id ? 'bg-vista-blue-light dark:bg-vista-blue-dark/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <p className="font-bold truncate text-sm text-slate-800 dark:text-slate-100">{getConversationTitle(convo)}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ChatWindow = ({ conversation, messages, currentUser, allContacts, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(conversation.id, newMessage.trim());
            setNewMessage('');
        }
    };

    const getSender = (email: string) => allContacts.find(c => c.email === email);

    return (
        <div className="flex flex-col h-full bg-[#e9eef2] dark:bg-retro-gray-800/90">
            <div className="p-2 border-b border-black/20 flex-shrink-0 bg-vista-header-bg">
                 <h3 className="font-bold text-lg truncate px-1 text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>
                    {conversation.groupName || conversation.participantEmails.filter(e => e !== currentUser.email).map(e => getSender(e)?.name).join(', ')}
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const sender = getSender(msg.senderEmail);
                    if(msg.isTyping) {
                        return (
                             <div key={msg.id} className="flex items-center justify-start h-[38px] px-1">
                                <div className="text-slate-500 dark:text-slate-400 text-sm italic animate-pulse">
                                    {sender ? `${sender.name.split(' ')[0]} is typing...` : '...'}
                                </div>
                            </div>
                        )
                    }
                    const isCurrentUser = msg.senderEmail === currentUser.email;
                    return (
                        <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex items-end gap-2 max-w-xs md:max-w-md">
                                <div className={`px-3 py-2 rounded-lg ${isCurrentUser ? 'bg-vista-blue-dark text-white' : 'bg-slate-100 dark:bg-retro-gray-700'}`}>
                                    {!isCurrentUser && <p className="text-xs font-bold text-vista-blue-dark dark:text-vista-blue-mid mb-1">{sender?.name.split(' ')[0]}</p>}
                                    <p className="text-sm break-words text-retro-gray-900 dark:text-slate-100">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-black/20 bg-white dark:bg-retro-gray-900">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="input-vista"/>
                    <button type="submit" className="btn-aqua p-2 rounded-md">
                        <ReplyIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    )
};

interface InstantMessengerViewProps {
    currentUser: User;
    conversations: IMConversation[];
    messages: IMMessage[];
    allContacts: (User | Coworker)[];
    onCreateConversation: (participantEmails: string[]) => void;
    onSendMessage: (conversationId: string, content: string) => void;
}

export default function InstantMessengerView({ currentUser, conversations, messages, allContacts, onCreateConversation, onSendMessage }: InstantMessengerViewProps) {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!selectedConversationId && conversations.length > 0) {
            setSelectedConversationId(conversations[0].id);
        }
    }, [conversations, selectedConversationId]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId);
    }, [selectedConversationId, conversations]);

    const messagesForSelectedConvo = useMemo(() => {
        return messages.filter(m => m.conversationId === selectedConversationId).sort((a,b) => a.timestamp - b.timestamp);
    }, [selectedConversationId, messages]);
    
    return (
        <div className="flex-1 bg-white dark:bg-retro-gray-900 shadow-inner-dark rounded-md overflow-hidden border border-black/30 flex h-full">
            {isCreating && (
                <NewConversationModal 
                    allContacts={allContacts}
                    currentUser={currentUser}
                    onClose={() => setIsCreating(false)}
                    onCreateConversation={onCreateConversation}
                />
            )}
            <div className="w-1/3 max-w-xs h-full">
                <ConversationList
                    conversations={conversations}
                    allContacts={allContacts}
                    currentUser={currentUser}
                    onSelect={setSelectedConversationId}
                    selectedConversationId={selectedConversationId}
                    onNewConversation={() => setIsCreating(true)}
                />
            </div>
            <div className="flex-1 h-full min-w-0">
                {selectedConversation ? (
                    <ChatWindow 
                        conversation={selectedConversation}
                        messages={messagesForSelectedConvo}
                        currentUser={currentUser}
                        allContacts={allContacts}
                        onSendMessage={onSendMessage}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400 p-4 text-center h-full">
                        <div>
                            <p>Select a conversation or start a new one.</p>
                            <button onClick={() => setIsCreating(true)} className="mt-4 btn-aqua">New Message</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}