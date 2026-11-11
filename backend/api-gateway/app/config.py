from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    GATEWAY_HOST: str = "127.0.0.1"
    GATEWAY_PORT: int = 8000

    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    AUTH_SERVICE_URL: str
    COURSE_SERVICE_URL: str
    ENROLLMENT_SERVICE_URL: str
    ASSESSMENT_SERVICE_URL: str
    NOTIFICATION_SERVICE_URL: str
    ANALYTICS_SERVICE_URL: str

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore"
    )


settings = Settings()
