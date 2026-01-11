# 🚀 P2P File Sharing

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

**A modern, secure peer-to-peer file sharing application with real-time chat and WebRTC technology**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

P2P File Sharing is a cutting-edge web application that enables users to share files directly between peers without relying on centralized servers. Built with modern web technologies, it provides a seamless, secure, and fast file transfer experience with real-time chat capabilities.

### Why P2P File Sharing?

- 🔒 **Privacy First**: Files are transferred directly between peers - no server storage
- ⚡ **Lightning Fast**: Direct peer-to-peer connections for maximum speed
- 🎯 **Easy to Use**: Intuitive interface for creating and joining rooms
- 🌐 **Real-time**: Live chat and instant file sharing
- 🎨 **Modern UI**: Beautiful, responsive design built with Tailwind CSS

---

## ✨ Features

### 🏠 Room Management
- **Create Rooms**: Set up private or public rooms with custom names and genres
- **Join Rooms**: Search and join public rooms or enter private rooms with room ID
- **Room Discovery**: Search public rooms by name with real-time filtering
- **Room Metadata**: Organize rooms by genre/theme (Music, Movies, Documents, etc.)

### 📁 File Sharing
- **Direct P2P Transfer**: Files transfer directly between peers using WebRTC
- **No Server Storage**: Files never touch the server - complete privacy
- **Multiple Users**: Support for up to 5 users per room
- **Real-time Progress**: See when files are being shared

### 💬 Real-time Chat
- **Instant Messaging**: Chat with room members in real-time
- **User Presence**: See who's in the room
- **Member Management**: Automatic updates when users join or leave

### 🎨 User Experience
- **Modern UI**: Beautiful, responsive design with dark theme
- **Smooth Navigation**: Intuitive flow from landing page to room
- **Browser Integration**: Proper handling of back button and page navigation
- **Error Handling**: Graceful error messages and connection management

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **Vite 6.0.5** - Lightning-fast build tool
- **React Router DOM 7.1.3** - Client-side routing
- **Tailwind CSS 4.0.0** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **WebRTC API** - Peer-to-peer connections

### Backend
- **Node.js** - JavaScript runtime
- **WebSocket (ws 8.18.0)** - Real-time bidirectional communication
- **UUID 11.0.5** - Unique identifier generation

### Architecture
- **WebSocket Signaling Server** - Handles room management and peer coordination
- **WebRTC Data Channels** - Direct peer-to-peer file transfer
- **STUN Server** - NAT traversal for peer connections

---

## 📦 Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "P2P File Sharing"
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🚀 Usage

### Starting the Application

#### Terminal 1: Start Backend Server
```bash
cd backend
node index.js
```
The WebSocket server will start on `ws://localhost:8080` (or the port specified in `PORT` environment variable).

#### Terminal 2: Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173` (or the port shown in your terminal).

### Using the Application

1. **Create a Room**
   - Click "Create Room" on the landing page
   - Enter your username
   - Configure room details:
     - Choose Private or Public
     - Enter a room name
     - Select a genre/theme
   - Click "Create Room"

2. **Join a Room**
   - **Private Room**: Click "Join Room" → Enter username and room ID
   - **Public Room**: Click "Join Room" → Switch to "Public Room" tab → Search for rooms by name → Click on a room to join

3. **Share Files**
   - Once in a room, select a user from the list
   - Choose a file to share
   - The file will transfer directly to the selected peer

4. **Chat**
   - Use the chat interface to send messages to all room members
   - Messages appear in real-time

---

## 🏗️ Architecture

### System Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client A  │◄───────►│  WebSocket   │◄───────►│   Client B   │
│  (Browser)  │         │   Server     │         │  (Browser)   │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │                        │
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                    Signaling & Room Management
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client A  │◄───────►│  WebRTC P2P │◄───────►│   Client B   │
│  (Browser)  │         │  Connection  │         │  (Browser)   │
└─────────────┘         └──────────────┘         └─────────────┘
                    Direct File Transfer
