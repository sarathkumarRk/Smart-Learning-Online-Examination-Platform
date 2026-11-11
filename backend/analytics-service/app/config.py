from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    AUTH_SERVICE_URL: str
    COURSE_SERVICE_URL: str
    ENROLLMENT_SERVICE_URL: str
    ASSESSMENT_SERVICE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore"
    )


settings = Settings()