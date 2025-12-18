const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store active rooms: roomCode -> [client1, client2]
const rooms = new Map();

app.get('/', (req, res) => {
  res.send('Device Communication Relay Server is running! 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

wss.on('connection', (ws) => {
  console.log('New client connected');
  let currentRoom = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'join') {
        currentRoom = message.roomCode;
        
        if (!rooms.has(currentRoom)) {
          rooms.set(currentRoom, []);
        }
        
        rooms.get(currentRoom).push(ws);
        console.log(`Client joined room: ${currentRoom}`);
        
        // Notify this client they joined
        ws.send(JSON.stringify({ type: 'joined', roomCode: currentRoom }));
        
        // If there are 2 clients in the room, notify both that they're connected
        if (rooms.get(currentRoom).length === 2) {
          rooms.get(currentRoom).forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'connected' }));
            }
          });
        }
      } 
      else if (message.type === 'message') {
        // Relay message to other client in the same room
        if (currentRoom && rooms.has(currentRoom)) {
          rooms.get(currentRoom).forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'message',
                content: message.content
              }));
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    
    // Remove client from room and notify other client
    if (currentRoom && rooms.has(currentRoom)) {
      const roomClients = rooms.get(currentRoom);
      const index = roomClients.indexOf(ws);
      
      if (index > -1) {
        roomClients.splice(index, 1);
        
        // Notify remaining client that other person disconnected
        roomClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'disconnected' }));
          }
        });
        
        // Clean up empty rooms
        if (roomClients.length === 0) {
          rooms.delete(currentRoom);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
