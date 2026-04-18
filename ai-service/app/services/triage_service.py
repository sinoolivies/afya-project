from __future__ import annotations


EMERGENCY_KEYWORDS = {
    "severe chest pain",
    "can not breathe",
    "can't breathe",
    "unconscious",
    "stroke",
    "bleeding heavily",
    "seizure",
    "suicidal",
}


def assess_urgency(message: str) -> dict[str, str]:
    normalized = message.lower()

    if any(keyword in normalized for keyword in EMERGENCY_KEYWORDS):
        return {
            "urgency": "emergency",
            "emergency": "true",
            "summary": "Symptoms suggest an emergency. Direct the patient to immediate in-person emergency care.",
        }

    if any(keyword in normalized for keyword in ["urgent", "pain", "fever", "dizzy", "vomit"]):
        return {
            "urgency": "high",
            "emergency": "false",
            "summary": "Symptoms may need prompt same-day review.",
        }

    return {
        "urgency": "medium",
        "emergency": "false",
        "summary": "Symptoms appear suitable for routine triage and appointment coordination.",
    }
