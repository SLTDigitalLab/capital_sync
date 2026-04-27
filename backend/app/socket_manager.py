"""
app/socket_manager.py

Shared Socket.IO async server instance.
Imported by main.py (to mount) and by routes/tools (to emit events).
"""

import socketio

# Async Socket.IO server — allows multiple origins so the Vite dev
# server on localhost:5173 can connect.
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)


@sio.event
async def connect(sid, environ):
    print(f"[Socket] Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"[Socket] Client disconnected: {sid}")


@sio.event
async def join(sid, data):
    """
    Frontend emits: socket.emit("join", { user_id: "..." })
    This puts the socket into a private room named after the user,
    so we can target events to a specific user.
    """
    user_id = data.get("user_id")
    if user_id:
        await sio.enter_room(sid, user_id)
        print(f"[Socket] {sid} joined room: {user_id}")


async def emit_data_updated(user_id: str, event_type: str = "update"):
    """
    Emit a 'data_updated' event to the user's private room.
    Called from REST routes and MCP tools after any DB write.
    """
    await sio.emit("data_updated", {"type": event_type}, room=user_id)
