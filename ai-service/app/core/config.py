from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AfyaCare AI Service"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    google_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    node_api_base_url: str = "http://localhost:5000/api/v1"
    internal_api_key: str = ""
    request_timeout_seconds: int = 30
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,https://africare.vercel.app"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
