from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: Decimal
    category_id: int
    category_name: str
    description: str
    date: date
    type: str


class ImportSummary(BaseModel):
    imported: int
    skipped_duplicates: int
    errors: list[str]