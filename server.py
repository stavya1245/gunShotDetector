import asyncio
import websockets
import json

clients = {}

async def handler(websocket, path):
    # Receive the initial message with device name and timestamp
    async for message in websocket:
        data = json.loads(message)
        device_name = data['device']
        timestamp = data['timestamp']

        # Store the websocket connection along with the timestamp
        clients[device_name] = (websocket, timestamp)
        print(f"Received from {device_name}: {timestamp}")

        # Check if all four devices have reported
        if len(clients) == 2:
            # Find the device with the earliest timestamp
            direction = min(clients, key=lambda k: clients[k][1])
            print(f"Sound detected from: {direction}")

            # Broadcast the direction to all connected clients
            for client_websocket, _ in clients.values():
                await client_websocket.send(direction)

async def main():
    print("WebSocket server started on ws://localhost:8765")
    async with websockets.serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()


asyncio.run(main())