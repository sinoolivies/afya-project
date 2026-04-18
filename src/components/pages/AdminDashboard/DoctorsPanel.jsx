import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Mail, Phone, Plus, Stethoscope, Trash2, UserRoundCheck, Users, X } from "lucide-react";
import { createAvailability, createDoctor, deleteAvailability, fetchAvailability, fetchDoctors, updateAvailability } from "../../../lib/api";

const formatStatus = (value = "") =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const initialsFromName = (name = "Doctor") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorsPanel({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    password: "",
  });
  const [availabilityForm, setAvailabilityForm] = useState({
    doctorId: "",
    dayOfWeek: "1",
    startTime: "08:00",
    endTime: "12:00",
    slotDurationMinutes: "30",
  });

  const loadDoctors = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchDoctors({
        hospitalId: user?.hospitalId?._id || user?.hospitalId,
      });
      setDoctors(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailability = async () => {
    setIsLoadingAvailability(true);
    setError("");

    try {
      const response = await fetchAvailability({
        hospitalId: user?.hospitalId?._id || user?.hospitalId,
      });
      setAvailability(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  useEffect(() => {
    if (user?.hospitalId) {
      loadDoctors();
      loadAvailability();
    }
  }, [user]);

  const stats = useMemo(() => {
    const active = doctors.filter((doctor) => doctor.status === "active").length;
    const accepting = doctors.filter((doctor) => doctor.acceptingNewPatients).length;
    const specialties = new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean)).size;

    return {
      total: doctors.length,
      active,
      accepting,
      specialties,
    };
  }, [doctors]);

  return (
    <div className="p-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Medical Staff</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Doctors at your hospital</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This view follows the original doctor-management flow, but now it is wired to your real hospital data so staff can review who is available for AI-assisted appointment routing.
            </p>
          </div>
          {user?.role === "hospital_admin" && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add Doctor
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Doctors" value={stats.total} icon={<Users className="text-emerald-600" />} />
        <StatCard title="Active" value={stats.active} icon={<UserRoundCheck className="text-green-600" />} />
        <StatCard title="Accepting Patients" value={stats.accepting} icon={<Stethoscope className="text-sky-600" />} />
        <StatCard title="Specialties" value={stats.specialties} icon={<Stethoscope className="text-amber-600" />} />
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-xl font-semibold text-slate-900">Doctor roster</h3>
          <p className="mt-1 text-sm text-slate-500">
            {user?.hospitalId?.name || "Hospital"} currently has {stats.total} doctor{stats.total === 1 ? "" : "s"} in the system.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Consultation</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan="5">
                    Loading doctors...
                  </td>
                </tr>
              ) : doctors.length ? (
                doctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                          {initialsFromName(doctor.userId?.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doctor.userId?.fullName || "Unnamed doctor"}</p>
                          <div className="mt-1 space-y-1 text-xs text-slate-500">
                            <p className="flex items-center gap-2">
                              <Mail size={12} />
                              {doctor.userId?.email || "No email"}
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone size={12} />
                              {doctor.userId?.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">{doctor.specialty}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {doctor.yearsOfExperience || 0} year{doctor.yearsOfExperience === 1 ? "" : "s"}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {(doctor.consultationModes || []).length
                        ? doctor.consultationModes.map((mode) => formatStatus(mode)).join(", ")
                        : "In Person"}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          doctor.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : doctor.status === "on_leave"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatStatus(doctor.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan="5">
                    No doctors found for this hospital yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Doctor availability</h3>
            <p className="text-sm text-slate-500">Create and manage weekly appointment windows used by manual booking and AI scheduling.</p>
          </div>
        </div>

        {user?.role === "hospital_admin" && (
          <form
            className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSavingAvailability(true);
              setError("");

              try {
                await createAvailability({
                  doctorId: availabilityForm.doctorId,
                  dayOfWeek: Number(availabilityForm.dayOfWeek),
                  startTime: availabilityForm.startTime,
                  endTime: availabilityForm.endTime,
                  slotDurationMinutes: Number(availabilityForm.slotDurationMinutes),
                });
                setAvailabilityForm((current) => ({ ...current, doctorId: "" }));
                await loadAvailability();
              } catch (err) {
                setError(err.message);
              } finally {
                setIsSavingAvailability(false);
              }
            }}
          >
            <label className="block xl:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Doctor</span>
              <select
                value={availabilityForm.doctorId}
                onChange={(event) => setAvailabilityForm((current) => ({ ...current, doctorId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400"
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.userId?.fullName} • {doctor.specialty}
                  </option>
                ))}
              </select>
            </label>
            <SelectSmall label="Day" value={availabilityForm.dayOfWeek} onChange={(value) => setAvailabilityForm((current) => ({ ...current, dayOfWeek: value }))} options={dayLabels.map((label, index) => ({ label, value: String(index) }))} />
            <SmallInput label="Start" type="time" value={availabilityForm.startTime} onChange={(value) => setAvailabilityForm((current) => ({ ...current, startTime: value }))} />
            <SmallInput label="End" type="time" value={availabilityForm.endTime} onChange={(value) => setAvailabilityForm((current) => ({ ...current, endTime: value }))} />
            <SmallInput label="Slot Minutes" value={availabilityForm.slotDurationMinutes} onChange={(value) => setAvailabilityForm((current) => ({ ...current, slotDurationMinutes: value }))} />
            <div className="md:col-span-2 xl:col-span-5 flex justify-end">
              <button disabled={isSavingAvailability} className="rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                {isSavingAvailability ? "Saving..." : "Add Availability"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Status</th>
                {user?.role === "hospital_admin" ? <th className="px-4 py-3">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingAvailability ? (
                <tr><td className="px-4 py-6 text-sm text-slate-500" colSpan={user?.role === "hospital_admin" ? 6 : 5}>Loading availability...</td></tr>
              ) : availability.length ? (
                availability.map((item) => {
                  const doctor = doctors.find((entry) => entry._id === item.doctorId || entry._id === item.doctorId?._id);
                  return (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">{doctor?.userId?.fullName || "Doctor"}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{dayLabels[item.dayOfWeek] || item.dayOfWeek}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{item.startTime} - {item.endTime}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{item.slotDurationMinutes} min</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {user?.role === "hospital_admin" ? (
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                setIsSavingAvailability(true);
                                try {
                                  await updateAvailability(item._id, { isActive: !item.isActive });
                                  await loadAvailability();
                                } catch (err) {
                                  setError(err.message);
                                } finally {
                                  setIsSavingAvailability(false);
                                }
                              }}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              {item.isActive ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={async () => {
                                setIsSavingAvailability(true);
                                try {
                                  await deleteAvailability(item._id);
                                  await loadAvailability();
                                } catch (err) {
                                  setError(err.message);
                                } finally {
                                  setIsSavingAvailability(false);
                                }
                              }}
                              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              ) : (
                <tr><td className="px-4 py-6 text-sm text-slate-500" colSpan={user?.role === "hospital_admin" ? 6 : 5}>No availability schedules yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && user?.role === "hospital_admin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">New doctor</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Create doctor account</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsCreating(true);
                setError("");

                try {
                  await createDoctor(form);
                  setForm({
                    fullName: "",
                    email: "",
                    phone: "",
                    specialty: "",
                    password: "",
                  });
                  setIsCreateOpen(false);
                  await loadDoctors();
                } catch (err) {
                  setError(err.message);
                } finally {
                  setIsCreating(false);
                }
              }}
            >
              <DoctorInput label="Full Name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
              <DoctorInput label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
              <DoctorInput label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
              <DoctorInput label="Specialty" value={form.specialty} onChange={(value) => setForm((current) => ({ ...current, specialty: value }))} />
              <DoctorInput label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button disabled={isCreating} className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                  {isCreating ? "Creating..." : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">{icon}</div>
      </div>
    </div>
  );
}

function DoctorInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400"
        required
      />
    </label>
  );
}

function SmallInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400"
        required
      />
    </label>
  );
}

function SelectSmall({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
