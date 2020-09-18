// Load Google Sheet (draw from credentials defined in load-incident-db.js)
var sheetName_misconduct = 'Misconduct'
var url_misconduct = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName_misconduct}?key=${apiKey}`;

fetch(url_misconduct)
	.then(response => response.json())
	.then(json_result => Papa.parse(Papa.unparse(json_result.values), { header: true }))
	.then(data => {
  		var data = data.data;
      console.log(data);
      addMisconductPoints(data);
      win.hide();
    });

/*
Add points from google sheet to Leaflet map
Thank you, https://github.com/carderne/leaflet-gsheets/blob/master/main.js
*/
function addMisconductPoints(data) {
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
    // marker.on('click', function () {});

    // Construct div with all misconduct incident-description
    let city_misconduct_cases = PD_misconduct_cases[city];

    let misconduct_div = document.createElement("div"); 
    misconduct_div.id = "misconduct-entries";

    console.log(city_misconduct_cases)

    let i_entry = 0;

    for (const type in city_misconduct_cases) {

      misconduct_type = document.createElement("b");
      misconduct_type.innerHTML =  `${type}`
      misconduct_div.appendChild(misconduct_type);

      for (const entry in city_misconduct_cases[type]) {
        i_entry += 1;

        let misconduct_entry = document.createElement("div"); 
        misconduct_entry.innerHTML = `
          <button class="btn btn-light misconduct-btn" id="collapseButton${city}${i_entry}" 
             data-toggle="collapse" data-target="#collapse${city}${i_entry}" 
             type="button" aria-expanded="false" aria-controls="collapseExample">
            ${city_misconduct_cases[type][entry].tagline}
            <div style="text-align: right;">
              <span class="read-more">Read more</span>
              <i class="fas fa-sort-down" aria-hidden="true"></i>
            </div> 
          </button>

          <div class="collapse" id="collapse${city}${i_entry}">
            ${city_misconduct_cases[type][entry].description}
            <div><i>Source: <a id="news-source" target="_blank" href=${city_misconduct_cases[type][entry].source_url}>
              ${city_misconduct_cases[type][entry].source_name}
            </a></i></div>   
          </div>
        `
        city_entries.push(city + i_entry);
        // misconduct_entry.innerHTML = city_misconduct_cases[type][entry].tagline;
        // misconduct_entry.value=i_entry;


        misconduct_div.appendChild(misconduct_entry);

        
      }

      // misconduct_div.appendChild(misconduct_type_list);

    }

    console.log(city_entries)

    console.log(misconduct_div)

    // document.getElementById("misconduct-entries").replaceWith(misconduct_div)
    // misconduct_div.appendAfter(document.getElementById("misconduct-entries"))
    // document.getElementById("misconduct-entries").appendChild(misconduct_div)

    marker.on('click', function () {

      $("#sidebar-killing")[0].style.display = "none";
      $("#sidebar-misconduct")[0].style.display = "block";

      $("#sidebar")[0].style.border = "10px solid #0055aa";

      document.getElementById("misconduct-dept").innerHTML = city + " PD";
      document.getElementById("n-misconduct").innerHTML = i_entry + " known incident(s) of misconduct";
      document.getElementById("misconduct-entries").replaceWith(misconduct_div);


      // Re-add the call to toggle the bootstrap collapse when the button is clicked
      for (i_cityentry in city_entries) {

        if (city_entries[i_cityentry].includes(this.options.city)) {

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
      
    });

    

  }

}

