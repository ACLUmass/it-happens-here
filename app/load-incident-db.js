// Define credentials to access Google Sheets database
// let SHEET_ID = '1WgKitw1ggr9VO9Wg_K50G7t4L-uP_dr3vi7drUcPPbU'; // Get this from the main sheet URL (not the copied Publish URL with '2PACX' in it).
// let API_KEY = google_sheets_api_key;

/*
Use Google Sheets API to download spreadshet as JSON, and Papa.parse to format
Thanks to mroswell: https://github.com/jsoma/tabletop/issues/189#issuecomment-650199344
*/
var spreadsheetId = SHEET_ID
var sheetName = 'Incidents'
var apiKey = API_KEY
var url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

var markers = {};
fetch(url)
	.then(response => response.json())
	.then(json_result => Papa.parse(Papa.unparse(json_result.values), { header: true }))
	.then(data => addPoints(data.data))
  .then(incidentPointsLayer => load_misconduct_data(incidentPointsLayer))
  .then(() => load_massachusetts())
  .then(() => {
      // addDates(data);
      loading_win.hide();
      // intro_win.show();
      handle_URL();
    });

/*
Add points from google sheet to Leaflet map
Thank you, https://github.com/carderne/leaflet-gsheets/blob/master/main.js
*/
function addPoints(data) {
  // data = data.data;
  var incidentPointsLayer = L.layerGroup().addTo(map);

  // Layer to hold both incidents and misconduct
  let searchLayer = L.layerGroup().addTo(map);

  for (let row = 0; row < data.length; row++) {
    let marker_id = data[row].VictimName.replace(/\s/g, '-').toLowerCase()  + '-' + data[row].IncidentDate_Num
    
    let marker = L.circleMarker([data[row].Latitude, data[row].Longitude], {
        radius: markerRadius, 
        stroke: false,
        fillOpacity: 0.6,
        color: "#ef404d",
        time: data[row].IncidentDate,
        title: data[row].VictimName + " [" + data[row].City + "]",
        type: "Incident",
        url: marker_id
      });
    marker.addTo(incidentPointsLayer);

    markers[marker_id] = marker;

    marker.on('mouseup', function () {
      document.getElementById("sidebar-killing").style.display = "block";
      document.getElementById("sidebar-misconduct").style.display = "none";

      document.getElementById("sidebar").style.border = "10px solid #d74d51";

      if (data[row].VictimRace == "White") {
        var race = "white";
      } else if (data[row].VictimRace == "Unknown") {
        var race = "";
      } else {
        var race = data[row].VictimRace;
      }

      if (data[row].VictimGender == "Male" & data[row].VictimAge >= 18) {
        gender = " man"
      } else if (data[row].VictimGender == "Male" & data[row].VictimAge < 18) {
         gender = " boy"
      } else if (data[row].VictimGender == "Female" & data[row].VictimAge >= 18) {
         gender = " woman"
      } else if (data[row].VictimGender == "Female" & data[row].VictimAge < 18) {
        gender = " girl"
      } else {
        gender = " person"
      }

      if (data[row].VictimAge.toLowerCase().trim() == "unknown") {
        var demographics = race + gender + " of unknown age"   
        demographics = demographics.trim()     
        demographics = demographics.charAt(0).toUpperCase() + demographics.slice(1);
      } else {
        var demographics = data[row].VictimAge + "-year-old " + race + gender
      }

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

      // Define URL for marker and customize "Copy URL" button
      let marker_url = base_url + "?id=" + marker_id;
      document.getElementById("url-copy-incident").onmouseup = copy_to_clipboard(marker_url);

      let tweet_type
      if (data[row].IncidentType.toLowerCase() == "death") {
        tweet_type = "death"
      } else {
        tweet_type = "violence"
      }

      document.getElementById("url-tweet-incident").href = create_tweet(tweet_type, data[row].VictimName, data[row].City, marker_url)

      // console.log("Consequence", data[row].Consequence)
      // if (data[row].Consequence == "No Consequence") {
      //   document.getElementById("accountability-icon").className = "fas fa-times-circle";
      //   document.getElementById("accountability").style.color = "red";
      //   document.getElementById("accountability-word").innerHTML = "No";
      // } else if (data[row].Consequence.toLowerCase() == "unknown") {
      //   document.getElementById("accountability-icon").className = "fas fa-question-circle";
      //   document.getElementById("accountability").style.color = "goldenrod";
      //   document.getElementById("accountability-word").innerHTML = "Unknown";
      // } else {
      //   document.getElementById("accountability-icon").className = "";
      //   document.getElementById("accountability").style.color = "black";
      //   document.getElementById("accountability-word").innerHTML = data[row].Consequence;
      // }

      sidebar.show(); 

      // Disable scroll zooming to not mess up scrolling inside sidebar
      map.scrollWheelZoom.disable();

      // Update the color
      updateSelectedMarker(this);
      
    });
  }

  return incidentPointsLayer
}

