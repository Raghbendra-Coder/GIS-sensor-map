// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
const SerialPort = require('serialport').SerialPort;
const port = new SerialPort({
  path: 'COM4',
  baudRate: 19200
});
var http = require('http');
var urldata = {
  host: 'localhost',
  port: '3000',
  path: '/services',
  method: 'GET'

}

const chokidar = require('chokidar');

const fs = require('fs');
const writeStream = fs.createWriteStream((__dirname + '/public/assets/data.txt'));

port.on('open', () => {
  console.log('Serial port opened')
});

port.on('data', (data) => {
  console.log('Received data:', data.toString())
  writeStream.write(data.toString());
  http.get(urldata, function(response){
    
  }).on('error', (err) => {
    console.log('Received error:', err)
  })
  
  });

  port.write('NODE01');


  chokidar.watch((__dirname + '/public/assets/msg.txt')).on('change', (event, path) => {
    fs.readFile((__dirname + '/public/assets/msg.txt'),'utf-8',(err,data) =>
    {
      port.write('NODE01');
    })
  });


  port.write('NODE01');
port.on('error', (err) => {
  console.error('Error:', err);
})

port.write('NODE01');