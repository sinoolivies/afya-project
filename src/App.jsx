import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import WhyChooseSection from './sections/WhyChooseSection';
import CtaSection from './sections/CtaSection';
import PageBackground from './components/PageBackground';
import SideChatBoard from './SideChatBoard';
import FindCare from './components/FindCare';
import Dashboard from './components/pages/AdminDashboard/Dashboard';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterHospitalPage from './pages/RegisterHospitalPage';
import { Navigate } from 'react-router-dom';

const Home = () => (
  <main className="relative">
    <HeroSection />
    <div className="space-y-32 pb-32">
      <FeaturesSection />
      <WhyChooseSection />
      <CtaSection />
    </div>
  </main>
);

const PublicShell = () => (
  <div className="relative min-h-screen font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
    <PageBackground />
    <Navbar />

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/find-care" element={<FindCare />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/register-hospital" element={<RegisterHospitalPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/register-hospital" replace />} />
      <Route path="/contact" element={<Navigate to="/dashboard" replace />} />
      <Route path="/appointments" element={<Navigate to="/dashboard#appointments" replace />} />
      <Route path="/settings" element={<Navigate to="/dashboard#settings" replace />} />
      <Route path="/doctors" element={<Navigate to="/dashboard#doctors" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>

    <footer className="relative border-t border-slate-100 bg-white/70 py-12 backdrop-blur-md mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">AfyaCare</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} AfyaCare Rwanda. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition">Terms</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition">Privacy</a>
          </div>
        </div>
      </div>
    </footer>

    <SideChatBoard />
  </div>
);

const DashboardShell = () => <Dashboard />;

function AppRoutes() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  if (isDashboardRoute) {
    return (
      <Routes>
        <Route path="/dashboard" element={<DashboardShell />} />
      </Routes>
    );
  }

  return (
    <PublicShell />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
