import { Bell, Building2, LoaderCircle, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { useMemo, useState } from "react";
import { updateHospital } from "../../../lib/api";

const titleCase = (value = "") =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function SettingsPanel({ user, onHospitalUpdated }) {
  const hospital = user?.hospitalId;
  const [form, setForm] = useState({
    name: hospital?.name || "",
    type: hospital?.type || "hospital",
    email: hospital?.contact?.email || "",
    phone: hospital?.contact?.phone || "",
    address: hospital?.address?.fullAddress || "",
    departments: (hospital?.departments || []).join(", "),
    acceptingAppointments: hospital?.acceptingAppointments ?? true,
    supportsEmergency: hospital?.supportsEmergency ?? false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  const accountStatus = useMemo(() => titleCase(user?.status || "active"), [user]);

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    setError("");

    try {
      await updateHospital(hospital?._id, {
        name: form.name,
        type: form.type,
        contact: {
          email: form.email,
          phone: form.phone,
        },
        address: {
          ...hospital?.address,
          fullAddress: form.address,
        },
        departments: form.departments
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        acceptingAppointments: form.acceptingAppointments,
        supportsEmergency: form.supportsEmergency,
      });
      setSaveMessage("Hospital settings updated successfully.");
      onHospitalUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <User className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Account</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Signed-in staff profile</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoBlock label="Full Name" value={user?.fullName || "Unknown"} />
          <InfoBlock label="Role" value={titleCase(user?.role || "")} />
          <InfoBlock label="Email Address" value={user?.email || "Unknown"} icon={<Mail size={16} />} />
          <InfoBlock label="Phone Number" value={user?.phone || "Not provided"} icon={<Phone size={16} />} />
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Hospital</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Facility details</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Hospital Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <SelectField label="Facility Type" value={form.type} onChange={(value) => setForm((current) => ({ ...current, type: value }))} options={[{ label: "Hospital", value: "hospital" }, { label: "Clinic", value: "clinic" }]} />
          <Field label="Hospital Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} icon={<Mail size={16} />} type="email" />
          <Field label="Hospital Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} icon={<Phone size={16} />} />
          <Field label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} icon={<MapPin size={16} />} className="md:col-span-2" />
          <Field label="Departments" value={form.departments} onChange={(value) => setForm((current) => ({ ...current, departments: value }))} className="md:col-span-2" placeholder="Cardiology, General Medicine, Pediatrics" />
          <ToggleField label="Accepting Appointments" checked={form.acceptingAppointments} onChange={(checked) => setForm((current) => ({ ...current, acceptingAppointments: checked }))} />
          <ToggleField label="Emergency Support" checked={form.supportsEmergency} onChange={(checked) => setForm((current) => ({ ...current, supportsEmergency: checked }))} />
        </div>

        {(error || saveMessage) && (
          <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${error ? "border border-red-200 bg-red-50 text-red-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {error || saveMessage}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60" disabled={isSaving}>
            {isSaving ? <LoaderCircle size={18} className="animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Hospital Settings"}
          </button>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
              <Bell className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Notification workflow</h3>
              <p className="mt-1 text-sm text-slate-500">
                AI-created bookings notify the hospital admin first, then patients receive updates after approval or rejection.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <WorkflowItem text="Pending appointments appear in the dashboard notification queue." />
            <WorkflowItem text="Admin approval sends a patient confirmation email automatically." />
            <WorkflowItem text="Doctors see only their scoped appointments when signed in as doctor." />
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Security and access</h3>
              <p className="mt-1 text-sm text-slate-500">
                Authentication, hospital scoping, and email-based notifications are all active in this environment.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <InfoBlock label="Account Status" value={accountStatus} />
            <InfoBlock label="Hospital Scope" value={hospital?.slug || "Scoped via token"} />
            <InfoBlock label="Dashboard Access" value={user?.role === "doctor" ? "Doctor workflow" : "Hospital admin workflow"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, icon = null, type = "text", className = "", placeholder = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
        {icon ? <span className="text-slate-400">{icon}</span> : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
        />
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none"
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

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-14 rounded-full transition ${checked ? "bg-emerald-600" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-8" : "left-1"}`}
        />
      </button>
    </label>
  );
}

function InfoBlock({ label, value, icon = null }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function WorkflowItem({ text }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      {text}
    </div>
  );
}
