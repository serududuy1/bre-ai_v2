from pydantic import BaseModel


class AutoReconHistoryItem(BaseModel):
    id: int
    job_name: str
    key_column: str
    input_files: list[str]
    summary: dict
    output_path: str | None = None

    model_config = {"from_attributes": True}
