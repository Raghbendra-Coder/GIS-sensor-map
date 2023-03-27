import MousePosition from '../node_modules/ol/control/MousePosition.js';
import {createStringXY} from '/ol/coordinate.js';
import Map from '/ol/Map.js';
import {defaults} from '/ol/control/defaults.js';
import TileLayer from '/ol/layer/Tile.js';
import OSM from '/ol/source/OSM.js';
import VectorLayer from '/ol/layer/Vector.js';
import Style from '/ol/style/Style.js';
import Icon from '/ol/style/Icon.js';
import View from '/ol/View.js';
import {fromLonLat} from '/ol/proj.js';
import CircleStyle from '/ol/style/Circle.js';
import Fill from '/ol/style/Fill.js';
import Stroke from '/ol/style/Stroke.js';
import Overlay from '/ol/Overlay.js';
import Feature from '/ol/Feature.js';
import Point from '/ol/geom/Point.js';
import VectorSource from '/ol/source/Vector.js';
import {transform} from '/ol/proj.js';
import Modify from '/ol/interaction/Modify.js';









var markerColor = '';
var markerArray = [];
const centerCoordinates = [74.8723, 31.6340];
const zoomLevel = 5;
var container = document.getElementById('popup');
var pop_content = document.getElementById('popupcontent');
var closer = document.getElementById('popupcloser');
var close_btn = document.querySelector('#close-button')

var send_btn = document.querySelector('#send-btn');
const mousepositions = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

const socket = io();
socket.on('Input is received', () => {
  console.log('data received');
  window.location.reload();
});

// Create the map object
var map = Map({
  controls: defaults().extend([mousepositions]),
  target: 'map',
  layers: [
    // Create a Tile layer as the base layer
    new TileLayer({
      source: new OSM(),
    }),
    // Create a Vector layer for the markers
    new VectorLayer({
      source: new VectorLayer(),
      // Use a custom style for the markers
      style: function (feature) {
        markerColor = feature.get('value') === 1 ? "/assets/red.png" : "/assets/green.png";
        return new Style({
          image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: markerColor,
          }),
        });
      },
    }),
  ],
  view: new View({
    center: fromLonLat(centerCoordinates),
    zoom: zoomLevel
  }),
});

var style = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({
      color: '#7AC7F4'
    }),
    stroke: new Stroke({
      color: '#624553',
      width: 2
    })

  }),
  stroke: new Stroke({
    color: '#EF5FA2',
    width: 2
  })
});



var popup = new Overlay({
  element: container,
  autoPanAnimation: {
    duration: 250
  }
});
map.addOverlay(popup);

