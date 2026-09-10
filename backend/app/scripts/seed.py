"""
Seed the database with a sample user, categories, and transactions for local dev.
Run with: python -m app.scripts.seed
"""
import hashlib
import random
from datetime import date, timedelta

from app.database.session import SessionLocal
from app.models import User, Category, Transaction

CATEGORY_NAMES = [
    "Groceries", "Rent", "Utilities", "Transport",
    "Dining", "Entertainment", "Income", "Health", "Shopping",
]

SAMPLE_DESCRIPTIONS = {
    "Groceries": ["Whole Foods", "Trader Joe's", "Local Market"],
    "Rent": ["Monthly Rent"],
    "Utilities": ["Electric Bill", "Internet Bill", "Water Bill"],
    "Transport": ["Uber", "Lyft", "Metro Card"],
    "Dining": ["Chipotle", "Local Cafe", "Pizza Place"],
    "Entertainment": ["Netflix", "Spotify", "Movie Theater"],
    "Income": ["Payroll Deposit"],
    "Health": ["Pharmacy", "Gym Membership"],
    "Shopping": ["Amazon", "Target"],
}


def seed():
    db = SessionLocal()
    try:
        # 1. Create a sample user (password isn't used since auth is removed,
        # but password_hash is NOT NULL so we still need a value)
        user = db.query(User).filter_by(email="demo@finsight.dev").first()
        if not user:
            user = User(
                email="demo@finsight.dev",
                password_hash=hashlib.sha256(b"seed_password").hexdigest(),
            )
            db.add(user)
            db.flush()  # get user.id without committing yet

        # 2. Create categories (skip ones that already exist)
        categories = {}
        for name in CATEGORY_NAMES:
            existing = db.query(Category).filter_by(name=name).first()
            if existing:
                categories[name] = existing
            else:
                cat = Category(name=name, is_default=True)
                db.add(cat)
                db.flush()
                categories[name] = cat

        # 3. Generate ~5 months of transactions
        start = date.today() - timedelta(days=150)
        transactions = []
        for day_offset in range(150):
            current_date = start + timedelta(days=day_offset)

            # ~40% chance of a transaction on any given day
            if random.random() < 0.4:
                category_name = random.choice(CATEGORY_NAMES)
                description = random.choice(SAMPLE_DESCRIPTIONS[category_name])

                if category_name == "Income":
                    amount = round(random.uniform(2500, 4000), 2)
                    txn_type = "income"
                else:
                    amount = round(random.uniform(8, 250), 2)
                    txn_type = "expense"

                transactions.append(
                    Transaction(
                        user_id=user.id,
                        amount=amount,
                        category_id=categories[category_name].id,
                        description=description,
                        date=current_date,
                        type=txn_type,
                    )
                )

        db.add_all(transactions)
        db.commit()
        print(f"Seeded user '{user.email}' with {len(categories)} categories and {len(transactions)} transactions.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()