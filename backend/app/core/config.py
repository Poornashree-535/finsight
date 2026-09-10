from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "FinSight API"
    environment: str = "development"
    database_url: str = "sqlite:///./finsight.db"
    frontend_origin: str = "http://localhost:5173"
    jwt_secret_key: str = "local-dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60


settings = Settings()
