import csv
import io
from datetime import datetime
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models import User, Category, Transaction
from app.schemas.transaction import TransactionRead, ImportSummary

router = APIRouter(prefix="/transactions", tags=["transactions"])

REQUIRED_COLUMNS = {"date", "description", "amount", "type", "category"}


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.date.desc())
        .all()
    )
    return [
        {
            "id": t.id,
            "amount": t.amount,
            "category_id": t.category_id,
            "category_name": t.category.name,
            "description": t.description,
            "date": t.date,
            "type": t.type,
        }
        for t in transactions
    ]


@router.post("/import", response_model=ImportSummary)
def import_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ImportSummary:
    raw = file.file.read().decode("utf-8-sig")  # utf-8-sig handles Excel BOM
    reader = csv.DictReader(io.StringIO(raw))

    if reader.fieldnames is None or not REQUIRED_COLUMNS.issubset(
        {f.strip().lower() for f in reader.fieldnames}
    ):
        return ImportSummary(
            imported=0,
            skipped_duplicates=0,
            errors=[f"CSV must include columns: {', '.join(sorted(REQUIRED_COLUMNS))}"],
        )

    # Existing rows for this user, used to skip duplicates
    existing = {
        (t.date, t.description, t.amount)
        for t in db.query(Transaction).filter(Transaction.user_id == current_user.id)
    }

    # Cache categories by lowercase name so we don't hit the DB per row
    category_cache = {c.name.lower(): c for c in db.query(Category).all()}

    imported = 0
    skipped_duplicates = 0
    errors: list[str] = []

    for i, row in enumerate(reader, start=2):  # start=2: row 1 is the header
        try:
            row_date = datetime.strptime(row["date"].strip(), "%Y-%m-%d").date()
            description = row["description"].strip()
            amount = Decimal(row["amount"].strip())
            txn_type = row["type"].strip().lower()
            category_name = row["category"].strip()

            if txn_type not in ("income", "expense"):
                errors.append(f"Row {i}: type must be 'income' or 'expense', got '{txn_type}'")
                continue

            key = (row_date, description, amount)
            if key in existing:
                skipped_duplicates += 1
                continue

            category = category_cache.get(category_name.lower())
            if category is None:
                category = Category(name=category_name, is_default=False)
                db.add(category)
                db.flush()
                category_cache[category_name.lower()] = category

            db.add(
                Transaction(
                    user_id=current_user.id,
                    amount=amount,
                    category_id=category.id,
                    description=description,
                    date=row_date,
                    type=txn_type,
                )
            )
            existing.add(key)
            imported += 1

        except (ValueError, InvalidOperation) as exc:
            errors.append(f"Row {i}: {exc}")

    db.commit()
    return ImportSummary(imported=imported, skipped_duplicates=skipped_duplicates, errors=errors)