from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List, Literal
from decimal import Decimal


# ── Income Schemas ─────────────────────────────────────────────────────────────

class IncomeCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    amount: Decimal = Field(..., gt=0)
    category: str
    date: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Monthly Salary",
                "amount": 5000.00,
                "category": "Salary/Wages",
                "date": "2025-01-08T10:00:00Z"
            }
        }


class IncomeResponse(BaseModel):
    id: str
    user_id: str
    title: Optional[str]
    amount: Decimal
    category: str
    date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Expense Schemas ────────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    amount: Decimal = Field(..., gt=0)
    category: str
    payment_method: Optional[str] = None
    note: Optional[str] = None
    date: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Grocery Shopping",
                "amount": 150.50,
                "category": "Food & Drink",
                "payment_method": "Cash",
                "note": "Weekly groceries",
                "date": "2025-01-08T10:00:00Z"
            }
        }


class ExpenseResponse(BaseModel):
    id: str
    user_id: str
    title: Optional[str]
    amount: Decimal
    category: str
    payment_method: Optional[str]
    note: Optional[str]
    date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Transaction Schemas ────────────────────────────────────────────────────────

class TransactionItem(BaseModel):
    id: str
    type: str
    title: Optional[str] = None
    amount: Decimal
    category: str
    payment_method: Optional[str] = None
    note: Optional[str] = None
    date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedTransactionResponse(BaseModel):
    items: List[TransactionItem]
    total_items: int
    total_pages: int


# ── Update Schemas ─────────────────────────────────────────────────────────────

class IncomeUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    date: Optional[datetime] = None


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    payment_method: Optional[str] = None
    note: Optional[str] = None
    date: Optional[datetime] = None


# ── Goal Schemas ───────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    goal_type: str = Field(..., description="income or expense")
    category: Optional[str] = Field(None)
    target_amount: Decimal = Field(..., gt=0)
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$")

    class Config:
        json_schema_extra = {
            "example": {
                "goal_type": "expense",
                "category": "Food & Drink",
                "target_amount": 500.00,
                "month": "2024-02"
            }
        }


class GoalResponse(BaseModel):
    id: str
    user_id: str
    goal_type: str
    category: Optional[str]
    target_amount: Decimal
    month: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Invoice Schemas ────────────────────────────────────────────────────────────

class InvoiceData(BaseModel):
    title: str
    amount: float
    currency: str = "LKR"
    category: str
    date: str
    payment_method: Optional[str] = None
    invoice_type: Literal["income", "expense"]
    invoice_number: Optional[str] = None
    tax_amount: Optional[float] = None
    description: Optional[str] = None
    confidence: Literal["high", "medium", "low"] = "medium"
    raw_amount_text: Optional[str] = None

    @field_validator("amount", mode="before")
    @classmethod
    def parse_amount(cls, v):
        if isinstance(v, str):
            cleaned = (
                v.replace(",", "")
                 .replace("Rs.", "")
                 .replace("LKR", "")
                 .replace("/-", "")
                 .strip()
            )
            return float(cleaned)
        return v

    @field_validator("date", mode="before")
    @classmethod
    def validate_date(cls, v):
        return str(v) if v else ""


# ── Invoice Save Request ───────────────────────────────────────────────────────
# InvoiceCard Confirm button click frontend schema data pass 
# invoice_type Income / Expense table save

class InvoiceSaveRequest(BaseModel):
    user_id: str 
    invoice_type: Literal["income", "expense"]
    title: Optional[str] = None          # vendor name → income/expense title
    amount: float                         # edited amount
    currency: str = "LKR"
    category: str                         # edited category
    date: Optional[str] = None           # YYYY-MM-DD string
    payment_method: Optional[str] = None  # expense only
    invoice_number: Optional[str] = None  # note field save 
    tax_amount: Optional[float] = None
    description: Optional[str] = None    # note field save


# Save response — frontend confirm message show 
class InvoiceSaveResponse(BaseModel):
    id: str
    invoice_type: str
    title: Optional[str]
    amount: float
    category: str
    message: str = "Saved successfully"


class InvoiceSummary(BaseModel):
    total_income: float
    total_expense: float
    net: float
    is_profit: bool
    invoice_count: int
    income_count: int
    expense_count: int