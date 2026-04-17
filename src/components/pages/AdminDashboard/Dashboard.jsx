import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import Appointments from "./Appointmments";

const validTabs = ["dashboard", "appointments", "doctors", "settings"];

function getHashTab() {
  const hash = window.location.hash.replace("#", "");
  return validTabs.includes(hash) ? hash : "dashboard";
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(getHashTab());

  useEffect(() => {
    const handleHashChange = () => setActiveTab(getHashTab());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} />

      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto">
          {activeTab === "appointments" ? (
            <Appointments />
          ) : activeTab === "doctors" ? (
            <SectionPlaceholder
              title="Doctors"
              description="Doctor rosters, availability, and profile management live here."
            />
          ) : activeTab === "settings" ? (
            <SectionPlaceholder
              title="Settings"
              description="Admin preferences, notification settings, and account options."
            />
          ) : (
            <DashboardContent />
          )}
        </div>
      </div>
    </div>
  );
}

function SectionPlaceholder({ title, description }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold mb-3">{title}</h1>
        <p className="text-gray-600 max-w-2xl leading-7">{description}</p>
      </div>
    </div>
  );
}