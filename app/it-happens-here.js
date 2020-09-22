const base_url = "0.0.0.0:8000"

// Initialize Leaflet map
var map = L.map('mapid').setView([42.4072, -71.3824], 10);
L.esri.basemapLayer('Gray').addTo(map);

// Add link to specific marker with URL parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const incident_url_param = urlParams.get('id')
const url_params_present = incident_url_param != null;

// Add custom spinner while things are loading
var loading_win =  L.control.window(map,
	{closeButton: false,
	 content:'<div class="spinner-border text-dark" role="status"><span class="sr-only"></span></div>',
	 className: "spin-window"})
           .showOn([map.getSize().x / 2 - 50, 
           	map.getSize().y / 2 - 50])

// Add intro window
var intro_win =  L.control.window(map,
	{closeButton: false,
	 content: `
	 	 <img id="ihh-logo" src="img/ihh_logo.png" alt="Police Violence Happens Here">
	     <p id="intro-description">
	     	This map shows incidents of alleged police violence (red dots) and alleged misconduct 
	     	(blue dots) that occurred in Massachusetts since 2000. Descriptions are drawn 
	     	from contemporaneous sources. This is not an exhaustive list.
     	</p>`,
	 className: "intro-window",
	 position: "top-left",
	 prompt: {buttonOK: "Continue", 
	 		  callback: function() {
			 	addActions(map);
			 }}
	})

// Add info window
var info_win =  L.control.window(map,
	{closeButton: true,
		title: "Police Violence Happens Here",
	 content: `
	 	 <p><em>A campaign by the <a href="aclum.org" target="_blank">ACLU of Massachusetts</a></em></p>

	 	 <p>Massachusetts is not immune to police violence and misconduct - and we must demand change. Right now, legislators in Massachusetts have the unprecedented opportunity to end qualified immunity, impose real restrictions on use of force, and ban police use of face surveillance technology. Police violence happens here: help us demand an end to it in Massachusetts.</p>
    
    <p> To take action against police violence and misconduct across Massachusetts, visit the homepage for our <a href="https://www.aclum.org/en/police-violence-happens-here-week-action" target="_blank">Week of Action</a>.</p>
    <p style="margin-bottom: 0px;">To learn more about policing in Massachusetts and nationally, we invite you to explore the following projects and organizations:</p>
    <ul>
        <li><a href="http://masspolicereform.org/" target="_blank">Mass Police Reform</a></li>
        <li><a href="https://www.wokewindows.org/" target="_blank">Woke Windows</a></li>
        <li><a href="https://mappingpoliceviolence.org/" target="_blank">Mapping Police Violence</a></li>
    </ul>
    
    <p>Please note that this map is by no means a comprehensive list of all 
	 	 incidents of police violence and misconduct in Massachusetts. Incidents reported here reflect only those reported publicly in the past two decades which ACLU-MA volunteers were able to compile over the course of a week. If you know of an 
	 	 incident that was documented in secondary sources but is not listed on our
	 	 map, we invite you to 
	 	 <a href="https://docs.google.com/forms/d/e/1FAIpQLScmhMIsDd_Ap2GqHHYe6BfBO87D_qIMQ-3n8YJbkUzEdEHjqw/formResponse" target="_blank">
	 	 let us know</a>.</p>

	 	 <p>Interested programmers can view the source code for this map, written in Javascript, on <a href="https://github.com/ACLUmass/it-happens-here" target="_blank">GitHub</a>.</p>
    
	 	 Please contact <a href="mailto:lchambers@aclum.org">lchambers@aclum.org</a> with questions, or <a href="mailto:klagreca@aclum.org">klagreca@aclum.org</a> with media inquiries.
	 	 `,
	 className: "info-window",
	 position: "top-left"}
	)

// Add polygon of MA to the map
var MAStyle = {
    weight: 2,
    opacity: 1,
    color: '#a3dbe3',
    dashArray: '3',
    fillOpacity: 0.2,
    interactive: false
};

var ma_polygon = new L.Shapefile("data/outline25k.zip", {style: MAStyle}).addTo(map);
ma_polygon.once("data:loaded", function() {
    map.fitBounds(ma_polygon.getBounds());
    this.bringToBack();
})

