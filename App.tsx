import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Coworker, Thread, View, Email, User, ThreadStatus, Project, CompanyProfile, Role, Event, IMConversation, IMMessage, AiAction, AiIMResponse, AiEmailActionResponse, SocialPost, GeneratedCoworker, GeneratedProject, GeneratedEvent } from './types';
import { DEPARTMENTS } from './constants';
import { generateReply, generateProjectKickoffThread, generateSpontaneousEmail, generateProjectQueryEmail, generateProjectContribution, generateIMReply, generateTaskCompletionEmail, generateSocialMediaPost, generateSocialMediaComment, generateNewCoworkerProfile, generateNewProjectIdea, generateNewCompanyEvent, generateProjectCompletionEmail, generateImage } from './services/geminiService';
import Sidebar from './components/Sidebar';
import InboxView from './components/InboxView';
import DirectoryView from './components/DirectoryView';
import AdminView from './components/AdminView';
import Auth from './components/Auth';
import ComposeEmail from './components/ComposeEmail';
import { useLocalStorage } from './hooks/useLocalStorage';
import OrgChartView from './components/OrgChartView';
import ScheduleView from './components/ScheduleView';
import InstantMessengerView from './components/InstantMessengerView';
import ProjectsView from './components/ProjectsView';
import SocialMediaView from './components/SocialMediaView';
import { EliteSoftwareLogoIcon } from './components/icons/EliteSoftwareLogoIcon';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { PauseIcon } from './components/icons/PauseIcon';
import { PlayIcon } from './components/icons/PlayIcon';
import { INITIAL_GAME_STATE } from './initialData';
import BootSequence from './components/BootSequence';
import RelationshipsView from './components/RelationshipsView';

type Theme = 'light' | 'dark';

const COMPANY_SOCIAL_PROFILE_EMAIL = 'company@elitesoftware.tech';

