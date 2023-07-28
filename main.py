import json
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount('/client', StaticFiles(directory='client'), name='client')

rooms = []


@app.get('/ping')
def ping():
    return {'msg': 'pong'}


@app.get('/')
def home():
    path = Path('client/index.html')
    return FileResponse(path, media_type='text/html')


async def broadcast_to_room(message: str, sender_room):
    message = json.dumps({
        'msg': message,
        'userId': sender_room['client_id'],
    })

    for room in rooms:
        if room == sender_room:
            continue

        await room['socket'].send_text(message)


def remove_room(room):
    for r in rooms:
        if r == room:
            rooms.remove(room)


@app.websocket('/ws/{client_id}')
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    room = {
        'client_id': client_id,
        'socket': websocket
    }
    try:
        await websocket.accept()
        rooms.append(room)
        while True:
            data = await websocket.receive_text()
            await broadcast_to_room(data, room)

    except WebSocketDisconnect as e:
        remove_room(room)
