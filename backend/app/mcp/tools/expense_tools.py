"""
app/mcp/tools/expense_tools.py

MCP tools for Expense — mirrors the logic in app/routes/expense.py
but usable by the AI via tool calling (Gemini / OpenAI).

Expense model fields:
  id              String   (uuid, auto-generated)
  user_id         String
  title           String(255)  optional
  amount          Numeric(10,2)
  category        String(100)  Food & Drink | Housing | Transportation |
                               Bills & Utilities | Health & Medical
  payment_method  String(50)   optional  Cash | Bank
  note            Text         optional
  date            DateTime     optional (defaults to now)
"""

import uuid
import asyncio
from datetime import datetime
from typing import Optional

from app.database import SessionLocal
from app.models import Expense
from app.socket_manager import sio


def _emit(user_id: str, event_type: str):
    """Fire-and-forget socket emit from a sync context."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.ensure_future(sio.emit("data_updated", {"type": event_type}, room=user_id))
        else:
            loop.run_until_complete(sio.emit("data_updated", {"type": event_type}, room=user_id))
    except Exception:
        pass  # never crash a tool call over a socket error


# Valid options — shown to the AI so it picks correct values
EXPENSE_CATEGORIES = [
    "Food & Drink",
    "Housing",
    "Transportation",
    "Bills & Utilities",
    "Health & Medical",
    "Others",
]

PAYMENT_METHODS = ["Cash", "Bank"]


def register_expense_tools(mcp):

    @mcp.tool()
    def add_expense(
        user_id: str,
        amount: float,
        category: str,
        title: Optional[str] = None,
        payment_method: Optional[str] = None,
        note: Optional[str] = None,
        date: Optional[str] = None,
    ) -> str:
        """
        Add a new expense for the user.

        category must be one of:
          Food & Drink, Housing, Transportation,
          Bills & Utilities, Health & Medical, Others

        payment_method: Cash or Bank (optional)
        date: YYYY-MM-DD format (optional, defaults to today)
        amount: positive number in LKR
        """
        db = SessionLocal()
        try:
            parsed_date = (
                datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()
            )

            expense = Expense(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=title,
                amount=amount,
                category=category,
                payment_method=payment_method,
                note=note,
                date=parsed_date,
            )
            db.add(expense)
            db.commit()
            db.refresh(expense)

            parts = [f"✅ Expense saved!"]
            parts.append(f"📌 Category : {category}")
            parts.append(f"💸 Amount   : LKR {float(amount):,.2f}")
            if title:
                parts.append(f"📝 Title    : {title}")
            if payment_method:
                parts.append(f"💳 Payment  : {payment_method}")
            if note:
                parts.append(f"🗒  Note     : {note}")
            parts.append(f"📅 Date     : {parsed_date.strftime('%Y-%m-%d')}")
            parts.append(f"🔑 ID       : {expense.id}")
            _emit(user_id, "expense_added")
            return "\n".join(parts)

        except Exception as e:
            db.rollback()
            return f"❌ Failed to add expense: {str(e)}"
        finally:
            db.close()

    @mcp.tool()
    def remove_expense(user_id: str, expense_id: str) -> str:
        """
        Delete an expense by its ID.
        Only deletes if the expense belongs to the given user.
        expense_id is a UUID string.
        """
        db = SessionLocal()
        try:
            expense = (
                db.query(Expense)
                .filter(Expense.id == expense_id, Expense.user_id == user_id)
                .first()
            )
            if not expense:
                return (
                    f"❌ Expense with ID '{expense_id}' not found "
                    f"or does not belong to you."
                )

            label = expense.title or expense.category
            amount = float(expense.amount)
            db.delete(expense)
            db.commit()
            _emit(user_id, "expense_deleted")
            return (
                f"✅ Deleted expense '{label}' "
                f"(LKR {amount:,.2f}) successfully."
            )

        except Exception as e:
            db.rollback()
            return f"❌ Failed to delete expense: {str(e)}"
        finally:
            db.close()

    @mcp.tool()
    def list_expenses(user_id: str, limit: int = 10) -> str:
        """
        List the most recent expenses for the user.
        Returns ID, title, category, amount, date for each entry.
        Use the ID when the user wants to delete a specific expense.
        """
        db = SessionLocal()
        try:
            rows = (
                db.query(Expense)
                .filter(Expense.user_id == user_id)
                .order_by(Expense.date.desc())
                .limit(limit)
                .all()
            )
            if not rows:
                return "No expenses found."

            lines = ["Recent expenses:\n"]
            for e in rows:
                line = (
                    f"• [{e.id[:8]}...] "
                    f"{e.title or '(no title)'} | "
                    f"{e.category} | "
                    f"LKR {float(e.amount):,.2f} | "
                    f"{e.date.strftime('%Y-%m-%d') if e.date else 'N/A'}"
                )
                lines.append(line)
            return "\n".join(lines)

        except Exception as e:
            return f"❌ Failed to fetch expenses: {str(e)}"
        finally:
            db.close()