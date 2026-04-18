from __future__ import annotations

import re
from typing import Any


EMAIL_REGEX = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_REGEX = re.compile(r"(\+?\d[\d\s-]{7,}\d)")
NAME_PATTERNS = [
    re.compile(r"(?:my name is|i am|i'm)\s+([A-Za-z][A-Za-z\s'-]{2,})", re.IGNORECASE),
]
DATE_PATTERNS = [
    re.compile(r"\b(20\d{2}-\d{2}-\d{2})\b"),
]
LOCATION_PATTERNS = [
    re.compile(r"(?:i am in|i'm in|am in|from|located in)\s+([A-Za-z][A-Za-z\s'-]{2,})", re.IGNORECASE),
]

SPECIALTY_KEYWORDS = {
    "cardio": "Cardiology",
    "heart": "Cardiology",
    "child": "Pediatrics",
    "pediatric": "Pediatrics",
    "fever": "General Medicine",
    "headache": "General Medicine",
    "general": "General Medicine",
    "pregnan": "Obstetrics",
}


def _extract_name(text: str) -> str | None:
    for pattern in NAME_PATTERNS:
        match = pattern.search(text)
        if match:
            return " ".join(match.group(1).split()).strip()
    return None


def _extract_email(text: str) -> str | None:
    match = EMAIL_REGEX.search(text)
    return match.group(0).lower() if match else None


def _extract_phone(text: str) -> str | None:
    match = PHONE_REGEX.search(text)
    if not match:
        return None
    return re.sub(r"\s+", "", match.group(1))


def _extract_date(text: str) -> str | None:
    for pattern in DATE_PATTERNS:
        match = pattern.search(text)
        if match:
            return match.group(1)
    return None


def _extract_specialty(text: str) -> str | None:
    normalized = text.lower()
    for keyword, specialty in SPECIALTY_KEYWORDS.items():
        if keyword in normalized:
            return specialty
    return None


def _extract_location_text(text: str) -> str | None:
    for pattern in LOCATION_PATTERNS:
        match = pattern.search(text)
        if match:
          return " ".join(match.group(1).split()).strip()
    return None


def build_patient_state(
    history: list[dict[str, Any]],
    current_message: str,
    payload_patient: dict[str, Any],
    payload_specialty: str | None,
    payload_preferred_date: str | None,
) -> dict[str, Any]:
    text_parts = [item.get("content", "") for item in history if item.get("sender") == "patient"]
    text_parts.append(current_message)
    combined_text = "\n".join(text_parts)

    full_name = payload_patient.get("fullName") or _extract_name(combined_text)
    email = payload_patient.get("email") or _extract_email(combined_text)
    phone = payload_patient.get("phone") or _extract_phone(combined_text)
    preferred_date = payload_preferred_date or _extract_date(combined_text)
    specialty = payload_specialty or _extract_specialty(combined_text) or "General Medicine"

    state = {
        "fullName": full_name,
        "email": email,
        "phone": phone,
        "location": payload_patient.get("location"),
        "locationText": _extract_location_text(combined_text),
        "preferredDate": preferred_date,
        "specialty": specialty,
        "symptomSummary": current_message.strip(),
    }

    missing_fields = []
    for field in ("fullName", "email", "phone", "preferredDate"):
        if not state.get(field):
            missing_fields.append(field)

    if not state.get("location") and not state.get("locationText"):
        missing_fields.append("location")

    return {
        "patient": state,
        "missingFields": missing_fields,
        "bookingReady": len(missing_fields) == 0,
    }
