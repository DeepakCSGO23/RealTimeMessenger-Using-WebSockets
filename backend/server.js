const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

// Load your SSL certificates
const server = https.createServer({
  key: fs.readFileSync('C:\\Certificate\\localhost+2-key.pem'),
  cert: fs.readFileSync('C:\\Certificate\\localhost+2.pem')
});

// Creating a WebSocket server & attaching it to the HTTP server
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {  
  // wss.clients.forEach(client => {
  //   // Log the client comparison
  //   console.log(`Client comparison: ${client !== ws}, State: ${client.readyState}`);
  //   if (client !== ws && client.readyState === WebSocket.OPEN) {
  //     console.log('Sending message to another client');
  //     client.send("hi there i wanted to chat");
  //   }
  // });
  // Triggers when a message if send from the client & hits the websocket server
  ws.on('message', (message) => {
    wss.clients.forEach(client=>{
      if(client!==ws&&client.readyState===WebSocket.OPEN){
        // Sending Message to another client from the websocket server 
        client.send(message.toString())
      }
    })
  });
  
  // When the 
  ws.on('close', () => {
    console.log('A client disconnected');
  });
});

server.listen(5000, '0.0.0.0', () => {
  console.log('WebSocket server is listening on wss://192.168.0.106:5000');
});