```

### Key Components

#### Backend (`backend/index.js`)
- **WebSocket Server**: Manages connections and room state
- **Room Management**: Creates rooms, tracks members, handles joins/leaves
- **Signaling**: Coordinates WebRTC offer/answer exchange
- **Metadata Storage**: Maintains room information (name, privacy, genre)

#### Frontend Components
- **`LandingPage.jsx`**: Entry point with create/join options
- **`CreateRoom.jsx`**: Username input for room creation
- **`RoomDetails.jsx`**: Room configuration (privacy, name, genre)
- **`JoinRoom.jsx`**: Room joining interface with public room search
- **`Room.jsx`**: Main room component with WebRTC and chat logic
- **`RoomLayout.jsx`**: UI layout for the room interface
- **`WebSocketContext.jsx`**: WebSocket connection management

### Data Flow

1. **Room Creation**
   ```
   Client → WebSocket: create-room {roomName, isPrivate, genre}
   WebSocket → Client: room {roomId, roomName, isPrivate, genre}
   ```

2. **Joining Room**
   ```
   Client → WebSocket: join-room {roomId, userName}
   WebSocket → Client: user {userId}
   WebSocket → Other Clients: new-member {userId, userName}
   ```

3. **WebRTC Signaling**
   ```
   Client A → WebSocket: create-offer {sdp, targetUserId}
   WebSocket → Client B: offer {sdp, userId}
   Client B → WebSocket: create-answer {sdp, targetUserId}
   WebSocket → Client A: answer {sdp, userId}
   ```

4. **File Transfer**
   ```
   Client A → WebRTC Data Channel: File metadata + chunks
   WebRTC Data Channel → Client B: File received
   ```

---

## 🔧 Configuration

### Environment Variables

#### Backend
Create a `.env` file in the `backend` directory:
```env
PORT=8080
```

#### Frontend
Create a `.env` file in the `frontend` directory:
```env
VITE_APP_WEBSOCKET_URL=ws://localhost:8080
```

> **Note**: The frontend has a fallback to `ws://localhost:8080` if the environment variable is not set.

---

## 🎯 Features in Detail

### Room Types

**Private Rooms**
- Require exact room ID to join
- Not visible in public room search
- Ideal for secure file sharing

**Public Rooms**
- Discoverable through search
- Show room name and genre
- Display member count
- Filtered by availability (not full)

### File Sharing

- **Protocol**: WebRTC Data Channels
- **Chunk Size**: 16KB chunks for efficient transfer
- **Metadata**: File name and size sent before transfer
- **Status**: Automatic download when transfer completes

### Real-time Updates

- User join/leave notifications
- Room member list updates
- Chat message synchronization
- Connection status monitoring

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure the backend server is running
- Check that the port (default: 8080) is not blocked
- Verify the WebSocket URL in frontend configuration

### WebRTC Connection Issues
- Check firewall settings
- Ensure STUN server is accessible (`stun:stun.l.google.com:19302`)
- Some networks may require TURN servers for NAT traversal

### File Transfer Not Working
- Verify both peers are in the same room
- Check browser console for WebRTC errors
- Ensure data channels are properly established

---

## 🚧 Future Enhancements

- [ ] File transfer progress indicators
- [ ] Multiple file selection and batch transfer
- [ ] Room password protection
- [ ] File preview before download
- [ ] TURN server support for complex networks
- [ ] Mobile responsive optimizations
- [ ] End-to-end encryption for files
- [ ] Room history and recent rooms
- [ ] User profiles and avatars
- [ ] File type filtering

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Nilesh Agrawal**

---

## 🙏 Acknowledgments

- WebRTC API for peer-to-peer connections
- STUN servers for NAT traversal
- React and Vite communities
- All contributors and users

---

<div align="center">

**Made with ❤️ using React, WebRTC, and WebSockets**

⭐ Star this repo if you find it helpful!

</div>

