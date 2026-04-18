import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarCheck,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  LoaderCircle,
  Mail,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  fetchAppointments,
  fetchAppointmentStats,
  updateAppointmentStatus,
} from "../../../lib/api";

const formatDateTime = (value) =>
  new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

const titleCase = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

export default function Appointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState(null);
  const [error, setError] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const loadAppointments = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [appointmentsResponse, statsResponse] = await Promise.all([
        fetchAppointments(),
        fetchAppointmentStats(),
      ]);
      setAppointments(appointmentsResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const notificationCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "pending").length,
    [appointments]
  );

  const handleStatusUpdate = async (appointmentId, status, extra = {}) => {
    setIsSavingId(appointmentId);
    setError("");
    try {
      const response = await updateAppointmentStatus(appointmentId, {
        status,
        notes:
          status === "approved"
            ? "Approved by hospital staff. A confirmation email has been sent to the patient."
            : "This request needs rescheduling. A status email has been sent to the patient.",
        ...extra,
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId ? response.data : appointment
        )
      );

      if (selected?._id === appointmentId) {
        setSelected(response.data);
      }
      setDecisionNotes("");
      setRejectionReason("");

      const refreshedStats = await fetchAppointmentStats();
      setStats(refreshedStats.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Live Queue</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {user.role === "doctor" ? "Doctor appointment queue" : "Hospital appointment queue"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pending AI bookings appear here immediately. Approving one sends the patient a confirmation email, and rejecting it sends a status update.
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {notificationCount} pending notification{notificationCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <Card title="Total Appointments" value={stats?.total ?? appointments.length} icon={<CalendarCheck className="text-green-600" />} />
        <Card title="Pending Requests" value={stats?.pending ?? 0} icon={<Clock className="text-yellow-500" />} />
        <Card title="Approved" value={stats?.approved ?? 0} icon={<CheckCircle className="text-green-600" />} />
        <Card title="Rejected" value={stats?.rejected ?? 0} icon={<XCircle className="text-red-500" />} />
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Notification</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan="6">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length ? (
                appointments.map((appointment) => (
                  <Row
                    key={appointment._id}
                    appointment={appointment}
                    onView={setSelected}
                    onUpdateStatus={handleStatusUpdate}
                    isSaving={isSavingId === appointment._id}
                  />
                ))
              ) : (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan="6">
                    No appointments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="absolute right-0 top-0 mt-4 w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Appointment Details</p>
                <h3 className="mt-2 text-2xl font-semibold">
                  {selected.patientId?.fullName || "Patient"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selected.doctorId?.userId?.fullName || "Doctor not assigned"}
                </p>
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
              <InfoCard icon={<Calendar size={16} />} title="Date" value={formatDateTime(selected.slotStart)} />
              <InfoCard icon={<Clock size={16} />} title="Time" value={new Date(selected.slotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
            </div>

            <div className="mt-4">
              <InfoCard title="Status" value={titleCase(selected.status)} />
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText size={16} />
                <span>Symptoms / Reason for Visit</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {selected.symptoms || selected.reason}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard icon={<User size={16} />} title="Patient Email" value={selected.patientId?.email || "Not provided"} />
              <InfoCard icon={<Mail size={16} />} title="Admin Notification" value={selected.notification?.lastStatus || "Not sent"} />
            </div>

            {selected.status === "pending" && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Actions</p>
                <div className="mt-4 space-y-4">
                  <textarea
                    value={decisionNotes}
                    onChange={(event) => setDecisionNotes(event.target.value)}
                    rows={3}
                    placeholder="Optional approval or rejection note..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                  <input
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Optional rejection reason"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-red-300"
                  />
                  <div className="flex gap-3">
                    <button
                      disabled={isSavingId === selected._id}
                      onClick={() =>
                        handleStatusUpdate(selected._id, "approved", {
                          notes: decisionNotes || "Approved by hospital staff. A confirmation email has been sent to the patient.",
                        })
                      }
                      className="flex-1 rounded-2xl bg-emerald-700 px-4 py-3 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {isSavingId === selected._id ? "Saving..." : "Approve"}
                    </button>
                    <button
                      disabled={isSavingId === selected._id}
                      onClick={() =>
                        handleStatusUpdate(selected._id, "rejected", {
                          notes: decisionNotes || "This request needs rescheduling. A status email has been sent to the patient.",
                          rejectionReason,
                        })
                      }
                      className="flex-1 rounded-2xl border border-red-300 px-4 py-3 font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {isSavingId === selected._id ? "Saving..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
      </div>
      <div className="rounded-2xl bg-gray-100 p-3">{icon}</div>
    </div>
  );
}

function InfoCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl bg-white p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Row({ appointment, onView, onUpdateStatus, isSaving }) {
  const statusColor =
    appointment.status === "approved"
      ? "bg-green-100 text-green-700"
      : appointment.status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="p-4">{appointment.patientId?.fullName || "Unknown patient"}</td>
      <td className="p-4">{appointment.doctorId?.userId?.fullName || "Unknown doctor"}</td>
      <td className="p-4">{formatDateTime(appointment.slotStart)}</td>
      <td className="p-4">
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
          {titleCase(appointment.status)}
        </span>
      </td>
      <td className="p-4 text-sm text-slate-500">{appointment.notification?.lastStatus || "queued"}</td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            disabled={isSaving}
            onClick={() => onUpdateStatus(appointment._id, "approved")}
            className="rounded-full bg-green-50 p-2 text-green-600 hover:bg-green-100 disabled:opacity-60"
          >
            {isSaving ? <LoaderCircle size={18} className="animate-spin" /> : "✔"}
          </button>
          <button
            disabled={isSaving}
            onClick={() => onUpdateStatus(appointment._id, "rejected")}
            className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            ✖
          </button>
          <button
            onClick={() => onView(appointment)}
            className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
            aria-label={`View details for ${appointment.patientId?.fullName || "patient"}`}
          >
            <Eye size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
