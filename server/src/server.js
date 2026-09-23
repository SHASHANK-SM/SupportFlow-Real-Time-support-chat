import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { attachSocket } from './socket/socketHandler.js';
import { ensureDemoAgent } from './services/devBootstrap.js';

await connectDb();
await ensureDemoAgent();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.clientUrl, credentials: true },
  maxHttpBufferSize: 5e6,
});

app.set('io', io);
attachSocket(io);

httpServer.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use. Stop the other API process or start this one with a different PORT.`);
  } else {
    console.error('Unable to start the API server:', error);
  }

  process.exitCode = 1;
});

httpServer.listen(env.port, () => {
  console.log(`API listening on ${env.port}`);
});
