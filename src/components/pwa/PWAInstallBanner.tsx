import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if dismissed previously in session
    const isDismissed = sessionStorage.getItem('puplume_pwa_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('puplume_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setDismissed(true);
      }
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[#FFF9F2] border border-[#E8DDD3] rounded-2xl shadow-xl p-4 text-[#2C211B] animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="PupLume Icon"
              className="w-12 h-12 rounded-xl shadow-md border border-[#E8DDD3]"
            />
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 text-white">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-[#2C211B]">Install PupLume App</h4>
              <span className="text-[10px] bg-[#E9B89C]/40 text-[#5F3E29] font-medium px-1.5 py-0.5 rounded-full">PWA</span>
            </div>
            <p className="text-xs text-[#7A6B63] mt-0.5 line-clamp-2">
              Add to Home Screen for lightning-fast launch, offline schedules, and full-screen view.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                id="pwa-banner-install-btn"
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-1.5 bg-[#8B5E3C] hover:bg-[#734927] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-medium text-[#7A6B63] hover:text-[#2C211B] px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Not Now
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close install prompt"
            className="text-[#A2948A] hover:text-[#2C211B] p-1 rounded-full hover:bg-[#F3E7DA]/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide modal if native prompt cannot be automatically invoked */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[#FFF9F2] p-6 shadow-2xl border border-[#E8DDD3] text-[#2C211B] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD3]/70">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#8B5E3C]" />
                <h3 className="text-sm font-bold text-[#2C211B]">Install on Your Device</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-[#7A6B63] hover:bg-[#E8DDD3]/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#4A3B32]">
              {isIOS ? (
                <>
                  <p className="text-[#7A6B63]">To install on iPhone or iPad:</p>
                  <ol className="space-y-2.5 list-decimal pl-4 font-medium">
                    <li>Tap the <strong>Share</strong> icon at the bottom of Safari.</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top-right corner.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="text-[#7A6B63]">To install in your browser:</p>
                  <ol className="space-y-2.5 list-decimal pl-4 font-medium">
                    <li>Click the <strong>Install</strong> icon in the address bar (or browser menu ⋮).</li>
                    <li>Select <strong>Install PupLume</strong> to add it to your desktop or apps launcher.</li>
                  </ol>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2 rounded-xl bg-[#8B5E3C] text-white text-xs font-semibold shadow-xs hover:bg-[#734927] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
