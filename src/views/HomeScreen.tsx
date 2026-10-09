import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  SkipForward, 
  Plus, 
  Calendar as CalendarIcon, 
  Droplet, 
  Utensils, 
  Moon, 
  Footprints, 
  GraduationCap, 
  DollarSign, 
  AlertCircle,
  Bell,
  Search,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { PuppyProfile, TaskItem } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Modal } from '../components/ui/Modal';

interface HomeScreenProps {
  puppy: PuppyProfile;
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  puppy,
  onNavigate,
  onOpenSearch,
  onOpenNotifications,
  onOpenLesson
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(storage.getTasks());
  const [activeTaskModal, setActiveTaskModal] = useState<TaskItem | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  React.useEffect(() => {
    return storage.subscribe(() => {
      setTasks([...storage.getTasks()]);
    });
  }, []);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  React.useEffect(() => {
    const fetchInsight = async () => {
      try {
        const payload = {
          message: `Write a short 2-sentence daily insight or tip for raising my puppy based on the recent tasks and data. Be extremely brief, warm, and concise. Do not use introductory phrases.`,
          puppyContext: {
            name: puppy.name,
            breed: puppy.breed,
            ageWeeks: Math.max(1, Math.floor((new Date().getTime() - new Date(puppy.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 7))),
            tasks: storage.getTasks().slice(0, 5),
            pottyLogs: storage.getPottyLogs().slice(0, 3)
          }
        };

        const res = await fetch('/api/ai/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Insight fetch failed');
        const data = await res.json();
        setAiInsight(data.text);
        sessionStorage.setItem(`insight-${puppy.id}`, data.text);
      } catch (err) {
        console.error("Failed to load insight", err);
        setAiInsight(`${puppy.name} is growing fast! Keep training sessions under 10 minutes to maintain high motivation and reward positive associations.`);
      } finally {
        setIsInsightLoading(false);
      }
    };
    
    const cachedInsight = sessionStorage.getItem(`insight-${puppy.id}`);
    if (cachedInsight) {
      setAiInsight(cachedInsight);
      setIsInsightLoading(false);
    } else {
      fetchInsight();
    }
  }, [puppy]);


  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<any>('training');
  const [newTaskTime, setNewTaskTime] = useState('02:00 PM');
  const [newTaskDuration, setNewTaskDuration] = useState('15');
  const [newTaskPeriod, setNewTaskPeriod] = useState<any>('afternoon');

  const unreadNotifs = storage.getNotifications().filter(n => !n.read).length;

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  // Next up task: first uncompleted task
  const nextUpTask = tasks.find(t => !t.completed && !t.skipped) || null;

  // Calculate puppy age in weeks
  const birthDate = new Date(puppy.birthDate);
  const ageWeeks = Math.max(1, Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));

