import React, { useState } from 'react';
import Dashboard from './components/dashboard.jsx';
import Calendar from './pages/Calendar.jsx';
import Journal from './pages/journal.jsx';
import Learn from './pages/learn.jsx';
import { useCycleData } from './hooks/useCycleData';

export default function AppShell({ user }) {
  const [activeNav, setActiveNav] = useState('home');
  const cycleData = useCycleData(user?.id);

  return (
    <>
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
    </>
  );
}