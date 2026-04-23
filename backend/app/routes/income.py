from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime
from app.database import get_db
from app.models import Income
from app.schemas import IncomeCreate, IncomeResponse
from app.auth.firebase_auth import verify_firebase_token

router = APIRouter(prefix="/api/income", tags=["Income"])


@router.post("/", response_model=IncomeResponse, status_code=201)
async def create_income(
    income: IncomeCreate,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Create a new income entry
    
    Fields:
    - title: Optional title/description (e.g., "Monthly Salary")
    - amount: Income amount (must be positive)
    - category: Income source (Salary/Wages, Freelance/Side hustle, Business Income, Investment, Others)
    - date: Optional date (defaults to current time)
    """
    new_income = Income(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=income.title,
        amount=income.amount,
        category=income.category,
        date=income.date or datetime.now()
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income


@router.get("/", response_model=List[IncomeResponse])
async def get_all_incomes(
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Get all income entries for the authenticated user
    """
    incomes = db.query(Income).filter(Income.user_id == user_id).order_by(Income.date.desc()).all()
    return incomes


@router.get("/{income_id}", response_model=IncomeResponse)
async def get_income(
    income_id: str,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Get a specific income entry by ID
    """
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == user_id
    ).first()
    
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    return income

@router.get("/{}")

@router.put("/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: str,
    income_update: IncomeCreate,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Update an existing income entry
    """
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == user_id
    ).first()
    
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    income.title = income_update.title
    income.amount = income_update.amount
    income.category = income_update.category
    income.date = income_update.date or income.date
    income.updated_at = datetime.now()
    
    db.commit()
    db.refresh(income)
    return income


@router.delete("/{income_id}", status_code=204)
async def delete_income(
    income_id: str,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """
    Delete an income entry
    """
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == user_id
    ).first()
    
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    db.delete(income)
    db.commit()
    return None