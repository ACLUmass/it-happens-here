// Initialize Leaflet map
var map = L.map('mapid').setView([42.4072, -71.3824], 10);
L.esri.basemapLayer('Gray').addTo(map);

var map_width = document.getElementById("mapid").width
var map_height = document.getElementById("mapid").height

console.log("map loaded")
console.log("map size:", map.getSize())

// Add custom spinner while things are loading
var win =  L.control.window(map,
	{closeButton: false,
	 content:'<div class="spinner-border text-dark" role="status"><span class="sr-only"></span></div>',
	 className: "spin-window"})
           .showOn([map.getSize().x / 2 - 50, 
           	map.getSize().y / 2 - 50])

var MAStyle = {
    weight: 2,
    opacity: 1,
    color: '#fabeaf',
    dashArray: '3',
    fillOpacity: 0.2,
    interactive: false
};

var ma_polygon = new L.Shapefile("data/outline25k.zip", {style: MAStyle}).addTo(map);
ma_polygon.once("data:loaded", function() {
    console.log("finished loaded shapefile");
    map.fitBounds(ma_polygon.getBounds());
})

var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'right'
});
map.addControl(sidebar);
