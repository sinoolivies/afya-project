from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings


def build_chat_model():
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.google_api_key,
        temperature=0.2,
    )
