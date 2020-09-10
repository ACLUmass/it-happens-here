// Initialize Leaflet map
var map = L.map('mapid').setView([42.4072, -71.3824], 10);
L.esri.basemapLayer('Gray').addTo(map);

console.log("map loaded")

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
