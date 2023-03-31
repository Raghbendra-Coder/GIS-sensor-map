var send_btn = document.querySelector('#send-btn');
var resetBtn = document.querySelector('#resetBtn')
var map = L.map('map', { zoomControl: false}).setView([30.644199, 76.888217], 6);
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);
var LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [40, 40],
        shadowSize:   [50, 64],
        // iconAnchor:   [20, 30],
        shadowAnchor: [4, 62]
        // popupAnchor:  [0, 0]
    }
});

L.tileLayer('/ind/{z}/{x}/{y}.png' ,{
    maxZoom: 11,
    minZoom: 5,
    tileSize: 512,
    zoomOffset: -1
    
    
}).addTo(map);

var markerss = L.markerClusterGroup();

markerss.on('mouseover', function(e){
  var m = e.layer;
  m.openPopup();
})

markerss.on('mouseout', function(e){
  var m = e.layer;
  m.closePopup();
})


const socket = io();
socket.on('Text file is modified', () => {
  console.log('data received');
  window.location.reload();
});

// function showMarkers(data){
//   for(let i = 0; i< data.length; i++){
//     var micon = greenIcon;
//     var long = data[i].longitude;
//     var lati = data[i].latitude;
//     var value = data[i].value;
//     if(value == 1){micon = redIcon;}
//     var marker = L.marker([lati, long],{icon :micon} ).addTo(map);
//     marker.bindPopup(data[i].id.bold() +"<br>"+ lati + " "+long + "<br>" + data[i].content).openPopup();
// } 
// }

function handlePopup(marker){
  marker.on("mouseover", function(e){
    this.openPopup();
  })
  marker.on("mouseout", function(e){
    this.closePopup();
  })
}

const markers = [];
var greenIcon = new LeafIcon({iconUrl: './images/green.png'}),
    redIcon = new LeafIcon({iconUrl: './images/red.png'});
fetch('markers.json')
    .then(response => response.json())
    .then(data => {
      data.forEach((node) => {
        var micon = greenIcon;
        var val = node.value;
        // if(val == 1){micon = redIcon;}
        const marker = L.marker([node.latitude, node.longitude],{icon :micon}).bindPopup(node.id.bold() +"<br><b>Latitude: </b>"+ node.latitude + "<br><b>Longitude: </b>"+node.longitude + "<br>" + node.content);
        markerss.addLayer(marker);
        map.addLayer(markerss);
        markers.push(marker);
      });

      console.log(markers)
        resetBtn.addEventListener('click', function () {
          for (var i = 0; i < data.length; i++) {
            data[i].value = 0;
          }
          const request = new XMLHttpRequest();
          const endpoint = "/reset-coordinates";
      
          request.open("POST", endpoint);
      
          request.setRequestHeader("Content-Type", "application/json");
          request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
              console.log("Markers value changed");
            }
          };
          
          var da = JSON.stringify(data);
          
          request.send(da);
          window.location.reload();
        });
        
        fetch('/assets/data.txt')
        .then(response => response.text())
        .then(string => {        
        // let pattern = /NODE\d\d\d/g;
        // let pattern = /^([^\r\n]+)\r\n([^\r\n]+)\r\n([^\r\n]+)/gm;
        let pattern = /^(NODE\d+)([a-zA-Z0-9#]+[a-zA-Z0-9#])\s+(\d+\.\d+)\s+(\d+\.\d+)/gm;
        let match;
        while ((match = pattern.exec(string)) !== null) {
          var fullid = match[1];
          var id = fullid.substring(0,5);
          var value = fullid.substring(5,6);
          var content = fullid.substring(5,22);
          var latitude = match[3];
          var longitude = match[4];
          console.log(fullid, id, value, content, latitude, longitude);
          value = Number(value);
          console.log(id, value);
          var micon = greenIcon;
          // markerss.addLayer(L.marker([latitude, longitude],{icon :micon}).bindPopup(id.bold() +"<br><b>Latitude: </b>"+ latitude + "<br><b>Longitude: </b>"+longitude + "<br>" + content));
          



          const matchingMarker = markers.find((marker) => {
            const markerData = data.find((node) => node.id === id);
            return markerData && marker.getLatLng().equals([markerData.latitude, markerData.longitude]);
          });

          if (matchingMarker) {
            // Remove the old marker from the map
            markerss.removeLayer(matchingMarker);
            map.removeLayer(matchingMarker);
            // Create a new marker with the updated coordinates
            var micon = greenIcon;
            // if(value == 1){micon = redIcon;}
            const newMarker = L.marker([latitude, longitude],{icon :micon}).bindPopup(id.bold() +"<br><b>Latitude: </b>"+ latitude + "<br><b>Longitude: </b>"+longitude + "<br>" + content);
            markerss.addLayers(newMarker);
            map.addLayer(markerss);
            // Add the new marker to the array of markers
            const matchingIndex = markers.indexOf(matchingMarker);
            markers[matchingIndex] = newMarker;
          }

          for(let i=0; i<data.length;i++)
          {
              if(id == data[i].id){
                  data[i].value = value;
                  data[i].longitude = longitude;
                  data[i].latitude = latitude;
                  data[i].content = content;
              }
          }
          // socket.emit('clean');
            
        }
        // showMarkers(data);
        saveMarkersToJSON(data);
        console.log(data);
        
    })
    })
    


    function saveMarkersToJSON(ma) {
      const da = JSON.stringify(ma);
      //console.log(data);
      //console.log(markers);
  
  
      const request = new XMLHttpRequest();
      const endpoint = "/update-coordinates";
  
      request.open("POST", endpoint);
  
      request.setRequestHeader("Content-Type", "application/json");
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          console.log("Markers saved to JSON file");
        }
      };
      request.send(da);
    }


    send_btn.addEventListener('click',((e)=>{
      
      var send_text = document.querySelector('#send-text').value;
      console.log(send_text);
      console.log("clicked");
      socket.emit('clk',send_text);
    }))