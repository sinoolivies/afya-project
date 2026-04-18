from __future__ import annotations

from typing import Any

from langchain.tools import StructuredTool
from pydantic import BaseModel, Field

from app.clients.node_api import NodeApiClient


class LocationInput(BaseModel):
    latitude: float
    longitude: float
    specialty: str | None = None


class LoadBalancerInput(BaseModel):
    limit: int = Field(default=3)


class CalendarInput(BaseModel):
    doctor_id: str = Field(alias="doctorId")
    date: str


class NotificationInput(BaseModel):
    appointment_id: str = Field(alias="appointmentId")
    subject: str
    html: str


def build_tools(node_api_client: NodeApiClient) -> list[StructuredTool]:
    async def nearest_hospital(latitude: float, longitude: float, specialty: str | None = None) -> list[dict[str, Any]]:
        return await node_api_client.get_nearest_hospitals(latitude, longitude, specialty=specialty)

    async def least_busy(limit: int = 3) -> list[dict[str, Any]]:
        return await node_api_client.get_least_busy_hospitals(limit=limit)

    async def calendar(doctor_id: str, date: str) -> list[dict[str, Any]]:
        return await node_api_client.get_doctor_slots(doctor_id, date)

    async def notify(appointment_id: str, subject: str, html: str) -> dict[str, Any]:
        return await node_api_client.send_notification(appointment_id, subject, html)

    return [
        StructuredTool.from_function(
            coroutine=nearest_hospital,
            name="location_tool",
            description="Select the nearest active hospital or clinic using patient coordinates and specialty.",
            args_schema=LocationInput,
        ),
        StructuredTool.from_function(
            coroutine=least_busy,
            name="load_balancer_tool",
            description="Select the least busy hospital using real appointment load.",
            args_schema=LoadBalancerInput,
        ),
        StructuredTool.from_function(
            coroutine=calendar,
            name="calendar_tool",
            description="Fetch real available doctor slots for a given date.",
            args_schema=CalendarInput,
        ),
        StructuredTool.from_function(
            coroutine=notify,
            name="notification_tool",
            description="Trigger an email notification through the Node API after a pending appointment is created.",
            args_schema=NotificationInput,
        ),
    ]
