"""
app/mcp/tools/income_tools.py

MCP tools for Income — mirrors the logic in app/routes/income.py
but usable by the AI via tool calling (Gemini / OpenAI).

Income model fields:
  id          String   (uuid, auto-generated)
  user_id     String
  title       String(255)  optional
  amount      Numeric(10,2)
  category    String(100)  Salary/Wages | Freelance/Side hustle |
                           Business Income | Investment | Others
  date        DateTime     optional (defaults to now)
"""

import uuid
import asyncio
from datetime import datetime
from typing import Optional

from app.database import SessionLocal
from app.models import Income
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


INCOME_CATEGORIES = [
    "Salary/Wages",
    "Freelance/Side hustle",
    "Business Income",
    "Investment",
    "Others",
]


def register_income_tools(mcp):

    @mcp.tool()
    def add_income(
        user_id: str,
        amount: float,
        category: str,
        title: Optional[str] = None,
        date: Optional[str] = None,
    ) -> str:
        """
        Add a new income record for the user.

        category must be one of:
          Salary/Wages, Freelance/Side hustle,
          Business Income, Investment, Others

        date: YYYY-MM-DD format (optional, defaults to today)
        amount: positive number in LKR
        """
        db = SessionLocal()
        try:
            parsed_date = (
                datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()
            )

            income = Income(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=title,
                amount=amount,
                category=category,
                date=parsed_date,
            )
            db.add(income)
            db.commit()
            db.refresh(income)

            parts = ["✅ Income saved!"]
            parts.append(f"📌 Category : {category}")
            parts.append(f"💰 Amount   : LKR {float(amount):,.2f}")
            if title:
                parts.append(f"📝 Title    : {title}")
            parts.append(f"📅 Date     : {parsed_date.strftime('%Y-%m-%d')}")
            parts.append(f"🔑 ID       : {income.id}")
            _emit(user_id, "income_added")
            return "\n".join(parts)

        except Exception as e:
            db.rollback()
            return f"❌ Failed to add income: {str(e)}"
        finally:
            db.close()

    @mcp.tool()
    def remove_income(user_id: str, income_id: str) -> str:
        """
        Delete an income record by its ID.
        Only deletes if the income belongs to the given user.
        income_id is a UUID string.
        """
        db = SessionLocal()
        try:
            income = (
                db.query(Income)
                .filter(Income.id == income_id, Income.user_id == user_id)
                .first()
            )
            if not income:
                return (
                    f"❌ Income with ID '{income_id}' not found "
                    f"or does not belong to you."
                )

            label = income.title or income.category
            amount = float(income.amount)
            db.delete(income)
            db.commit()
            _emit(user_id, "income_deleted")
            return (
                f"✅ Deleted income '{label}' "
                f"(LKR {amount:,.2f}) successfully."
            )

        except Exception as e:
            db.rollback()
            return f"❌ Failed to delete income: {str(e)}"
        finally:
            db.close()

    @mcp.tool()
    def list_incomes(user_id: str, limit: int = 10) -> str:
        """
        List the most recent income records for the user.
        Returns ID, title, category, amount, date for each entry.
        Use the ID when the user wants to delete a specific income.
        """
        db = SessionLocal()
        try:
            rows = (
                db.query(Income)
                .filter(Income.user_id == user_id)
                .order_by(Income.date.desc())
                .limit(limit)
                .all()
            )
            if not rows:
                return "No income records found."

            lines = ["Recent income records:\n"]
            for i in rows:
                line = (
                    f"• [{i.id[:8]}...] "
                    f"{i.title or '(no title)'} | "
                    f"{i.category} | "
                    f"LKR {float(i.amount):,.2f} | "
                    f"{i.date.strftime('%Y-%m-%d') if i.date else 'N/A'}"
                )
                lines.append(line)
            return "\n".join(lines)

        except Exception as e:
            return f"❌ Failed to fetch incomes: {str(e)}"
        finally:
            db.close()