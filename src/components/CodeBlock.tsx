import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface CodeBlockProps {
    language: string;
    code: string;
}

const LANGUAGE_MAP: { [key: string]: { name: string, extension: string } } = {
    javascript: { name: 'JavaScript', extension: 'js' },
    js: { name: 'JavaScript', extension: 'js' },
    python: { name: 'Python', extension: 'py' },
    py: { name: 'Python', extension: 'py' },
    powershell: { name: 'PowerShell', extension: 'ps1' },
    shell: { name: 'Shell Script', extension: 'sh' },
    bash: { name: 'Bash', extension: 'sh' },
    html: { name: 'HTML', extension: 'html' },
    css: { name: 'CSS', extension: 'css' },
    json: { name: 'JSON', extension: 'json' },
    sql: { name: 'SQL', extension: 'sql' },
    typescript: { name: 'TypeScript', extension: 'ts' },
    ts: { name: 'TypeScript', extension: 'ts' },
    tsx: { name: 'TSX', extension: 'tsx' },
    jsx: { name: 'JSX', extension: 'jsx' },
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
    const [copyText, setCopyText] = useState('Copy');

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopyText('Copied!');
        setTimeout(() => setCopyText('Copy'), 2000);
    };

    const handleDownload = () => {
        const langDetails = LANGUAGE_MAP[language.toLowerCase()] || { name: 'Text', extension: 'txt' };
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `script-${Date.now()}.${langDetails.extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const langName = LANGUAGE_MAP[language.toLowerCase()]?.name || language;

    return (
        <div className="bg-retro-gray-800 rounded-md my-2 overflow-hidden border border-retro-gray-700">
            <div className="flex justify-between items-center bg-retro-gray-900/80 px-3 py-1 text-xs">
                <span className="font-semibold text-slate-300">{langName}</span>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownload} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                        <DownloadIcon className="w-3.5 h-3.5" />
                        Download
                    </button>
                    <button onClick={handleCopy} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                        <CopyIcon className="w-3.5 h-3.5" />
                        {copyText}
                    </button>
                </div>
            </div>
            <pre className="p-3 text-sm overflow-x-auto text-white">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};
