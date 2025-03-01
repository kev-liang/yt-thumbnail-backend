// import { Server } from 'socket.io';
// import { Server as HTTPSServer } from 'https';

// let io: Server;

// export const initializeSocket = (server: HTTPSServer) => {
//   const io = new Server(server, {
//     cors: {
//       origin: '*', // Or specify your client domains
//       methods: ['GET', 'POST'],
//       credentials: true,
//     },
//     allowEIO3: true,
//   });

//   io.on('connection', (socket) => {
//     console.log('Client connected');

//     socket.on('disconnect', () => {
//       console.log('Client disconnected');
//     });
//   });
// };

// // export const initializeSocket = (server: http.Server) => {
// //   io = new Server(server, {
// //     cors: {
// //       origin: '*',
// //       methods: ['GET', 'POST'],
// //     },
// //   });

// //   io.on('connection', (socket) => {
// //     console.log('A user connected:', socket.id);

// //     socket.on('send_message', (data) => {
// //       console.log('Message received:', data);
// //       io.emit('receive_message', data);
// //     });

// //     socket.on('disconnect', () => {
// //       console.log('A user disconnected:', socket.id);
// //     });
// //   });

// //   return io;
// // };

// export const getIO = () => {
//   if (!io) {
//     throw new Error('Socket.IO not initialized!');
//   }
//   return io;
// };
// import { Server } from 'socket.io';
// import { Server as HTTPSServer } from 'https';

// let io: Server | null = null;

// export const initializeSocket = (httpsServer: HTTPSServer) => {
//   io = new Server(httpsServer, {
//     cors: {
//       origin: '*',
//       methods: ['GET', 'POST'],
//     },
//   });

//   io.on('connection', (socket) => {
//     console.log('Client connected');

//     socket.on('disconnect', () => {
//       console.log('Client disconnected');
//     });
//   });
// };

// export const getIO = (): Server => {
//   if (!io) {
//     throw new Error('Socket.io not initialized');
//   }
//   return io;
// };
// ('*');

import { Server as HTTPSServer } from 'https';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;

export const initializeWebSocket = (server: any) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    ws.on('message', (message: string) => {
      console.log(`Received: ${message}`);
      ws.send(`You said: ${message}`);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};

export const getWebSocketServer = (): WebSocketServer => {
  if (!wss) {
    throw new Error('WebSocket server not initialized');
  }
  return wss;
};
