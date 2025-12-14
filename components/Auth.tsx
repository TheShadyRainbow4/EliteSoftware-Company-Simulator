import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { DEPARTMENTS } from '../constants';
import { EliteSoftwareLogoIcon } from './icons/EliteSoftwareLogoIcon';

interface AuthProps {
    onLogin: (user: User) => void;
    onCreateUser: (newUser: Omit<User, 'id'> & { password: string }) => boolean;
    users: { [username: string]: Omit<User, 'id'> & { password: string } };
}

const LoginView = ({ onSubmit, username, setUsername, password, setPassword }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label htmlFor="login-id" className="text-sm block mb-1">Employee ID:</label>
      <input id="login-id" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g., jsmith" className="input-vista" />
    </div>
    <div>
      <label htmlFor="login-pw" className="text-sm block mb-1">Password:</label>
      <input id="login-pw" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-vista" />
    </div>
    <div className="text-sm space-y-2 pt-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="vista-checkbox" />
        <span>Remember me</span>
      </label>
       <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="vista-checkbox" />
        <span>Sign me in automatically</span>
      </label>
    </div>
    <div className="text-right pt-2">
      <button type="submit" className="btn-aqua">Sign in</button>
    </div>
  </form>
);

const SignupView = ({ onSubmit, username, setUsername, password, setPassword, name, setName, email, setEmail, company, setCompany }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <h3 className="text-lg font-semibold">Request Corporate Account</h3>
    <div>
      <label className="text-sm">Full Name:</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-vista" />
    </div>
     <div>
      <label className="text-sm">Corporate Email Address:</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-vista" />
    </div>
     <div>
      <label className="text-sm">Company:</label>
      <input type="text" value={company} onChange={e => setCompany(e.target.value)} required className="input-vista" />
    </div>
    <div>
      <label className="text-sm">Employee ID (Username):</label>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="input-vista" />
    </div>
    <div>
      <label className="text-sm">Password:</label>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-vista" />
    </div>
    <div className="text-right">
      <button type="submit" className="btn-aqua">Request Account</button>
    </div>
  </form>
)

export default function Auth({ onLogin, onCreateUser, users }: AuthProps) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');

    // State for both forms
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('EliteSoftware Co. Limited');

    // Clear form state when switching views
    useEffect(() => {
      setUsername('');
      setPassword('');
      setName('');
      setEmail('');
      setCompany('EliteSoftware Co. Limited');
      setError('');
    }, [isLoginView]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const userAccount = users[username];
        if (userAccount && userAccount.password === password) {
            onLogin({ id: username, ...userAccount });
        } else {
            setError('Invalid Employee ID or password. Please try again.');
        }
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username || !password || !name || !email || !company) {
            setError('Please fill all required fields.');
            return;
        }

        const newUser: Omit<User, 'id'> & {password: string} = {
            username,
            password,
            name,
            email,
            company,
            age: Math.floor(Math.random() * 30) + 22, // Random age between 22 and 52
            domain: email.split('@')[1] || 'domain.com',
            signature: `Best regards,\n${name}`,
            role: 'Associate',
            department: 'General',
            reportsTo: undefined,
        };

        if (onCreateUser(newUser)) {
           onLogin({ id: username, ...newUser });
        } else {
           setError('That Employee ID is already taken. Please choose another.');
        }
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-slate-200/50 dark:bg-black/30 backdrop-blur-xl rounded-lg shadow-vista border border-white/30 overflow-hidden">
                {/* Title Bar */}
                <div className="h-6 bg-vista-header-bg flex items-center px-2 border-b border-black/20">
                    <p className="text-sm text-black/80 font-bold" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>EliteSoftware Client</p>
                </div>

                <div className="flex">
                    {/* Left Pane */}
                    <div className="w-2/5 bg-slate-200/60 p-6 flex flex-col items-center justify-center text-center border-r border-black/20">
                        <EliteSoftwareLogoIcon className="w-20 h-20 mb-4 text-slate-700"/>
                        <h1 className="text-2xl font-bold text-slate-800" style={{textShadow: '0 1px 0 #fff'}}>EliteSoftware</h1>
                        <p className="text-sm text-slate-600 mt-1">Client Access</p>
                        <div className="mt-auto text-left text-sm w-full space-y-1">
                           <a href="#" onClick={(e) => {e.preventDefault(); setIsLoginView(false);}} className="text-vista-blue-login hover:underline">Request a new account</a>
                           <br/>
                           <a href="#" onClick={(e) => e.preventDefault()} className="text-vista-blue-login hover:underline">Contact IT Support</a>
                        </div>
                    </div>

                    {/* Right Pane */}
                    <div className="w-3/5 bg-slate-100/70 dark:bg-gray-700/70 p-6 text-sm text-slate-800 dark:text-slate-200">
                      {isLoginView ? (
                        <>
                          <p className="mb-4">Use your corporate account to access the EliteSoftware network.</p>
                          <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">Your address book and corporate settings are linked to your sign-in credentials.</p>
                        </>
                      ) : (
                        <p className="mb-4">Enter your details to request a new corporate account. Approvals are managed by IT.</p>
                      )}

                      {error && <div className="bg-red-200/50 border border-red-500/50 text-red-800 dark:text-red-200 px-3 py-2 rounded-md relative mb-4 text-xs" role="alert">{error}</div>}

                      {isLoginView ?
                        <LoginView onSubmit={handleLogin} username={username} setUsername={setUsername} password={password} setPassword={setPassword} /> :
                        <SignupView onSubmit={handleSignup} username={username} setUsername={setUsername} password={password} setPassword={setPassword} name={name} setName={setName} email={email} setEmail={setEmail} company={company} setCompany={setCompany} />
                      }

                      <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-3 flex justify-between items-center text-xs">
                          {isLoginView && <a href="#" onClick={(e) => e.preventDefault()} className="text-vista-blue-login hover:underline">Forgot your password?</a>}
                          <button onClick={() => { setIsLoginView(!isLoginView); }} className="text-vista-blue-login hover:underline ml-auto">
                            {isLoginView ? `Need an account?` : 'Already have an account? Sign in'}
                          </button>
                      </div>
                    </div>
                </div>

                 {/* Footer Bar */}
                <div className="h-5 bg-vista-header-bg border-t border-black/20 px-2 flex items-center">
                    <p className="text-xs text-slate-700" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>&copy; EliteSoftware Co. Limited</p>
                </div>
            </div>
        </div>
    );
}