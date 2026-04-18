import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  LoaderCircle,
  Mail,
  Phone,
  Stethoscope,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import ImageWithFallback from "../components/ImageWithFallback";
import { createManualAppointment, fetchDoctorSlots, fetchDoctors, fetchHospitals } from "../lib/api";
import doc2 from "../assets/images/doc2.PNG";
import doc4 from "../assets/images/doc 4.PNG";
import doc7 from "../assets/images/doc 7.PNG";
import docOther from "../assets/images/doc....PNG";

const doctorImages = [doc2, doc4, doc7, docOther];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

function formatDateLabel(value) {
  return new Date(value).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeLabel(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMinimumDate() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadHospitals() {
      setIsLoadingHospitals(true);
      setError("");

      try {
        const response = await fetchHospitals({ status: "active" });
        if (mounted) {
          setHospitals(response.data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setIsLoadingHospitals(false);
        }
      }
    }

    loadHospitals();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDoctors() {
      if (!selectedHospital?._id) {
        setDoctors([]);
        return;
      }

      setIsLoadingDoctors(true);
      setError("");

      try {
        const response = await fetchDoctors({
          hospitalId: selectedHospital._id,
          status: "active",
        });

        if (mounted) {
          setDoctors(response.data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setIsLoadingDoctors(false);
        }
      }
    }

    loadDoctors();

    return () => {
      mounted = false;
    };
  }, [selectedHospital]);

  useEffect(() => {
    let mounted = true;

    async function loadSlots() {
      if (!selectedDoctor?._id || !selectedDate) {
        setSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      setError("");

      try {
        const response = await fetchDoctorSlots(selectedDoctor._id, selectedDate);
        if (mounted) {
          setSlots(response.data?.slots || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setSlots([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      mounted = false;
    };
  }, [selectedDoctor, selectedDate]);

  const decoratedDoctors = useMemo(
    () =>
      doctors.map((doctor, index) => ({
        ...doctor,
        image: doctorImages[index % doctorImages.length],
        rating: (4.7 + (index % 3) * 0.1).toFixed(1),
        experience: `${doctor.yearsOfExperience || 1} years`,
        availability: (doctor.languages || []).slice(0, 3),
      })),
    [doctors]
  );

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedSlot(null);
    setStep(2);
    setError("");
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setSelectedSlot(null);
    setStep(3);
    setError("");
  };

  const handleBooking = async (event) => {
    event.preventDefault();
    if (!selectedHospital || !selectedDoctor || !selectedSlot) {
      setError("Please complete the hospital, doctor, and slot selection first.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await createManualAppointment({
        hospitalId: selectedHospital._id,
        doctorId: selectedDoctor._id,
        patient: {
          fullName: patientInfo.name,
          email: patientInfo.email,
          phone: patientInfo.phone,
        },
        reason: patientInfo.reason,
        symptoms: patientInfo.reason,
        scheduledFor: selectedDate,
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end,
      });

      setCreatedAppointment(response.data);
      setBookingConfirmed(true);
      setStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedSlot(null);
    setPatientInfo({ name: "", email: "", phone: "", reason: "" });
    setBookingConfirmed(false);
    setCreatedAppointment(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 pt-20 text-center lg:pt-28"
        >
          <h1 className="text-5xl text-gray-900 mb-4">Book an Appointment</h1>
          <p className="text-xl text-gray-600">Choose your preferred hospital and doctor</p>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-slate-500">
            The AI assistant can still help through chat, but this page keeps the full manual booking flow and submits real pending appointments to the backend for hospital approval.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    step >= stepNum ? "bg-[#2E7D32] text-white scale-110" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > stepNum ? <CheckCircle2 className="h-6 w-6" /> : <span>{stepNum}</span>}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`mx-2 h-1 w-16 transition-all duration-300 ${
                      step > stepNum ? "bg-[#2E7D32]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-16 text-sm text-gray-600">
            <span className={step >= 1 ? "text-[#2E7D32]" : ""}>Hospital</span>
            <span className={step >= 2 ? "text-[#2E7D32]" : ""}>Doctor</span>
            <span className={step >= 3 ? "text-[#2E7D32]" : ""}>Date & Time</span>
            <span className={step >= 4 ? "text-[#2E7D32]" : ""}>Details</span>
          </div>
        </motion.div>

        {error && (
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <h2 className="mb-8 text-center text-3xl text-gray-900">Select a Hospital or Clinic</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {isLoadingHospitals ? (
                <div className="col-span-full rounded-2xl bg-white/80 p-10 text-center text-slate-500 shadow-lg">
                  Loading hospitals...
                </div>
              ) : (
                hospitals.map((hospital) => (
                  <motion.div key={hospital._id} variants={itemVariants}>
                    <div
                      className="cursor-pointer rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
                      onClick={() => handleHospitalSelect(hospital)}
                      style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] shadow-lg">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-2 text-xl text-gray-900">{hospital.name}</h3>
                      <p className="mb-4 text-sm text-gray-600">{hospital.address?.fullAddress || hospital.address?.city}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-[#2E7D32]">
                          {hospital.type}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-sky-700">
                          {(hospital.departments || []).length} departments
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && selectedHospital && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <h2 className="mb-8 text-center text-3xl text-gray-900">
              Select a Doctor at {selectedHospital.name}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {isLoadingDoctors ? (
                <div className="col-span-full rounded-2xl bg-white/80 p-10 text-center text-slate-500 shadow-lg">
                  Loading doctors...
                </div>
              ) : decoratedDoctors.length ? (
                decoratedDoctors.map((doctor) => (
                  <motion.div key={doctor._id} variants={itemVariants}>
                    <div
                      className="cursor-pointer rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
                      onClick={() => handleDoctorSelect(doctor)}
                      style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}
                    >
                      <div className="flex gap-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg">
                          <ImageWithFallback src={doctor.image} alt={doctor.userId?.fullName} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 text-xl text-gray-900">{doctor.userId?.fullName}</h3>
                          <p className="mb-2 text-[#2E7D32]">{doctor.specialty}</p>
                          <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
                            <span>⭐ {doctor.rating}</span>
                            <span>• {doctor.experience} exp</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {doctor.availability.length ? (
                              doctor.availability.map((label) => (
                                <span
                                  key={label}
                                  className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-[#2E7D32]"
                                >
                                  {label}
                                </span>
                              ))
                            ) : (
                              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-[#2E7D32]">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full rounded-2xl bg-white/80 p-10 text-center text-slate-500 shadow-lg">
                  No doctors available for this hospital right now.
                </div>
              )}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedHospital(null);
                }}
                className="rounded-xl border-2 border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Back to Hospitals
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="mx-auto max-w-3xl rounded-2xl border-0 bg-white/80 p-8 shadow-xl backdrop-blur-sm"
              style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}
            >
              <h2 className="mb-8 text-center text-3xl text-gray-900">Choose Date & Time</h2>

              <div className="mb-8">
                <label className="mb-3 block text-lg">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedSlot(null);
                  }}
                  min={getMinimumDate()}
                  className="w-full rounded-xl border-2 border-gray-200 py-6 text-lg focus:border-[#2E7D32]"
                />
              </div>

              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <label className="mb-3 block text-lg">Select Time</label>
                  {isLoadingSlots ? (
                    <div className="mb-8 flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-slate-500">
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Loading available slots...
                    </div>
                  ) : slots.length ? (
                    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                      {slots.map((slot) => (
                        <button
                          key={slot.start}
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center justify-center rounded-xl py-6 transition-all duration-300 ${
                            selectedSlot?.start === slot.start
                              ? "bg-[#2E7D32] text-white scale-105"
                              : "border-2 border-gray-200 text-gray-700 hover:border-[#2E7D32]"
                          }`}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {formatTimeLabel(slot.start)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-8 rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
                      No free slots found for {formatDateLabel(selectedDate)}.
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 rounded-xl border-2 border-gray-300 py-6 hover:bg-gray-50">
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!selectedDate || !selectedSlot}
                  className="flex-1 rounded-xl bg-[#2E7D32] py-6 text-white disabled:opacity-50 hover:bg-[#1B5E20]"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="mx-auto max-w-2xl rounded-2xl border-0 bg-white/80 p-8 shadow-xl backdrop-blur-sm"
              style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}
            >
              <h2 className="mb-8 text-center text-3xl text-gray-900">Your Information</h2>

              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <label className="mb-2 block text-lg">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={patientInfo.name}
                      onChange={(event) => setPatientInfo({ ...patientInfo, name: event.target.value })}
                      required
                      className="w-full rounded-xl border-2 border-gray-200 py-6 pl-12 focus:border-[#2E7D32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-lg">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={patientInfo.email}
                      onChange={(event) => setPatientInfo({ ...patientInfo, email: event.target.value })}
                      required
                      className="w-full rounded-xl border-2 border-gray-200 py-6 pl-12 focus:border-[#2E7D32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-lg">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+2507xxxxxxxx"
                      value={patientInfo.phone}
                      onChange={(event) => setPatientInfo({ ...patientInfo, phone: event.target.value })}
                      required
                      className="w-full rounded-xl border-2 border-gray-200 py-6 pl-12 focus:border-[#2E7D32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-lg">Reason for Visit</label>
                  <textarea
                    placeholder="Briefly describe your symptoms or reason for appointment..."
                    value={patientInfo.reason}
                    onChange={(event) => setPatientInfo({ ...patientInfo, reason: event.target.value })}
                    required
                    rows={4}
                    className="w-full rounded-xl border-2 border-gray-200 p-4 focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 p-5 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Booking summary</p>
                  <p className="mt-2">{selectedHospital?.name}</p>
                  <p>{selectedDoctor?.userId?.fullName} • {selectedDoctor?.specialty}</p>
                  <p>{selectedDate ? formatDateLabel(selectedDate) : ""} {selectedSlot ? `at ${formatTimeLabel(selectedSlot.start)}` : ""}</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-xl border-2 border-gray-300 py-6 hover:bg-gray-50">
                    Back
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-[#2E7D32] py-6 text-white hover:bg-[#1B5E20] disabled:opacity-60">
                    {isSubmitting ? "Submitting..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {step === 5 && bookingConfirmed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <div
              className="mx-auto max-w-2xl rounded-2xl border-0 bg-white/90 p-12 text-center shadow-2xl backdrop-blur-sm"
              style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] shadow-xl"
              >
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>

              <h2 className="mb-4 text-4xl text-gray-900">Booking Submitted!</h2>
              <p className="mb-8 text-lg text-gray-600">
                Your appointment request has been sent and is now waiting for hospital approval.
              </p>

              <div className="mb-8 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 p-6 text-left">
                <h3 className="mb-4 text-xl text-gray-900">Appointment Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-[#2E7D32]" />
                    <span className="text-gray-700">{selectedHospital?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-[#2E7D32]" />
                    <span className="text-gray-700">{selectedDoctor?.userId?.fullName} - {selectedDoctor?.specialty}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-[#2E7D32]" />
                    <span className="text-gray-700">
                      {createdAppointment?.slotStart ? formatDateLabel(createdAppointment.slotStart) : selectedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#2E7D32]" />
                    <span className="text-gray-700">
                      {createdAppointment?.slotStart ? formatTimeLabel(createdAppointment.slotStart) : selectedSlot ? formatTimeLabel(selectedSlot.start) : ""}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-8 text-gray-600">
                A hospital notification has been sent, and updates will be emailed to{" "}
                <span className="text-[#2E7D32]">{patientInfo.email}</span>.
              </p>

              <button onClick={resetBooking} className="rounded-xl bg-[#2E7D32] px-8 py-6 text-lg text-white hover:bg-[#1B5E20]">
                Book Another Appointment
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
