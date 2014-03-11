function send(token,method,call,json) {
    var xhr = new XMLHttpRequest();
    var auth = btoa(token+':api_token');
    xhr.open(method, "https://toggl.com/api/v8/"+call, false);
    xhr.setRequestHeader('Authorization',auth,'Content-type','application/json');
    xhr.setRequestHeader("Content-length", json.length);
    xhr.send(json);
    return JSON.parse(xhr.responseText);
}

function startTimer() {
	var data = {};
	data.time_entry = {};
    data.time_entry.description = "Pebble initiated timer";
    var json = JSON.stringify(data);
    var result = send(token,"POST","time_entries/start",json);
    return result.data;
}

function stopTimer(id) {
    var result = send(token,"PUT","time_entries/"+id+"/stop",null);
    return result.data.duration;
}

function getTimer() {
    var result = send(token,"GET","time_entries/current",null);
    return result.data;
}

Pebble.addEventListener("ready",
  function(e) {
    console.log("JavaScript app ready and running!");
  }
);

Pebble.addEventListener("appmessage",
  function(e) {
    console.log("Received message: " + e.payload);
	  if (e.type == 'start') {
		  id = startTimer()
	  } else if (e.type == 'stop' ) {
		  stopTimer(id);
	  }
  }
);

var id = localStorage.getItem("lastId");
//var token = localStorage.getItem("token");
var token = "e7d2ad36d546dd60702083029c03a9b6";
