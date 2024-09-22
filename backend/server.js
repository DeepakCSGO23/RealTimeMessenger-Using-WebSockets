const express = require('express');
const cors = require('cors');
const app = express();
const WebSocket = require('ws');
require('dotenv').config()
// Cors setup
app.use(cors({origin:['https://realtalkmessenger.netlify.app']}));
// Http Server setup
const server=app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
})
// Creating a WebSocket server & attaching it to the HTTP server
const wss = new WebSocket.Server({ server });
// 
const clientProfileName=new Map()
wss.on('connection', (ws) => {
  console.log('address',ws._socket.remoteAddress)
  console.log('A new client connected')  
  // wss.clients.forEach(client => {
  //   // Log the client comparison
  //   console.log(`Client comparison: ${client !== ws}, State: ${client.readyState}`);
  //   if (client !== ws && client.readyState === WebSocket.OPEN) {
  //     console.log('Sending message to another client');
  //     client.send("hi there i wanted to chat");
  //   }
  // });
  // This event handler handles the first message from the client i.e the first message is received when a new client connects
  ws.once('message',(message)=>{
    const profileName=message.toString()
    console.log(profileName)
    if(!clientProfileName.has(ws)){
      clientProfileName.set(ws,profileName)
    }
  })
  // Triggers when a message if send from the client & hits the websocket server
  ws.on('message', (message) => {
    wss.clients.forEach(client=>{
      if(client.readyState===WebSocket.OPEN){
        // Getting JSON string which is send to all clients as String which is then parsed to JSON using JSON.parse()
        // Sending Message to another client from the websocket server 
        client.send(message.toString())
      }
    })
  });

  // When the 
  ws.on('close', () => {
    console.log('A client disconnected');
    clientProfileName.delete(ws)
  });
});
app.get('/total-clients',(req,res)=>{
  const totalClients=wss.clients.size
  const allClientsProfileName=Array.from(clientProfileName.values())
  console.log(allClientsProfileName)
  console.log(allClientsProfileName)
  res.send({totalClients,allClientsProfileName})
})
app.get('/health',(req,res)=>{
  res.status(200).send("server is up and running")
})

