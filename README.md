# Device Communication Server

A lightweight WebSocket relay server built with Node.js and Express that enables real-time peer-to-peer communication between devices worldwide. This server acts as a middleman to route messages between clients using simple room codes.

## 🎯 Purpose

This server is the backend relay for the [DeviceCommunication](https://github.com/AlnemerAbdulwahab/DeviceCommunication) C# application. It handles:
- WebSocket connections from multiple clients
- Room-based message routing
- Connection state management
- Client disconnection handling

## 🌟 Features

- **🔄 Real-Time Relay**: Instant message forwarding using WebSocket
- **🏠 Room System**: Clients connect via unique room codes
- **📊 Health Monitoring**: Built-in health check endpoint
- **🔌 Auto-Cleanup**: Removes empty rooms automatically
- **⚡ Lightweight**: Minimal dependencies, fast performance
- **☁️ Cloud-Ready**: Easily deployable to Render, Heroku, Railway, etc.
- **💯 Free Tier Friendly**: Optimized for free hosting services

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: ws (WebSocket library)
- **CORS**: cors middleware
- **Hosting**: Render.com (or any Node.js hosting)

## 📋 Prerequisites

- Node.js 14.x or higher
- npm or yarn package manager

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/AlnemerAbdulwahab/DeviceCommunicationServer.git
cd DeviceCommunicationServer
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Test the server**
Open your browser and visit:
```
http://localhost:10000
```

You should see: **"Device Communication Relay Server is running! 🚀"**

## ☁️ Deployment on Render.com (Free)

### Step 1: Push to GitHub

Make sure your code is pushed to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/DeviceCommunicationServer.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [Render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure settings:
   - **Name**: `devicecommunicationserver`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment
7. Copy your server URL: `https://devicecommunicationserver.onrender.com`

### Step 3: Update Client App

In your C# app (`DeviceCommunication`), update `Form1.cs`:
```csharp
private const string SERVER_URL = "ws://devicecommunicationserver.onrender.com";
```

## 📁 Project Structure
```
DeviceCommunicationServer/
├── server.js              # Main server logic
├── package.json           # Dependencies and scripts
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## 🔧 Server Code Overview

### server.js

**WebSocket Server Setup**
```javascript
const wss = new WebSocket.Server({ server });
const rooms = new Map(); // roomCode -> [client1, client2]
```

**Connection Handler**
```javascript
wss.on('connection', (ws) => {
  console.log('New client connected');
  let currentRoom = null;
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    
    if (message.type === 'join') {
      // Add client to room
      currentRoom = message.roomCode;
      rooms.get(currentRoom).push(ws);
      
      // Notify when 2 clients in room
      if (rooms.get(currentRoom).length === 2) {
        // Send 'connected' to both clients
      }
    }
    
    if (message.type === 'message') {
      // Relay message to other client in room
    }
  });
});
```

## 🔌 API Endpoints

### HTTP Endpoints

#### GET /
**Description**: Server status check  
**Response**: 
```
Device Communication Relay Server is running! 🚀
```

#### GET /health
**Description**: Health check with stats  
**Response**:
```json
{
  "status": "ok",
  "activeRooms": 5
}
```

### WebSocket Messages

#### Join Room
**Client → Server**
```json
{
  "type": "join",
  "roomCode": "1234-5678"
}
```

**Server → Client** (when joined)
```json
{
  "type": "joined",
  "roomCode": "1234-5678"
}
```

**Server → Both Clients** (when 2 in room)
```json
{
  "type": "connected"
}
```

#### Send Message
**Client → Server**
```json
{
  "type": "message",
  "content": "Hello, World!"
}
```

**Server → Other Client**
```json
{
  "type": "message",
  "content": "Hello, World!"
}
```

#### Disconnect
**Server → Remaining Client**
```json
{
  "type": "disconnected"
}
```

## 🏗️ How It Works

### Connection Flow
```
Client A                    Server                      Client B
   |                           |                            |
   |--- join: "1234-5678" ---->|                            |
   |<--- joined -------------- |                            |
   |                           |<--- join: "1234-5678" -----|
   |                           |---- joined --------------->|
   |<--- connected ------------|---- connected ------------>|
   |                           |                            |
   |--- message: "Hi!" ------->|---- message: "Hi!" ------->|
   |<--- message: "Hey!" ------|<--- message: "Hey!" -------|
```

### Room Management

1. **Client joins room**: Creates room if doesn't exist, adds client to list
2. **Second client joins same room**: Sends "connected" to both clients
3. **Message sent**: Relayed only to other client in same room
4. **Client disconnects**: Notifies other client, removes from room, deletes empty rooms

## 📊 Performance & Limits

### Render.com Free Tier
- **Instance**: 512 MB RAM, 0.1 CPU
- **Auto-sleep**: After 15 minutes of inactivity
- **Wake-up time**: ~30 seconds on first request
- **Monthly limit**: 750 hours (enough for testing)

### Scaling Considerations
- Current implementation supports multiple concurrent rooms
- Each room limited to 2 clients (peer-to-peer design)
- For production, consider upgrading to paid tier or implementing connection pooling

## 🐛 Troubleshooting

### Server not responding
**Check**: Visit server URL in browser - should show "running" message  
**Solution**: Wait 30 seconds for Render to wake up the instance

### WebSocket connection fails
**Check**: Ensure using `ws://` (or `wss://` for HTTPS)  
**Solution**: Verify URL in client app matches deployed server URL

### Messages not relaying
**Check**: Server logs on Render dashboard  
**Solution**: Ensure both clients joined the same room code

## 🔐 Security Considerations

- Room codes are not validated (trust-based system)
- No message encryption (implement TLS/WSS for production)
- No rate limiting (add for production to prevent abuse)
- No authentication (rooms are public if code is known)

### Production Recommendations
1. Use WSS (WebSocket Secure) with valid SSL certificate
2. Implement rate limiting per IP address
3. Add room expiration (auto-delete after X hours)
4. Log connections for monitoring
5. Add optional room passwords

## 👨‍💻 Author

**Abdulwahab Alnemer**
- GitHub: [@AlnemerAbdulwahab](https://github.com/AlnemerAbdulwahab)

## 🔗 Related Projects

- [DeviceCommunication](https://github.com/AlnemerAbdulwahab/DeviceCommunication) - C# Windows Forms client application

## 🙏 Acknowledgments

- Built as part of Tuwaiq Academy Software Development Bootcamp
- Powered by ws library and Express.js
- Hosted on Render.com

## About

This project was created as part of the Tuwaiq Academy Software Development Bootcamp as a hands-on exercise. The objective was to apply previous lessons.

The code was AI-generated as a learning tool. The primary objective was to study and understand the code structure, analyze how devices communicate and interact with each other, and gain the ability to modify and enhance the code independently through hands-on practice.