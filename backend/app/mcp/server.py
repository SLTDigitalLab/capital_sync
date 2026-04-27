"""
app/mcp/server.py

Central FastMCP server.
All tools are registered here and shared by both
Gemini and OpenAI providers.
"""

from fastmcp import FastMCP
from app.mcp.tools.expense_tools import register_expense_tools
from app.mcp.tools.income_tools import register_income_tools

mcp = FastMCP("Finance Tracker")

# Register all tools onto the server
register_expense_tools(mcp)
register_income_tools(mcp)