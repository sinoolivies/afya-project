import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth (adjust based on your backend)
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      
      {/* Left */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
            M
          </div>
          <h1 className="text-xl font-semibold">MediAssist</h1>
        </div>

        {/* Page Title */}
        <h2 className="text-lg font-semibold text-gray-700">
          Dashboard
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search appointments, doctors..."
            className="pl-10 pr-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
          />
        </div>

        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
            AU
          </div>
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