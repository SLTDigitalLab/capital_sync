import sys
import os
import asyncio

os.chdir('..\\backend')
sys.path.append(os.getcwd())

from app.mcp.server import mcp

async def main():
    tools = await mcp.list_tools()
    if tools:
        t = tools[0]
        print("Tool dir:", dir(t))
        print("Tool properties:", vars(t))
        
if __name__ == "__main__":
    asyncio.run(main())
