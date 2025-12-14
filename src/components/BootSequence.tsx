import React, { useState, useEffect } from 'react';
import { EliteSoftwareLogoIcon } from './icons/EliteSoftwareLogoIcon';

const BiosScreen = ({ lines }) => (
  <div className="w-full h-full bg-black text-white font-mono text-sm p-4 flex flex-col">
    {lines.map((line, index) => (
      <p key={index}>{line}</p>
    ))}
    <p>
      <span className="border-r-2 border-white animate-blink-caret">&nbsp;</span>
    </p>
  </div>
);

const OsLoadingScreen = () => (
    <div className="w-full h-full bg-[#008080] flex flex-col items-center justify-center font-sans">
        <EliteSoftwareLogoIcon className="w-24 h-24 text-black/70 mb-4" />
        <div className="w-72 bg-black/50 p-1 border-2 border-t-white border-l-white border-b-black border-r-black">
            <div className="h-4 bg-blue-600 animate-progress-bar"></div>
        </div>
        <p className="text-white text-lg mt-4" style={{ textShadow: '1px 1px 2px black' }}>
            EliteSoftware <span className="font-bold">2025</span>
        </p>
    </div>
);

const WelcomeScreen = () => (
    <div className="w-full h-full bg-gradient-to-tr from-sky-500 via-cyan-400 to-teal-300 flex flex-col items-center justify-center font-sans">
        <EliteSoftwareLogoIcon className="w-28 h-28 text-white mb-6" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
        <h1 className="text-4xl font-bold text-white mb-4" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>Welcome to EliteSoftware!</h1>
        <div className="flex items-center gap-3 text-white">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <p>Loading your profile...</p>
        </div>
    </div>
);


export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [status, setStatus] = useState<'bios' | 'os' | 'welcome'>('bios');
  const [biosLines, setBiosLines] = useState<string[]>([]);

  const biosText = [
    'EliteBIOS(C) 2024 EliteSoftware Corporation, All Rights Reserved.',
    'BIOS Version: 2.5.1-PROD',
    ' ',
    'Initializing USB Controllers ... Done',
    'Initializing Network Adapter ... Done',
    'Memory Test : 16777216K OK',
    ' ',
    'Detecting Primary Master ... Elite-SATA Hard Disk (ES2025)',
    'Detecting Secondary Master ... CD-ROM Drive',
    ' ',
    'Booting from Hard Disk...',
  ];

  useEffect(() => {
    if (status === 'bios') {
      let i = 0;
      const interval = setInterval(() => {
        if (i < biosText.length) {
          setBiosLines(prev => [...prev, biosText[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStatus('os'), 800);
        }
      }, 200);
      return () => clearInterval(interval);
    } else if (status === 'os') {
      setTimeout(() => setStatus('welcome'), 4200);
    } else if (status === 'welcome') {
      setTimeout(onComplete, 2000);
    }
  }, [status, onComplete]);

  const renderScreen = () => {
    switch(status) {
        case 'bios': return <BiosScreen lines={biosLines} />;
        case 'os': return <OsLoadingScreen />;
        case 'welcome': return <WelcomeScreen />;
        default: return null;
    }
  }
  
  return (
    <div className="w-screen h-screen">
      {renderScreen()}
    </div>
  )
}
