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

  // Initialize set to hold PD locations
  let PD_locations = [];

  // Initialize object (dict) to hold misconduct events
  let PD_misconduct_cases = new Object({});

  for (let row = 0; row < data.length; row++) {
    let city = data[row].City;
    let dvsv_flag = data[row].DVSV;
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
    PD_locations.push([city, dvsv_flag, lat, lng])

    // Collect information needed for each misconduct entry
    let entry = {
      year: year,
      tagline: tagline,
      description: description,
      source_name: source_name,
      source_url: source_url
    };

    let city_flag_key = city + "-" + dvsv_flag.replace(/\s/g, '-').toLowerCase()

    // Populate object (dict) with eachs entry, organized by city and type
    if (Object.keys(PD_misconduct_cases).includes(city_flag_key)) {
      if (Object.keys(PD_misconduct_cases[city_flag_key]).includes(misconduct_type)) {
        PD_misconduct_cases[city_flag_key][misconduct_type].push(entry);
      } else {
        PD_misconduct_cases[city_flag_key][misconduct_type] = [entry];
      }
    } else {
      PD_misconduct_cases[city_flag_key] = {};
      PD_misconduct_cases[city_flag_key][misconduct_type] = [entry];
    }
  }

  let PD_locations_set = Array.from(new Set(PD_locations.map(JSON.stringify)), JSON.parse);

  var city_entries = [];

  // Add one marker to map per PD
  for (let item of PD_locations_set) {
    let city = item[0];
    let dvsv_flag = item[1];
    let lat = item[2];
    let lng = item[3];

    if (dvsv_flag == "Sexual Violence") {
      var misconduct_color = "#d74d51"
    } else {
      var misconduct_color = "#0055aa"
    }

    let marker = L.circleMarker([lat, lng], {
      radius: markerRadius, 
      stroke: false,
      fillOpacity: 0.6,
      color: misconduct_color,
      city: city,
      dvsv_flag: dvsv_flag
    });
    marker.addTo(pointGroupLayer);

    let marker_id = city.toLowerCase().replace(/\s/g, '-');
    markers[marker_id] = marker;

    let city_flag_key = city + "-" + dvsv_flag.replace(/\s/g, '-').toLowerCase()

    // Construct div with all misconduct incident-description
    let city_misconduct_cases = PD_misconduct_cases[city_flag_key];

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

    marker.on('mouseup', function () {

      let tweet_type
      if (this.options.dvsv_flag == "Sexual Violence") {
        var misconduct_color = "#d74d51"
        var watermark_color = "rgba(239, 64, 78, 0.3)"
        var watermark = "ALLEGED VIOLENCE"
        var suffix = " incident(s) of alleged violence"
        tweet_type = "violence"
      } else {
        var misconduct_color = "#0055aa"
        var watermark_color = "rgba(0, 85, 170, 0.3)"
        var watermark = "ALLEGED MISCONDUCT"
        var suffix = " incident(s) of alleged misconduct";
        tweet_type = "misconduct"
      }

      document.getElementById("sidebar-killing").style.display = "none";
      document.getElementById("sidebar-misconduct").style.display = "block";

      document.getElementById("sidebar").style.border = `10px solid ${misconduct_color}`;

      document.getElementById("misconduct-heading").innerHTML = watermark;
      document.getElementById("misconduct-heading").style.color = watermark_color;

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
      document.getElementById("n-misconduct").innerHTML = i_entry + suffix;
      document.getElementById("misconduct-entries").replaceWith(misconduct_div);

      // Define URL for marker and customize "Copy URL" button
      let marker_url = base_url + "?id=" + marker_id;
      document.getElementById("url-copy-misconduct").onmouseup = copy_to_clipboard(marker_url);

      let city_to_tweet;
      if (city == "Statewide") {
        city_to_tweet = "statewide"
      } else if (city.includes("Sheriff")) {
        city_to_tweet = "at the " + city
      } else if (city.includes("Various")) {
        city_to_tweet = "statewide"
      } else {
        city_to_tweet = "in " + city
      }

      document.getElementById("url-tweet-incident").href = create_tweet(tweet_type, "", city_to_tweet, marker_url)

      // Re-add the call to toggle the bootstrap collapse when the button is clicked
      for (i_cityentry in city_entries) {

        if (city_entries[i_cityentry].includes(this.options.city.replace(/\s/g, '-'))) {

          let city_entry_id = city_entries[i_cityentry]
          let button_id = "collapseButton" + city_entry_id;
          let collapse_id = "collapse" + city_entry_id;

          L.DomEvent.on(
              document.getElementById(button_id), // HTMLElement
              'mouseup', // String with event names
              function(ev) {  // Handler function
                document.getElementById(collapse_id).collapse("toggle")
                 
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

