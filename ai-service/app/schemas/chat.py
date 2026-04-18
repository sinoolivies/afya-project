from typing import Any

from pydantic import BaseModel, Field


class PatientLocation(BaseModel):
    latitude: float
    longitude: float


class PatientPayload(BaseModel):
    full_name: str | None = Field(default=None, alias="fullName")
    email: str | None = None
    phone: str | None = None
    location: PatientLocation | None = None


class ChatRequest(BaseModel):
    session_id: str = Field(alias="sessionId")
    message: str
    patient: PatientPayload
    preferred_date: str | None = Field(default=None, alias="preferredDate")
    specialty: str | None = None


class ChatResponse(BaseModel):
    reply: str
    triage: dict[str, Any]
    suggested_hospital: dict[str, Any] | None = None
    suggested_doctor: dict[str, Any] | None = None
    suggested_slot: dict[str, Any] | None = None
    appointment: dict[str, Any] | None = None
    booking_ready: bool = Field(default=False, alias="bookingReady")
    missing_fields: list[str] = Field(default_factory=list, alias="missingFields")
    collected_patient: dict[str, Any] = Field(default_factory=dict, alias="collectedPatient")
