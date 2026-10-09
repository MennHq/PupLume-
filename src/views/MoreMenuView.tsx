import React from 'react';
import { 
  Droplet, 
  Activity, 
  DollarSign, 
  FileText, 
  Users, 
  Heart, 
  Settings, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Scissors,
  LogOut,
  Dog
} from 'lucide-react';
import { PuppyProfile } from '../types';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';
import { Download } from 'lucide-react';

interface MoreMenuViewProps {
  puppy: PuppyProfile;
  onNavigate: (view: string) => void;
  onSignOut?: () => void;
}

export const MoreMenuView: React.FC<MoreMenuViewProps> = ({ puppy, onNavigate, onSignOut }) => {
  const menuSections = [
    {
      title: 'Daily Tracking & Care',
      items: [
        { id: 'potty', label: 'Potty Tracker & Predictor', desc: 'Real-time countdowns & accident log', icon: <Droplet className="w-5 h-5 text-emerald-600" />, badge: '86% Safe' },
        { id: 'health', label: 'Health & Veterinary Center', desc: 'Vaccine schedule, meds & weight tracking', icon: <Activity className="w-5 h-5 text-rose-600" /> },
        { id: 'socialization', label: 'Socialization & Grooming', desc: '12-week checklist & fear-free care', icon: <Scissors className="w-5 h-5 text-purple-600" /> },
        { id: 'journal', label: 'Puppy Journal & Memories', desc: 'Milestone moments & photo log', icon: <Heart className="w-5 h-5 text-pink-600" /> }
      ]
    },
    {
      title: 'Records & Organization',
      items: [
        { id: 'expenses', label: 'Expense & Budget Tracker', desc: 'Receipt scanner, vet bills & CSV export', icon: <DollarSign className="w-5 h-5 text-amber-600" /> },
        { id: 'vault', label: 'Document Vault', desc: 'Vaccine records, microchip & insurance PDFs', icon: <FileText className="w-5 h-5 text-sky-600" /> },
        { id: 'sharing', label: 'Family & Caregiver Team', desc: 'Partner sharing & pet sitter emergency sheet', icon: <Users className="w-5 h-5 text-indigo-600" /> }
      ]
    },
    {
      title: 'Puppy & Preferences',
      items: [
        { id: 'puppy', label: `${puppy.name}’s Profile`, desc: 'Weight, breed details & emergency vet phone', icon: <Dog className="w-5 h-5 text-[#8B5E3C]" /> },
        { id: 'settings', label: 'App Settings & Backup', desc: 'Reminders, measurement units & JSON restore', icon: <Settings className="w-5 h-5 text-[#766A63]" /> }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Puppy Card in More */}
      <div 
        onClick={() => onNavigate('puppy')}
        className="bg-white rounded-3xl border border-[#E8DDD3] p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#8B5E3C]/40 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <img
            src={puppy.photoUrl}
            alt={puppy.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#8B5E3C]"
          />
          <div>
            <h2 className="text-base font-extrabold text-[#2C211B] flex items-center gap-1.5">
              {puppy.name}
              <span className="text-[10px] bg-[#F3E7DA] text-[#5F3E29] px-2 py-0.5 rounded-full font-bold">
                {puppy.breed}
              </span>
            </h2>
            <p className="text-xs text-[#766A63] mt-0.5">
              Tap to view full profile & emergency contacts
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-[#766A63]" />
      </div>

      {/* PWA Home Screen Installation Card */}
      <div className="bg-gradient-to-br from-[#FFF4E8] to-[#FFF9F2] rounded-3xl border border-[#E8DDD3] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8DDD3] flex items-center justify-center shadow-xs shrink-0">
            <img src="/pwa-192x192.png" alt="PupLume PWA" className="w-9 h-9 rounded-xl object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-[#2C211B]">Install PupLume App</h3>
              <span className="text-[10px] bg-[#8B5E3C] text-white px-1.5 py-0.2 rounded-md font-bold">PWA</span>
            </div>
            <p className="text-xs text-[#766A63] mt-0.5">
              Add to Home Screen for one-tap launch, offline capability, and standalone display.
            </p>
          </div>
        </div>

        <div className="self-end sm:self-center shrink-0">
          <PWAInstallButton variant="primary" />
        </div>
      </div>

      {/* Sections */}
      {menuSections.map((section) => (
        <div key={section.title} className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#766A63] px-2">
            {section.title}
          </h3>

          <div className="bg-white rounded-2xl border border-[#E8DDD3] shadow-xs divide-y divide-[#E8DDD3]/60 overflow-hidden">
            {section.items.map((item) => (
              <div
                key={item.id}
                id={`menu-item-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className="p-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3]/80 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#2C211B] group-hover:text-[#8B5E3C] transition-colors">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-[#766A63] mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#766A63] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Sign Out row */}
      {onSignOut && (
        <div className="pt-2 px-2 flex justify-center">
          <button
            onClick={onSignOut}
            className="text-xs font-bold text-[#766A63] hover:text-rose-600 flex items-center gap-1.5 py-2 px-4 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Switch Account / Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
