var markerColor = '';
var markerArray = [];
const centerCoordinates = [74.8723, 31.6340];
const zoomLevel = 9;
var container = document.getElementById('popup');
var pop_content = document.getElementById('popupcontent');
var closer = document.getElementById('popupcloser');
var close_btn = document.querySelector('#close-button')
const mousepositions = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),

});


var map = new ol.Map({
  controls: ol.control.defaults().extend([mousepositions]),
  target: 'map',
  layers: [
    // Create a Tile layer as the base layer
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    // Create a Vector layer for the markers
    new ol.layer.Vector({
      source: new ol.source.Vector(),
      // Use a custom style for the markers
      style: function (feature) {
        markerColor = feature.get('value') === 1 ? "/assets/red_marker.png" : "/assets/green_marker.png";
        return new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 46],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: markerColor,
          }),
        });
      },
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat(centerCoordinates),
    zoom: zoomLevel
  }),
});


// Create an Overlay for the popup
// var popup = new ol.Overlay({
//   element: document.getElementById('popup'),
//   autoPan: true,
//   autoPanAnimation: {
//     duration: 250,
//   },
// });

// // Add the overlay to the map
// map.addOverlay(popup);
var style = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 5,
    fill: new ol.style.Fill({
      color: '#7AC7F4'
    }),
    stroke: new ol.style.Stroke({
      color: '#624553',
      width: 2
    })

  }),
  stroke: new ol.style.Stroke({
    color: '#EF5FA2',
    width: 2
  })
});



var popup = new ol.Overlay({
  element: container,
  autoPanAnimation: {
    duration: 250
  }
});
map.addOverlay(popup);

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
  });

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
  for (var i = 0; i < markers.length; i++) {
    // Add marker for this node
    updateMarkerColor(marker, markers[i].value);
  }
  window.location.reload();
});