const UserMenu = ({ user, onToggleTheme, onLogout, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative h-full flex items-center" ref={menuRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center rounded-md font-bold text-slate-800 border border-[#999] cursor-pointer h-[22px]"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, #f0f0f0, #d0d0d0)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.2)',
                  textShadow: '0 1px 0px rgba(255,255,255,0.7)'
                }}
            >
                <span className="pl-3 pr-2 py-0.5 text-sm">{user.name}</span>
                <div className="h-full w-px bg-black/20"></div>
                <div className="px-1.5 py-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </div>
            </div>
            {isOpen && (
                <div className="absolute right-0 mt-2 top-full w-48 bg-white/95 dark:bg-retro-gray-800/95 backdrop-blur-md rounded-md shadow-lg border border-slate-400/50 z-50 p-1">
                    <button
                        onClick={() => { onToggleTheme(); setIsOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-sm rounded-sm flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-vista-blue-mid hover:text-white"
                    >
                      {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                      Toggle Theme
                    </button>
                    <button
                        onClick={() => { onLogout(); setIsOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-sm rounded-sm flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-vista-blue-mid hover:text-white"
                    >
                      <LogoutIcon className="w-4 h-4" />
                      Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);

  const [users, setUsers] = useLocalStorage<{ [username: string]: Omit<User, 'id'> & {password: string} }>('users_v3', INITIAL_GAME_STATE.users);
  const [threads, setThreads] = useLocalStorage<Thread[]>('threads_v3', INITIAL_GAME_STATE.threads);
  const [globalCoworkers, setGlobalCoworkers] = useLocalStorage<Coworker[]>('globalCoworkers_v3', INITIAL_GAME_STATE.globalCoworkers);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects_v3', INITIAL_GAME_STATE.projects);
  const [companyProfile, setCompanyProfile] = useLocalStorage<CompanyProfile>('companyProfile_v3', INITIAL_GAME_STATE.companyProfile);
  const [roles, setRoles] = useLocalStorage<Role[]>('roles_v3', INITIAL_GAME_STATE.roles);
  const [imConversations, setImConversations] = useLocalStorage<IMConversation[]>('imConversations_v3', []);
  const [imMessages, setImMessages] = useLocalStorage<IMMessage[]>('imMessages_v3', []);
  const [currentTime, setCurrentTime] = useLocalStorage<string>('currentTime_v3', INITIAL_GAME_STATE.currentTime);
  const [events, setEvents] = useLocalStorage<Event[]>('events_v3', INITIAL_GAME_STATE.events);
  const [socialPosts, setSocialPosts] = useLocalStorage<SocialPost[]>('socialPosts_v3', INITIAL_GAME_STATE.socialPosts);
  const [areSoundsMuted, setAreSoundsMuted] = useLocalStorage<boolean>('soundsMuted_v3', false);

  const [view, setView] = useState<View>(View.Inbox);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState<false | 'new' | 'reply'>(false);
  const [isPaused, setIsPaused] = useState(true);
  const [actionQueue, setActionQueue] = useState<Array<() => Promise<void> | void>>([]);
  const [notifications, setNotifications] = useState<{ id: number; message: string }[]>([]);
  const [bootComplete, setBootComplete] = useState(false);

  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const imMessagesRef = useRef(imMessages);
  const isPausedRef = useRef(isPaused);
  const areSoundsMutedRef = useRef(areSoundsMuted);
  const actionQueueRef = useRef(actionQueue);
  imMessagesRef.current = imMessages;
  actionQueueRef.current = actionQueue;

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    areSoundsMutedRef.current = areSoundsMuted;
  }, [areSoundsMuted]);

  useEffect(() => {
    notificationSoundRef.current = document.getElementById('notification-sound') as HTMLAudioElement;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addNotification = useCallback((message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000); // Remove after 5 seconds
  }, []);

  const playNotificationSound = useCallback(() => {
    if (areSoundsMutedRef.current) return;
    if (notificationSoundRef.current) {
        notificationSoundRef.current.currentTime = 0;
        notificationSoundRef.current.play().catch(e => console.error("Error playing notification sound:", e));
    }
  }, []);

  const sendBroadcastEmailToAll = useCallback((emailContent: { subject: string; body: string }) => {
    const allUserEmails = Object.values(users).map(u => u.email);
    const allCoworkerEmails = globalCoworkers.map(c => c.email);
    const allEmails = Array.from(new Set([...allUserEmails, ...allCoworkerEmails]));
    const broadcastTime = new Date(currentTime).getTime();

    const newEmail: Email = {
      id: `email-broadcast-${Date.now()}`,
      from: 'system.notifications@elitesoftware.tech',
      to: allEmails,
      subject: emailContent.subject,
      body: emailContent.body,
      signature: 'This is an automated message from the EliteSoftware System.',
      timestamp: broadcastTime,
    };

    const participants = Array.from(new Set(['system.notifications@elitesoftware.tech', ...allEmails]));
    const newUserStatuses = Object.fromEntries(participants.map(p => [p, ThreadStatus.Active]));

    const newThread: Thread = {
        id: `thread-broadcast-${Date.now()}`,
        emails: [newEmail],
        participants,
        userStatuses: newUserStatuses,
    };

    setThreads(prev => [newThread, ...prev]);
  }, [users, globalCoworkers, setThreads, currentTime]);

  const handleCreateEvent = useCallback((newEventData: Omit<Event, 'id'>) => {
      const newEvent = { ...newEventData, id: `event-${Date.now()}` };
      setEvents(prev => [...prev, newEvent]);
      if (!newEvent.isSystem) {
        sendBroadcastEmailToAll({
            subject: `[New Event] ${newEvent.title}`,
            body: `A new event has been added to the company calendar.\n\nTitle: ${newEvent.title}\nStarts: ${new Date(newEvent.start).toLocaleString()}\nEnds: ${new Date(newEvent.end).toLocaleString()}\n\nDescription:\n${newEvent.description}`
        });
        playNotificationSound();
      }
  }, [setEvents, sendBroadcastEmailToAll, playNotificationSound]);

  useEffect(() => {
    if (isPaused) return;
    const now = new Date(currentTime);
    const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const updatedEvents = [...events];
    let reminderSent = false;

    events.forEach((event, index) => {
        const eventStart = new Date(event.start);
        if (!event.isSystem && !event.reminderSent && eventStart > now && eventStart <= oneDayAhead) {
            sendBroadcastEmailToAll({
                subject: `[REMINDER] Upcoming Event: ${event.title}`,
                body: `This is a reminder that the following event is scheduled to start in less than 24 hours:\n\nTitle: ${event.title}\nStarts: ${new Date(event.start).toLocaleString()}\n\nDescription:\n${event.description}`
            });
            updatedEvents[index] = { ...event, reminderSent: true };
            reminderSent = true;
        }
    });

    if (reminderSent) {
        setEvents(updatedEvents);
        playNotificationSound();
    }
  }, [currentTime, events, setEvents, sendBroadcastEmailToAll, playNotificationSound, isPaused]);

  const allContacts = useMemo<(User | Coworker)[]>(() => {
    const userList: User[] = Object.entries(users).map(([username, u]) => ({...u, id: username, username}));
    const companyProfile: Coworker = {
        id: 'company-profile',
        name: 'EliteSoftware Co. Limited',
        email: COMPANY_SOCIAL_PROFILE_EMAIL,
        role: 'Company Profile',
        department: 'Corporate',
        company: 'EliteSoftware Co. Limited',
        domain: 'elitesoftware.tech',
        personality: 'The official company voice. Professional, exciting, and full of corporate synergy.',
        age: 0,
        signature: 'EliteSoftware Co. Limited',
        reportsTo: undefined,
        isAdmin: false,
    };
    return [...userList, ...globalCoworkers, companyProfile];
  }, [users, globalCoworkers]);

  const addAiEmailToThread = useCallback((threadId: string, aiEmail: Email) => {
    playNotificationSound();
    setThreads(prevThreads => {
        const finalThreads = [...prevThreads];
        const finalThreadIndex = finalThreads.findIndex(t => t.id === threadId);
        if (finalThreadIndex !== -1) {
            const threadToUpdate = { ...finalThreads[finalThreadIndex] };
            threadToUpdate.emails.push(aiEmail);

            const newParticipants = [aiEmail.from, ...aiEmail.to, ...(aiEmail.cc || []), ...(aiEmail.bcc || [])];
            threadToUpdate.participants = Array.from(new Set([...threadToUpdate.participants, ...newParticipants]));

            newParticipants.forEach(pEmail => {
                threadToUpdate.userStatuses[pEmail] = ThreadStatus.Active;
            });
            finalThreads[finalThreadIndex] = threadToUpdate;
            return finalThreads;
        }
        return prevThreads;
    });
  }, [setThreads, playNotificationSound]);

    const handleExecuteAiAction = useCallback((action: AiAction) => {
        if (isPausedRef.current) return;
        switch(action.type) {
            case 'CREATE_EVENT':
                handleCreateEvent(action.payload);
                break;
            case 'SEND_EMAIL': {
                const newEmail: Email = {
                    id: `email-ai-action-${Date.now()}`,
                    from: 'system.notifications@elitesoftware.tech', // Sent on behalf of the user by the system
                    to: action.payload.to,
                    cc: action.payload.cc,
                    subject: action.payload.subject,
                    body: action.payload.body,
                    signature: 'This email was generated by an AI Assistant based on a user request.',
                    timestamp: new Date(currentTime).getTime(),
                };

                const participants = Array.from(new Set([newEmail.from, ...newEmail.to, ...(newEmail.cc || [])]));
                const newUserStatuses = Object.fromEntries(participants.map(p => [p, ThreadStatus.Active]));

                const newThread: Thread = {
                    id: `thread-ai-action-${Date.now()}`,
                    emails: [newEmail],
                    participants,
                    userStatuses: newUserStatuses,
                };
                setThreads(prev => [newThread, ...prev]);
                playNotificationSound();
                break;
            }
            default:
                console.warn("Unknown AI action type:", action);
        }
    }, [handleCreateEvent, setThreads, currentTime, playNotificationSound]);

  const handleAiReplyGeneration = useCallback(async (thread: Thread, lastMessageSender: User | Coworker, depth = 0) => {
      if (isPausedRef.current) return;
      if (depth > 2) return; // Prevent excessively long AI chains

      const aiReplyResponse = await generateReply(thread, allContacts, lastMessageSender, companyProfile);

      if (aiReplyResponse) {
          const { email: emailContent, action, imagePrompt } = aiReplyResponse;

          let attachments: Email['attachments'] = [];
          if (imagePrompt) {
              const imageData = await generateImage(imagePrompt);
              if(imageData) attachments.push({ type: 'image', data: imageData });
          }

          const aiEmail: Email = {
              ...emailContent,
              id: `email-ai-reply-${Date.now()}`,
              timestamp: new Date(currentTime).getTime(),
              attachments,
          };
          addAiEmailToThread(thread.id, aiEmail);

          if (action) {
              setTimeout(() => handleExecuteAiAction(action), 1000);
          }

          // AI-to-AI conversation logic: give another AI a chance to reply
          if (Math.random() > 0.6) { // 40% chance to continue (reduced from 60%)
              setTimeout(() => {
                  if (isPausedRef.current) return;
                  const updatedThread: Thread = { ...thread, emails: [...thread.emails, aiEmail] };
                  const nextSender = allContacts.find(c => c.email === aiEmail.from);
                  if (nextSender) {
                      handleAiReplyGeneration(updatedThread, nextSender, depth + 1);
                  }
              }, 20000 + Math.random() * 20000); // Wait 20-40 seconds
          }
      }
  }, [allContacts, companyProfile, addAiEmailToThread, handleExecuteAiAction, currentTime]);


  // AI Proactive Project Email Effect
  useEffect(() => {
    if (!currentUser || projects.length === 0) return;

    const sendRandomProjectEmail = async () => {
        if (isPausedRef.current || document.hidden) return;

        const aiOnProjects = projects.flatMap(p =>
            p.memberEmails
                .map(email => globalCoworkers.find(c => c.email === email))
                .filter(Boolean)
                .map(coworker => ({ coworker, project: p }))
        );

        if (aiOnProjects.length === 0) return;

        const { coworker, project } = aiOnProjects[Math.floor(Math.random() * aiOnProjects.length)];

        if (!project.threadId) return;
        const projectThread = threads.find(t => t.id === project.threadId);
        if(!projectThread) return;

        const members = allContacts.filter(c => project.memberEmails.includes(c.email));

        try {
            const projectQueryResponse = await generateProjectQueryEmail(project, projectThread, coworker, members, companyProfile);
            if(projectQueryResponse) {
                const { email: emailContent, action, imagePrompt } = projectQueryResponse;
                let attachments: Email['attachments'] = [];
                if (imagePrompt) {
                    const imageData = await generateImage(imagePrompt);
                    if(imageData) attachments.push({ type: 'image', data: imageData });
                }
                const projectQueryEmail: Email = {
                    ...emailContent,
                    id: `email-ai-pq-${Date.now()}`,
                    timestamp: new Date(currentTime).getTime(),
                    attachments,
                };
                addAiEmailToThread(project.threadId, projectQueryEmail);
                if (action) {
                    setTimeout(() => handleExecuteAiAction(action), 1000);
                }
            }
        } catch(e) {
            console.error("Error generating project query email:", e);
        }
    };

    const randomInterval = 150000 + Math.random() * 120000; // 2.5-4.5 minutes
    const timerId = setTimeout(sendRandomProjectEmail, randomInterval);

    return () => clearTimeout(timerId);
  }, [currentUser, projects, globalCoworkers, companyProfile, threads, allContacts, addAiEmailToThread, isPaused, currentTime, handleExecuteAiAction]);

    // AI Project Collaboration Effect
    useEffect(() => {
    if (!currentUser || isPaused) return;

    const triggerProjectWork = async () => {
        if (isPausedRef.current || document.hidden) return;

        const activeProjects = projects.filter(p => p.status === 'Active');
        if (activeProjects.length === 0) return;

        const project = activeProjects[Math.floor(Math.random() * activeProjects.length)];
        const aiMembers = project.memberEmails
            .map(email => globalCoworkers.find(c => c.email === email))
            .filter((c): c is Coworker => !!c);

        if (aiMembers.length === 0 || !project.threadId) return;

        // Find the project's thread
        const projectThread = threads.find(t => t.id === project.threadId);
        if (!projectThread) return;

        try {
            const projectUpdateResponse = await generateProjectContribution(project, projectThread, aiMembers, allContacts, companyProfile);
            if (projectUpdateResponse) {
                const { email: emailContent, action, imagePrompt } = projectUpdateResponse;
                let attachments: Email['attachments'] = [];
                if (imagePrompt) {
                    const imageData = await generateImage(imagePrompt);
                    if(imageData) attachments.push({ type: 'image', data: imageData });
                }
                const projectUpdateEmail: Email = {
                    ...emailContent,
                    id: `email-project-contrib-${Date.now()}`,
                    timestamp: new Date(currentTime).getTime(),
                    attachments,
                };
                addAiEmailToThread(project.threadId, projectUpdateEmail);
                if (action) {
                    setTimeout(() => handleExecuteAiAction(action), 1000);
                }
            }
        } catch (e) {
            console.error("Error during AI project contribution:", e);
        }
    };

    const randomInterval = 180000 + Math.random() * 150000; // 3-5.5 minutes
    const timerId = setTimeout(triggerProjectWork, randomInterval);

    return () => clearTimeout(timerId);
    }, [currentUser, projects, globalCoworkers, threads, allContacts, companyProfile, addAiEmailToThread, isPaused, currentTime, handleExecuteAiAction]);


  // Spontaneous AI Email Effect
  useEffect(() => {
    if (!currentUser || isPaused) return;

    const sendRandomEmail = async () => {
        if (isPausedRef.current || document.hidden) return; // Don't send if tab is not active

        if (globalCoworkers.length < 2) return;

        // Pick two different random AIs
        const shuffled = [...globalCoworkers].sort(() => 0.5 - Math.random());
        const sender = shuffled[0];
        const recipient = shuffled[1];

        const ccRecipient = currentUser.isAdmin ? currentUser : null;

        try {
            const spontaneousThread = await generateSpontaneousEmail(sender, recipient, ccRecipient, companyProfile, Math.random() > 0.8);
            if(spontaneousThread) {
                playNotificationSound();
                setThreads(prev => [spontaneousThread, ...prev]);
            }
        } catch(e) {
            console.error("Error generating spontaneous email:", e);
        }
    };

    const randomInterval = 120000 + Math.random() * 120000; // 2-4 minutes
    const timerId = setTimeout(sendRandomEmail, randomInterval);

    return () => clearTimeout(timerId);
  }, [currentUser, globalCoworkers, companyProfile, setThreads, playNotificationSound, isPaused]);

    const handleDeadlineTrigger = useCallback(async (deadlineEvent: Event) => {
        if (isPausedRef.current) return;
        if (!deadlineEvent.taskDetails) return;

        const assignee = globalCoworkers.find(c => c.email === deadlineEvent.taskDetails?.assigneeEmail);
        if (!assignee) return;

        try {
            const completionEmailResponse = await generateTaskCompletionEmail(deadlineEvent.taskDetails, assignee, companyProfile);
            if (completionEmailResponse) {
                const { email: emailContent, action, imagePrompt } = completionEmailResponse;
                let attachments: Email['attachments'] = [];
                if (imagePrompt) {
                    const imageData = await generateImage(imagePrompt);
                    if(imageData) attachments.push({ type: 'image', data: imageData });
                }
                const completionEmail: Email = {
                    ...emailContent,
                    id: `email-task-complete-${Date.now()}`,
                    timestamp: new Date(currentTime).getTime(),
                    attachments,
                };
                 const newThread: Thread = {
                    id: `thread-task-complete-${Date.now()}`,
                    emails: [completionEmail],
                    participants: [completionEmail.from, ...completionEmail.to, ...(completionEmail.cc || [])],
                    userStatuses: {},
                };
                newThread.participants.forEach(pEmail => { newThread.userStatuses[pEmail] = ThreadStatus.Active; });
                setThreads(prev => [newThread, ...prev]);
                playNotificationSound();

                if (action) {
                    setTimeout(() => handleExecuteAiAction(action), 1000);
                }
            }
        } catch (e) {
            console.error("Error generating task completion email:", e);
        } finally {
            // Remove the completed deadline event
            setEvents(prev => prev.filter(e => e.id !== deadlineEvent.id));
        }

    }, [globalCoworkers, companyProfile, setThreads, setEvents, playNotificationSound, isPaused, currentTime, handleExecuteAiAction]);

    const handleProjectDeadline = useCallback(async (deadlineEvent: Event) => {
        if (isPausedRef.current) return;
        if (!deadlineEvent.projectId) return;

        const project = projects.find(p => p.id === deadlineEvent.projectId);
        if (!project || !project.completionRecipientEmail || project.status !== 'Active') return;

        const aiMembers = project.memberEmails
            .map(email => globalCoworkers.find(c => c.email === email))
            .filter((c): c is Coworker => !!c);

        if (aiMembers.length === 0) return;

        const projectThread = threads.find(t => t.id === project.threadId);
        if (!projectThread) return;

        try {
            const submissionEmailResponse = await generateProjectCompletionEmail(project, projectThread, aiMembers, allContacts, companyProfile);
            if(submissionEmailResponse) {
                const { email: emailContent, action, imagePrompt } = submissionEmailResponse;
                let attachments: Email['attachments'] = [];
                if (imagePrompt) {
                    const imageData = await generateImage(imagePrompt);
                    if(imageData) attachments.push({ type: 'image', data: imageData });
                }
                const submissionEmail: Email = {
                    ...emailContent,
                    id: `email-project-complete-${Date.now()}`,
                    timestamp: new Date(currentTime).getTime(),
                    attachments,
                };
                addAiEmailToThread(project.threadId, submissionEmail);
                setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'Completed' } : p));
                if (action) {
                    setTimeout(() => handleExecuteAiAction(action), 1000);
                }
            }

        } catch(e) {
            console.error("Error generating project completion email", e);
        } finally {
             setEvents(prev => prev.filter(e => e.id !== deadlineEvent.id));
        }

    }, [projects, globalCoworkers, threads, allContacts, companyProfile, addAiEmailToThread, setProjects, setEvents, isPaused, currentTime, handleExecuteAiAction]);

    // Deadline checking effect
    useEffect(() => {
        if (isPaused) return;
        const now = new Date(currentTime);
        events.forEach(event => {
            if (event.isSystem) {
                const deadlineTime = new Date(event.end);
                if (now >= deadlineTime) {
                    if (event.taskDetails) {
                        handleDeadlineTrigger(event);
                    } else if (event.projectId) {
                        handleProjectDeadline(event);
                    }
                }
            }
        });
    }, [currentTime, events, handleDeadlineTrigger, handleProjectDeadline, isPaused]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleTogglePause = () => {
    const currentlyPaused = isPausedRef.current;
    const newPausedState = !currentlyPaused;
    setIsPaused(newPausedState);

    // If we are resuming...
    if (currentlyPaused) {
      const queue = [...actionQueueRef.current];
      if (queue.length > 0) {
        addNotification(`Executing ${queue.length} queued action(s)...`);
        setActionQueue([]); // Clear queue immediately to prevent re-execution

        const processQueue = async () => {
          for (const action of queue) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Stagger actions slightly
            await action();
          }
        };
        processQueue();
      }
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView(user.isAdmin ? View.Admin : View.Inbox);
    setSelectedThreadId(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSendEmail = async (email: Omit<Email, 'id' | 'timestamp' | 'from'>) => {
    if (!currentUser) return;

    const capturedIsComposing = isComposing;
    const capturedSelectedThreadId = selectedThreadId;

    const sendEmailAction = async () => {
      setIsLoading(true);
      setError(null);

      const newEmail: Email = {
        ...email,
        id: `email-${Date.now()}`,
        from: currentUser.email,
        timestamp: new Date(currentTime).getTime(),
      };

      let threadForAiReply: Thread;

      if (capturedIsComposing === 'reply' && capturedSelectedThreadId) {
        const originalThread = threads.find(t => t.id === capturedSelectedThreadId);
        if (!originalThread) {
          setError("Error: Could not find thread to reply to.");
          setIsLoading(false);
          return;
        }
        threadForAiReply = {
          ...originalThread,
          emails: [...originalThread.emails, newEmail],
          participants: Array.from(new Set([...originalThread.participants, newEmail.from, ...newEmail.to, ...(newEmail.cc || [])])),
          userStatuses: { ...originalThread.userStatuses, [currentUser.email]: ThreadStatus.Active }
        };
        setThreads(prevThreads => prevThreads.map(t => t.id === capturedSelectedThreadId ? threadForAiReply : t));
      } else {
        const threadId = `thread-${Date.now()}`;
        threadForAiReply = {
          id: threadId,
          emails: [newEmail],
          participants: Array.from(new Set([currentUser.email, ...newEmail.to, ...(newEmail.cc || [])])),
          userStatuses: {},
        };
        threadForAiReply.participants.forEach(p => threadForAiReply.userStatuses[p] = ThreadStatus.Active);
        setThreads(prev => [threadForAiReply, ...prev]);
        setSelectedThreadId(threadId);
      }

      try {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
        await handleAiReplyGeneration(threadForAiReply, currentUser);
      } catch (e) {
        console.error('Failed to generate reply:', e);
        setError('An AI coworker seems to be having trouble replying. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isPausedRef.current) {
      setActionQueue(prev => [...prev, sendEmailAction]);
      addNotification('Email queued. It will be sent when you resume.');
    } else {
      await sendEmailAction();
    }

    setIsComposing(false);
  };

  const handleDeleteThread = (threadId: string) => {
    if (!currentUser) return;
    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id === threadId) {
        const newUserStatuses = { ...t.userStatuses, [currentUser.email]: ThreadStatus.Deleted };
        return { ...t, userStatuses: newUserStatuses };
      }
      return t;
    }));
    if(selectedThreadId === threadId) {
      setSelectedThreadId(null);
    }
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    const userEmailToDelete = users[usernameToDelete]?.email;
    if (userEmailToDelete) {
      setThreads(prevThreads => prevThreads.map(t => {
        const newParticipants = t.participants.filter(p => p !== userEmailToDelete);
        const newUserStatuses = { ...t.userStatuses };
        delete newUserStatuses[userEmailToDelete];
        return { ...t, participants: newParticipants, userStatuses: newUserStatuses };
      }).filter(t => t.participants.length > 0));
    }
    const newUsers = { ...users };
    delete newUsers[usernameToDelete];
    setUsers(newUsers);
  };

  const handleCreateUser = (newUser: Omit<User, 'id'> & { password: string }) => {
    if (users[newUser.username] || newUser.username === 'admin') {
      alert('Username already exists.');
      return false;
    }
    setUsers(prev => ({...prev, [newUser.username]: newUser}));
    return true;
  };

  const handleUpdateUser = (username: string, data: Partial<Omit<User, 'id' | 'username' | 'password'>> & { password?: string | null }) => {
    setUsers(prev => {
      const updatedUsers = { ...prev };
      const currentUserData = updatedUsers[username];
      if (currentUserData) {
        const { password, ...restOfData } = data;
        updatedUsers[username] = { ...currentUserData, ...restOfData };
        if (password) {
          updatedUsers[username].password = password;
        }
      }
      return updatedUsers;
    });
    if (currentUser && currentUser.username === username) {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const { password, ...restOfData } = data;
            return { ...prevUser, ...restOfData };
        });
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'status' | 'threadId'>) => {
    if (!currentUser) return;

    const createProjectAction = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const projectMembers = allContacts.filter(c => projectData.memberEmails.includes(c.email));
            const kickoffThread = await generateProjectKickoffThread(projectData, projectMembers, currentUser, companyProfile);

            if (kickoffThread) {
                playNotificationSound();
                const newProject: Project = {
                    ...projectData,
                    id: `proj-${Date.now()}`,
                    threadId: kickoffThread.id,
                    status: 'Active'
                };
                setProjects(prev => [...prev, newProject]);
                setThreads(prev => [kickoffThread, ...prev]);

                if (newProject.deadline && newProject.completionRecipientEmail) {
                    const deadlineEvent: Omit<Event, 'id'> = {
                        title: `DEADLINE: Project ${newProject.name}`,
                        description: `Final work for project ${newProject.name} is due.`,
                        start: newProject.deadline,
                        end: newProject.deadline,
                        allDay: true,
                        isSystem: true,
                        projectId: newProject.id,
                    };
                    handleCreateEvent(deadlineEvent);
                }
                addNotification(`Project "${projectData.name}" created and kickoff email sent!`);
            } else {
                throw new Error("Could not generate the project kickoff thread.");
            }
        } catch (e) {
            console.error('Failed to create project:', e);
            setError('Failed to create the project. The AI might be unavailable.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isPausedRef.current) {
        setActionQueue(prev => [...prev, createProjectAction]);
        addNotification(`Project creation for "${projectData.name}" is queued.`);
    } else {
        await createProjectAction();
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    const updateProjectAction = () => {
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));

      setEvents(prev => prev.filter(e => !(e.isSystem && e.projectId === updatedProject.id)));

      if (updatedProject.deadline && updatedProject.completionRecipientEmail) {
        const deadlineEvent: Omit<Event, 'id'> = {
            title: `DEADLINE: Project ${updatedProject.name}`,
            description: `Final work for project ${updatedProject.name} is due.`,
            start: updatedProject.deadline,
            end: updatedProject.deadline,
            allDay: true,
            isSystem: true,
            projectId: updatedProject.id,
        };
        handleCreateEvent(deadlineEvent);
      }

      if (!updatedProject.threadId) return;

      const body = `The details for project "${updatedProject.name}" have been updated.\n\nNew Status: ${updatedProject.status}\nMembers: ${updatedProject.memberEmails.join(', ')}`;
      const systemEmail: Email = {
          id: `email-proj-update-${Date.now()}`,
          from: 'system.notifications@elitesoftware.tech',
          to: updatedProject.memberEmails,
          subject: `[Update] ${updatedProject.name}`,
          body,
          signature: 'This is an automated system notification.',
          timestamp: new Date(currentTime).getTime(),
      };

      addAiEmailToThread(updatedProject.threadId, systemEmail);
      addNotification("Project updated and members notified.");
    };

    if (isPausedRef.current) {
        setActionQueue(prev => [...prev, updateProjectAction]);
        addNotification(`Update for project "${updatedProject.name}" is queued.`);
    } else {
        updateProjectAction();
    }
  }

  const handleViewProjectThread = (threadId?: string) => {
    if (threadId) {
        setView(View.Inbox);
        setSelectedThreadId(threadId);
    } else {
        alert("This project does not have a linked email thread.");
    }
  };

  const handleSendBroadcast = (emailContent: { subject: string; body: string }) => {
    if (!currentUser || !currentUser.isAdmin) return;

    sendBroadcastEmailToAll({
        subject: `[Company Broadcast] ${emailContent.subject}`,
        body: emailContent.body,
    });
    playNotificationSound();
    addNotification('Broadcast sent successfully to all users and AI staff.');
  };

  const handleCreateCoworker = (newCoworker: Coworker) => { setGlobalCoworkers(prev => [...prev, newCoworker]); }
  const handleUpdateCoworker = (updatedCoworker: Coworker) => { setGlobalCoworkers(prev => prev.map(c => c.id === updatedCoworker.id ? updatedCoworker : c)); }
  const handleDeleteCoworker = (coworkerId: string) => { setGlobalCoworkers(prev => prev.filter(c => c.id !== coworkerId)); }

  const handleTotalReset = () => {
    if (confirm('ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete all users, emails, projects, and coworkers from your browser storage. The application will be reset to its original state. This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    try {
        const allData = { users, threads, globalCoworkers, projects, companyProfile, roles, events, currentTime, imConversations, imMessages, socialPosts };
        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elitesoftware-backup-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addNotification("Data exported successfully!");
    } catch(err) {
        console.error("Failed to export data", err);
        addNotification("An error occurred while exporting your data.");
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("Are you sure you want to import data? This will overwrite all current users, emails, and settings.")) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("File could not be read");
            const importedData = JSON.parse(text);

            if (!importedData.users || !importedData.threads || !importedData.globalCoworkers) {
                throw new Error("Invalid or corrupted data file.");
            }

            setUsers(importedData.users);
            setThreads(importedData.threads || []);
            setGlobalCoworkers(importedData.globalCoworkers);
            setProjects(importedData.projects || []);
            setCompanyProfile(importedData.companyProfile || { tagline: '', rules: [] });
            setRoles(importedData.roles || []);
            setEvents(importedData.events || []);
            setCurrentTime(importedData.currentTime || new Date().toISOString());
            setImConversations(importedData.imConversations || []);
            setImMessages(importedData.imMessages || []);
            setSocialPosts(importedData.socialPosts || []);

            addNotification("Data imported successfully! The application will now reload.");
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            console.error("Failed to import data", err);
            addNotification(`An error occurred while importing: ${err.message}`);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

    const handleAdvanceTime = (amount: number, unit: 'hours' | 'days') => {
        const newDate = new Date(currentTime);
        if (unit === 'hours') { newDate.setHours(newDate.getHours() + amount); }
        else if (unit === 'days') { newDate.setDate(newDate.getDate() + amount); }
        setCurrentTime(newDate.toISOString());
    };

    const handleUpdateEvent = (updatedEvent: Event) => {
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        if (!updatedEvent.isSystem) {
            sendBroadcastEmailToAll({
                subject: `[Event Update] ${updatedEvent.title}`,
                body: `An event on the company calendar has been updated.\n\nTitle: ${updatedEvent.title}\nStarts: ${new Date(updatedEvent.start).toLocaleString()}\nEnds: ${new Date(updatedEvent.end).toLocaleString()}\n\nDescription:\n${updatedEvent.description}`
            });
            playNotificationSound();
        }
    };
    const handleDeleteEvent = (eventId: string) => {
        const eventToDelete = events.find(e => e.id === eventId);
        if(eventToDelete) {
            setEvents(prev => prev.filter(e => e.id !== eventId));
            if (!eventToDelete.isSystem) {
                sendBroadcastEmailToAll({
                    subject: `[Event Canceled] ${eventToDelete.title}`,
                    body: `The following event has been canceled and removed from the company calendar:\n\nTitle: ${eventToDelete.title}\nOriginally Scheduled for: ${new Date(eventToDelete.start).toLocaleString()}`
                });
                playNotificationSound();
            }
        }
    };

    const onToggleSoundsMuted = () => {
      setAreSoundsMuted(prev => !prev);
    }

    // ----- Instant Messenger Logic -----

    const handleCreateIMConversation = (participantEmails: string[]) => {
        if (!currentUser) return;
        const allParticipants = Array.from(new Set([currentUser.email, ...participantEmails]));
        if (allParticipants.length < 2) return;

        // Check if a conversation with these exact participants already exists
        const existingConvo = imConversations.find(c =>
            c.participantEmails.length === allParticipants.length &&
            c.participantEmails.every(p => allParticipants.includes(p))
        );
        if(existingConvo) {
            setView(View.Messenger);
            return;
        }

        const newConversation: IMConversation = {
            id: `im-convo-${Date.now()}`,
            participantEmails: allParticipants,
        };
        setImConversations(prev => [newConversation, ...prev]);
        setView(View.Messenger);
    };

    const triggerAiImReply = useCallback(async (conversation: IMConversation, replyingAi: Coworker) => {
        if (isPausedRef.current) return;
        const typingIndicatorId = `im-typing-${replyingAi.email}-${Date.now()}`;
        const typingMessage: IMMessage = {
            id: typingIndicatorId, conversationId: conversation.id, senderEmail: replyingAi.email, content: '...', isTyping: true, timestamp: Date.now()
        };
        setImMessages(prev => [...prev, typingMessage]);

        try {
            const aiResponse = await generateIMReply(conversation, imMessagesRef.current, allContacts, companyProfile, replyingAi);

            setImMessages(prev => prev.filter(m => m.id !== typingIndicatorId));

            if (aiResponse) {
                if (aiResponse.text) {
                    const aiMessage: IMMessage = {
                        id: `im-msg-ai-${Date.now()}`,
                        conversationId: conversation.id,
                        senderEmail: replyingAi.email,
                        content: aiResponse.text,
                        timestamp: new Date(currentTime).getTime(),
                    };
                    setImMessages(prev => [...prev, aiMessage]);
                    playNotificationSound();
                }

                if (aiResponse.action) {
                    setTimeout(() => handleExecuteAiAction(aiResponse.action!), 1000);
                }
            }
        } catch (e) {
            console.error(`AI ${replyingAi.name} failed to reply in IM:`, e);
            setImMessages(prev => prev.filter(m => m.id !== typingIndicatorId)); // Clean up typing indicator on error
        }
    }, [allContacts, companyProfile, currentTime, playNotificationSound, handleExecuteAiAction]);


    const handleSendIMMessage = async (conversationId: string, content: string) => {
        if (!currentUser) return;
        const conversation = imConversations.find(c => c.id === conversationId);
        if(!conversation) return;

        const newMessage: IMMessage = {
            id: `im-msg-${Date.now()}`,
            conversationId,
            senderEmail: currentUser.email,
            content,
            timestamp: new Date(currentTime).getTime(),
        };
        setImMessages(prev => [...prev, newMessage]);

        // Let all AIs in the chat have a chance to respond
        const aiParticipants = conversation.participantEmails
            .map(email => globalCoworkers.find(c => c.email === email))
            .filter((c): c is Coworker => !!c);

        aiParticipants.forEach((ai) => {
            // Give each AI a chance to reply, with a random delay
            if (Math.random() > 0.3) { // 70% chance to reply
                setTimeout(() => {
                    if (isPausedRef.current) return;
                    triggerAiImReply(conversation, ai);
                }, 8000 + Math.random() * 7000); // 8 - 15 second delay
            }
        });
    };

  const composeContacts = useMemo(() => {
    const contactsAsCoworkers: Coworker[] = allContacts.map((c): Coworker => {
      if ('personality' in c) { // It is a Coworker
          return c;
      }
      // It is a User, so we must construct a Coworker from it.
      const user = c; // c is narrowed to User here
      return {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          domain: user.domain,
          personality: 'A registered user.',
          age: user.age,
          birthday: user.birthday,
          signature: user.signature,
          role: user.role,
          department: user.department,
          reportsTo: user.reportsTo,
          isAdmin: user.isAdmin,
      };
    });
    return Array.from(new Map(contactsAsCoworkers.map(c => [c.email, c])).values());
  }, [allContacts]);

  const threadsForView = useMemo(() => {
    if (!currentUser) return [];
    return threads
      .filter(t => t.participants.includes(currentUser.email) && t.userStatuses[currentUser.email] === ThreadStatus.Active)
      .sort((a, b) => {
        const lastEmailA = a.emails[a.emails.length - 1];
        const lastEmailB = b.emails[b.emails.length - 1];
        return (lastEmailB?.timestamp || 0) - (lastEmailA?.timestamp || 0);
      });
  }, [threads, currentUser]);

  // ----- Social Media Logic -----
    const handleCreateSocialPost = (content: string) => {
        if (!currentUser) return;
        const newPost: SocialPost = {
            id: `post-${Date.now()}`,
            authorEmail: currentUser.email,
            content,
            timestamp: new Date(currentTime).getTime(),
            likes: [],
            comments: [],
        };
        setSocialPosts(prev => [newPost, ...prev]);
    };

    const handleCreateSocialComment = (postId: string, content: string) => {
        if (!currentUser) return;
        setSocialPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const newComment = {
                    id: `comment-${Date.now()}`,
                    postId,
                    authorEmail: currentUser.email,
                    content,
                    timestamp: new Date(currentTime).getTime(),
                };
                return { ...post, comments: [...post.comments, newComment] };
            }
            return post;
        }));
    };

    const handleToggleLike = (postId: string) => {
        if (!currentUser) return;
        setSocialPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const hasLiked = post.likes.includes(currentUser.email);
                const newLikes = hasLiked
                    ? post.likes.filter(email => email !== currentUser.email)
                    : [...post.likes, currentUser.email];
                return { ...post, likes: newLikes };
            }
            return post;
        }));
    };

    // Proactive AI Social Media Activity
    useEffect(() => {
        if (!currentUser || isPaused) return;

        const triggerAiSocialActivity = async () => {
            if (isPausedRef.current || document.hidden) return;
            const actionChance = Math.random();

            // 20% chance to post
            if (actionChance < 0.2 || socialPosts.length === 0) {
                const potentialPosters = globalCoworkers.filter(c => c.email !== currentUser.email);
                if (potentialPosters.length > 0) {
                    const poster = potentialPosters[Math.floor(Math.random() * potentialPosters.length)];
                    const isBrendaPostingAsCompany = poster.email === 'brenda.miller@elitesoftware.tech' && Math.random() < 0.3; // 30% chance for Brenda to post as company
                    const authorForPost = isBrendaPostingAsCompany ? allContacts.find(c => c.email === COMPANY_SOCIAL_PROFILE_EMAIL) as Coworker : poster;

                    const postContent = await generateSocialMediaPost(authorForPost, companyProfile, authorForPost.email === COMPANY_SOCIAL_PROFILE_EMAIL);
                    if (postContent) {
                        const newPost: SocialPost = {
                            id: `post-${Date.now()}`, authorEmail: authorForPost.email, content: postContent.content,
                            timestamp: new Date(currentTime).getTime(), likes: [], comments: []
                        };
                        setSocialPosts(prev => [newPost, ...prev]);
                    }
                }
            }
            // 40% chance to comment
            else if (actionChance < 0.6 && socialPosts.length > 0) {
                const postToCommentOn = socialPosts[Math.floor(Math.random() * socialPosts.length)];
                const potentialCommenters = globalCoworkers.filter(c => c.email !== postToCommentOn.authorEmail && !postToCommentOn.comments.some(comm => comm.authorEmail === c.email));
                if (potentialCommenters.length > 0) {
                    const commenter = potentialCommenters[Math.floor(Math.random() * potentialCommenters.length)];
                    const postAuthor = allContacts.find(c => c.email === postToCommentOn.authorEmail);
                    const commentData = await generateSocialMediaComment(
                        commenter,
                        { authorName: postAuthor?.name || 'Someone', content: postToCommentOn.content },
                        postToCommentOn.comments.map(c => ({ authorName: allContacts.find(p => p.email === c.authorEmail)?.name || 'Unknown', content: c.content})),
                        companyProfile
                    );
                    if(commentData) {
                        setSocialPosts(prev => prev.map(p => {
                            if (p.id === postToCommentOn.id) {
                                return {...p, comments: [...p.comments, { id: `comment-${Date.now()}`, postId: p.id, authorEmail: commenter.email, content: commentData.content, timestamp: new Date(currentTime).getTime() }]};
                            }
                            return p;
                        }))
                    }
                }
            }
        };

        const randomInterval = 240000 + Math.random() * 180000; // 4-7 minutes
        const timerId = setTimeout(triggerAiSocialActivity, randomInterval);

        return () => clearTimeout(timerId);

    }, [currentUser, globalCoworkers, companyProfile, socialPosts, allContacts, currentTime, isPaused]);

    // ----- Random Generation Logic -----

    const handleGenerateRandomCoworker = async () => {
        if (!currentUser?.isAdmin) return;
        setIsLoading(true);
        try {
            const newCoworkerProfile = await generateNewCoworkerProfile(allContacts, roles, companyProfile);
            if (newCoworkerProfile) {
                const { family, relationships, ...restOfProfile } = newCoworkerProfile;

                // Convert relationships array to object format
                const relationshipsObject = relationships?.reduce((acc, rel) => {
                    acc[rel.email] = rel.type;
                    return acc;
                }, {} as { [email: string]: 'friendly' | 'neutral' | 'rival' });

                // Convert family array to object format
                const familyObject = family?.reduce((acc, member) => {
                    acc[member.relation] = member.name;
                    return acc;
                }, {} as { [key: string]: string });

                const newCoworker: Coworker = {
                    ...restOfProfile,
                    id: `coworker-${Date.now()}`,
                    company: 'EliteSoftware Co. Limited',
                    domain: 'elitesoftware.tech',
                    relationships: relationshipsObject,
                    family: familyObject,
                };
                handleCreateCoworker(newCoworker);
                addNotification(`New AI coworker "${newCoworker.name}" has been hired!`);
            }
        } catch (e) {
            console.error("Failed to generate random coworker:", e);
            addNotification("The AI had trouble generating a new coworker profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateRandomProject = async () => {
        if (!currentUser?.isAdmin) return;
        setIsLoading(true);
        try {
            const newProjectIdea = await generateNewProjectIdea(allContacts, companyProfile);
            if (newProjectIdea) {
                await handleCreateProject(newProjectIdea);
            }
        } catch (e) {
            console.error("Failed to generate random project:", e);
            addNotification("The AI had trouble coming up with a new project. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateRandomEvent = async () => {
        if (!currentUser?.isAdmin) return;
        setIsLoading(true);
        try {
            const newEventIdea = await generateNewCompanyEvent(companyProfile);
            if (newEventIdea) {
                const start = new Date(currentTime);
                start.setDate(start.getDate() + (Math.floor(Math.random() * 5) + 3)); // 3-7 days from now
                start.setHours(Math.floor(Math.random() * 8) + 9, 0, 0, 0); // Random time between 9am-4pm
                const end = new Date(start.getTime() + (Math.floor(Math.random() * 3) + 1) * 60 * 60 * 1000); // 1-3 hours long

                const newEvent: Omit<Event, 'id'> = {
                    ...newEventIdea,
                    start: start.toISOString(),
                    end: end.toISOString(),
                };
                handleCreateEvent(newEvent);
                addNotification(`New event "${newEvent.title}" has been added to the calendar!`);
            }
        } catch(e) {
            console.error("Failed to generate random event:", e);
            addNotification("The AI had trouble creating a new event. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

  if (!bootComplete) {
    return <BootSequence onComplete={() => setBootComplete(true)} />;
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} onCreateUser={handleCreateUser} users={users} />;
  }

  const selectedThread = threads.find(t => t.id === selectedThreadId) || null;

  const renderView = () => {
    switch (view) {
      case View.Admin:
         if (!currentUser.isAdmin) return null;
         const allUsers = Object.entries(users).map(([username, u]) => ({...u, id: username, username}));
         return <AdminView
                  currentUser={currentUser} users={allUsers} onDeleteUser={handleDeleteUser} onCreateUser={handleCreateUser} onUpdateUser={handleUpdateUser}
                  globalCoworkers={globalCoworkers} onCreateCoworker={handleCreateCoworker} onUpdateCoworker={handleUpdateCoworker} onDeleteCoworker={handleDeleteCoworker}
                  onSendBroadcast={handleSendBroadcast}
                  companyProfile={companyProfile} onUpdateCompanyProfile={setCompanyProfile} roles={roles} onUpdateRoles={setRoles}
                  onTotalReset={handleTotalReset} onImportData={handleImportData} onExportData={handleExportData}
                  onGenerateRandomCoworker={handleGenerateRandomCoworker}
                  addNotification={addNotification}
                  areSoundsMuted={areSoundsMuted}
                  onToggleSoundsMuted={onToggleSoundsMuted}
                />;
      case View.Directory: return <DirectoryView allContacts={allContacts} />;
      case View.OrgChart: return <OrgChartView allContacts={allContacts} />;
      case View.Relationships: return <RelationshipsView allContacts={allContacts} />;
      case View.Schedule:
        return <ScheduleView
                    events={events} currentTime={new Date(currentTime)} isAdmin={currentUser.isAdmin || false}
                    onCreateEvent={handleCreateEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent}
                    onGenerateRandomEvent={handleGenerateRandomEvent}
                />;
      case View.Messenger:
        return <InstantMessengerView
                    currentUser={currentUser}
                    conversations={imConversations}
                    messages={imMessages}
                    allContacts={allContacts}
                    onCreateConversation={handleCreateIMConversation}
                    onSendMessage={handleSendIMMessage}
                />;
      case View.Projects:
        return <ProjectsView
                    currentUser={currentUser}
                    projects={projects}
                    allContacts={allContacts}
                    onCreateProject={handleCreateProject}
                    onUpdateProject={handleUpdateProject}
                    onNavigateToThread={handleViewProjectThread}
                    onGenerateRandomProject={handleGenerateRandomProject}
                    addNotification={addNotification}
                />;
      case View.SocialMedia:
        return <SocialMediaView
                    currentUser={currentUser}
                    posts={socialPosts}
                    allContacts={allContacts}
                    onCreatePost={handleCreateSocialPost}
                    onCreateComment={handleCreateSocialComment}
                    onToggleLike={handleToggleLike}
                />;
      case View.Inbox:
      default:
        return (
          <InboxView
            currentUser={currentUser}
            threads={threadsForView} selectedThread={selectedThread} onSelectThread={setSelectedThreadId}
            onDeleteThread={handleDeleteThread} onComposeReply={() => setIsComposing('reply')}
            isLoading={isLoading} error={error}
          />
        );
    }
  };

  return (
     <div className="w-full h-screen p-0 sm:p-4 md:p-8 flex items-center justify-center font-sans antialiased text-shadow shadow-black/30 dark:shadow-black/70">
        <div className="w-full h-full max-w-screen-xl mx-auto flex flex-col bg-slate-200/50 dark:bg-black/40 backdrop-blur-xl rounded-none sm:rounded-lg shadow-vista border border-white/30 overflow-hidden">
            <div className="fixed top-20 right-4 z-[60] w-full max-w-sm space-y-2">
                {notifications.map(n => (
                    <div key={n.id} className="p-3 bg-vista-blue-dark/90 text-white rounded-md shadow-lg text-sm animate-pulse">
                        {n.message}
                    </div>
                ))}
            </div>
            {isComposing && (
                <ComposeEmail
                user={currentUser} contacts={composeContacts} onClose={() => setIsComposing(false)} onSend={handleSendEmail}
                mode={isComposing} thread={selectedThread}
                />
            )}
            <header className="h-7 bg-vista-header-bg flex items-center justify-between px-2 flex-shrink-0 border-b border-black/20">
                <div className="flex items-center gap-2">
                    <EliteSoftwareLogoIcon className="w-5 h-5 text-slate-700" />
                    <h1 className="text-sm text-black/80 font-bold" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>EliteSoftware Client</h1>
                </div>
                <div className="flex items-center gap-4 h-full text-black/80 font-bold text-sm" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>
                    {currentUser.isAdmin && (
                        <div className="flex items-center gap-2">
                             <button onClick={() => handleAdvanceTime(1, 'hours')} disabled={isPaused} className="text-xs btn-aqua !py-0 !px-2 !font-semibold disabled:opacity-50 disabled:cursor-not-allowed">{'Adv >'}</button>
                             <button onClick={() => handleAdvanceTime(1, 'days')} disabled={isPaused} className="text-xs btn-aqua !py-0 !px-2 !font-semibold disabled:opacity-50 disabled:cursor-not-allowed">{'Adv >>'}</button>
                        </div>
                    )}
                    <button onClick={handleTogglePause} className="btn-aqua !py-0 !px-2 flex items-center gap-1.5">
                        {isPaused ? <PlayIcon className="w-4 h-4"/> : <PauseIcon className="w-4 h-4" />}
                        <span className="text-xs font-semibold">{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    {isPaused && (
                      <div className="hidden sm:flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 font-bold animate-pulse" style={{textShadow: '0 1px 1px rgba(0,0,0,0.5)'}}>
                        <PauseIcon className="w-4 h-4" />
                        <span>PAUSED</span>
                      </div>
                    )}
                    <div className="hidden sm:block">
                        {new Date(currentTime).toLocaleString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </div>
                </div>
                 <div className="flex items-center gap-2 h-full">
                    <UserMenu user={currentUser} onToggleTheme={handleToggleTheme} onLogout={handleLogout} theme={theme} />
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                <Sidebar
                currentView={view} setView={setView} onCompose={() => setIsComposing('new')}
                isAdmin={currentUser.isAdmin || false}
                />
                <main className="flex-1 flex flex-col bg-slate-50 dark:bg-retro-gray-800/50 p-1 sm:p-2 gap-2">
                {currentUser ? renderView() : <div className="flex-1 flex items-center justify-center">Loading user data...</div>}
                </main>
            </div>

            <footer className="h-5 bg-vista-header-bg border-t border-black/20 px-2 flex items-center flex-shrink-0">
                <p className="text-xs text-slate-700" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>&copy; EliteSoftware Co. Limited</p>
            </footer>
        </div>
    </div>
  );
}