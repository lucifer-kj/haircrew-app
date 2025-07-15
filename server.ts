import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || '3000', 10);

// Create HTTP server
const httpServer = createServer((req, res) => {
  handle(req, res);
});

// Set up Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // For development; restrict in production
    methods: ['GET', 'POST'],
  },
});

// Listen for client connections
io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);
  // Placeholder: Add event listeners and emitters here
});

// Start Next.js and HTTP/Socket.IO server
app.prepare().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
});

export { httpServer, io }; 