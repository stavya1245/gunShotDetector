import asyncio
import websockets
import json

clients = {}

async def handler(websocket, path):
    async for message in websocket:
        data = json.loads(message)
        device_name = data['device']
        timestamp = data['timestamp']

        clients[device_name] = timestamp
        print(f"Received from {device_name}: {timestamp}")

        if len(clients) == 4:  # When all devices have reported
            direction = min(clients, key=clients.get)
            print(f"Sound detected from: {direction}")

            # Send the detected direction to all connected clients
            for client in clients:
                await clients[client].send(direction)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # Run forever

asyncio.run(main())