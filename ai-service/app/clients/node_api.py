from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings


class NodeApiClient:
    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            base_url=settings.node_api_base_url,
            timeout=settings.request_timeout_seconds,
            headers={"x-internal-api-key": settings.internal_api_key},
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def get_nearest_hospitals(
        self, latitude: float, longitude: float, specialty: str | None = None, limit: int = 3
    ) -> list[dict[str, Any]]:
        response = await self._client.get(
            "/internal/hospitals/nearest",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "specialty": specialty,
                "limit": limit,
            },
        )
        response.raise_for_status()
        return response.json()["data"]

    async def get_least_busy_hospitals(self, limit: int = 3) -> list[dict[str, Any]]:
        response = await self._client.get(
            "/internal/hospitals/least-busy",
            params={"limit": limit},
        )
        response.raise_for_status()
        return response.json()["data"]

    async def get_doctors(
        self, hospital_id: str | None = None, specialty: str | None = None
    ) -> list[dict[str, Any]]:
        response = await self._client.get(
            "/internal/doctors",
            params={"hospitalId": hospital_id, "specialty": specialty, "status": "active"},
        )
        response.raise_for_status()
        return response.json()["data"]

    async def get_doctor_slots(self, doctor_id: str, date: str) -> list[dict[str, Any]]:
        response = await self._client.get(f"/internal/doctors/{doctor_id}/slots", params={"date": date})
        response.raise_for_status()
        return response.json()["data"]["slots"]

    async def create_ai_appointment(self, payload: dict[str, Any]) -> dict[str, Any]:
        response = await self._client.post("/internal/appointments/ai-create", json=payload)
        response.raise_for_status()
        return response.json()["data"]

    async def send_notification(self, appointment_id: str, subject: str, html: str) -> dict[str, Any]:
        response = await self._client.post(
            "/internal/notifications/email",
            json={
                "appointmentId": appointment_id,
                "subject": subject,
                "html": html,
            },
        )
        response.raise_for_status()
        return response.json()["data"]

    async def get_messages(self, session_id: str) -> list[dict[str, Any]]:
        response = await self._client.get(f"/internal/messages/session/{session_id}")
        response.raise_for_status()
        return response.json()["data"]

    async def create_message(self, payload: dict[str, Any]) -> dict[str, Any]:
        response = await self._client.post("/internal/messages", json=payload)
        response.raise_for_status()
        return response.json()["data"]