  const handleToggleTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = storage.toggleTask(taskId);
    setTasks([...updated]);
  };

  const handleSkipTask = (taskId: string) => {
    const updated = storage.skipTask(taskId);
    setTasks([...updated]);
  };

  const getTaskPeriod = (t: TaskItem): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const raw = (t.period || '').toLowerCase().trim();
    if (raw === 'morning') return 'morning';
    if (raw === 'afternoon') return 'afternoon';
    if (raw === 'evening') return 'evening';
    if (raw === 'night') return 'night';
    const timeStr = (t.time || '').toLowerCase();
    const isPM = timeStr.includes('pm');
    const match = timeStr.match(/(\d+):?(\d*)/);
    let hour = match ? parseInt(match[1], 10) : 10;
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    storage.addTask({
      puppyId: puppy.id,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      time: newTaskTime.trim() || '10:00 AM',
      durationMin: parseInt(newTaskDuration, 10) || 15,
      completed: false,
      skipped: false,
      period: newTaskPeriod,
      date: new Date().toISOString().split('T')[0]
    });
    setTasks([...storage.getTasks()]);
    setIsAddTaskOpen(false);
    setNewTaskTitle('');
  };

  const periods: Array<{ id: 'morning' | 'afternoon' | 'evening' | 'night'; label: string; timeRange: string }> = [
    { id: 'morning', label: 'Morning Rhythm', timeRange: '6:00 AM – 11:59 AM' },
    { id: 'afternoon', label: 'Afternoon Flow', timeRange: '12:00 PM – 4:59 PM' },
    { id: 'evening', label: 'Evening Routine', timeRange: '5:00 PM – 8:59 PM' },
    { id: 'night', label: 'Night & Sleep', timeRange: '9:00 PM – 5:59 AM' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => onNavigate('puppy')}
            className="relative cursor-pointer group"
          >
            <img
              src={puppy.photoUrl}
              alt={puppy.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#8B5E3C] shadow-xs group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-[10px] font-bold">
              🐾
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B] leading-tight">
                Good day, {puppy.name}!
              </h1>
              <span className="text-[11px] font-bold bg-[#F3E7DA] text-[#5F3E29] px-2 py-0.5 rounded-full">
                {ageWeeks} wks
              </span>
            </div>
            <p className="text-xs text-[#766A63] mt-0.5 flex items-center gap-2">
              <span>{puppy.breed}</span>
              <span>•</span>
              <span>{puppy.weightLbs} lbs</span>
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="home-search-button"
            onClick={onOpenSearch}
            className="p-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] transition-colors cursor-pointer"
            aria-label="Search records"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            id="home-notifications-button"
            onClick={onOpenNotifications}
            className="p-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] transition-colors cursor-pointer relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold"
          >
            Full Planner
          </Button>
        </div>
      </div>

      {/* Progress & Bladder Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Today's Tasks Progress */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
              Today's Rhythm
            </span>
            <h3 className="text-xl font-black text-[#2C211B] mt-0.5">
              {completedCount} <span className="text-xs font-medium text-[#766A63]">/ {totalCount} completed</span>
            </h3>
            <p className="text-[11px] text-[#8B5E3C] font-semibold mt-1">
              {completedCount >= totalCount ? '🎉 Daily goal achieved!' : `${totalCount - completedCount} tasks remaining`}
            </p>
          </div>
          <ProgressRing completed={completedCount} total={totalCount} size={64} strokeWidth={6} />
        </div>

        {/* Card 2: Smart Potty Countdown */}
        {(() => {
          const pottyLogs = storage.getPottyLogs();
          const lastPotty = pottyLogs[0];
          return (
            <div 
              onClick={() => onNavigate('potty')}
              className="bg-white rounded-2xl border border-[#E8DDD3] p-4 flex items-center justify-between shadow-xs hover:border-[#8B5E3C]/40 transition-colors cursor-pointer group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
                    Potty Tracking
                  </span>
                </div>
                <h3 className="text-sm font-black text-[#2C211B] mt-0.5">
                  {lastPotty ? `Last: ${lastPotty.type} (${lastPotty.location})` : 'Ready to Log'}
                </h3>
                <p className="text-[11px] text-[#766A63] mt-1">
                  {lastPotty ? `Recorded at ${lastPotty.timestamp}` : 'Tap to record potty break'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
                <Droplet className="w-5 h-5" />
              </div>
            </div>
          );
        })()}

        {/* Card 3: Next Health Milestone */}
        {(() => {
          const apts = storage.getAppointments();
          const vacs = storage.getVaccinations();
          const nextApt = apts.find(a => a.status === 'scheduled');
          const nextVac = vacs.find(v => v.status === 'due_soon');

          return (
            <div 
              onClick={() => onNavigate('health')}
              className="bg-white rounded-2xl border border-[#E8DDD3] p-4 flex items-center justify-between shadow-xs hover:border-[#8B5E3C]/40 transition-colors cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
                  Vet & Vaccines
                </span>
                <h3 className="text-sm font-bold text-[#2C211B] mt-0.5 line-clamp-1">
                  {nextApt 
                    ? `${nextApt.date} • ${nextApt.title}`
                    : nextVac
                    ? `Due: ${nextVac.nextDueDate} • ${nextVac.vaccineName}`
                    : (puppy.vetClinic || 'Health Records')}
                </h3>
                <p className="text-[11px] text-[#8B5E3C] font-semibold mt-1">
                  {nextApt ? nextApt.clinic : puppy.vetPhone ? `Call: ${puppy.vetPhone}` : 'Tap to add vet visits'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 group-hover:scale-105 transition-transform">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Prominent NEXT UP Card */}
      {nextUpTask && (
        <div className="bg-gradient-to-br from-[#FFF9F2] to-[#F3E7DA] rounded-3xl border-2 border-[#8B5E3C]/30 p-5 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#8B5E3C] text-white text-[10px] font-extrabold uppercase tracking-wider">
                Next Up
              </span>
              <span className="text-xs font-semibold text-[#5F3E29] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {nextUpTask.time} ({nextUpTask.durationMin} min)
              </span>
            </div>

            <Badge variant={nextUpTask.category as any} size="sm">
              {nextUpTask.category.toUpperCase()}
            </Badge>
          </div>

          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              {nextUpTask.title}
            </h2>
            {nextUpTask.description && (
              <p className="text-xs sm:text-sm text-[#5F3E29] mt-1 font-medium">
                {nextUpTask.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#8B5E3C]/20">
            {nextUpTask.category === 'training' ? (
              <Button
                id="next-up-start-lesson-btn"
                variant="primary"
                size="sm"
                leftIcon={<Play className="w-4 h-4 fill-white" />}
                onClick={() => onOpenLesson('lesson-1')}
              >
                Start Interactive Drill
              </Button>
            ) : (
              <Button
                id="next-up-complete-btn"
                variant="primary"
                size="sm"
                leftIcon={<Check className="w-4 h-4" />}
                onClick={() => handleToggleTask(nextUpTask.id)}
              >
                Mark Complete
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={<SkipForward className="w-3.5 h-3.5" />}
              onClick={() => handleSkipTask(nextUpTask.id)}
            >
              Skip
            </Button>

            <button
              onClick={() => onNavigate('ai')}
              className="text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] flex items-center gap-1 ml-auto px-2 py-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI about this
            </button>
          </div>
        </div>
      )}

      {/* AI Insight Card */}
      <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-xs flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#8B5E3C]/10 text-[#8B5E3C] flex-shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-[#2C211B] uppercase tracking-wider">
              PupLume Daily AI Insight
            </h4>
            <span className="text-[10px] text-[#766A63]">Week {ageWeeks} Focus</span>
          </div>
          <p className="text-xs text-[#5F3E29] mt-1 leading-relaxed">
            {isInsightLoading ? (
              <span className="flex items-center gap-2 text-[#766A63] animate-pulse">
                <span className="w-3 h-3 rounded-full border-2 border-[#8B5E3C] border-t-transparent animate-spin" />
                Analyzing recent data for {puppy.name}...
              </span>
            ) : (
              aiInsight
            )}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => onNavigate('ai')}
              className="text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] flex items-center gap-1 cursor-pointer"
            >
              Ask AI: "Best routine suggestions for {puppy.name}?" <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Full Schedule by Period */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#2C211B]">Today's Plan</h2>
            <p className="text-xs text-[#766A63]">Structured routine balancing rest, food, and training</p>
          </div>

          <Button
            id="add-task-btn"
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddTaskOpen(true)}
          >
            Add Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#2C211B] mb-1">No tasks scheduled yet today</h3>
            <p className="text-xs text-[#766A63] max-w-sm mx-auto mb-4">
              Add meals, walks, potty breaks, and training sessions for {puppy.name} to track your daily rhythm.
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddTaskOpen(true)}
            >
              Add First Task
            </Button>
          </div>
        ) : (
          periods.map((period) => {
            const periodTasks = tasks.filter(t => getTaskPeriod(t) === period.id);
            if (periodTasks.length === 0) return null;

            return (
              <div key={period.id} className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8DDD3]/60">
                  <span className="text-xs font-bold text-[#2C211B]">{period.label}</span>
                  <span className="text-[11px] text-[#766A63]">{period.timeRange}</span>
                </div>

                <div className="space-y-2">
                  {periodTasks.map((task) => (
                    <div
                      key={task.id}
                      id={`task-item-${task.id}`}
                      onClick={() => setActiveTaskModal(task)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setActiveTaskModal(task);
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        task.completed
                          ? 'bg-[#FFF9F2]/70 border-[#E8DDD3]/60 opacity-60'
                          : task.skipped
                          ? 'bg-stone-50 border-stone-200 line-through opacity-50'
                          : 'bg-white border-[#E8DDD3] hover:border-[#8B5E3C]/40 hover:bg-[#FFF9F2]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Interactive checkmark button */}
                        <button
                          type="button"
                          id={`task-checkbox-${task.id}`}
                          onClick={(e) => handleToggleTask(task.id, e)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                            task.completed
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-[#E8DDD3] hover:border-[#8B5E3C] bg-white'
                          }`}
                          aria-label={`Mark ${task.title} complete`}
                        >
                          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-bold text-[#2C211B] truncate ${task.completed ? 'line-through text-[#766A63]' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge variant={task.category as any} size="sm">
                              {task.category}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-[#766A63] truncate mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold text-[#766A63]">
                          {task.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Details Modal */}
      <Modal
        isOpen={!!activeTaskModal}
        onClose={() => setActiveTaskModal(null)}
        title={activeTaskModal?.title || 'Task Details'}
      >
        {activeTaskModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={activeTaskModal.category as any}>
                {activeTaskModal.category.toUpperCase()}
              </Badge>
              <span className="text-xs text-[#766A63] font-semibold">
                Scheduled for {activeTaskModal.time} ({activeTaskModal.durationMin} min)
              </span>
            </div>

            {activeTaskModal.description && (
              <div className="p-3.5 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] text-xs text-[#2C211B] leading-relaxed">
                {activeTaskModal.description}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant={activeTaskModal.completed ? 'secondary' : 'primary'}
                className="flex-1"
                leftIcon={<Check className="w-4 h-4" />}
                onClick={() => {
                  handleToggleTask(activeTaskModal.id);
                  setActiveTaskModal(null);
                }}
              >
                {activeTaskModal.completed ? 'Mark Incomplete' : 'Mark Completed'}
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  handleSkipTask(activeTaskModal.id);
                  setActiveTaskModal(null);
                }}
              >
                Skip Task
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                storage.deleteTask(activeTaskModal.id);
                setTasks([...storage.getTasks()]);
                setActiveTaskModal(null);
              }}
            >
              Delete Task
            </Button>
          </div>
        )}
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title="Add Daily Routine Task"
        subtitle={`Schedule a new activity for ${puppy.name}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Loose leash sidewalk practice"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              >
                <option value="training">Training</option>
                <option value="potty">Potty</option>
                <option value="feeding">Feeding</option>
                <option value="sleep">Sleep</option>
                <option value="walk">Walk</option>
                <option value="health">Health</option>
                <option value="grooming">Grooming</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Period
              </label>
              <select
                value={newTaskPeriod}
                onChange={(e) => setNewTaskPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="text"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min="1"
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
