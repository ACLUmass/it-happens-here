// Thank you: https://codepen.io/AdamKimmerer/pen/RraRbb/

// Add custom control for timeline
function addTimeline(map) {
	var map_width = map.getSize().x;
	L.Control.Timeline = L.Control.extend({
	    onAdd: function(map) {
	        var timeline_div = L.DomUtil.create('div');

	        timeline_div.innerHTML = `
	        <div id="lineCont"> 
			  <div id="line"></div>
			  <div id="span">Date Placeholder</div>
			</div>
			<div id="mainCont">
			</div>
	        `

	        console.log("map_width", map_width)
	        timeline_div.id = "timeline-div";
	        timeline_div.style.width = map_width + 'px';
	        // img.src = 'img/black_logo.png';
	        // img.style.width = '100px';

	        return timeline_div;
	    },

	    onRemove: function(map) {
	        // Nothing to do here
	    }
	});

	L.control.timeline = function(opts) {
	    return new L.Control.Timeline(opts);
	}

	L.control.timeline({ position: 'bottomleft' }).addTo(map);

	createTimelinePoints()

}
////////////

function createTimelinePoints() {
	//Sample dates
	var dates = ["6/12/2015", "8/15/2015", "10/22/2015", "11/2/2015", "12/22/2015"];
	//For the purpose of stringifying MM/DD/YYYY date format
	var monthSpan = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	//Format MM/DD/YYYY into string
	function dateSpan(date) {
	  var month = date.split('/')[0];
	  month = monthSpan[month - 1];
	  var day = date.split('/')[1];
	  if (day.charAt(0) == '0') {
	    day = day.charAt(1);
	  }
	  var year = date.split('/')[2];

	  //Spit it out!
	  return month + " " + day + ", " + year;
	}

	//Main function. Draw your circles.
	function makeCircles() {
	  //Forget the timeline if there's only one date. Who needs it!?
	  if (dates.length < 2) {
	    $("#line").hide();
	    $("#span").show().text(dateSpan(dates[0]));
	    //This is what you really want.
	  } else if (dates.length >= 2) {
	    //Set day, month and year variables for the math
	    var first = dates[0];
	    var last = dates[dates.length - 1];

	    var firstMonth = parseInt(first.split('/')[0]);
	    var firstDay = parseInt(first.split('/')[1]);

	    var lastMonth = parseInt(last.split('/')[0]);
	    var lastDay = parseInt(last.split('/')[1]);

	    //Integer representation of the last day. The first day is represnted as 0
	    var lastInt = ((lastMonth - firstMonth) * 30) + (lastDay - firstDay);

	    //Draw first date circle
	    $("#line").append('<div class="circle" id="circle0" style="left: ' + 0 + '%;"><div class="popupSpan">' + dateSpan(dates[0]) + '</div></div>');
	    
	    $("#mainCont").append('<span id="span0" class="center"></span>');

	    //Loop through middle dates
	    for (i = 1; i < dates.length - 1; i++) {
	      var thisMonth = parseInt(dates[i].split('/')[0]);
	      var thisDay = parseInt(dates[i].split('/')[1]);

	      //Integer representation of the date
	      var thisInt = ((thisMonth - firstMonth) * 30) + (thisDay - firstDay);

	      //Integer relative to the first and last dates
	      var relativeInt = thisInt / lastInt;

	      //Draw the date circle
	      $("#line").append('<div class="circle" id="circle' + i + '" style="left: ' + relativeInt * 100 + '%;"><div class="popupSpan">' + dateSpan(dates[i]) + '</div></div>');
	      
	      $("#mainCont").append('<span id="span' + i + '" class="right"></span>');
	    }

	    //Draw the last date circle
	    $("#line").append('<div class="circle" id="circle' + i + '" style="left: ' + 99 + '%;"><div class="popupSpan">' + dateSpan(dates[dates.length - 1]) + '</div></div>'); 
	    
	    $("#mainCont").append('<span id="span' + i + '" class="right"></span>');
	  }

	  $(".circle:first").addClass("active");
	}

	makeCircles();

	$(".circle").mouseenter(function() {
	  $(this).addClass("hover");
	  // $(".circle.active").removeClass("active");
	});

	$(".circle").mouseleave(function() {
	  $(this).removeClass("hover");
	  // $(".circle.active").addClass("active");
	});

	$(".circle").click(function() {
	  var spanNum = $(this).attr("id");
	  selectDate(spanNum);
	  alert('circle clicked:', spanNum)
	});

	function selectDate(selector) {
	  $selector = "#" + selector;
	  $spanSelector = $selector.replace("circle", "span");
	  var current = $selector.replace("circle", "");
	  
	  $(".active").removeClass("active");
	  $($selector).addClass("active");
	  
	  if ($($spanSelector).hasClass("right")) {
	    $(".center").removeClass("center").addClass("left")
	    $($spanSelector).addClass("center");
	    $($spanSelector).removeClass("right")
	  } else if ($($spanSelector).hasClass("left")) {
	    $(".center").removeClass("center").addClass("right");
	    $($spanSelector).addClass("center");
	    $($spanSelector).removeClass("left");
	  }; 
	};

	console.log()
}


