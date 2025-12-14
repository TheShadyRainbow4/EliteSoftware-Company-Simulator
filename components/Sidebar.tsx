import React from 'react';
import { View } from '../types';
import { InboxIcon } from './icons/InboxIcon';
import { DirectoryIcon } from './icons/DirectoryIcon';
import { ComposeIcon } from './icons/ComposeIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { OrgChartIcon } from './icons/OrgChartIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { MessengerIcon } from './icons/MessengerIcon';
import { ProjectIcon } from './icons/ProjectIcon';
import { UsersIcon } from './icons/UsersIcon';
import { HeartIcon } from './icons/HeartIcon';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onCompose: () => void;
  isAdmin: boolean;
}

export default function Sidebar({ currentView, setView, onCompose, isAdmin }: SidebarProps) {
  const navItems = [
    { view: View.Inbox, label: 'Inbox', icon: InboxIcon },
    { view: View.Schedule, label: 'Schedule', icon: CalendarIcon },
    { view: View.Projects, label: 'Projects', icon: ProjectIcon },
    { view: View.Directory, label: 'Company Directory', icon: DirectoryIcon },
    { view: View.OrgChart, label: 'Org Chart', icon: OrgChartIcon },
  ];

  const socialItems = [
    { view: View.Relationships, label: 'Relationships', icon: HeartIcon, className: 'btn-teal-relationships' },
    { view: View.Messenger, label: 'Messenger', icon: MessengerIcon, className: 'btn-pink-messenger' },
    { view: View.SocialMedia, label: 'DramaBox Feed', icon: UsersIcon, className: 'btn-purple-dramabox' },
  ];

  const adminItem = { view: View.Admin, label: 'Elite Admin Console', icon: ShieldIcon };


  return (
    <nav className="w-56 bg-slate-200/50 border-r border-black/20 p-2 flex flex-col gap-1 flex-shrink-0">
      <button
        onClick={onCompose}
        className="flex items-center justify-center gap-2 w-full p-2 mb-2 text-base btn-aqua"
      >
        <ComposeIcon className="w-5 h-5" />
        <span>Compose</span>
      </button>

      <div className="flex-grow">
          {navItems.map(({ view, label, icon: Icon }) => {
            const isActive = currentView === view;
            return (
              <button
                key={view}
                onClick={() => setView(view)}
                className={`sidebar-btn-glossy ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            );
          })}
      </div>

      <div className="flex-shrink-0 space-y-2 pt-2 border-t border-black/20">
        {socialItems.map(({ view, label, icon: Icon, className }) => (
            <button
                key={view}
                onClick={() => setView(view)}
                className={`${className} ${currentView === view ? 'active' : ''}`}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
            </button>
        ))}
        {isAdmin && (
           <button
              key={adminItem.view}
              onClick={() => setView(adminItem.view)}
              className={`btn-green-admin ${currentView === adminItem.view ? 'active' : ''}`}
           >
              <adminItem.icon className="w-5 h-5" />
              <span>{adminItem.label}</span>
           </button>
        )}
      </div>
    </nav>
  );
}