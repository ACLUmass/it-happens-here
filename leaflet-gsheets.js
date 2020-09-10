/*
Add points from google sheet to Leaflet map
Thank you, https://github.com/carderne/leaflet-gsheets/blob/master/main.js
*/

function addPoints(data) {
  // data = data.data;
  let pointGroupLayer = L.layerGroup().addTo(map);

  // Choose marker type. Options are:
  // (these are case-sensitive, defaults to marker!)
  // marker: standard point with an icon
  // circleMarker: a circle with a radius set in pixels
  // circle: a circle with a radius set in meters
  let markerType = "circleMarker";

  // Marker radius
  // Wil be in pixels for circleMarker, metres for circle
  // Ignore for point
  let markerRadius = 5;

  for (let row = 0; row < data.length; row++) {
    // var victim_name = data[row].VictimName;
    console.log("Lat:", data[row].Latitude, "Long:", data[row].Longitude);
    let marker;
    if (markerType == "circleMarker") {
      marker = L.circleMarker([data[row].Latitude, data[row].Longitude], {
        radius: markerRadius, 
        stroke: false,
        fillOpacity: 0.6,
        color: "#ef404d",
      });
    } else if (markerType == "circle") {
      marker = L.circle([data[row].Latitude, data[row].Longitude], {
        radius: markerRadius,
      });
    } else {
      marker = L.marker([data[row].Latitude, data[row].Longitude]);
    }
    marker.addTo(pointGroupLayer);

    // UNCOMMENT THIS LINE TO USE POPUPS
    //marker.bindPopup('<h2>' + data[row].name + '</h2>There's a ' + data[row].description + ' here');

    // COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS

    let demographics = data[row].VictimAge + "-year-old " + data[row].VictimRace

    if (data[row].VictimGender == "M" & data[row].VictimAge >= 18) {
      demographics += " man"
    } else if (data[row].VictimGender == "M" & data[row].VictimAge < 18) {
      demographics += " boy"
    } else if (data[row].VictimGender == "F" & data[row].VictimAge >= 18) {
      demographics += " woman"
    } else if (data[row].VictimGender == "F" & data[row].VictimAge < 18) {
      demographics += " girl"
    } else {
      demographics += " person"
    }

    let accountability;
    if (data[row].Accountability == "N") {
      document.getElementById("accountability-icon").className = "fas fa-times-circle";
      document.getElementById("accountability").style.color = "red";
      document.getElementById("accountability-word").innerHTML = "No";
    } else if (data[row].Accountability == "Y") {
      document.getElementById("accountability-icon").className = "fas fa-check-circle";
      document.getElementById("accountability").style.color = "green";
      document.getElementById("accountability-word").innerHTML = "Yes";
    } else {
      document.getElementById("accountability-icon").className = "fas fa-question-circle";
      document.getElementById("accountability").style.color = "goldenrod";
      document.getElementById("accountability-word").innerHTML = "Unknown";
    }

    marker.on('click', function () {
      document.getElementById("victim-name").innerHTML = data[row].VictimName;
      document.getElementById("victim-demographics").innerHTML = demographics;
      document.getElementById("incident-date").innerHTML = data[row].IncidentDate;
      document.getElementById("city").innerHTML = data[row].City;
      document.getElementById("police-dept").innerHTML = data[row].PoliceDept;
      document.getElementById("officers").innerHTML = data[row].OfficerName;
      document.getElementById("incident-description").innerHTML = data[row].Description;
      // document.getElementById("accountability").innerHTML = accountability;
      document.getElementById("news-source").innerHTML = data[row].ArticleSource;
      document.getElementById("news-source").href = data[row].ArticleURL;

      sidebar.show(); 
      
    });

    // marker.feature = {
    //   properties: {
    //     // name: data[row].name,
    //     name: "test name",
    //     // description: data[row].description,
    //     description: "Lorem ipsum.",
    //   },
    // };
    // marker.on({
    //   click: function (e) {
    //     L.DomEvent.stopPropagation(e);
    //     document.getElementById("sidebar-title").innerHTML =
    //       e.target.feature.properties.name;
    //     document.getElementById("sidebar-content").innerHTML =
    //       e.target.feature.properties.description;
    //     sidebar.open(panelID);
    //   },
    // });
    // COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS

    // AwesomeMarkers is used to create fancier icons
    let icon = L.AwesomeMarkers.icon({
      icon: "info-circle",
      iconColor: "white",
      // markerColor: data[row].color,
      markerColor: "blue",
      prefix: "fa",
      extraClasses: "fa-rotate-0",
    });
    if (!markerType.includes("circle")) {
      marker.setIcon(icon);
    }
  }
}