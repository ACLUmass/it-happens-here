// Define credentials to access Google Sheets database
let SHEET_ID = '1WgKitw1ggr9VO9Wg_K50G7t4L-uP_dr3vi7drUcPPbU'; // Get this from the main sheet URL (not the copied Publish URL with '2PACX' in it).
let API_KEY = google_sheets_api_key;

/*
Use Google Sheets API to download spreadshet as JSON, and Papa.parse to format
Thanks to mroswell: https://github.com/jsoma/tabletop/issues/189#issuecomment-650199344
*/
var spreadsheetId = SHEET_ID
var sheetName = 'Incidents'
var apiKey = API_KEY
var url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

fetch(url)
	.then(response => response.json())
	.then(json_result => Papa.parse(Papa.unparse(json_result.values), { header: true }))
	.then(data => {
  		var data = data.data;
      addPoints(data);
      // addDates(data);
      win.hide();
    });

/*
Add points from google sheet to Leaflet map
Thank you, https://github.com/carderne/leaflet-gsheets/blob/master/main.js
*/
function addPoints(data) {
  // data = data.data;
  let pointGroupLayer = L.layerGroup().addTo(map);

  // Marker radius
  // Wil be in pixels for circleMarker, metres for circle
  // Ignore for point
  let markerRadius = 5;

  for (let row = 0; row < data.length; row++) {
    // var victim_name = data[row].VictimName;
    // console.log("Lat:", data[row].Latitude, "Long:", data[row].Longitude);
    let marker = L.circleMarker([data[row].Latitude, data[row].Longitude], {
        radius: markerRadius, 
        stroke: false,
        fillOpacity: 0.6,
        color: "#ef404d",
        time: data[row].IncidentDate
      });
    marker.addTo(pointGroupLayer);

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
      $("#sidebar-killing")[0].style.display = "block";
      $("#sidebar-misconduct")[0].style.display = "none";

      $("#sidebar")[0].style.border = "10px solid #d74d51";

      document.getElementById("violence-heading").innerHTML = data[row].IncidentType;
      document.getElementById("victim-name").innerHTML = data[row].VictimName;
      document.getElementById("victim-demographics").innerHTML = demographics;
      document.getElementById("incident-date").innerHTML = data[row].IncidentDate;
      document.getElementById("city").innerHTML = data[row].City;
      document.getElementById("police-dept").innerHTML = data[row].PoliceDept;
      document.getElementById("officers").innerHTML = data[row].OfficerName;
      document.getElementById("incident-description").innerHTML = data[row].Description;
      document.getElementById("news-source").innerHTML = data[row].ArticleSource;
      document.getElementById("news-source").href = data[row].ArticleURL;

      sidebar.show(); 
      
    });
  }
}

