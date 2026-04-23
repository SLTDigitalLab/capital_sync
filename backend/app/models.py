from sqlalchemy import Column, String, Numeric, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum

class TransactionType(enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class Income(Base):
    __tablename__ = "incomes"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String(255), nullable=True)  # Title/Description
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=False)  # Salary/Wages, Freelance, Business, Investment, Others
    date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String(255), nullable=True)  # Title
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=False)  # Food & Drink, Housing, Transportation, Bills, Health
    payment_method = Column(String(50), nullable=True)  # Cash, Bank
    note = Column(Text, nullable=True)  # Optional note
    date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Goal(Base):
    __tablename__ = "goals"  
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    goal_type = Column(String(50), nullable=False)
    category = Column(String(100), nullable=True)
    target_amount = Column(Numeric(10, 2), nullable=False)
    month = Column(String(7), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())