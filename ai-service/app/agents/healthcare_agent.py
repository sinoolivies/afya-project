from __future__ import annotations

from google.api_core.exceptions import ResourceExhausted
from langchain.prompts import ChatPromptTemplate

from app.clients.node_api import NodeApiClient
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.memory_service import MemoryService
from app.services.model_factory import build_chat_model
from app.services.patient_intake_service import build_patient_state
from app.services.triage_service import assess_urgency
from app.tools.operational_tools import build_tools


class HealthcareAgent:
    def __init__(self, node_api_client: NodeApiClient) -> None:
        self.node_api_client = node_api_client
        self.memory_service = MemoryService(node_api_client)
        self.llm = build_chat_model()
        self.tools = {tool.name: tool for tool in build_tools(node_api_client)}
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are AfyaCare's healthcare scheduling assistant. "
                    "Never hallucinate hospitals, doctors, or appointments. "
                    "Only use supplied operational context. "
                    "Analyze the patient's actual symptoms and question before answering. "
                    "Explain likely urgency in plain language without claiming a diagnosis. "
                    "You may suggest emergency action, recommend a hospital, and create only pending appointments. "
                    "If booking information is missing, ask only for the next missing details you need. "
                    "Keep replies concise, calm, and safety-focused.",
                ),
                (
                    "human",
                    "Patient message: {message}\n"
                    "Triage: {triage}\n"
                    "Recent history: {history}\n"
                    "Collected patient profile: {patient_state}\n"
                    "Missing booking fields: {missing_fields}\n"
                    "Suggested hospital: {hospital}\n"
                    "Suggested doctor: {doctor}\n"
                    "Suggested slot: {slot}\n"
                    "Pending appointment: {appointment}\n",
                ),
            ]
        )

    def _symptom_guidance(self, message: str, triage: dict) -> str:
        normalized = message.lower()

        if triage.get("emergency") == "true":
            return "Your message sounds urgent enough that you should seek emergency in-person care right away."

        if any(term in normalized for term in ["chest pain", "shortness of breath", "difficulty breathing"]):
            return "Chest pain or breathing trouble can be serious, so same-day medical review is important."
        if any(term in normalized for term in ["headache", "dizziness", "migraine"]):
            return "Headache with dizziness should be assessed by a clinician, especially if it is new, severe, or worsening."
        if any(term in normalized for term in ["fever", "vomit", "vomiting", "stomach", "abdominal"]):
            return "Those symptoms may need prompt medical review, especially if they are persistent or getting worse."
        if any(term in normalized for term in ["child", "baby", "pediatric"]):
            return "Because this concerns a child, it is helpful to connect you with a pediatric clinician."

        return "I can help assess how urgent this sounds and guide you to the right next step."

    def _fallback_reply(
        self,
        *,
        triage: dict,
        patient_state: dict,
        missing_fields: list[str],
        hospital: dict | None,
        doctor: dict | None,
        slot: dict | None,
        appointment: dict | None,
    ) -> str:
        if triage.get("emergency") == "true":
            if hospital:
                return (
                    f"{self._symptom_guidance(patient_state.get('symptomSummary', ''), triage)} "
                    f"Please go to {hospital.get('name')} or the nearest emergency department immediately."
                )
            return f"{self._symptom_guidance(patient_state.get('symptomSummary', ''), triage)} Please go to the nearest emergency department immediately."

        if appointment:
            doctor_name = doctor.get("userId", {}).get("fullName") if isinstance(doctor, dict) else None
            hospital_name = hospital.get("name") if isinstance(hospital, dict) else "the hospital"
            slot_start = slot.get("start") if isinstance(slot, dict) else None
            slot_label = slot_start or "the selected time"
            return (
                f"I have created a pending appointment at {hospital_name}"
                f"{' with ' + doctor_name if doctor_name else ''} for {slot_label}. "
                "The hospital team will review it and respond."
            )

        if missing_fields:
            labels = {
                "fullName": "your full name",
                "email": "your email address",
                "phone": "your phone number",
                "preferredDate": "your preferred appointment date in YYYY-MM-DD format",
                "location": "your location or permission to use your browser location",
            }
            readable = [labels.get(field, field) for field in missing_fields[:2]]
            return (
                f"{self._symptom_guidance(patient_state.get('symptomSummary', ''), triage)} "
                f"I can continue booking for you. Please send {', '.join(readable)}."
            )

        if hospital and doctor and slot:
            return (
                f"{self._symptom_guidance(patient_state.get('symptomSummary', ''), triage)} "
                f"I found a possible appointment at {hospital.get('name')} with "
                f"{doctor.get('userId', {}).get('fullName', 'an available doctor')} on {slot.get('start')}. "
                "If that looks right, I can continue with the booking."
            )

        return (
            f"{self._symptom_guidance(patient_state.get('symptomSummary', ''), triage)} "
            "Please tell me your symptoms, preferred date, "
            "and your contact details."
        )

    async def run(self, payload: ChatRequest) -> ChatResponse:
        triage = assess_urgency(payload.message)

        memory = await self.memory_service.load_memory(payload.session_id)
        history = memory.load_memory_variables({"message": payload.message})
        persisted_messages = await self.node_api_client.get_messages(payload.session_id)

        intake = build_patient_state(
            history=persisted_messages,
            current_message=payload.message,
            payload_patient=payload.patient.model_dump(by_alias=True, exclude_none=True),
            payload_specialty=payload.specialty,
            payload_preferred_date=payload.preferred_date,
        )
        patient_state = intake["patient"]
        patient_location = patient_state.get("location")
        latitude = patient_location.get("latitude") if isinstance(patient_location, dict) else None
        longitude = patient_location.get("longitude") if isinstance(patient_location, dict) else None
        preferred_date = patient_state.get("preferredDate") or "2026-04-20"
        booking_ready = intake["bookingReady"]
        missing_fields = intake["missingFields"]

        await self.memory_service.persist_message(
            session_id=payload.session_id,
            patient_id=None,
            sender="patient",
            content=payload.message,
            metadata={"source": "frontend"},
        )

        hospital = None
        doctor = None
        slot = None
        appointment = None

        if triage["emergency"] == "true" and patient_location:
            hospitals = await self.tools["location_tool"].ainvoke(
                {
                    "latitude": latitude,
                    "longitude": longitude,
                    "specialty": patient_state.get("specialty"),
                }
            )
            hospital = hospitals[0] if hospitals else None
        elif patient_location and booking_ready:
            nearby = await self.tools["location_tool"].ainvoke(
                {
                    "latitude": latitude,
                    "longitude": longitude,
                    "specialty": patient_state.get("specialty"),
                }
            )
            balanced = await self.tools["load_balancer_tool"].ainvoke({"limit": 3})

            candidate_hospital = nearby[0] if nearby else None
            if balanced:
                best_busy_match = next(
                    (
                        item
                        for item in balanced
                        if candidate_hospital and str(item["_id"]) == str(candidate_hospital["_id"])
                    ),
                    None,
                )
                hospital = best_busy_match or candidate_hospital or balanced[0]
            else:
                hospital = candidate_hospital

            if hospital:
                doctors = await self.node_api_client.get_doctors(
                    hospital_id=str(hospital["_id"]),
                    specialty=patient_state.get("specialty"),
                )
                doctor = doctors[0] if doctors else None

            if doctor:
                slots = await self.tools["calendar_tool"].ainvoke(
                    {"doctorId": str(doctor["_id"]), "date": preferred_date}
                )
                slot = slots[0] if slots else None

            if hospital and doctor and slot and triage["emergency"] != "true":
                appointment = await self.node_api_client.create_ai_appointment(
                    {
                        "hospitalId": str(hospital["_id"]),
                        "doctorId": str(doctor["_id"]),
                        "patient": {
                            "fullName": patient_state.get("fullName"),
                            "email": patient_state.get("email"),
                            "phone": patient_state.get("phone"),
                            "location": {
                                "type": "Point",
                                "coordinates": [
                                    longitude,
                                    latitude,
                                ],
                            }
                            if patient_location
                            else None,
                        },
                        "reason": patient_state.get("specialty") or "General consultation",
                        "symptoms": payload.message,
                        "triage": triage,
                        "scheduledFor": preferred_date,
                        "slotStart": slot["start"],
                        "slotEnd": slot["end"],
                    }
                )

                await self.tools["notification_tool"].ainvoke(
                    {
                        "appointmentId": str(appointment["_id"]),
                        "subject": "New pending AI-assisted appointment",
                        "html": f"<p>Please review pending appointment {appointment['_id']}.</p>",
                    }
                )

        try:
            response_message = await self.llm.ainvoke(
                self.prompt.format_messages(
                    message=payload.message,
                    triage=triage,
                    history=history.get("chat_history", []),
                    patient_state=patient_state,
                    missing_fields=missing_fields,
                    hospital=hospital,
                    doctor=doctor,
                    slot=slot,
                    appointment=appointment,
                )
            )
            reply = response_message.content
        except ResourceExhausted:
            reply = self._fallback_reply(
                triage=triage,
                patient_state=patient_state,
                missing_fields=missing_fields,
                hospital=hospital,
                doctor=doctor,
                slot=slot,
                appointment=appointment,
            )
        except Exception:
            reply = self._fallback_reply(
                triage=triage,
                patient_state=patient_state,
                missing_fields=missing_fields,
                hospital=hospital,
                doctor=doctor,
                slot=slot,
                appointment=appointment,
            )

        appointment_patient_id = None
        appointment_hospital_id = None
        appointment_id = None

        if appointment:
            appointment_id = appointment.get("_id")
            appointment_hospital_id = (
                appointment.get("hospitalId", {}).get("_id")
                if isinstance(appointment.get("hospitalId"), dict)
                else appointment.get("hospitalId")
            )
            appointment_patient_id = (
                appointment.get("patientId", {}).get("_id")
                if isinstance(appointment.get("patientId"), dict)
                else appointment.get("patientId")
            )

        await self.memory_service.persist_message(
            session_id=payload.session_id,
            patient_id=appointment_patient_id,
            sender="assistant",
            content=reply,
            hospital_id=appointment_hospital_id if appointment else (hospital["_id"] if hospital else None),
            appointment_id=appointment_id,
            metadata={
                "triage": triage,
                "hospital": hospital,
                "doctor": doctor,
                "slot": slot,
            },
        )

        return ChatResponse(
            reply=reply,
            triage=triage,
            suggested_hospital=hospital,
            suggested_doctor=doctor,
            suggested_slot=slot,
            appointment=appointment,
            bookingReady=booking_ready and appointment is not None,
            missingFields=missing_fields,
            collectedPatient=patient_state,
        )
