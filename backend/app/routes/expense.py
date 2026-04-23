from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime
from app.database import get_db
from app.models import Expense
from app.schemas import ExpenseCreate, ExpenseResponse
from app.auth.firebase_auth import verify_firebase_token

router = APIRouter(prefix="/api/expense", tags=["Expense"])


@router.post("/", response_model=ExpenseResponse, status_code=201)
async def create_expense(
    expense: ExpenseCreate,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Create a new expense entry
    
    Fields:
    - title: Optional title (e.g., "Grocery Shopping")
    - amount: Expense amount (must be positive)
    - category: Expense category (Food & Drink, Housing, Transportation, Bills & Utilities, Health & Medical)
    - payment_method: Optional (Cash, Bank)
    - note: Optional note
    - date: Optional date (defaults to current time)
    """
    new_expense = Expense(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        payment_method=expense.payment_method,
        note=expense.note,
        date=expense.date or datetime.now()
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.get("/", response_model=List[ExpenseResponse])
async def get_all_expenses(
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Get all expense entries for the authenticated user
    """
    expenses = db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.date.desc()).all()
    return expenses


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: str,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Get a specific expense entry by ID
    """
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    expense_update: ExpenseCreate,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Update an existing expense entry
    """
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.title = expense_update.title
    expense.amount = expense_update.amount
    expense.category = expense_update.category
    expense.payment_method = expense_update.payment_method
    expense.note = expense_update.note
    expense.date = expense_update.date or expense.date
    expense.updated_at = datetime.now()
    
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(
    expense_id: str,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Delete an expense entry
    """
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    return None