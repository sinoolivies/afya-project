import { LayoutDashboard, Calendar, Users, Settings } from "lucide-react";

const navItems = [
  { hash: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { hash: "appointments", icon: <Calendar size={18} />, label: "Appointments" },
  { hash: "doctors", icon: <Users size={18} />, label: "Doctors" },
  { hash: "settings", icon: <Settings size={18} />, label: "Settings" },
];

export default function Sidebar({ activeTab, user }) {
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "AC";

  return (
    <div className="w-64 bg-white border-r p-4 relative">
      <div className="space-y-4 mt-10">
        {navItems.map((item) => (
          <a
            key={item.hash}
            href={`#${item.hash}`}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === item.hash
                ? "bg-green-100 text-green-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>

      <div className="absolute bottom-6 flex items-center gap-3">
        <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center rounded-full">
          {initials}
        </div>
        <div>
          <p className="font-medium">{user?.fullName || "AfyaCare Staff"}</p>
          <p className="text-sm text-gray-500">{user?.email || "dashboard access"}</p>
        </div>
      </div>
    </div>
  );
}
