"""
app/services/mcp_tools.py

MCP tool definitions for the AI chat.
Currently implements CREATE and READ for expenses and income.
Adding more operations later is just adding a new @tool block.
"""

from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.models import Expense, Income


# ─────────────────────────────────────────────
#  TOOL SCHEMA  (sent to the LLM as tool specs)
# ─────────────────────────────────────────────

TOOLS = [
    # ── CREATE ──────────────────────────────
    {
        "name": "create_expense",
        "description": (
            "Save a new expense to the database. "
            "Call this when the user wants to log, record, or add an expense."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "title":          {"type": "string",  "description": "Short label, e.g. 'Electricity bill'"},
                "amount":         {"type": "number",  "description": "Positive numeric amount in LKR"},
                "category":       {"type": "string",  "description": "One of: Food & Drink, Housing, Transportation, Bills & Utilities, Health & Medical, Other"},
                "payment_method": {"type": "string",  "description": "Cash or Bank (optional)"},
                "note":           {"type": "string",  "description": "Extra note (optional)"},
                "date":           {"type": "string",  "description": "ISO date YYYY-MM-DD (optional, defaults to today)"},
            },
            "required": ["title", "amount", "category"],
        },
    },
    {
        "name": "create_income",
        "description": (
            "Save a new income entry to the database. "
            "Call this when the user wants to log, record, or add income."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "title":    {"type": "string", "description": "Short label, e.g. 'Freelance payment'"},
                "amount":   {"type": "number", "description": "Positive numeric amount in LKR"},
                "category": {"type": "string", "description": "One of: Salary/Wages, Freelance/Side hustle, Business Income, Investment, Others"},
                "date":     {"type": "string", "description": "ISO date YYYY-MM-DD (optional, defaults to today)"},
            },
            "required": ["title", "amount", "category"],
        },
    },

    # ── READ ─────────────────────────────────
    {
        "name": "get_expenses",
        "description": (
            "Fetch the user's expenses from the database. "
            "Call this when the user asks about their spending, expenses, or wants a summary."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "limit":    {"type": "integer", "description": "Max records to return (default 20)"},
                "category": {"type": "string",  "description": "Filter by category (optional)"},
            },
            "required": [],
        },
    },
    {
        "name": "get_income",
        "description": (
            "Fetch the user's income entries from the database. "
            "Call this when the user asks about their earnings, income, or wants a summary."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "limit":    {"type": "integer", "description": "Max records to return (default 20)"},
                "category": {"type": "string",  "description": "Filter by category (optional)"},
            },
            "required": [],
        },
    },

    # ── Future operations go here ────────────
    # Just add another dict block with name / description / input_schema
    # and a matching handler in execute_tool() below.
]


# ─────────────────────────────────────────────
#  TOOL EXECUTOR
# ─────────────────────────────────────────────

def execute_tool(tool_name: str, tool_input: dict, user_id: str, db: Session) -> str:
    """
    Runs a tool call and returns a plain-text result string
    that is fed back into the AI conversation.
    """

    # ── create_expense ───────────────────────
    if tool_name == "create_expense":
        date = _parse_date(tool_input.get("date"))
        record = Expense(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=tool_input["title"],
            amount=float(tool_input["amount"]),
            category=tool_input["category"],
            payment_method=tool_input.get("payment_method"),
            note=tool_input.get("note"),
            date=date,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return (
            f"Expense saved ✓\n"
            f"  ID       : {record.id}\n"
            f"  Title    : {record.title}\n"
            f"  Amount   : LKR {record.amount:,.2f}\n"
            f"  Category : {record.category}\n"
            f"  Date     : {record.date}"
        )

    # ── create_income ────────────────────────
    if tool_name == "create_income":
        date = _parse_date(tool_input.get("date"))
        record = Income(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=tool_input["title"],
            amount=float(tool_input["amount"]),
            category=tool_input["category"],
            date=date,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return (
            f"Income saved ✓\n"
            f"  ID       : {record.id}\n"
            f"  Title    : {record.title}\n"
            f"  Amount   : LKR {record.amount:,.2f}\n"
            f"  Category : {record.category}\n"
            f"  Date     : {record.date}"
        )

    # ── get_expenses ─────────────────────────
    if tool_name == "get_expenses":
        limit = int(tool_input.get("limit", 20))
        query = db.query(Expense).filter(Expense.user_id == user_id)
        if cat := tool_input.get("category"):
            query = query.filter(Expense.category == cat)
        records = query.order_by(Expense.date.desc()).limit(limit).all()

        if not records:
            return "No expense records found."

        total = sum(r.amount for r in records)
        lines = [f"Found {len(records)} expense(s) — Total: LKR {total:,.2f}\n"]
        for r in records:
            lines.append(
                f"• [{r.date}] {r.title} — LKR {r.amount:,.2f} ({r.category})"
            )
        return "\n".join(lines)

    # ── get_income ───────────────────────────
    if tool_name == "get_income":
        limit = int(tool_input.get("limit", 20))
        query = db.query(Income).filter(Income.user_id == user_id)
        if cat := tool_input.get("category"):
            query = query.filter(Income.category == cat)
        records = query.order_by(Income.date.desc()).limit(limit).all()

        if not records:
            return "No income records found."

        total = sum(r.amount for r in records)
        lines = [f"Found {len(records)} income record(s) — Total: LKR {total:,.2f}\n"]
        for r in records:
            lines.append(
                f"• [{r.date}] {r.title} — LKR {r.amount:,.2f} ({r.category})"
            )
        return "\n".join(lines)

    return f"Unknown tool: {tool_name}"


# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────

def _parse_date(date_str: str | None) -> datetime:
    if not date_str:
        return datetime.now()
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return datetime.now()