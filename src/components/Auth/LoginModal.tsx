import React, { useState } from 'react';
import { X, User, Key, ShieldCheck, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface LoginModalProps {
  users: UserAccount[];
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  currentUser,
  onLogin,
  onClose,
}) => {
  const [username, setUsername] = useState(users[0]?.username || '');
  const [password, setPassword] = useState(users[0]?.password || '');
  const [errorMsg, setErrorMsg] = useState('');

  // 1-click instant login by user account or role
  const handleInstantLogin = (u: UserAccount) => {
    onLogin(u);
    onClose();
  };

  const handleRoleQuickLogin = (role: UserRole) => {
    const matched = users.find((u) => u.role === role);
    if (matched) {
      handleInstantLogin(matched);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password.trim()
    );
    if (matched) {
      onLogin(matched);
      onClose();
    } else {
      setErrorMsg('Invalid username or password. Check credentials below.');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'lead':
        return (
          <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
            Lead QA
          </span>
        );
      case 'deputy':
        return (
          <span className="text-[10px] uppercase font-bold text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded">
            Deputy Lead
          </span>
        );
      case 'tester':
      default:
        return (
          <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
            Tester
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-base font-semibold text-slate-100">QA Team Sign In</span>
              <p className="text-xs text-slate-400">
                Log in as Lead, Deputy Lead, or assigned Tester
              </p>
            </div>
          </div>
          {currentUser && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 1-Click Role Switch Strip */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Role Switch:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('lead')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/40 transition-colors text-center"
            >
              Lead QA
            </button>
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('deputy')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-950/40 text-sky-300 border border-sky-800/60 hover:bg-sky-900/40 transition-colors text-center"
            >
              Deputy Lead
            </button>
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('tester')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/40 transition-colors text-center"
            >
              QA Tester
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/30 border border-rose-900/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="lead, deputy, or tester name..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter password..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            Authenticate & Access Workspace
          </button>
        </form>

        {/* Quick select roster list (1-click login on click) */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Team Accounts Roster (Click to Log In)
            </span>
            <span className="text-[10px] text-slate-500">1-click login</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleInstantLogin(u)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors border group ${
                  currentUser?.id === u.id
                    ? 'border-indigo-500/50 bg-indigo-950/30 text-slate-200'
                    : 'border-slate-800/80 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{u.displayName}</span>
                  <span className="font-mono text-[11px] text-slate-500">(@{u.username})</span>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(u.role)}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
