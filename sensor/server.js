
//const { Console } = require('console');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const scriptPath = path.join(__dirname,'./public/script.js');
const textPath = path.join(__dirname,'./public/assets/data.txt');


app.use(express.static('public'));

app.use(express.json());
const server = http.createServer(app);
const io = socketio(server);

app.get('/', (req, res) => 
 {
  
  console.log(__dirname + '/index.html');
  res.sendFile(__dirname + '/index.html')
 });
io.on('connection' ,(socket) =>
{
 console.log('new socket layer connection made')
 app.get('/services', (req, res) =>
  {
   console.log('request sent');
   socket.emit('Input is received');
  }
 )
 socket.on('clk',(data) =>
 {
  console.log(data);
  fs.writeFile((__dirname + '/public/assets/msg.txt'),data,(err) =>
  {
    console.log(err);
  })
 })







 
 
 
 app.post('/update-coordinates',function(req, res) {
 
 var data = JSON.stringify(req.body);
//fs.watch(textPath,(eventType, filename)=>{
// if(filename){
//     socket.emit('fileUpdate','File Updated');
//   }
//  })
 fs.writeFile((__dirname +'/public/markers.json'), data , (err) =>{
  err? console.log(err) : console.log('Coordinates updated!')}
 );
 console.log("inside server");
})

 app.post('/reset-coordinates',function(req, res) {
  var da = '';
  fs.writeFile((__dirname + '/public/assets/data.txt'),da,function (err){
  
    err? console.log(err) : console.log('files reset!')
  })
  //console.log(da);
   var data = JSON.stringify(req.body);
   console.log(data);
   
   fs.writeFile((__dirname +'/public/markers.json'), data , (err) =>
    err? console.log(err) : console.log('Coordinates reset!')
   )
  //  var da = fs.readFile((__dirname +'/public/data.txt'));
  //  console.log(da);
   

   })
  })

  

 
 
 server.listen(port, 
    () => console.log(`App listening on port ${port}!`));