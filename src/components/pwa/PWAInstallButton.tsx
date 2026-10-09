import React, { useState } from 'react';
import { Download, Share, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'outline' | 'minimal';
  className?: string;
  showIconOnly?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'primary',
  className = '',
  showIconOnly = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed and active as standalone, show subtle badge or hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      // If prompt not natively fired (iOS or desktop browser without native trigger yet)
      setShowGuide(true);
    }
  };

  const getBaseClasses = () => {
    if (variant === 'primary') {
      return 'bg-gradient-to-r from-[#A27046] to-[#734927] text-white hover:opacity-95 shadow-sm active:scale-95';
    }
    if (variant === 'outline') {
      return 'border border-[#D1C2B4] text-[#4A3B32] hover:bg-[#F3E7DA]/50 bg-white/80 backdrop-blur-xs';
    }
    return 'text-[#8B5E3C] hover:bg-[#F3E7DA]/50';
  };

  return (
    <>
      <button
        type="button"
        id="pwa-install-btn"
        onClick={handleInstallClick}
        title="Install PupLume to your home screen"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${getBaseClasses()} ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        {!showIconOnly && <span>Install App</span>}
      </button>

      {/* Guide modal if native prompt cannot be automatically invoked (iOS or browser menu fallback) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[#FFF9F2] p-6 shadow-2xl border border-[#E8DDD3] text-[#2C211B] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src="/pwa-192x192.png" alt="PupLume" className="w-10 h-10 rounded-xl shadow-xs" />
                <div>
                  <h3 className="text-base font-bold text-[#2C211B]">Install PupLume</h3>
                  <p className="text-xs text-[#7A6B63]">Fast access right from your home screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-full text-[#7A6B63] hover:bg-[#E8DDD3]/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#4A3B32] bg-white/70 p-3.5 rounded-xl border border-[#E8DDD3]/60">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9B89C] text-[11px] font-bold text-[#4A3B32]">1</span>
                    <p>Tap the <span className="font-semibold text-[#8B5E3C] inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline" /> Share</span> button in the Safari toolbar at the bottom.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9B89C] text-[11px] font-bold text-[#4A3B32]">2</span>
                    <p>Scroll down and select <span className="font-semibold text-[#8B5E3C]">Add to Home Screen</span>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9B89C] text-[11px] font-bold text-[#4A3B32]">3</span>
                    <p>Tap <span className="font-semibold text-[#8B5E3C]">Add</span> in the top right corner.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9B89C] text-[11px] font-bold text-[#4A3B32]">1</span>
                    <p>In your browser address bar or menu, tap <span className="font-semibold text-[#8B5E3C]">Install PupLume</span> or <span className="font-semibold text-[#8B5E3C]">Add to Home Screen</span>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9B89C] text-[11px] font-bold text-[#4A3B32]">2</span>
                    <p>Confirm by clicking <span className="font-semibold text-[#8B5E3C]">Install</span> to launch in dedicated standalone app mode.</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#8B5E3C] text-white text-xs font-semibold shadow-xs hover:bg-[#734927] transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
