from fastapi import APIRouter, Depends

from app.agents.healthcare_agent import HealthcareAgent
from app.clients.node_api import NodeApiClient
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


async def get_node_api_client():
    client = NodeApiClient()
    try:
        yield client
    finally:
        await client.close()


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, node_api_client: NodeApiClient = Depends(get_node_api_client)):
    agent = HealthcareAgent(node_api_client)
    return await agent.run(payload)
