from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import User


DEMO_USER_EMAIL = "demo@finsight.dev"


def get_current_user(db: Session = Depends(get_db)) -> User:
    # Auth is currently removed — use the fixed demo user rather than
    # trusting row order, since stray/test users can exist in the DB.
    user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found. Run the seed script first.")
    return user