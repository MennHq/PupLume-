import React from 'react';
import { Sparkles, Check, X, Shield, Lock } from 'lucide-react';
import { Button } from './Button';

interface ProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const ProPaywallModal: React.FC<ProPaywallModalProps> = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // In the future, this will redirect to the Lemon Squeezy checkout URL
    alert('This will redirect to the Lemon Squeezy checkout page once your API keys are added!');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#8B5E3C] to-[#5F3E29] p-8 text-center text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
            <Lock className="w-8 h-8 text-[#F3E7DA]" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Unlock {featureName}</h2>
          <p className="text-sm text-white/80 max-w-xs mx-auto">
            Upgrade to PupLume Pro to access premium features and give your puppy the best care possible.
          </p>
        </div>

        {/* Pricing & Features */}
        <div className="p-6">
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-4xl font-extrabold text-[#2C211B]">$4.99</span>
            <span className="text-sm font-semibold text-[#766A63]">/ month</span>
          </div>

          <div className="space-y-4 mb-8">
            <FeatureRow text="Unlimited AI Co-Pilot chat" />
            <FeatureRow text="Full access to Training Academy" />
            <FeatureRow text="Advanced health & growth analytics" />
            <FeatureRow text="Priority support" />
          </div>

          <Button 
            variant="primary" 
            className="w-full h-14 text-lg font-bold shadow-xl shadow-[#8B5E3C]/20"
            onClick={handleUpgrade}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </Button>
          
          <p className="text-center text-[10px] text-[#A69B95] mt-4 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> Secure billing powered by Lemon Squeezy
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
      <Check className="w-3 h-3 text-emerald-600 font-bold" />
    </div>
    <span className="text-sm font-medium text-[#4A3B32]">{text}</span>
  </div>
);
