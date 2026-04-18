import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Mail, MapPin, Phone, ShieldPlus, User } from "lucide-react";
import { registerHospital, setStoredAuth } from "../lib/api";

const initialForm = {
  hospitalName: "",
  hospitalType: "hospital",
  hospitalEmail: "",
  hospitalPhone: "",
  address: "",
  adminFullName: "",
  adminEmail: "",
  adminPhone: "",
  adminPassword: "",
};

export default function RegisterHospitalPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await registerHospital({
        hospitalName: form.hospitalName,
        hospitalType: form.hospitalType,
        hospitalEmail: form.hospitalEmail,
        hospitalPhone: form.hospitalPhone,
        address: {
          fullAddress: form.address,
          city: "Kigali",
          country: "Rwanda",
        },
        admin: {
          fullName: form.adminFullName,
          email: form.adminEmail,
          phone: form.adminPhone,
          password: form.adminPassword,
        },
      });

      setStoredAuth(response.data);
      navigate("/dashboard#doctors");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f0fdf4,#dcfce7_45%,#f8fafc)] px-6 py-24 lg:px-8 lg:pt-36">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[36px] border border-emerald-100 bg-white/85 p-8 shadow-[0_24px_60px_rgba(18,38,31,0.06)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Hospital onboarding</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">
              Register your hospital and start receiving AI-assisted bookings
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Create a hospital admin account, open your dashboard, and then add doctors so appointments can be routed and approved in one place.
            </p>

            <div className="mt-8 space-y-4">
              <Feature text="Hospital admin account is created immediately." />
              <Feature text="New hospitals get their own isolated data scope." />
              <Feature text="After login, the admin can create doctors from the dashboard." />
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/" className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50">
                Back to Home
              </Link>
              <Link to="/dashboard" className="rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700">
                Staff Login
              </Link>
            </div>
          </section>

          <section className="rounded-[36px] border border-emerald-100 bg-white/90 p-8 shadow-[0_24px_60px_rgba(18,38,31,0.06)] backdrop-blur">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Hospital Name" icon={<Building2 size={18} />} value={form.hospitalName} onChange={(value) => updateField("hospitalName", value)} placeholder="King Faisal Hospital Kigali" />
                <Select label="Facility Type" value={form.hospitalType} onChange={(value) => updateField("hospitalType", value)} options={[{ label: "Hospital", value: "hospital" }, { label: "Clinic", value: "clinic" }]} />
                <Input label="Hospital Email" icon={<Mail size={18} />} type="email" value={form.hospitalEmail} onChange={(value) => updateField("hospitalEmail", value)} placeholder="admin@hospital.rw" />
                <Input label="Hospital Phone" icon={<Phone size={18} />} value={form.hospitalPhone} onChange={(value) => updateField("hospitalPhone", value)} placeholder="+2507..." />
              </div>

              <Input label="Hospital Address" icon={<MapPin size={18} />} value={form.address} onChange={(value) => updateField("address", value)} placeholder="KG 544 St, Kigali, Rwanda" />

              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <ShieldPlus className="text-emerald-600" size={20} />
                  <h2 className="text-lg font-semibold text-slate-900">Admin account</h2>
                </div>
                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <Input label="Admin Full Name" icon={<User size={18} />} value={form.adminFullName} onChange={(value) => updateField("adminFullName", value)} placeholder="Hospital administrator" />
                  <Input label="Admin Email" icon={<Mail size={18} />} type="email" value={form.adminEmail} onChange={(value) => updateField("adminEmail", value)} placeholder="admin@hospital.rw" />
                  <Input label="Admin Phone" icon={<Phone size={18} />} value={form.adminPhone} onChange={(value) => updateField("adminPhone", value)} placeholder="+2507..." />
                  <Input label="Password" icon={<ShieldPlus size={18} />} type="password" value={form.adminPassword} onChange={(value) => updateField("adminPassword", value)} placeholder="At least 8 characters" />
                </div>
              </div>

              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button disabled={isSubmitting} className="w-full rounded-2xl bg-emerald-600 px-5 py-4 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {isSubmitting ? "Creating hospital..." : "Create Hospital Account"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function Input({ label, icon, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <span className="text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none"
          required
        />
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
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

function Feature({ text }) {
  return (
    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      {text}
    </div>
  );
}
