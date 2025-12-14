import React, { useState } from 'react';
import { User, Coworker, SocialPost, SocialComment } from '../types';
import { ReplyIcon } from './icons/ReplyIcon';

const timeSince = (date: number) => {
    const seconds = Math.floor((new Date().getTime() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

const PostComposer = ({ currentUser, onCreatePost }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onCreatePost(content.trim());
            setContent('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-retro-gray-800/50 rounded-md border border-slate-300 dark:border-slate-700">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                className="w-full p-2 bg-white dark:bg-retro-gray-900 border border-gray-400 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-vista-blue-dark/50 text-retro-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-y"
                rows={3}
            />
            <div className="flex justify-end mt-2">
                <button type="submit" className="btn-aqua">Post</button>
            </div>
        </form>
    );
};

const Post = ({ post, currentUser, allContacts, onComment, onToggleLike }) => {
    const [comment, setComment] = useState('');
    const author = allContacts.find(c => c.email === post.authorEmail);
    const hasLiked = post.likes.includes(currentUser.email);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim()) {
            onComment(post.id, comment.trim());
            setComment('');
        }
    };

    const isCompanyPost = author?.name === "EliteSoftware Co. Limited";

    return (
        <div className="bg-white dark:bg-retro-gray-800/50 rounded-md border border-slate-300 dark:border-slate-700">
            <div className="p-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`font-bold text-slate-800 dark:text-slate-100 ${isCompanyPost ? 'text-blue-600 dark:text-blue-400' : ''}`}>{author?.name || 'Unknown User'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400" title={new Date(post.timestamp).toLocaleString()}>{timeSince(post.timestamp)} ago</p>
                    </div>
                </div>
                <p className="my-3 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <button onClick={() => onToggleLike(post.id)} className={`font-semibold ${hasLiked ? 'text-blue-600 dark:text-blue-400' : 'hover:underline'}`}>
                        Like
                    </button>
                    <span>{post.likes.length > 0 && `${post.likes.length} ${post.likes.length === 1 ? 'Like' : 'Likes'}`}</span>
                </div>
            </div>
            {post.comments.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-2">
                    {post.comments.sort((a,b) => a.timestamp - b.timestamp).map(c => {
                        const commentAuthor = allContacts.find(contact => contact.email === c.authorEmail);
                        return (
                             <div key={c.id} className="bg-slate-100 dark:bg-retro-gray-700/80 p-2 rounded-md">
                                <p className="text-sm">
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{commentAuthor?.name || 'Unknown'}: </span>
                                    <span className="text-slate-600 dark:text-slate-300">{c.content}</span>
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700 p-3">
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." className="input-vista flex-grow"/>
                    <button type="submit" className="btn-aqua p-2"><ReplyIcon className="w-4 h-4"/></button>
                </form>
            </div>
        </div>
    );
};


interface SocialMediaViewProps {
    currentUser: User;
    posts: SocialPost[];
    allContacts: (User | Coworker)[];
    onCreatePost: (content: string) => void;
    onCreateComment: (postId: string, content: string) => void;
    onToggleLike: (postId: string) => void;
}

export default function SocialMediaView({ currentUser, posts, allContacts, onCreatePost, onCreateComment, onToggleLike }: SocialMediaViewProps) {
    const sortedPosts = [...posts].sort((a,b) => b.timestamp - a.timestamp);
    return (
        <div className="flex flex-col h-full bg-white dark:bg-retro-gray-900 shadow-inner-dark rounded-md border border-black/30 overflow-hidden">
            <header className="p-4 bg-vista-header-bg border-b border-black/20 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>DramaBox Feed</h2>
                <p className="text-sm text-slate-700" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>The *real* EliteSoftware water cooler.</p>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-100 dark:bg-retro-gray-800">
                <PostComposer currentUser={currentUser} onCreatePost={onCreatePost} />
                
                {sortedPosts.map(post => (
                    <Post 
                        key={post.id} 
                        post={post}
                        currentUser={currentUser}
                        allContacts={allContacts} 
                        onComment={onCreateComment}
                        onToggleLike={onToggleLike}
                    />
                ))}
            </div>
        </div>
    );
}