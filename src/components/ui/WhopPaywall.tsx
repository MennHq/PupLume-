import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Lock, ArrowRight, Dog, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { useUser, useClerk } from '@clerk/react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface WhopPaywallProps {
  onSignOut: () => void;
}

export const WhopPaywall: React.FC<WhopPaywallProps> = ({ onSignOut }) => {
  const { user } = useUser();
  const unlockApp = useMutation(api.users.unlockDeveloperAccess);
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // If the URL has receipt_id, it means they just came back from Whop
    if (typeof window !== 'undefined' && window.location.href.includes('receipt_id=')) {
      setIsVerifying(true);
      
      // OPTIMISTIC UNLOCK FOR LOCAL DEV TESTING
      // Since Whop sandbox webhooks are frequently delayed or dropped, we automatically
      // unlock the developer's account if they successfully returned with a receipt_id.
      if (import.meta.env.DEV) {
        unlockApp().then(() => {
          // Clean up the URL so it doesn't stay there
          window.history.replaceState({}, document.title, window.location.pathname);
        }).catch(console.error);
        return;
      }

      // Production fallback: Wait up to 5 seconds for the webhook to unlock them
      const timeout = setTimeout(() => {
        setIsVerifying(false);
        setShowError(true);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [unlockApp]);
  
  // Whop checkout URL with email prefilled
  const whopUrl = `https://whop.com/checkout/plan_XUyinIlWY5Z1I?email=${encodeURIComponent(userEmail)}`;

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-6 text-[#2C211B] relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#8B5E3C] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#F59E0B] rounded-full blur-[100px] opacity-[0.03] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.08)] relative z-10 border border-black/5 animate-in slide-in-from-bottom-8 fade-in duration-700">
        
        {/* Header */}
        <div className="relative bg-[#2C211B] p-10 text-center text-white overflow-hidden">
          {/* Subtle texture inside header */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          
          <div className="relative z-10 mx-auto w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mb-6 border border-white/20 shadow-inner backdrop-blur-md">
            <Dog className="w-10 h-10 text-[#F3E7DA]" />
          </div>
          
          <h2 className="text-3xl font-black mb-3 tracking-tight">Get PupLume</h2>
          <p className="text-base text-white/80 font-medium">
            Your all-in-one AI puppy companion. Master training, track health, and get 24/7 expert advice.
          </p>
        </div>

        {/* Pricing Block */}
        <div className="bg-[#FAF6F0] p-8 text-center border-b border-[#E8DDD3]">
          <div className="flex items-end justify-center gap-1 mb-2">
            <span className="text-5xl font-black text-[#2C211B]">$24.99</span>
          </div>
          <span className="inline-block bg-[#2C211B] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            One-Time Payment
          </span>
          <p className="text-[15px] font-semibold text-[#766A63] mt-4">
            Lifetime access. No subscriptions. No hidden fees.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 px-10">
          
          {isVerifying && (
            <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center gap-3 text-amber-800 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold text-sm">Verifying your payment with Whop...</span>
            </div>
          )}

          {showError && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-3 text-red-800 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div className="text-sm font-medium">
                <span className="font-bold block text-red-700">Payment received, but verification is delayed.</span>
                Whop's server is taking longer than usual to confirm. Please refresh this page in a minute, or click Developer Bypass below for now.
              </div>
            </div>
          )}

          <div className="space-y-5 mb-10">
            <FeatureItem text="Unlimited AI Co-Pilot chat" />
            <FeatureItem text="Full access to Training Academy" />
            <FeatureItem text="Advanced health & growth analytics" />
            <FeatureItem text="Complete medical & vaccine vault" />
          </div>

          <a href={whopUrl} className="block w-full">
            <Button 
              variant="primary" 
              className="w-full h-16 text-xl font-bold shadow-2xl shadow-[#8B5E3C]/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Unlock Lifetime Access
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </a>
          
          <div className="mt-8 pt-6 border-t border-black/5 flex flex-col items-center gap-4">
            <p className="text-center text-xs font-semibold text-[#8B5E3C]/60 flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <Shield className="w-4 h-4" /> Secure checkout by Whop
            </p>
            
            <button 
              onClick={onSignOut}
              className="text-sm font-medium text-[#2C211B]/60 hover:text-[#2C211B] transition-colors"
            >
              Sign in with a different account
            </button>

            {/* Developer Bypass (Only visible on localhost) */}
            {import.meta.env.DEV && (
              <button 
                onClick={async () => {
                  try {
                    await unlockApp();
                  } catch (e) {
                    console.error("Failed to unlock app", e);
                  }
                }}
                className="mt-4 px-4 py-2 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors"
              >
                🛠 Developer Bypass: Unlock App
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-4">
    <div className="mt-0.5 w-6 h-6 rounded-full bg-[#E5F6DF] flex items-center justify-center shrink-0 border border-[#C6E9BA]">
      <Lock className="w-3.5 h-3.5 text-[#4CAF50] font-bold" />
    </div>
    <span className="text-[17px] font-semibold text-[#2C211B]/90">{text}</span>
  </div>
);
