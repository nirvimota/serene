import React, { useState, useEffect } from 'react';
import Dashboard from './components/dashboard.jsx';
import Calendar from './pages/Calendar.jsx';
import Journal from './pages/journal.jsx';
import Learn from './pages/learn.jsx';
import TopNav from './components/TopNav.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import ShareModal from './components/ShareModal.jsx';
import { PrivacyPolicyModal, TermsOfServiceModal } from './components/LegalModals.jsx';
import { useCycleData } from './hooks/useCycleData';
import { useNotifications } from './hooks/useNotifications';

export default function AppShell({ user }) {
  const [activeNav, setActiveNav] = useState('home');
  const [profileOpen, setProfileOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const cycleData = useCycleData(user?.id);

  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    dismiss,
    requestBrowserPermission,
  } = useNotifications(cycleData);

  // Auto-trigger onboarding for new users with 0 logged periods
  useEffect(() => {
    if (user?.id && !cycleData.loading) {
      const key = `serene_onboarded_${user.id}`;
      const alreadyOnboarded = localStorage.getItem(key);
      if (!alreadyOnboarded && cycleData.loggedPeriods.length === 0) {
        setOnboardingOpen(true);
      }
    }
  }, [user?.id, cycleData.loading, cycleData.loggedPeriods.length]);

  const handleFinishOnboarding = () => {
    if (user?.id) {
      localStorage.setItem(`serene_onboarded_${user.id}`, 'true');
    }
    setOnboardingOpen(false);
  };

  // Soft-ask for browser notification permission after 30 seconds in-app
  useEffect(() => {
    const timer = setTimeout(() => {
      requestBrowserPermission();
    }, 30000);
    return () => clearTimeout(timer);
  }, [requestBrowserPermission]);

  // Derive user initial for avatar from email or display name
  const userName = user?.user_metadata?.full_name || '';
  const userInitial = (userName?.[0] || user?.email?.[0] || 'S').toUpperCase();

  const navProps = {
    activeNav,
    onNavigate: setActiveNav,
    notifications,
    unreadCount,
    onMarkRead: markRead,
    onMarkAllRead: markAllRead,
    onDismiss: dismiss,
    userInitial,
    onOpenProfile: () => setProfileOpen(true),
    onOpenShare: () => setShareOpen(true),
  };

  return (
    <>
      <TopNav {...navProps} />

      {activeNav === 'home' && (
        <Dashboard activeNav={activeNav} onNavigate={setActiveNav} cycleData={cycleData} />
      )}
      {activeNav === 'calendar' && (
        <Calendar activeNav={activeNav} onNavigate={setActiveNav} cycleData={cycleData} />
      )}
      {activeNav === 'journal' && (
        <Journal activeNav={activeNav} onNavigate={setActiveNav} cycleData={cycleData} />
      )}
      {activeNav === 'learn' && (
        <Learn activeNav={activeNav} onNavigate={setActiveNav} cycleData={cycleData} />
      )}

      {/* Modals */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        cycleData={cycleData}
        onOpenPrivacy={() => { setProfileOpen(false); setPrivacyOpen(true); }}
        onOpenTerms={() => { setProfileOpen(false); setTermsOpen(true); }}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        cycleData={cycleData}
        user={user}
      />

      <PrivacyPolicyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />

      <TermsOfServiceModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={handleFinishOnboarding}
        cycleData={cycleData}
        userName={userName}
      />
    </>
  );
}