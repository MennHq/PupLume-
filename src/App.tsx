import React, { useState, useEffect } from 'react';
import { useUser, useClerk, SignIn } from '@clerk/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { PuppyProfile } from './types';
import { storage } from './lib/storage';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Views
import { OnboardingWizard } from './views/OnboardingWizard';
import { HomeScreen } from './views/HomeScreen';
import { TasksView } from './views/TasksView';
import { AIAssistantView } from './views/AIAssistantView';
import { TrainingAcademyView } from './views/TrainingAcademyView';
import { PottyTrackerView } from './views/PottyTrackerView';
import { HealthCenterView } from './views/HealthCenterView';
import { ExpensesView } from './views/ExpensesView';
import { DocumentVaultView } from './views/DocumentVaultView';
import { SocializationGroomingView } from './views/SocializationGroomingView';
import { PuppyJournalView } from './views/PuppyJournalView';
import { PuppyProfileView } from './views/PuppyProfileView';
import { FamilySharingView } from './views/FamilySharingView';
import { SettingsView } from './views/SettingsView';
import { MoreMenuView } from './views/MoreMenuView';
import { Dog, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { clearUserDataInConvex } from './lib/convex';
import { OfflineAlert } from './components/pwa/OfflineAlert';
import { ProPaywallModal } from './components/ui/ProPaywallModal';
import { PaddlePaywall } from './components/ui/PaddlePaywall';
import { engine as notificationEngine } from './lib/NotificationEngine';

// Create a small component for the animated marketing text
import { motion, AnimatePresence } from 'framer-motion';

const MarketingCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const slides = [
    { title: "Sign In.", desc: "Welcome back to your puppy's digital home." },
    { title: "Track.", desc: "Log potty breaks, meals, and sleep effortlessly." },
    { title: "Train.", desc: "Master recall and loose leash walking with our Academy." },
    { title: "Care.", desc: "Keep track of vaccines, weights, and vet visits." },
    { title: "Ask AI.", desc: "Get instant advice on biting, barking, and behavior." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative z-10 max-w-lg xl:max-w-xl mx-auto w-full h-[300px] flex flex-col justify-end pb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl lg:text-8xl font-black mb-6 leading-tight tracking-tighter">
            {slides[activeIndex].title}
          </h1>
          <p className="text-xl lg:text-2xl font-medium text-[#F3E7DA] leading-relaxed max-w-md">
            {slides[activeIndex].desc}
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-3 mt-12">
        {slides.map((_, i) => (
          <button 
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              i === activeIndex ? 'bg-white shadow-md scale-125' : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [puppy, setPuppy] = useState<PuppyProfile | null>(() => storage.getPuppy());
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+/, '');
      return path || 'home';
    }
    return 'home';
  });
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);

  

  // Sync currentView to clean URL paths (e.g. /academy)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const targetPath = currentView === 'home' ? '/' : `/${currentView}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: currentView }, '', targetPath);
      }
    }
  }, [currentView]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, '');
      setCurrentView(path || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen for custom navigate events (e.g., triggered by the AI assistant)
  useEffect(() => {
    const handleCustomNavigate = (e: any) => {
      if (e.detail && e.detail.view) {
        setCurrentView(e.detail.view);
      }
    };
    window.addEventListener('navigate', handleCustomNavigate);
    return () => window.removeEventListener('navigate', handleCustomNavigate);
  }, []);


  // Authoritative real-time data subscription from Convex scoped to user.id
  const cloudData = useQuery(
    api.app.getUserAppData,
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
  );
  
  // Since the entire app is gated by the Paddle lifetime purchase paywall, 
  // anyone who makes it here is a Pro member.
  const isPro = true;

  const syncUserMutation = useMutation(api.users.syncUser);

  // Set authenticated user on storage to isolate data across users
  useEffect(() => {
    storage.setAuthenticatedUser(user?.id ?? null);
  }, [user?.id]);

  // Sync user profile to Convex upon signing in
  useEffect(() => {
    if (isSignedIn && user?.id) {
      syncUserMutation({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || 'Pup Parent',
        avatarUrl: user.imageUrl,
      }).catch((err) => console.debug('[App] syncUser error:', err));
    }
  }, [isSignedIn, user?.id, syncUserMutation]);

  // Reactive listener to storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      const current = storage.getPuppy();
      setPuppy(current ? { ...current } : null);
    });
    return unsubscribe;
  }, []);

  // Hydrate from Convex reactive cloud subscription (No fake data!)
  useEffect(() => {
    if (cloudData && user?.id) {
      if (cloudData.puppies && cloudData.puppies.length > 0) {
        storage.hydrateFromConvex(cloudData);
        const activePup = storage.getPuppy();
        setPuppy(activePup ? { ...activePup } : null);
      } else {
        const localPup = storage.getActivePuppy() || storage.getPuppy();
        if (localPup) {
          storage.syncFullStateToConvex(user.id);
          setPuppy(localPup);
        } else if (cloudData.settings?.hasCompletedOnboarding) {
          // Existing user who already completed onboarding
        } else {
          // Brand-new account with zero data (only if not already set locally)
          const current = storage.getPuppy();
          if (!current) {
            setPuppy(null);
          }
        }
      }
    }
  }, [cloudData, user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Loading authentication state
  
  // Start the background notification engine
  useEffect(() => {
    notificationEngine.start();
    return () => notificationEngine.stop();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
        <OfflineAlert />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#766A63]">Loading PupLume...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Split-screen layout (Marketing on left, Clerk on right)
  if (!isSignedIn) {
    // If user hit the app without login intent, redirect to the marketing site
    const isLoginIntent = window.location.pathname === '/sign-in' || window.location.search.includes('login=true');
    if (!isLoginIntent) {
      window.location.href = 'http://localhost:3001';
      return null;
    }

    return (
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col md:flex-row">
        
        {/* Left Side: Brand Hero */}
        <div className="hidden md:flex md:w-1/2 bg-[#8B5E3C] text-white p-12 flex-col justify-center relative overflow-hidden">
          {/* Decorative glowing background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <MarketingCarousel />
        </div>

        {/* Right Side: Auth Widget */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-[#FFF9F2]">
          <div className="absolute top-4 w-full px-4">
            <OfflineAlert />
          </div>
          
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            {/* We can remove the custom logo header since we will let Clerk show its own header, or we can keep a small logo above it */}
            <div className="w-full flex justify-center">
              <SignIn 
                appearance={{
                  variables: {
                    colorPrimary: "#8B5E3C",
                    colorText: "#2C211B",
                    colorTextSecondary: "#766A63",
                    colorBackground: "#FFF9F2",
                    borderRadius: "1rem",
                  },
                  elements: {
                    rootBox: "w-full",
                    cardBox: "!shadow-none",
                    card: "bg-[#FFF9F2] !shadow-none rounded-3xl border border-[#E8DDD3] w-full max-w-md p-8",
                    footer: "!bg-transparent !border-none !shadow-none",
                    headerTitle: "text-2xl font-black text-[#2C211B] mb-1",
                    headerSubtitle: "text-[#766A63] font-medium text-base",
                    socialButtonsBlockButton: "border border-[#E8DDD3] bg-white hover:bg-[#F3E7DA] text-[#2C211B] transition-colors rounded-xl py-3.5",
                    socialButtonsBlockButtonText: "font-bold",
                    formButtonPrimary: "bg-[#8B5E3C] hover:bg-[#6D492F] transition-colors shadow-sm hover:shadow-md font-bold py-3.5",
                    formFieldInput: "bg-white border border-[#E8DDD3] focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] shadow-xs py-2.5",
                    formFieldLabel: "text-[#2C211B] font-bold text-sm",
                    footerActionLink: "text-[#8B5E3C] hover:text-[#5F3E29] font-bold",
                    footerActionText: "text-[#766A63] font-medium",
                    dividerLine: "bg-[#E8DDD3]",
                    dividerText: "text-[#766A63] font-bold text-xs uppercase tracking-wider",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Waiting for user's cloud data to load before making routing decision
  if (cloudData === undefined && !puppy) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
        <OfflineAlert />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#766A63]">Loading your puppy profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Paddle Paywall Gate
  if (cloudData !== undefined && !cloudData?.user?.hasAccess) {
    return <PaddlePaywall onSignOut={signOut} />;
  }

  // Active puppy from state, storage, or cloud data
  const activePuppy: PuppyProfile | null = puppy || storage.getPuppy() || (cloudData?.puppies && cloudData.puppies.length > 0 ? {
    id: cloudData.puppies[0]._id,
    name: cloudData.puppies[0].name,
    breed: cloudData.puppies[0].breed,
    birthDate: cloudData.puppies[0].birthDate,
    sex: cloudData.puppies[0].sex as 'male' | 'female',
    weightLbs: cloudData.puppies[0].weightLbs,
    photoUrl: cloudData.puppies[0].photoUrl,
    temperament: cloudData.puppies[0].temperament,
    dietaryRestrictions: cloudData.puppies[0].dietaryRestrictions,
    favoriteTreat: cloudData.puppies[0].favoriteTreat,
    createdAt: cloudData.puppies[0].createdAt,
  } : null);

  // 4. Show onboarding only if user explicitly navigated to it, OR if user has no puppy profile yet
  if (!activePuppy || currentView === 'onboarding') {
    return (
      <div className="min-h-screen flex flex-col">
        <OfflineAlert />
        <div className="flex-1">
          <OnboardingWizard
            userId={user?.id}
            onComplete={(newPuppy) => {
              setPuppy(newPuppy);
              setCurrentView('home');
              showToast(`Welcome ${newPuppy.name}! Your puppy's schedule is ready.`);
              if (user?.id) {
                storage.syncFullStateToConvex(user.id);
              }
            }}
            onCancel={() => {
              if (activePuppy) setCurrentView('home');
            }}
          />
        </div>
      </div>
    );
  }

  // 5. Authenticated with puppy profile: Full Application
  return (
    <AppLayout
      currentView={currentView}
      onNavigate={(view) => {
        if (!isPro && (view === 'ai' || view === 'academy')) {
          setPaywallFeature(view === 'ai' ? 'AI Co-Pilot' : 'Training Academy');
          return;
        }
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      puppy={activePuppy}
      onSelectLesson={(lessonId) => {
        setSelectedLessonId(lessonId);
        setCurrentView('academy');
      }}
      onOpenNewPuppyWizard={() => setCurrentView('onboarding')}
    >
      {/* Demo Profile Alert Banner if user still has placeholder Max */}
      {activePuppy.name === 'Max' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Demo profile active:</strong> Set up your real puppy&apos;s schedule with our conversational AI Onboarding!
            </span>
          </div>
          <button
            onClick={async () => {
              if (user?.id) {
                await clearUserDataInConvex(user.id);
              }
              storage.clearAllUserData();
              setPuppy(null);
              setCurrentView('onboarding');
            }}
            className="px-3 py-1 bg-[#8B5E3C] hover:bg-[#6D492F] text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0 text-xs shadow-xs"
          >
            Start Real AI Onboarding
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#2C211B] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-[#E8DDD3]/30">
          🐾 {toastMessage}
        </div>
      )}

      {/* Main View Router */}
      {currentView === 'home' && (
        <HomeScreen
          puppy={activePuppy}
          onNavigate={setCurrentView}
          onOpenSearch={() => {
            const searchBtn = document.getElementById('home-search-button');
            if (searchBtn) searchBtn.click();
          }}
          onOpenNotifications={() => {
            const notifBtn = document.getElementById('home-notifications-button');
            if (notifBtn) notifBtn.click();
          }}
          onOpenLesson={(lessonId) => {
            if (!isPro) {
              setPaywallFeature('Training Academy');
              return;
            }
            setSelectedLessonId(lessonId);
            setCurrentView('academy');
          }}
        />
      )}

      {currentView === 'tasks' && (
        <TasksView
          puppy={activePuppy}
          onOpenLesson={(lessonId) => {
            if (!isPro) {
              setPaywallFeature('Training Academy');
              return;
            }
            setSelectedLessonId(lessonId);
            setCurrentView('academy');
          }}
        />
      )}

      {currentView === 'ai' && (
        <AIAssistantView
          puppy={activePuppy}
          onActionTriggered={(msg) => showToast(msg)}
        />
      )}

      {currentView === 'academy' && (
        <TrainingAcademyView
          puppy={activePuppy}
          activeLessonId={selectedLessonId}
          onCloseLessonModal={() => setSelectedLessonId(null)}
        />
      )}

      {currentView === 'more' && (
        <MoreMenuView
          puppy={activePuppy}
          onNavigate={setCurrentView}
          onSignOut={async () => {
            storage.clearActiveSession();
            setPuppy(null);
            await signOut();
          }}
        />
      )}

      {currentView === 'potty' && (
        <PottyTrackerView puppy={activePuppy} />
      )}

      {currentView === 'health' && (
        <HealthCenterView puppy={activePuppy} />
      )}

      {currentView === 'expenses' && (
        <ExpensesView puppy={activePuppy} />
      )}

      {currentView === 'vault' && (
        <DocumentVaultView puppy={activePuppy} />
      )}

      {currentView === 'socialization' && (
        <SocializationGroomingView puppy={activePuppy} />
      )}

      {currentView === 'journal' && (
        <PuppyJournalView puppy={activePuppy} />
      )}

      {currentView === 'puppy' && (
        <PuppyProfileView
          puppy={activePuppy}
          onUpdatePuppy={(updated) => {
            setPuppy(updated);
            showToast(`${updated.name}'s profile updated!`);
          }}
        />
      )}

      {currentView === 'sharing' && (
        <FamilySharingView puppy={activePuppy} />
      )}

      {currentView === 'settings' && (
        <SettingsView
          puppy={activePuppy}
          onResetData={async () => {
            if (user?.id) {
              await clearUserDataInConvex(user.id);
            }
            storage.clearAllUserData();
            setPuppy(null);
            setCurrentView('onboarding');
            showToast('All data cleared. Welcome to AI Onboarding!');
          }}
        />
      )}
      <ProPaywallModal 
        isOpen={!!paywallFeature}
        onClose={() => setPaywallFeature(null)}
        featureName={paywallFeature || ''}
      />
    </AppLayout>
  );
}
