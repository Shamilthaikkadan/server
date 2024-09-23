import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from "ws";
import customerRouter from './routes/customerRoutes.js';
import authRouter from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const server = app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

const wss = new WebSocketServer({ server });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const customerFilePath = path.join(__dirname, './data/data.json');
export const profileFilePath = path.join(__dirname, './data/user.json');
export const notificationFilePath = path.join(__dirname, './data/notification.json');

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);


const clients = new Set(); 

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws); 

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.send('Connected to notification server');
});


export const broadcastNotification = (message) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};




export const writeMagazineFile = (data, callback) => {
  fs.writeFile(magazineFilePath, data, 'utf8', (err) => {
    if (err) {
      // console.error('Error writing magazine file:', err);
      return callback(err);
    }
    callback(null);
  });
};

export const readMagazineFile = (callback) => {
  fs.readFile(magazineFilePath, 'utf8', (err, data) => {
    if (err) {
      // console.error('Error reading magazine file:', err);
      return callback(err);
    }
    callback(null, data);
  });
};

export const writeUserFile = (data, callback) => {
  fs.writeFile(profileFilePath, data, 'utf8', (err) => {
    if (err) {
      // console.error('Error writing user file:', err);
      return callback(err);
    }
    callback(null);
  });
};

export const readUserFile = (callback) => {
  fs.readFile(profileFilePath, 'utf8', (err, data) => {
    if (err) {
      // console.error('Error reading user file:', err);
      return callback(err);
    }
    callback(null, data);
  });
};

export const writeFile = (data, callback) => {
  fs.writeFile(customerFilePath, data, 'utf8', (err) => {
    if (err) {
      // console.error('Error writing customer file:', err);
      return callback(err);
    }
    callback(null);
  });
};

export const readFile = (callback) => {
  fs.readFile(customerFilePath, 'utf8', (err, data) => {
    if (err) {
      // console.error('Error reading customer file:', err);
      return callback(err);
    }
    callback(null, data);
  });
};

export const appendToFile = (data, callback) => {
  fs.appendFile(customerFilePath, data, 'utf8', (err) => {
    if (err) {
      // console.error('Error appending to customer file:', err);
      return callback(err);
    }
    callback(null);
  });
};

export const deleteFile = (callback) => {
  fs.unlink(customerFilePath, (err) => {
    if (err) {
      // console.error('Error deleting customer file:', err);
      return callback(err);
    }
    callback(null);
  });
};

export const writeNotification = (message) => {
  fs.readFile(notificationFilePath, 'utf8', (err, data) => {
    const notifications = err ? [] : JSON.parse(data);
    notifications.push({ message, timestamp: new Date().toISOString() });

    fs.writeFile(notificationFilePath, JSON.stringify(notifications), 'utf8', (err) => {
      if (err)
        console.error('Error writing notification file:', err);
    });
  });
};

export const readNotifications = (callback) => {
  fs.readFile(notificationFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading notification file:', err);
      return callback(err);
    }
    callback(null, JSON.parse(data || '[]'));
  });
};

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  ws.send('Connected to notification server');
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