// Add button to reset zoom
L.easyButton('fa-home', function(btn, map){
    map.fitBounds(ma_polygon.getBounds());
}).addTo(map);

// Add button to show info window
L.easyButton('fa-info', function(btn, map){
    info_win.show()
}).addTo(map);


// Add sidebar
var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'right'
});
map.addControl(sidebar);

sidebar.on('hidden', function () {
    map.scrollWheelZoom.enable();

});

// Add custom control with ACLUM logo
function addBranding(map) {
	L.Control.Watermark = L.Control.extend({
	    onAdd: function(map) {
	        var img = L.DomUtil.create('img');

	        img.src = 'img/black_logo.png';
	        img.style.width = '100px';
	        img.style.margin = '2rem';

	        return img;
	    },

	    onRemove: function(map) {
	        // Nothing to do here
	    }
	});

	L.control.watermark = function(opts) {
	    return new L.Control.Watermark(opts);
	}

	L.control.watermark({ position: 'bottomleft' }).addTo(map);
}

addBranding(map);

// Add custom control with Take Action, etc. buttons
function addActions(map) {
	L.Control.TakeAction = L.Control.extend({
	    onAdd: function(map) {
	        let div = L.DomUtil.create('div');
	        div.classList.add("take-action");

	        div.innerHTML = `
	        <a href="#" 
	           class="btn btn-danger take-action-btn" 
	        	role="button" aria-disabled="true">
                    Take Action
                </a>	
            <a href="https://docs.google.com/forms/d/e/1FAIpQLScmhMIsDd_Ap2GqHHYe6BfBO87D_qIMQ-3n8YJbkUzEdEHjqw/formResponse" 
            class="btn btn-info submit-incident-btn" 
        	role="button" aria-disabled="true" target="_blank">
                Submit Incident 
                <i class="fas fa-external-link-alt"></i>
            </a>	
	        `

	        return div;
	    },

	    onRemove: function(map) {
	        // Nothing to do here
	    }
	});

	L.control.take_action = function(opts) {
	    return new L.Control.TakeAction(opts);
	}

	L.control.take_action({ position: 'topright' }).addTo(map);
}

// Determine what to do with urlParams
function handle_URL() {
	if (url_params_present == true) {
		if (Object.keys(markers).includes(incident_url_param)) {
			markers[incident_url_param].fire('click')
		// document.getElementById('elementID').click();
		} else {
			// URL parameter does not match marker
			console.warn("Could not match URL parameter", incident_url_param)
			intro_win.show();
		}
	} else if (url_params_present == false) {
		intro_win.show();
	}
}

function copy_to_clipboard(id) {
	var textArea = document.createElement("textarea");
	textArea.id = "url-textarea"
		// Place in top-left corner of screen regardless of scroll position.
	  textArea.style.position = 'fixed';
	  textArea.style.top = 0;
	  textArea.style.left = 0;

	  // Ensure it has a small width and height. Setting to 1px / 1em
	  // doesn't work as this gives a negative w/h on some browsers.
	  textArea.style.width = '2em';
	  textArea.style.height = '2em';

	  // We don't need padding, reducing the size if it does flash render.
	  textArea.style.padding = 0;

	  // Clean up any borders.
	  textArea.style.border = 'none';
	  textArea.style.outline = 'none';
	  textArea.style.boxShadow = 'none';

	  // Avoid flash of white box if rendered for any reason.
	  textArea.style.background = 'transparent';

	  textArea.value = id;

	  document.body.appendChild(textArea);
	  textArea.focus()
	  textArea.select();


	  try {
	    var successful = document.execCommand('copy');
	    var msg = successful ? 'successful' : 'unsuccessful';
	  } catch (err) {
	    console.warn('Oops, unable to copy URL');
	  }

	  document.body.removeChild(textArea);

  /* Alert the copied text */
  // alert("Copied the text: " + copyText.value);
}

// function create_tweet(type, name, url) {
// 	if (type = "violence") {
// 		tweet_language = "Massachusetts is not immune to police violence and misconduct. We must demand change. #ItHappensHere".replace(/\s/g, '%20')
// 	}

// 	url_to_tweet = `http://twitter.com/intent/tweet?text=${tweet_language}%3A&url=http%3A%2F%2F${url}%2F&via=ACLU_Mass`
// }

