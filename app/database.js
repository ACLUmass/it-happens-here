// Populate the HTML database with violence & misconduct incidents

function incident_type_change(value) {
    if (value == "violence") {
        document.getElementById("violence_type_div").style.display = "inline"
        document.getElementById("misconduct_type_div").style.display = "none"
    } else if (value == "misconduct") {
        document.getElementById("violence_type_div").style.display = "none"
        document.getElementById("misconduct_type_div").style.display = "inline"
    } else {
        document.getElementById("violence_type_div").style.display = "none"
        document.getElementById("misconduct_type_div").style.display = "none"
    }
}

let SHEET_ID = '1WgKitw1ggr9VO9Wg_K50G7t4L-uP_dr3vi7drUcPPbU'; // Get this from the main sheet URL (not the copied Publish URL with '2PACX' in it).
let API_KEY = google_sheets_api_key;
var spreadsheetId = SHEET_ID
var sheetName = 'Incidents'
var apiKey = API_KEY
var incidents_url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

var sheetName_misconduct = 'Misconduct'
var url_misconduct = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName_misconduct}?key=${apiKey}`;

var all_data = {}
var i_incident = 1;

function load_incident_data() {
    return fetch(incidents_url)
        .then(response => response.json())
        .then(json_result => Papa.parse(Papa.unparse(json_result.values), { header: true }))
        .then(data => all_data.incidents = data);
}

function load_misconduct_data() {
    return fetch(url_misconduct)
        .then(response => response.json())
        .then(json_result => Papa.parse(Papa.unparse(json_result.values), { header: true }))
        .then(data => all_data.misconduct = data);
}

load_incident_data()
    .then(() => load_misconduct_data())
    .then(() => {
        console.log("data loaded", all_data)
        createCards(all_data)
    })

var years = [];
var cities = [];

function createCards(all_data) {

    card_container = document.getElementsByClassName("cards-container")[0]

    // Add cards for incidents of violence
    for (incident in all_data.incidents.data) {
        // console.log(data.data[incident])
        incident_data = all_data.incidents.data[incident]

        let id = incident_data.VictimName.replace(/\s/g, '-').toLowerCase() + '-' + incident_data.IncidentDate_Num
        incident_url = "https://data.aclum.org/it-happens-here/?id=" + id

        if (incident_data.VictimRace == "White") {
            var race = "white";
        } else if (incident_data.VictimRace == "Unknown") {
            var race = "";
        } else {
            var race = incident_data.VictimRace;
        }

        if (incident_data.VictimGender == "Male" & incident_data.VictimAge >= 18) {
            gender = " man"
        } else if (incident_data.VictimGender == "Male" & incident_data.VictimAge < 18) {
            gender = " boy"
        } else if (incident_data.VictimGender == "Female" & incident_data.VictimAge >= 18) {
            gender = " woman"
        } else if (incident_data.VictimGender == "Female" & incident_data.VictimAge < 18) {
            gender = " girl"
        } else {
            gender = " person"
        }

        if (incident_data.VictimAge.toLowerCase().trim() == "unknown") {
            var demographics = race + gender + " of unknown age"
            demographics = demographics.trim()
            demographics = demographics.charAt(0).toUpperCase() + demographics.slice(1);
        } else {
            var demographics = incident_data.VictimAge + "-year-old " + race + gender
        }

        if (incident_data.IncidentDate == "Unknown") {
            var year = "Unknown"
        } else {
            var year = incident_data.IncidentDate.slice(incident_data.IncidentDate.length - 4)
        }

        years.push(year)

        cities.push(incident_data.City)

        // console.log(incident_data.IncidentDate.slice(incident_data.IncidentDate.length - 4))

        let card_div = document.createElement("div");
        card_div.className = "col-lg-6 card_div"
        card_div.id = "card" + i_incident
        card_div.setAttribute("year", year)
        card_div.setAttribute("city", incident_data.City)
        card_div.setAttribute("type", incident_data.IncidentType.toLowerCase())
        card_div.setAttribute("keywords", [incident_data.VictimName, incident_data.City, incident_data.PoliceDept, incident_data.OfficerName, incident_data.Description].join(" "))
        card_div.innerHTML = `
		        	<div class="card">
		        	<div class="card-header">
					    ${incident_data.IncidentType}
					  </div>
				  <div class="card-body">
				    <h5 class="card-title">${incident_data.VictimName}</h5>
				    <h6 class="card-subtitle mb-2 text-muted">${demographics}</h6>

				  <div class="card-text">
			    	        <div><b>Date of Incident:</b> ${incident_data.IncidentDate}</div>
			    	        <div><b>Location:</b> ${incident_data.City}</div>
			    	        <div><b>Police Department:</b> ${incident_data.PoliceDept}</div>
			    	        <div><b>Officer(s) Involved:</b> ${incident_data.OfficerName}</div>
			            <p class="incident-description">
			            	${incident_data.Description}
			            </p>
			            <div style="max-width: 220px;">
			            	<i>Source: <a id="news-source" target="_blank" href="${incident_data.ArticleURL}">${incident_data.ArticleSource}</a></i>
			            </div>

			            <div style="text-align:right;"><a class="btn btn-dark" href="${incident_url}" target="blank" role="button">See on map</a></div>
				  </div>
				  </div>
				`

        // card_div.setAttribute("year", incident_data.IncidentDate.slice(id.length - 4))

        card_container.appendChild(card_div)
        i_incident += 1


    }

    // Add cards for misconduct or other sorts of violence
    for (incident in all_data.misconduct.data) {
        // console.log(data.data[incident])
        incident_data = all_data.misconduct.data[incident]

        let city = incident_data.City;
        let dvsv_flag = incident_data.DVSV;
        let misconduct_type = incident_data.Type;
        let lat = incident_data.Latitude;
        let lng = incident_data.Longitude;
        let year = incident_data.Year;
        let tagline = incident_data.Tagline;
        let description = incident_data.Description;
        let source_url = incident_data.SourceURL;
        let source_name = incident_data.SourceName;

        if (typeof description == "undefined") {
            description = "<em>No details available.</em>"
        }

        let id = city.toLowerCase().replace(/\s/g, '-');
        incident_url = "https://data.aclum.org/it-happens-here/?id=" + id

        years.push(year)

        cities.push(city)

        if (dvsv_flag == "Sexual Violence") {
            var misconduct_color = "#d74d51"
            // var watermark_color = "rgba(239, 64, 78, 0.3)"
            var watermark = "ALLEGED VIOLENCE"
            var suffix = " incident(s) of alleged violence"
            var type_prefix = "violence_"
            // tweet_type = "violence"
        } else {
            var misconduct_color = "#0055aa"
            // var watermark_color = "rgba(0, 85, 170, 0.3)"
            var watermark = "ALLEGED MISCONDUCT"
            var suffix = " incident(s) of alleged misconduct";
            var type_prefix = "misconduct_"
            // tweet_type = "misconduct"
        }

        let card_div = document.createElement("div");
        card_div.className = "col-lg-6 card_div"
        card_div.id = "card" + i_incident
        card_div.setAttribute("year", year)
        card_div.setAttribute("city", city)
        card_div.setAttribute("type", type_prefix + misconduct_type.toLowerCase().replace(/\s/g, '-'))
        card_div.setAttribute("keywords", [city, misconduct_type, description].join(" "))
        card_div.innerHTML = `
		        	<div class="card">
		        	<div class="card-header" style="background-color: ${misconduct_color}">
					    ${watermark}
					  </div>
				  <div class="card-body">
				    <h5 class="card-title">${city}</h5>
				    <h6 class="card-subtitle mb-2 text-muted">${misconduct_type}</h6>

				  <div class="card-text">
				  		<div><b>Year of Incident:</b> ${year}</div>

			            <p class="incident-description">
			            	${description}
			            </p>
			            <div style="max-width: 220px;">
			            	<i>Source: <a id="news-source" target="_blank" href="${source_url}">${source_name}</a></i>
		            	</div>
			            </div>

			            <div style="text-align:right;"><a class="btn btn-dark" href="${incident_url}" target="blank" role="button">See on map</a></div>
				  </div>
				  </div>
				`
        // card_div.setAttribute("year", year)

        card_container.appendChild(card_div)
        i_incident += 1

    }

    // Do years now	
    years.sort();
    years = ["All"].concat(years)
    years_set = new Set(years)

    years_set.forEach(function(y) {
        o = document.createElement("option")
        o.innerHTML = y
        document.getElementById("year_select").appendChild(o)
    })

    // And cities
    cities.sort();
    cities = ["All"].concat(cities)
    cities_set = new Set(cities)

    cities_set.forEach(function(c) {
        o = document.createElement("option")
        o.innerHTML = c
        document.getElementById("city_select").appendChild(o)
    })

    // Count all incidents// Find all email elements
    let incidents = document.getElementsByClassName("card_div");
    console.log("total number of incidents: ", incidents.length)
    document.getElementById('total_n_incidents').innerHTML = incidents.length;
    document.getElementById('n_incidents_showing').innerHTML = incidents.length;

}