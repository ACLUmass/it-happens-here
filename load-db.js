// var gsheets_url = "https://docs.google.com/spreadsheets/d/1WgKitw1ggr9VO9Wg_K50G7t4L-uP_dr3vi7drUcPPbU/edit?usp=sharing"
// var gsheets_url = "https://docs.google.com/spreadsheets/d/1WgKitw1ggr9VO9Wg_K50G7t4L-uP_dr3vi7drUcPPbU/pub?output=csv"

let SHEET_ID = '1WgKitw1ggr9VO9Wg_K50G7t4L-uP_dr3vi7drUcPPbU'; // Get this from the main sheet URL (not the copied Publish URL with '2PACX' in it).
let API_KEY = google_sheets_api_key;

console.log("got keys?")
console.log(API_KEY)

function fetchSheet({ spreadsheetId, sheetName, apiKey, complete }) {
    let url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
    return fetch(url).then(response =>
        response.json().then(result => {
            let data = Papa.parse(Papa.unparse(result.values), { header: true });
            complete(data);
        })
    );
}

function init() {
    fetchSheet({
        spreadsheetId: SHEET_ID,
        sheetName: 'Incidents',
        apiKey: API_KEY,
        complete: function(results) {
            var data = results.data;
            console.log("data downloaded?");
            console.log(data);
            addPoints(data);
          }
    });
}

init();
