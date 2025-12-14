import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface EventModalProps {
    event: Event | null;
    selectedDate: Date | null;
    onClose: () => void;
    onCreate: (event: Omit<Event, 'id'>) => void;
    onUpdate: (event: Event) => void;
    onDelete: (id: string) => void;
}

export default function EventModal({ event, selectedDate, onClose, onCreate, onUpdate, onDelete }: EventModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: false
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description,
                start: event.start.substring(0, 16), // "YYYY-MM-DDTHH:mm"
                end: event.end.substring(0, 16),
                allDay: event.allDay
            });
        } else if (selectedDate) {
            const defaultStartTime = new Date(selectedDate);
            defaultStartTime.setHours(9, 0, 0, 0);
            const defaultEndTime = new Date(selectedDate);
            defaultEndTime.setHours(10, 0, 0, 0);

            setFormData({
                title: '',
                description: '',
                start: defaultStartTime.toISOString().substring(0, 16),
                end: defaultEndTime.toISOString().substring(0, 16),
                allDay: false
            });
        }
    }, [event, selectedDate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            start: new Date(formData.start).toISOString(),
            end: new Date(formData.end).toISOString(),
        };

        if (event) {
            onUpdate({ ...payload, id: event.id });
        } else {
            onCreate(payload);
        }
        onClose();
    };

    const handleDelete = () => {
        if(event && confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
            onDelete(event.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-200/90 dark:bg-retro-gray-800/90 rounded-lg shadow-vista w-full max-w-lg flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
                <header className="p-3 bg-vista-header-bg border-b border-black/20 rounded-t-lg flex justify-between items-center">
                    <h2 className="font-bold text-lg text-slate-800" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}>
                        {event ? 'Edit Event' : 'Create Event'}
                    </h2>
                    {event && (
                        <button onClick={handleDelete} className="btn-aqua-red !p-1.5" aria-label="Delete event">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    )}
                </header>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh] bg-white dark:bg-retro-gray-900/80">
                        <div>
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="mt-1 input-vista" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="mt-1 input-vista resize-y" />
                        </div>
                         <div className="flex items-center gap-3">
                            <input type="checkbox" id="allDay" name="allDay" checked={formData.allDay} onChange={handleCheckboxChange} className="vista-checkbox" />
                            <label htmlFor="allDay" className="text-sm font-semibold text-slate-600 dark:text-slate-400">All Day Event</label>
                        </div>
                        {!formData.allDay && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Start Time</label>
                                    <input type="datetime-local" name="start" value={formData.start} onChange={handleInputChange} required className="mt-1 input-vista" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">End Time</label>
                                    <input type="datetime-local" name="end" value={formData.end} onChange={handleInputChange} required className="mt-1 input-vista" />
                                </div>
                            </div>
                        )}
                    </div>
                    <footer className="p-3 bg-vista-header-bg border-t border-black/20 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="btn-aqua-gray">Cancel</button>
                        <button type="submit" className="btn-aqua">Save</button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
