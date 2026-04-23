from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
import uuid
import json

from app.schemas import InvoiceData, InvoiceSaveRequest, InvoiceSaveResponse
from app.services.google import extract_invoice as gemini_extract
from app.services.openai import extract_invoice as openai_extract
from app.models import Income, Expense
from app.database import get_db
from app.auth.firebase_auth import verify_firebase_token

router = APIRouter(prefix="/extract", tags=["Extract"])


# ── POST /extract/invoice ──────────────────────────────────────────────────────
# Auth required — user must be logged in to extract
@router.post("/invoice", response_model=InvoiceData)
async def extract_invoice_endpoint(
    file: UploadFile = File(...),
    provider: str = Query(default="gemini", enum=["gemini", "openai"]),
    user_id: str = Depends(verify_firebase_token),
):
    try:
        if provider == "openai":
            result = await openai_extract(file)
        else:
            result = await gemini_extract(file)

        return InvoiceData(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /extract/save ─────────────────────────────────────────────────────────
# No token needed — user_id comes from request body
# Frontend passes user_id from already-authenticated session
@router.post("/save", response_model=InvoiceSaveResponse)
async def save_invoice_endpoint(
    payload: InvoiceSaveRequest,
    db: Session = Depends(get_db),
):
    print("\n" + "=" * 50)
    print("INVOICE SAVE REQUEST RECEIVED")
    print(f"User ID: {payload.user_id}")
    print("=" * 50)
    print(json.dumps(payload.model_dump(), indent=2, default=str))
    print("=" * 50 + "\n")

    try:
        # Validate user_id
        if not payload.user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        # Parse date
        parsed_date = None
        if payload.date:
            try:
                parsed_date = datetime.strptime(payload.date[:10], "%Y-%m-%d")
            except ValueError:
                parsed_date = None

        # Build note from extra fields
        note_parts = []
        if payload.invoice_number:
            note_parts.append(f"Invoice: {payload.invoice_number}")
        if payload.description:
            note_parts.append(payload.description)
        if payload.tax_amount:
            note_parts.append(f"Tax: {payload.currency} {payload.tax_amount}")
        note = " | ".join(note_parts) if note_parts else None

        record_id = str(uuid.uuid4())

        if payload.invoice_type == "income":
            record = Income(
                id=record_id,
                user_id=payload.user_id,
                title=payload.title,
                amount=Decimal(str(payload.amount)),
                category=payload.category,
                date=parsed_date,
            )
        else:
            record = Expense(
                id=record_id,
                user_id=payload.user_id,
                title=payload.title,
                amount=Decimal(str(payload.amount)),
                category=payload.category,
                payment_method=payload.payment_method,
                note=note,
                date=parsed_date,
            )

        db.add(record)
        db.commit()
        db.refresh(record)

        print(f"Saved to DB -> {payload.invoice_type.upper()} | ID: {record_id}")
        print(f"User: {payload.user_id} | Title: {payload.title} | Amount: {payload.currency} {payload.amount}\n")

        return InvoiceSaveResponse(
            id=record_id,
            invoice_type=payload.invoice_type,
            title=payload.title,
            amount=payload.amount,
            category=payload.category,
            message="Saved successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"DB Save Error: {e}\n")
        raise HTTPException(status_code=500, detail=str(e))