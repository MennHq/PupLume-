import React, { useState } from 'react';
import { 
  Bell, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  Trash2, 
  ExternalLink,
  Cloud,
  CheckCircle2,
  Image as ImageIcon 
} from 'lucide-react';
import { PuppyProfile } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { CloudinaryImageUploader } from '../components/ui/CloudinaryImageUploader';
import { useUser } from '@clerk/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface SettingsViewProps {
  puppy: PuppyProfile;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ puppy, onResetData }) => {
  const { user } = useUser();
  const initialSettings = storage.getSettings();
  const [pottyAlerts, setPottyAlerts] = useState(initialSettings.pottyAlerts);
  const [feedingAlerts, setFeedingAlerts] = useState(initialSettings.feedingAlerts);
  const [trainingAlerts, setTrainingAlerts] = useState(initialSettings.trainingAlerts);
  const [medAlerts, setMedAlerts] = useState(initialSettings.medAlerts);
  const [units, setUnits] = useState<'imperial' | 'metric'>(initialSettings.units);
  const [isSaved, setIsSaved] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [userName, setUserName] = useState(user?.firstName || user?.fullName || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  React.useEffect(() => {
    if (user && !userName) setUserName(user.firstName || user.fullName || '');
  }, [user]);

  const cloudData = useQuery(api.app.getUserAppData, user?.id ? { userId: user.id } : 'skip');
  const memories = cloudData?.memories || [];
  const deleteMemory = useMutation(api.ai.deleteMemory);

  React.useEffect(() => {
    return storage.subscribe(() => {
      const s = storage.getSettings();
      setPottyAlerts(s.pottyAlerts);
      setFeedingAlerts(s.feedingAlerts);
      setTrainingAlerts(s.trainingAlerts);
      setMedAlerts(s.medAlerts);
      setUnits(s.units);
    });
  }, []);

  const showStatus = (msg: string) => {
    setBackupStatus(msg);
    setTimeout(() => setBackupStatus(null), 3500);
  };

  const handleExportJSON = () => {
    const backup = {
      puppy: storage.getPuppy(),
      tasks: storage.getTasks(),
      pottyLogs: storage.getPottyLogs(),
      feedingLogs: storage.getFeedingLogs(),
      sleepLogs: storage.getSleepLogs(),
      vaccinations: storage.getVaccinations(),
      medications: storage.getMedications(),
      appointments: storage.getAppointments(),
      expenses: storage.getExpenses(),
      documents: storage.getDocuments(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PupLume-Backup-${puppy.name}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('Backup exported successfully!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.puppy) storage.savePuppy(data.puppy);
          if (data.tasks) storage.saveTasks(data.tasks);
          showStatus('PupLume data restored successfully!');
        } catch (err) {
          showStatus('Error: Invalid JSON backup file.');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleSaveSettings = () => {
    storage.saveSettings({
      pottyAlerts,
      feedingAlerts,
      trainingAlerts,
      medAlerts,
      units,
      activePuppyId: puppy.id,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleUpdateName = async () => {
    if (!user || !userName.trim() || userName.trim() === user.firstName) return;
    setIsUpdatingName(true);
    try {
      await user.update({ firstName: userName.trim() });
      showStatus("Your name has been updated!");
    } catch (e) {
      console.error(e);
      showStatus("Failed to update name.");
    } finally {
      setIsUpdatingName(false);
    }
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
          Settings & Preferences
        </h1>
        <p className="text-xs text-[#766A63] mt-1">
          Configure smart notification cadences, measurement systems, and data backup.
        </p>
      </div>

      {/* User Profile */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#8B5E3C]" />
          Your Profile
        </h3>
        <div>
          <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
            Your Name (Owner)
          </label>
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="flex-1 p-2.5 bg-[#FAF6F0] border border-[#E8DDD3] rounded-xl text-sm font-semibold text-[#2C211B] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
            />
            <Button 
              onClick={handleUpdateName} 
              disabled={isUpdatingName || !userName.trim() || userName.trim() === user?.firstName}
            >
              {isUpdatingName ? 'Saving...' : 'Update'}
            </Button>
          </div>
        </div>
      </div>

      {/* Smart Notifications */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#8B5E3C]" />
          Smart Reminder Notifications
        </h3>

        <div className="space-y-3">
          {[
            { id: 'potty', label: 'Predictive Potty Countdowns', desc: 'Alerts 10 minutes before next estimated bladder threshold', state: pottyAlerts, set: setPottyAlerts },
            { id: 'feeding', label: 'Scheduled Mealtime Reminders', desc: 'Morning, noon, and evening alerts to keep feeding times reliable', state: feedingAlerts, set: setFeedingAlerts },
            { id: 'training', label: 'Daily 5-Minute Training Drills', desc: 'Micro-session nudges when puppy is refreshed after nap', state: trainingAlerts, set: setTrainingAlerts },
            { id: 'meds', label: 'Preventatives & Booster Notices', desc: 'Monthly heartworm/flea chews and clinic appointment reminders', state: medAlerts, set: setMedAlerts }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3]">
              <div>
                <h4 className="text-xs font-bold text-[#2C211B]">{item.label}</h4>
                <p className="text-[11px] text-[#766A63]">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => item.set(!item.state)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                  item.state ? 'bg-[#8B5E3C]' : 'bg-[#E8DDD3]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    item.state ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Measurement Units */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#2C211B]">Measurement Units</h3>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => setUnits('imperial')}
            className={`py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              units === 'imperial'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3]'
            }`}
          >
            Imperial (lbs, cups)
          </button>
          <button
            onClick={() => setUnits('metric')}
            className={`py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              units === 'metric'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3]'
            }`}
          >
            Metric (kg, grams)
          </button>
        </div>
      </div>

      {/* Cloudinary Media Cloud Connection */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#8B5E3C]" />
            Cloud Media Storage
          </h3>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Connected
          </span>
        </div>
        <p className="text-xs text-[#766A63]">
          Pet photos, journal memory snapshots, and medical documents are saved directly to your secure cloud storage. When you log in from any device, all your pet&apos;s photos and records load automatically.
        </p>

        <div>
          <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
            Update {puppy.name}&apos;s Primary Photo
          </label>
          <CloudinaryImageUploader
            currentImageUrl={puppy.photoUrl}
            onUploadSuccess={(url) => {
              const updated = { ...puppy, photoUrl: url };
              storage.savePuppy(updated);
              showStatus(`${puppy.name}'s photo updated securely!`);
            }}
            folder="puplume/puppies"
            label={`Upload New Photo for ${puppy.name}`}
            sublabel="Upload new pet picture • Automatically synced to database"
            variant="card"
          />
        </div>
      </div>

      {/* AI Long-Term Memory */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#8B5E3C]" />
            AI Long-Term Memory
          </h3>
          <span className="text-[11px] font-bold text-[#766A63] bg-[#FFF9F2] px-2.5 py-0.5 rounded-full border border-[#E8DDD3]">
            {memories.length} Saved Facts
          </span>
        </div>
        <p className="text-xs text-[#766A63]">
          These are the personalized facts the AI Co-Pilot has learned about you and {puppy.name}. They are automatically referenced during chats to tailor advice.
        </p>

        {memories.length > 0 ? (
          <div className="space-y-2 mt-3">
            {memories.map((mem: any) => (
              <div key={mem._id} className="flex items-center justify-between p-3 bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl">
                <span className="text-[11px] font-medium text-[#2C211B]">{mem.fact}</span>
                <button
                  onClick={() => deleteMemory({ memoryId: mem._id })}
                  className="p-1.5 text-[#766A63] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl text-xs text-[#766A63]">
            No personalized memories saved yet. Chat with the AI and ask it to remember important facts!
          </div>
        )}
      </div>

      {/* Data Backup & Cloud Sync */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#2C211B] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
          Data Portability & Backup
        </h3>
        <p className="text-xs text-[#766A63]">
          Your puppy data is stored offline-first on your device. You can download a full backup copy or restore on another phone.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download JSON Backup
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJSON}
            />
            <div className="px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-xs font-bold text-[#5F3E29] flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Restore from Backup
            </div>
          </label>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700">Reset all records?</span>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetData();
                  showStatus('Reset to starter data complete.');
                }}
              >
                Yes, Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Starter Data
            </Button>
          )}
        </div>

        {backupStatus && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{backupStatus}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          leftIcon={isSaved ? <Check className="w-4 h-4" /> : undefined}
        >
          {isSaved ? 'Preferences Saved!' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};
