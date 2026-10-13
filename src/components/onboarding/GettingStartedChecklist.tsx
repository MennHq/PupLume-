import React, { useState, useEffect } from 'react';
import { 
  Check, 
  RotateCcw, 
  X, 
  ArrowRight, 
  Sparkles, 
  Dog, 
  CheckCircle2, 
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { PuppyProfile } from '../../types';
import { storage } from '../../lib/storage';
import { useUser } from '@clerk/react';

interface GettingStartedChecklistProps {
  puppy: PuppyProfile;
  onNavigate: (view: string) => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  actionText: string;
  isCompleted: boolean;
  onAction: () => void;
}

export const GettingStartedChecklist: React.FC<GettingStartedChecklistProps> = ({ puppy, onNavigate }) => {
  const { user } = useUser();
  const userName = user?.firstName || user?.fullName || 'Guest';

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`puplume_checklist_dismissed_${puppy.id}`) === 'true';
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`puplume_checklist_minimized_${puppy.id}`) === 'true';
  });

  // Manual check overrides stored in localStorage
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(`puplume_checklist_state_${puppy.id}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Listen to storage changes to auto-detect completion
  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [pottyLogs, setPottyLogs] = useState(() => storage.getPottyLogs());
  const [lessons, setLessons] = useState(() => storage.getTrainingLessons());

  useEffect(() => {
    return storage.subscribe(() => {
      setTasks([...storage.getTasks()]);
      setPottyLogs([...storage.getPottyLogs()]);
      setLessons([...storage.getTrainingLessons()]);
    });
  }, []);

  useEffect(() => {
    const handleReopen = () => {
      setIsDismissed(false);
      setIsMinimized(false);
      localStorage.removeItem(`puplume_checklist_dismissed_${puppy.id}`);
      localStorage.removeItem(`puplume_checklist_minimized_${puppy.id}`);
    };
    window.addEventListener('reopen-getting-started', handleReopen);
    return () => window.removeEventListener('reopen-getting-started', handleReopen);
  }, [puppy.id]);

  const saveManualChecks = (newChecks: Record<string, boolean>) => {
    setManualChecks(newChecks);
    localStorage.setItem(`puplume_checklist_state_${puppy.id}`, JSON.stringify(newChecks));
  };

  const toggleCheck = (id: string, currentState: boolean) => {
    saveManualChecks({
      ...manualChecks,
      [id]: !currentState,
    });
  };

  const handleReset = () => {
    setManualChecks({});
    localStorage.removeItem(`puplume_checklist_state_${puppy.id}`);
    localStorage.removeItem(`puplume_checklist_dismissed_${puppy.id}`);
    setIsDismissed(false);
    setIsMinimized(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`puplume_checklist_dismissed_${puppy.id}`, 'true');
  };

  const handleToggleMinimize = () => {
    const next = !isMinimized;
    setIsMinimized(next);
    localStorage.setItem(`puplume_checklist_minimized_${puppy.id}`, String(next));
  };

  // 5 Essential Onboarding Tasks
  const checklistItems: ChecklistItem[] = [
    {
      id: 'profile',
      title: `Personalize ${puppy.name}'s Profile`,
      description: 'Upload a cute photo, verify breed and birthdate.',
      actionText: 'Do it',
      isCompleted: Boolean(manualChecks['profile'] ?? (puppy.photoUrl && puppy.breed && puppy.birthDate)),
      onAction: () => onNavigate('puppy'),
    },
    {
      id: 'task',
      title: 'Complete a Daily Task',
      description: 'Double-tap a morning routine task to check it off.',
      actionText: 'Do it',
      isCompleted: Boolean(manualChecks['task'] ?? tasks.some((t) => t.completed)),
      onAction: () => onNavigate('tasks'),
    },
    {
      id: 'potty',
      title: 'Log a Potty Break',
      description: 'Record an outdoor pee or poop to start predictions.',
      actionText: 'Do it',
      isCompleted: Boolean(manualChecks['potty'] ?? (pottyLogs.length > 0)),
      onAction: () => {
        onNavigate('potty');
      },
    },
    {
      id: 'ai',
      title: 'Ask AI Your First Question',
      description: 'Get tailored advice on teething, biting, or naps.',
      actionText: 'Do it',
      isCompleted: Boolean(manualChecks['ai'] ?? (localStorage.getItem('puplume_asked_ai') === 'true')),
      onAction: () => {
        localStorage.setItem('puplume_asked_ai', 'true');
        onNavigate('ai');
      },
    },
    {
      id: 'academy',
      title: 'Try a 5-Min Training Drill',
      description: 'Run a short recall or crate settling drill with timer.',
      actionText: 'Do it',
      isCompleted: Boolean(manualChecks['academy'] ?? lessons.some((l) => l.completed || l.lastPracticed)),
      onAction: () => onNavigate('academy'),
    },
  ];

  const completedCount = checklistItems.filter((i) => i.isCompleted).length;
  const totalCount = checklistItems.length;
  const percentCompleted = Math.round((completedCount / totalCount) * 100);

  const getEncouragement = () => {
    if (percentCompleted === 100) return 'Superstar! 🎉';
    if (percentCompleted >= 80) return 'Almost there!';
    if (percentCompleted >= 40) return 'Keep it up!';
    if (percentCompleted > 0) return 'Great start!';
    return "Let's go!";
  };

  if (isDismissed) return null;

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button
          onClick={handleToggleMinimize}
          className="flex items-center gap-3 px-4 py-2.5 bg-white border border-[#E8DDD3] rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:border-[#8B5E3C]"
        >
          <div className="w-6 h-6 rounded-lg bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center font-black text-xs">
            🐾
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold text-[#2C211B] flex items-center gap-1.5">
              Getting Started
              <span className="text-[10px] font-bold text-[#8B5E3C] bg-[#FFF9F2] px-2 py-0.2 rounded-full border border-[#E8DDD3]">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-24 bg-[#E8DDD3] h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-[#8B5E3C] h-full transition-all duration-300" 
                style={{ width: `${percentCompleted}%` }} 
              />
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-[#766A63] group-hover:text-[#2C211B] transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[360px] max-w-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl border border-[#E8DDD3] shadow-[0_12px_40px_rgba(0,0,0,0.14)] p-5 overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD3]/70">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#766A63]">
            Getting Started
          </span>

          <div className="flex items-center gap-1 text-[#766A63]">
            <button
              onClick={handleReset}
              className="p-1.5 hover:text-[#2C211B] hover:bg-[#FFF9F2] rounded-lg transition-colors cursor-pointer"
              title="Reset Checklist"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleMinimize}
              className="p-1.5 hover:text-[#2C211B] hover:bg-[#FFF9F2] rounded-lg transition-colors cursor-pointer"
              title="Minimize"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:text-[#2C211B] hover:bg-[#FFF9F2] rounded-lg transition-colors cursor-pointer"
              title="Dismiss Checklist"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div className="mt-3.5 mb-3">
          <h3 className="text-base font-extrabold text-[#2C211B] flex items-center gap-1.5">
            Hello {userName}! 👋
          </h3>
          <p className="text-xs text-[#766A63] mt-0.5">
            You&apos;re gonna be a {puppy.name} superstar!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="w-full bg-[#F3E7DA] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B5E3C] to-[#C99E7D] transition-all duration-500 rounded-full"
              style={{ width: `${percentCompleted}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#2C211B]">{percentCompleted}% Completed</span>
            <span className="text-[#8B5E3C]">{getEncouragement()}</span>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.isCompleted
                  ? 'bg-[#FFF9F2]/60 border-[#E8DDD3]/80 opacity-80'
                  : 'bg-white border-[#E8DDD3] hover:border-[#8B5E3C]/40 shadow-2xs'
              }`}
            >
              <div 
                className="flex items-start gap-2.5 min-w-0 cursor-pointer flex-1"
                onClick={() => toggleCheck(item.id, item.isCompleted)}
              >
                {/* Checkbox Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCheck(item.id, item.isCompleted);
                  }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                    item.isCompleted
                      ? 'bg-[#8B5E3C] text-white shadow-xs'
                      : 'border-2 border-[#E8DDD3] hover:border-[#8B5E3C] bg-white'
                  }`}
                >
                  {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-xs font-bold truncate transition-colors ${
                      item.isCompleted
                        ? 'line-through text-[#766A63]'
                        : 'text-[#2C211B]'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#766A63] truncate leading-tight mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {!item.isCompleted && (
                <button
                  type="button"
                  onClick={item.onAction}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-[#F3E7DA] text-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {item.actionText}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 100% Completion Celebration Banner */}
        {percentCompleted === 100 && (
          <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-in zoom-in-95 duration-200">
            <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              🎉 All steps complete! You&apos;re an official PupLume Master!
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
