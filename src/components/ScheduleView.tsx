import React, { useState, useMemo } from 'react';
import { Event } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import EventModal from './EventModal';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface ScheduleViewProps {
    events: Event[];
    currentTime: Date;
    isAdmin: boolean;
    onCreateEvent: (event: Omit<Event, 'id'>) => void;
    onUpdateEvent: (event: Event) => void;
    onDeleteEvent: (id: string) => void;
    onGenerateRandomEvent: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleView({ events, currentTime, isAdmin, onCreateEvent, onUpdateEvent, onDeleteEvent, onGenerateRandomEvent }: ScheduleViewProps) {
    const [viewDate, setViewDate] = useState(new Date(currentTime));
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState<Date | null>(null);
    
    const { month, year, calendarGrid } = useMemo(() => {
        const month = viewDate.getMonth();
        const year = viewDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let calendarGrid: (Date | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            calendarGrid.push(new Date(year, month, i));
        }
        
        return { month, year, calendarGrid };
    }, [viewDate]);
    
    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const handleToday = () => setViewDate(new Date());

    const openEventModal = (event: Event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const openNewEventModal = (date: Date) => {
        setSelectedEvent(null);
        setModalDate(date);
        setIsModalOpen(true);
    }
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        setModalDate(null);
    };

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    return (
        <>
            {isModalOpen && (
                <EventModal 
                    event={selectedEvent}
                    selectedDate={modalDate}
                    onClose={closeModal}
                    onCreate={onCreateEvent}
                    onUpdate={onUpdateEvent}
                    onDelete={onDeleteEvent}
                />
            )}
            <div className="flex flex-col h-full bg-white dark:bg-retro-gray-900 shadow-inner-dark rounded-md border border-black/30 overflow-hidden">
                <header className="p-4 bg-vista-header-bg border-b border-black/20 flex-shrink-0 flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Company Schedule</h2>
                        <p className="text-sm text-slate-700" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={handlePrevMonth} className="btn-aqua-gray text-lg font-bold">&larr;</button>
                         <button onClick={handleToday} className="btn-aqua-gray">Today</button>
                         <button onClick={handleNextMonth} className="btn-aqua-gray text-lg font-bold">&rarr;</button>
                         {isAdmin && (
                            <button onClick={onGenerateRandomEvent} className="btn-aqua flex items-center gap-1.5" title="Generate Random Event">
                                <MagicWandIcon className="w-4 h-4"/>
                            </button>
                         )}
                    </div>
                </header>
                
                <div className="flex-grow grid grid-cols-7 overflow-y-auto">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="text-center font-bold text-sm py-2 border-b-2 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">{day}</div>
                    ))}
                    {calendarGrid.map((date, index) => {
                        const isToday = date ? isSameDay(date, new Date(currentTime)) : false;
                        const eventsOnDay = date ? events.filter(e => {
                            const showEvent = isAdmin || !e.isSystem;
                            return showEvent && isSameDay(new Date(e.start), date)
                        }) : [];
                        return (
                             <div 
                                key={index} 
                                className={`relative p-1.5 border-b border-r border-slate-200 dark:border-slate-800 min-h-[100px] flex flex-col group ${date ? 'bg-white dark:bg-retro-gray-900' : 'bg-slate-50 dark:bg-retro-gray-900/50'}`}
                             >
                                {date && (
                                    <>
                                        <div className={`text-xs font-bold ${isToday ? 'bg-vista-blue-dark text-white rounded-full w-5 h-5 flex items-center justify-center' : ''}`}>{date.getDate()}</div>
                                        {isAdmin && (
                                            <button 
                                                onClick={() => openNewEventModal(date)}
                                                className="absolute top-1 right-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label="Add Event"
                                            >
                                                <PlusIcon className="w-3 h-3"/>
                                            </button>
                                        )}
                                        <div className="mt-1 space-y-1 overflow-y-auto">
                                            {eventsOnDay.map(event => {
                                                const eventStyle = event.isSystem 
                                                    ? 'bg-slate-200 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 italic'
                                                    : 'bg-vista-blue-light dark:bg-vista-blue-dark/80 text-black dark:text-white';
                                                
                                                return (
                                                    <button 
                                                        key={event.id}
                                                        onClick={() => openEventModal(event)} 
                                                        className={`w-full text-left text-xs p-1 rounded-sm shadow-sm ${eventStyle} ${isAdmin ? 'hover:ring-2 hover:ring-vista-blue-dark' : 'cursor-default'}`}
                                                        disabled={!isAdmin}
                                                    >
                                                        <p className="font-semibold truncate">{event.title}</p>
                                                        {!event.allDay && <p>{new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );
}