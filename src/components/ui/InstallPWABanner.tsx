import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, Sparkles } from 'lucide-react';
import { PupLumeLogo } from '../common/PupLumeLogo';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const InstallPWABanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('puplume_pwa_banner_dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Suppress if already running in standalone PWA mode or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setIsDismissed(true);
      }
    } else {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('puplume_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      <aside
        id="pwa-install-banner"
        aria-label="Install PupLume App"
        className="relative z-30 bg-gradient-to-r from-[#FFF4E8] via-[#FFF9F2] to-[#F7ECE1] border-b border-[#E8DDD3] px-3.5 py-2.5 shadow-2xs"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="PupLume PWA"
                className="w-8 h-8 rounded-xl border border-[#D1C2B4] shadow-xs object-cover"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-[#2C211B] truncate">
                  Install PupLume App
                </p>
                <span className="text-[10px] font-semibold bg-[#8B5E3C] text-white px-1.5 py-0.2 rounded-md">
                  PWA Ready
                </span>
              </div>
              <p className="text-[11px] text-[#766A63] truncate">
                Add to your home screen or desktop for fast launch, offline mode, and routine reminders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="pwa-install-action-button"
              onClick={handleInstallClick}
              className="text-xs font-bold bg-[#8B5E3C] hover:bg-[#6D492F] active:scale-95 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              id="pwa-dismiss-button"
              onClick={handleDismiss}
              className="p-1.5 text-[#766A63] hover:text-[#2C211B] rounded-lg hover:bg-[#E8DDD3]/50 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Guide modal if native prompt cannot be automatically invoked */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-[#2C211B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFF9F2] rounded-2xl max-w-sm w-full p-5 border border-[#E8DDD3] shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <img src="/pwa-192x192.png" alt="PupLume" className="w-8 h-8 rounded-xl border border-[#E8DDD3]" />
                <h3 className="text-sm font-bold text-[#2C211B]">Install PupLume</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-[#766A63] hover:text-[#2C211B] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#766A63] text-left mt-1 mb-3">
              Follow these simple steps to install PupLume as a standalone app on your device:
            </p>

            <div className="text-left space-y-2.5 text-xs bg-white p-3.5 rounded-xl border border-[#E8DDD3] mb-4">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <span>Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 text-[#8B5E3C]" /> in the Safari toolbar.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <span>In your browser&apos;s address bar or menu (<span className="font-bold">⋮</span>), look for the <strong>Install</strong> or <strong>Add to Home Screen</strong> icon.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <span>Click <strong>Install PupLume</strong> to add it to your launcher or desktop app list.</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#8B5E3C] text-white font-bold rounded-xl text-xs hover:bg-[#6D492F] transition-colors cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
