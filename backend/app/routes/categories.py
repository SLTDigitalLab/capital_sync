from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Income, Expense
from app.auth.firebase_auth import verify_firebase_token

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("/")
async def get_categories(
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Return all unique categories the user has used across income and expenses.
    Returns a flat sorted list for the frontend dropdown.
    """
    income_categories = (
        db.query(Income.category)
        .filter(Income.user_id == user_id)
        .distinct()
        .all()
    )
    expense_categories = (
        db.query(Expense.category)
        .filter(Expense.user_id == user_id)
        .distinct()
        .all()
    )

    # Flatten, deduplicate, remove None, sort
    all_categories = list(set(
        [c[0] for c in income_categories if c[0]] +
        [c[0] for c in expense_categories if c[0]]
    ))
    all_categories.sort()

    return all_categories