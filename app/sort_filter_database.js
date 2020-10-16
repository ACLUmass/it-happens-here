
/**
 * Perform a search of incidents and display the resulting cards
 */
function filter_incidents() {

    // Find all email elements
    var incidents = document.getElementsByClassName("card_div");

    // Determine the current search values
    var type_search = document.getElementById("incident_type").value;
    var misconduct_type_search = document.getElementById("misconduct_type").value;
    var violence_type_search = document.getElementById("violence_type").value;
    var city_search = document.getElementById("city_select").value;
    var year_search = document.getElementById("year_select").value;
    var keyword_search = document.getElementById("keyword_search_box").value;

    // Determine whether or not to display each thumbnail
    var num_incidents_displayed = 0;

    for (i = 1; i <= incidents.length; i++) {
        var incident  = document.getElementById("card" + i)

        if (!incident) {
            console.error("We've got an issue with card", i)
        }

        // Evaluate if the "type" text matches the search
        let incident_type_subtype = incident.getAttribute('type').toLowerCase()
        let incident_type = incident_type_subtype.split("_")[0]

        if (type_search == "all") {
            type_match = true;
        } else if (incident_type == type_search) {

            if (incident_type == "violence"){
                let violence_type = incident_type_subtype.split("_")[1]

                type_match = violence_type_search == "all" | violence_type == violence_type_search

            } else if (incident_type == "misconduct"){
                let misconduct_type = incident_type_subtype.split("_")[1]

                type_match = misconduct_type_search == "all" | misconduct_type == misconduct_type_search

            } else {
                type_match = true;
            }
        } else {
            type_match = false;
        }

        // Evaluate if the "location" text matches the search
        let incident_city = incident.getAttribute('city').toLowerCase()
        let city_match = city_search == "All" | incident_city.includes(city_search.toLowerCase())

        // Evaluate if the "year" text matches the search
        let incident_year = incident.getAttribute('year').toLowerCase()
        let year_match = year_search == "All" | incident_year.includes(year_search.toLowerCase())

        // Evaluate if the "keyword" text matches the search
        let incident_keyword = incident.getAttribute('keywords').toLowerCase()
        let keyword_match = keyword_search == "" | incident_keyword.includes(keyword_search.toLowerCase())

        console.log(incident, type_match, city_match, year_match, keyword_match)

        // if (from_match & to_match & cc_match && body_match & date_match) {
        if (type_match & city_match & year_match & keyword_match) {
            incident.style.display = "inline-block";
            num_incidents_displayed++;
        } else {
            incident.style.display = "none";
        }
    };

    // If there are no proposals to display, tell the user
    if (num_incidents_displayed == 0) {
        document.getElementById("no_incidents_msg").style.display = 'block';
    } else {
        document.getElementById("no_incidents_msg").style.display = 'none';
    };

    // Update the count of how many emails are being shown
    document.getElementById('n_incidents_showing').innerHTML = num_incidents_displayed;
};


function get_n_incidents_loaded() {
    // Find all email elements
    var incidents = document.getElementsByClassName("card_div");
    console.log("number of incidents: ", incidents.length)

    // Update the count of how many emails are being shown
    document.getElementById('n_incidents_showing').innerHTML = incidents.length;
};


