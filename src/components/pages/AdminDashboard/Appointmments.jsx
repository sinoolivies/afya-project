import { useState } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Calendar,
  FileText,
  User,
} from "lucide-react";

const appointments = [
  {
    id: 1,
    name: "Sarah Johnson",
    doctor: "Dr. Michael Chen",
    time: "Apr 18, 2026 09:00 AM",
    status: "Pending",
    date: "Apr 18, 2026",
    symptoms:
      "Persistent headaches for the past week, occasional dizziness and sensitivity to light. No prior history of migraines.",
  },
  {
    id: 2,
    name: "James Wilson",
    doctor: "Dr. Emily Rodriguez",
    time: "Apr 18, 2026 10:30 AM",
    status: "Approved",
    date: "Apr 18, 2026",
    symptoms: "Follow-up for routine checkup and medication review.",
  },
  {
    id: 3,
    name: "Maria Garcia",
    doctor: "Dr. Sarah Johnson",
    time: "Apr 18, 2026 02:00 PM",
    status: "Pending",
    date: "Apr 18, 2026",
    symptoms: "Abdominal discomfort and nausea for three days.",
  },
  {
    id: 4,
    name: "Robert Brown",
    doctor: "Dr. James Park",
    time: "Apr 18, 2026 03:30 PM",
    status: "Rejected",
    date: "Apr 18, 2026",
    symptoms: "Insurance mismatch during booking. Needs reschedule and verification.",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    doctor: "Dr. Michael Chen",
    time: "Apr 19, 2026 11:00 AM",
    status: "Pending",
    date: "Apr 19, 2026",
    symptoms: "Routine wellness visit and blood pressure monitoring.",
  },
  {
    id: 6,
    name: "David Martinez",
    doctor: "Dr. Emily Rodriguez",
    time: "Apr 19, 2026 04:00 PM",
    status: "Approved",
    date: "Apr 19, 2026",
    symptoms: "Chest pain evaluation and ECG review.",
  },
];

export default function Appointments() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Appointments"
          value={appointments.length}
          icon={<CalendarCheck className="text-green-600" />}
        />
        <Card
          title="Pending Requests"
          value={appointments.filter((item) => item.status === "Pending").length}
          icon={<Clock className="text-yellow-500" />}
        />
        <Card
          title="Approved Today"
          value={appointments.filter((item) => item.status === "Approved").length}
          icon={<CheckCircle className="text-green-600" />}
        />
        <Card
          title="Rejected"
          value={appointments.filter((item) => item.status === "Rejected").length}
          icon={<XCircle className="text-red-500" />}
        />
      </div>

      <h2 className="text-xl font-semibold mb-1">Recent Appointments</h2>
      <p className="text-gray-500 mb-4">Manage and review all appointment requests</p>

      <div className="relative">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-3">PATIENT</th>
                <th className="p-3">DOCTOR</th>
                <th className="p-3">DATE & TIME</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <Row key={appointment.id} appointment={appointment} onView={setSelected} />
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="absolute right-0 top-0 mt-4 w-full max-w-xl rounded-3xl bg-white border border-gray-200 shadow-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Appointment Details</p>
                <h3 className="text-2xl font-semibold mt-2">{selected.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selected.doctor}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>Date</span>
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900">{selected.date}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>Time</span>
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900">{selected.time.split(" ").slice(1).join(" ")}</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText size={16} />
                <span>Symptoms / Reason for Visit</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">{selected.symptoms}</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Patient</p>
                  <p className="mt-2 font-medium text-slate-900">{selected.name}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Status</p>
                  <p className="mt-2 font-medium text-slate-900">{selected.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
      <div>
        <p className="text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
      <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
    </div>
  );
}

function Row({ appointment, onView }) {
  const statusColor =
    appointment.status === "Approved"
      ? "bg-green-100 text-green-600"
      : appointment.status === "Rejected"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-600";

  return (
    <tr className="border-t hover:bg-slate-50 transition-colors">
      <td className="p-3">{appointment.name}</td>
      <td className="p-3">{appointment.doctor}</td>
      <td className="p-3">{appointment.time}</td>
      <td className="p-3">
        <span className={`px-3 py-1 rounded-full text-sm ${statusColor}`}>
          {appointment.status}
        </span>
      </td>
      <td className="p-3 flex gap-2">
        <button className="rounded-full bg-green-50 p-2 text-green-600 hover:bg-green-100">✔</button>
        <button className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100">✖</button>
        <button
          onClick={() => onView(appointment)}
          className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
          aria-label={`View details for ${appointment.name}`}
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
}