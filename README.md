# 🚀 P2P File Sharing

## 📖 Overview

P2P File Sharing is a cutting-edge web application that enables users to share files directly between peers without relying on centralized servers. Built with modern web technologies, it provides a seamless, secure, and fast file transfer experience with real-time chat capabilities.

### Why P2P File Sharing?

- 🔒 **Privacy First**: Files are transferred directly between peers - no server storage
- ⚡ **Lightning Fast**: Direct peer-to-peer connections for maximum speed
- 🎯 **Easy to Use**: Intuitive interface for creating and joining rooms
- 🌐 **Real-time**: Live chat and instant file sharing
- 🎨 **Modern UI**: Beautiful, responsive design built with Tailwind CSS

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

## 📦 Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/Nakul155/P2P-File-Sharing-System
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