import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import Appointments from "./Appointmments";
import DoctorsPanel from "./DoctorsPanel";
import SettingsPanel from "./SettingsPanel";
import {
  clearStoredAuth,
  fetchCurrentUser,
  getStoredAuth,
  loginStaff,
  setStoredAuth,
} from "../../../lib/api";

const validTabs = ["dashboard", "appointments", "doctors", "settings"];

function getHashTab() {
  const hash = window.location.hash.replace("#", "");
  return validTabs.includes(hash) ? hash : "dashboard";
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(getHashTab());
  const [auth, setAuth] = useState(getStoredAuth());
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleHashChange = () => setActiveTab(getHashTab());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!auth?.token) return;

    refreshCurrentUser();
  }, [auth]);

  const refreshCurrentUser = () => {
    fetchCurrentUser()
      .then((response) => setUser(response.data))
      .catch((err) => {
        setError(err.message);
        clearStoredAuth();
        setAuth(null);
      });
  };

  if (!auth?.token || !user) {
    return <StaffLogin onSignedIn={setAuth} error={error} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} user={user} />

      <div className="flex-1 flex flex-col">
        <Navbar user={user} notificationCount={activeTab === "appointments" ? 0 : 0} />
        <div className="flex-1 overflow-auto">
          {activeTab === "appointments" ? (
            <Appointments user={user} />
          ) : activeTab === "doctors" ? (
            <DoctorsPanel user={user} />
          ) : activeTab === "settings" ? (
            <SettingsPanel user={user} onHospitalUpdated={refreshCurrentUser} />
          ) : (
            <DashboardContent />
          )}
        </div>
      </div>
    </div>
  );
}

function StaffLogin({ onSignedIn, error }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(error || "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLocalError("");

    try {
      const response = await loginStaff(form);
      setStoredAuth(response.data);
      onSignedIn(response.data);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f0fdf4,#dcfce7_45%,#f8fafc)] px-6 py-16">
      <div className="mx-auto max-w-md rounded-[32px] border border-emerald-100 bg-white/90 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Staff Access</p>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
            Return Home
          </Link>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Admin and doctor dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in with your hospital admin or doctor account to review pending appointments and trigger patient approval emails.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          New hospital? <Link to="/register-hospital" className="font-medium text-emerald-600 hover:text-emerald-700">Create an account here</Link>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Enter your own staff credentials from registration or your local seed data.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 transition focus:border-emerald-400"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 transition focus:border-emerald-400"
            />
          </label>
          {(localError || error) && <p className="text-sm text-red-600">{localError || error}</p>}
          <button
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Open dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