//Fetch markers data from JSON file
fetch("/markers.json")
  .then(response => response.json())
  .then(data => {
    var markers = data;
    console.log(data);
    console.log(markers);
    var coordinates = [];
    for (var i = 0; i < markers.length; i++) {
      coordinates.push([markers[i].latitude, markers[i].longitude]);
    }
    console.log(coordinates)
    resetBtn.addEventListener('click', function () {


      for (var i = 0; i < markers.length; i++) {
        markers[i].value = 0;
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
      // for (var i = 0; i < markers.length; i++) {
      //   // Add marker for this node
      //   updateMarkerColor(marker, markers[i].value);
      // }
      window.location.reload();
    });


    for (let i = 0; i < markers.length; i++) {
      let nodeContent = markers[i].content.toString();
      let nodeid = markers[i].id.toString();
      var feat = new Feature({
        geometry: new Point(coordinates[i]),
        type: 'Point',
        desc: nodeContent,
        id: nodeid

      });
      //console.log("Feat = ", feat)
    }

    var drawingSource = new VectorSource({
      wrapX: true,
      features: [feat]
    });

    var drawingLayer = new VectorLayer({
      source: drawingSource,
      style: style
    });
    var baseLayer = new TileLayer({
      source: new OSM()
    });

   
    for (var i = 0; i < markers.length; i++) {
      // Add marker for this node
      var marker = addMarker(markers[i], i);
      console.log(markers[i].value);
      updateMarkerColor(marker, markers[i].value);
    }

    // Read node information from data.txt file
    fetch("/assets/data.txt")
      .then(response => response.text())
      .then(string => {
        console.log(string)
        // let pattern = /NODE\d\d\d/g;
        // let pattern = /^([^\r\n]+)\r\n([^\r\n]+)\r\n([^\r\n]+)/gm;
        let pattern = /(NODE\d+)[\s\S]*?([\d\.]+)[\s\S]*?([\d\.]+)/g;
        let match;
        while ((match = pattern.exec(string)) !== null) {
          var [, fullid, longitude, latitude] = match;
          // console.log("ID ",fullid, "LONGI= ",longitude, "LAti= ",latitude);
          var id = fullid.substring(0, 6);
          var value = fullid.substring(6, 7);

          
          value = Number(value);
          console.log(id, value);
          var m = addMarker({ longitude, latitude, value, id }, markers.length);
          console.log("This is M= ", m)
          updateMarkerColor(m, value);
          for (var j = 0; j < markers.length; j++) {
            console.log(markers[j].id);
              if (markers[j].id == id) {
                markers[j].value = value;
                markers[j].longitude = longitude;
                markers[j].latitude = latitude;
                console.log("Markers ===  ", markers)
                break;
            }
          }
          console.log("NEW MARKERS= ", markers)

          var data = JSON.stringify(markers);
          console.log(data);
          // for (var i = 0; i < markers.length; i++) {
          //   // Add marker for this node
          //   // var marker = addMarker(markers[i], i);
          //   console.log(markers[i].value);
          //   updateMarkerColor(marker, markers[i].value);
          // }
          saveMarkersToJSON(markers);

        }
        map.on('click', function (evt) {
          //console.log(markers)
          let feature = map.forEachFeatureAtPixel(evt.pixel, function (feat, layer) {
            return feat;
          });
          var coordinates = transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
          console.log(coordinates)
          coordinates = [coordinates[1].toFixed(6), coordinates[0].toFixed(6)];
          for (var i = 0; i < markers.length; i++) {
            var cooord = [markers[i].longitude, markers[i].latitude];
            console.log("markers coordinates: " + cooord);
            console.log("mouse coordinates: " + coordinates);
            if (cooord.toString() === coordinates.toString()) {
              // var content = markers[i].content;
              if (feature && feat.get('type') == 'Point') {
                let coordinate = feature.getGeometry().getCoordinates();
                pop_content.innerHTML = markers[i].content.bold() +"<br>" + "Longitude:- "+ markers[i].longitude + "<br> Latitude:- " + markers[i].latitude + "<br>" + "Value:- " + markers[i].value;
                popup.setPosition(coordinate);
              } else
                popup.setPosition(undefined);
            }
          }
        });
    

      }
      )
      

    // Add drag and drop interaction to markers
    var dragAndDropInteraction = new Modify({
      source: map.getLayers().getArray()[1].getSource(),
      pixelTolerance: 20,
    });
    map.addInteraction(dragAndDropInteraction);


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

    // Update markers.json when marker is dropped
    dragAndDropInteraction.on('modifyend', function (event) {
      var feature = event.features.getArray()[0];
      var coordinates = transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');

      console.log(feature.j.id);
      console.log("Drag Coordinates=  ", coordinates);
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].id === feature.j.id) {
          console.log('Inside IF');
          console.log(markers[i]);

          markers[i].longitude = coordinates[1].toFixed(6);
          markers[i].latitude = coordinates[0].toFixed(6);

        }
      }


      saveMarkersToJSON(data);
    });
  });


// Add Marker Function
function addMarker(props, index) {
  console.log("Longitude= ", props.longitude, "Latitude= ", props.latitude);

  var marker = new Feature({
    geometry: new Point(fromLonLat([props.latitude, props.longitude])),
    name: props.content,
    value: props.value,
    id: props.id,
  });

  // Add the marker feature to the vector source of the markers layer
  map.getLayers().getArray()[1].getSource().addFeature(marker);
  markerArray[index] = marker;
  return marker;
}


// Update Marker Color Function
function updateMarkerColor(marker, value) {
  markerColor = value === 1 ? "/assets/red.png" : "/assets/green.png";
  var iconStyle = new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: markerColor,

  });
  marker.setStyle(new Style({
    image: iconStyle,
  }));
}

close_btn.addEventListener('click', function () {
  popup.setPosition(undefined)
})

send_btn.addEventListener('click',(()=>{
  var send_text = document.querySelector('#send-text').value;
  console.log(send_text);
  console.log("clicked")
  socket.emit('clk',send_text);
}))

