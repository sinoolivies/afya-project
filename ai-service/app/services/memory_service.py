from __future__ import annotations

from langchain.memory import ConversationBufferMemory
from langchain.schema import AIMessage, HumanMessage

from app.clients.node_api import NodeApiClient


class MemoryService:
    def __init__(self, node_api_client: NodeApiClient) -> None:
        self.node_api_client = node_api_client

    async def load_memory(self, session_id: str) -> ConversationBufferMemory:
        memory = ConversationBufferMemory(return_messages=True, memory_key="chat_history", input_key="message")
        history = await self.node_api_client.get_messages(session_id)

        for message in history:
            if message["sender"] == "patient":
                memory.chat_memory.add_message(HumanMessage(content=message["content"]))
            elif message["sender"] == "assistant":
                memory.chat_memory.add_message(AIMessage(content=message["content"]))

        return memory

    async def persist_message(
        self,
        session_id: str,
        patient_id: str | None,
        sender: str,
        content: str,
        hospital_id: str | None = None,
        appointment_id: str | None = None,
        metadata: dict | None = None,
    ) -> None:
        payload = {
            "sessionId": session_id,
            "patientId": patient_id,
            "hospitalId": hospital_id,
            "appointmentId": appointment_id,
            "sender": sender,
            "content": content,
            "metadata": metadata or {},
        }
        await self.node_api_client.create_message(payload)
