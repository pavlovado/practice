from pydantic_settings import BaseSettings, SettingsConfigDict


class UvicornSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="uvicorn_")
    host: str = "localhost"
    port: int = 8080
    log_level: str = "info"
    server_header: bool = False


class FastAPISettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="fastapi_")
    directory: str = "static"
