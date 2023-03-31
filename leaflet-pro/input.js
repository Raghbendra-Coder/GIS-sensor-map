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
  port: '4000',
  path: '/services',
  method: 'GET'

}
const currentDate = new Date();

 

const chokidar = require('chokidar');

const fs = require('fs');
const writeStream1 = fs.createWriteStream((__dirname + '/public/assets/data.txt'));
const writeStream2 = fs.createWriteStream((__dirname + '/public/assets/log.txt'));

port.on('open', () => {
  console.log('Serial port opened')
});

function wrrr(data) {
  
  //const log = `${currentDate}  -  ${data.toString()} `
  writeStream1.write(data.toString());
  writeStream2.write(data.toString());
};
port.on('data', (data) => {
  console.log('Received data:', data.toString())
  // writeStream2.write(data.toString());
  // writeStream1.write(data.toString());
  wrrr(data);
  
  
  http.get(urldata, function(response){
    
  }).on('error', (err) => {
    console.log('Received error:', err)
  })
  
  });

  
port.on('error', (err) => {
  console.error('Error:', err);
})
chokidar.watch((__dirname + '/public/assets/msg.txt')).on('change', (event, path) => {
  fs.readFile((__dirname + '/public/assets/msg.txt'),'utf-8',(err,data) =>
  {
    port.write(data);
  })
});
