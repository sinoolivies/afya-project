import { Bell, ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearStoredAuth } from "../../../lib/api";

export default function Navbar({ user, notificationCount = 0 }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredAuth();
    navigate("/dashboard");
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "AC";

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      
      {/* Left */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
            A
          </div>
          <h1 className="text-xl font-semibold">AfyaCare</h1>
        </div>

        {/* Page Title */}
        <h2 className="text-lg font-semibold text-gray-700">
          Dashboard
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            {notificationCount}
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
            {initials}
          </div>
          <span className="text-sm text-gray-600">{user?.role || "guest"}</span>
          <ChevronDown size={16} />
        </div>

        {/* Logout */}
        <LogOut
          className="cursor-pointer text-gray-600"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}
