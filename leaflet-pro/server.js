
//const { Console } = require('console');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const app = express();
const port = 4000;
const fs = require('fs');
const path = require('path');

var bodyParser = require('body-parser')


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const scriptPath = path.join(__dirname,'/public/script.js');
const textPath = path.join(__dirname,'/public/assets/data.txt');


app.use(express.static('public'));

const server = http.createServer(app);
const io = socketio(server);

app.get('/', (req, res) => 
 {
  res.sendFile(__dirname + '/index.html')
 });
io.on('connection' ,(socket) =>
{
 console.log('new socket layer connection made')
 
 
 app.get('/services', (req, res) =>
  {
   
   socket.emit('Text file is modified');
  }
 )

//  socket.on('clean',()=>
//  {
//   var da = '';
//   fs.writeFile((__dirname + '/public/assets/data.txt'),da,function (err){
  
//     err? console.log(err) : console.log('HURRAY!')
//   })

//  })

const chokidar = require('chokidar');

fs.watch((__dirname + '/public/assets/data.txt')).on('change', (event, path) => {
  console.log("file is changed")
  socket.emit('Text file is modified');
});

socket.on('clk',(data) =>
 {
  
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
  
   var data = JSON.stringify(req.body);
   
   
   
   fs.writeFile((__dirname +'/public/markers.json'), data , (err) =>
    err? console.log(err) : console.log('Coordinates reset!')
   )
  //  var da = fs.readFile((__dirname +'/public/data.txt'));
  //  console.log(da);
   

   })
  })

 server.listen(port, 
    () => console.log(`App listening on port ${port}!`));