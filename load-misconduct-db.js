// Load Google Sheet (draw from credentials defined in load-incident-db.js)
let SHEET_ID = '1WgKitw1ggr9VO9Wg_K50G7t4L-uP_dr3vi7drUcPPbU'; // Get this from the main sheet URL (not the copied Publish URL with '2PACX' in it).
let API_KEY = google_sheets_api_key;
var spreadsheetId = SHEET_ID
var sheetName = 'Incidents'
var apiKey = API_KEY
var url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

var sheetName_misconduct = 'Misconduct'
var url_misconduct = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName_misconduct}?key=${apiKey}`;

function load_misconduct_data() {
  return fetch(url_misconduct)
  	.then(response => response.json())
  	.then(json_result => Papa.parse(Papa.unparse(json_result.values), { header: true }))
  	.then(data => {
    		var data = data.data;
        console.log(data);
        addMisconductPoints(data);
      });
  }

/*
Add points from google sheet to Leaflet map
Thank you, https://github.com/carderne/leaflet-gsheets/blob/master/main.js
*/
function addMisconductPoints(data) {

  console.log("markers within addMisconductPoints", markers)
  // data = data.data;
  let pointGroupLayer = L.layerGroup().addTo(map);

  // Marker radius
  // Wil be in pixels for circleMarker, metres for circle
  // Ignore for point
  let markerRadius = 5;

  // Initialize set to hold PD locations
  let PD_locations = [];

  // Initialize object (dict) to hold misconduct events
  let PD_misconduct_cases = new Object({});

  for (let row = 0; row < data.length; row++) {
    let city = data[row].City;
    let misconduct_type = data[row].Type;
    let lat = data[row].Latitude;
    let lng = data[row].Longitude;
    let year = data[row].Year;
    let tagline = data[row].Tagline;
    let description = data[row].Description;
    let source_url = data[row].SourceURL;
    let source_name = data[row].SourceName;

    // Skip any entries that don't have lat/lng
    if (typeof lat == "undefined" | typeof lng == "undefined") {
      continue
    }

    if (typeof description == "undefined") {
      console.log("description", description, typeof description == "undefined")
      description = "<em>No details available.</em>"
    }

    // Add City, Lat, Lng to set of PD locations
    PD_locations.push([city, lat, lng])

    // Collect information needed for each misconduct entry
    let entry = {
      year: year,
      tagline: tagline,
      description: description,
      source_name: source_name,
      source_url: source_url
    };

    // Populate object (dict) with eachs entry, organized by city and type
    if (Object.keys(PD_misconduct_cases).includes(city)) {
      if (Object.keys(PD_misconduct_cases[city]).includes(misconduct_type)) {
        PD_misconduct_cases[city][misconduct_type].push(entry);
      } else {
        PD_misconduct_cases[city][misconduct_type] = [entry];
      }
    } else {
      PD_misconduct_cases[city] = {};
      PD_misconduct_cases[city][misconduct_type] = [entry];
    }
  }

  let PD_locations_set = Array.from(new Set(PD_locations.map(JSON.stringify)), JSON.parse);

  var city_entries = [];

  // Add one marker to map per PD
  for (let item of PD_locations_set) {
    let city = item[0];
    let lat = item[1];
    let lng = item[2];

    let marker = L.circleMarker([lat, lng], {
      radius: markerRadius, 
      stroke: false,
      fillOpacity: 0.6,
      color: "#0055aa",
      city: city
    });
    marker.addTo(pointGroupLayer);

    let marker_id = city.toLowerCase();
    markers[marker_id] = marker;

    // Construct div with all misconduct incident-description
    let city_misconduct_cases = PD_misconduct_cases[city];

    let misconduct_div = document.createElement("div"); 
    misconduct_div.id = "misconduct-entries";

    let city_no_spaces = city.replace(/\s/g, '-') 

    let i_entry = 0;

    for (const type in city_misconduct_cases) {

      misconduct_type = document.createElement("b");
      misconduct_type.innerHTML =  `${type}`
      misconduct_div.appendChild(misconduct_type);

      for (const entry in city_misconduct_cases[type]) {
        i_entry += 1;

        let misconduct_entry = document.createElement("div"); 
        misconduct_entry.innerHTML = `
          <button class="btn btn-light misconduct-btn" id="collapseButton${city_no_spaces}${i_entry}" 
             data-toggle="collapse" data-target="#collapse${city_no_spaces}${i_entry}" 
             type="button" aria-expanded="false" aria-controls="collapseExample">
            ${city_misconduct_cases[type][entry].tagline}
            <div style="text-align: right;">
              <span class="read-more">Read more</span>
              <i class="fas fa-sort-down" aria-hidden="true"></i>
            </div> 
          </button>

          <div class="collapse" id="collapse${city_no_spaces}${i_entry}">
            ${city_misconduct_cases[type][entry].description}
            <i>Source: <a id="news-source" target="_blank" href=${city_misconduct_cases[type][entry].source_url}>
              ${city_misconduct_cases[type][entry].source_name}
            </a></i>  
          </div>
        `
        city_entries.push(city_no_spaces + i_entry);

        misconduct_div.appendChild(misconduct_entry);
      }
    }

    marker.on('click', function () {

      $("#sidebar-killing")[0].style.display = "none";
      $("#sidebar-misconduct")[0].style.display = "block";

      $("#sidebar")[0].style.border = "10px solid #0055aa";

      if (city == "Statewide") {
        var city_title = "MA State Police";
      } else if (city.includes("Sheriff")) {
        var city_title = city
      } else if (city.includes("Various")) {
        var city_title = "Statewide"
      }else {
        var city_title = city + " PD";
      }
      document.getElementById("misconduct-dept").innerHTML = city_title;
      document.getElementById("n-misconduct").innerHTML = i_entry + " collected incident(s) of misconduct";
      document.getElementById("misconduct-entries").replaceWith(misconduct_div);

      // Define URL for marker and customize "Copy URL" button
      let marker_url = base_url + "?id=" + marker_id;
      document.getElementById("url-copy-misconduct").onclick = copy_to_clipboard(marker_url);

      // Re-add the call to toggle the bootstrap collapse when the button is clicked
      for (i_cityentry in city_entries) {

        if (city_entries[i_cityentry].includes(this.options.city.replace(/\s/g, '-'))) {

          let city_entry_id = city_entries[i_cityentry]
          let button_id = "collapseButton" + city_entry_id;
          let collapse_id = "collapse" + city_entry_id;

          L.DomEvent.on(
              document.getElementById(button_id), // HTMLElement
              'click', // String with event names
              function(ev) {  // Handler function
                console.log('clicked!'); 
                $("#" + collapse_id).collapse("toggle")
                 
              }
          );
      }
    }

      sidebar.show();

      // Disable scroll zooming to not mess up scrolling inside sidebar
      map.scrollWheelZoom.disable();
      
    });

    

  }

  console.log("markers at the end of addMisconductPoints", markers)

}

