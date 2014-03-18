
var token;
function tokenIsSet(){
	return token != "undefined" && token != null && token != ""
}
function send(token,method,call,json) {
	if(tokenIsSet()){
		var xhr = new XMLHttpRequest();
		console.log("Send token"+token);
		var auth = "Basic "+base64.encode(token+':api_token');
		console.log(auth);
		xhr.open(method, "https://toggl.com/api/v8/"+call, false);
		xhr.setRequestHeader('Authorization',auth);
		xhr.setRequestHeader('Content-type','application/json');
		if ( json !== null ) {
			xhr.setRequestHeader("Content-length", json.length);
		}
		xhr.send(json);
		console.log(xhr.status);
		console.log(xhr.responseText);
		return JSON.parse(xhr.responseText);
	}else{
		console.log('no token');
		return JSON.parse("{error: 'no token'}");
	}
}

function startTimer() {
	var data = {};
	data.time_entry = {};
    data.time_entry.description = localStorage.getItem("desc");
    var json = JSON.stringify(data);
    var result = send(token,"POST","time_entries/start",json);
    return result.data;
}

function stopTimer(id) {
    var result = send(token,"PUT","time_entries/"+id+"/stop",null);
    return result.data;
}

function getTimer() {
    var result = send(token,"GET","time_entries/current",null);
    return result.data;
}

function getCurrentTimer() {
	var data = getTimer();
							console.log(data);

							if ( data ) {
								Pebble.sendAppMessage({
									"id": data.id,
									"duration": data.duration,
									 "description": data.description?data.description:"an unnamed task",
									"start":"1"
								});
							} else {
								Pebble.sendAppMessage({
									"id": 0,
									"duration": 0,
									"description": "",
									"start":"0"
								});
							}
}

Pebble.addEventListener("ready",
                        function(e) {
                            console.log("JavaScript app ready and running!");
							token = localStorage.getItem("token");
							Pebble.sendAppMessage({
									"offset": parseInt(localStorage.getItem("offset"))
								});
							if(tokenIsSet()){
								getCurrentTimer();
							}else{
								console.log('No token')
							}
                            	
                        }
                        );

Pebble.addEventListener("appmessage",
                        function(e) {
                            console.log("Received message: " + e.payload);
                            if (e.payload.start) {
                                data = startTimer();
								Pebble.sendAppMessage({
									"id": data.id,
									"duration": data.duration,
									 "description": data.description?data.description:"an unnamed task",
									"start":"1"
								});
							} else if (e.payload.stop ) {
                                stopTimer(e.payload.id);
							} else if (e.payload.get ) {
								getCurrentTimer();
							}
                        }
                        );

Pebble.addEventListener("showConfiguration", function (e) {
	var token = localStorage.getItem('token');
	var desc = localStorage.getItem('desc');
	var offset = localStorage.getItem('offset');
	if(tokenIsSet() && desc != "undefined" && offset != "undefined" 
	    && desc != null && offset != null){
		var urlVars = "token="+token+"&desc="+desc+"&offset="+offset;	
		console.log("http://klmz.nl/pebbletoggl/settings.html?"+encodeURI(urlVars));
   		Pebble.openURL("http://klmz.nl/pebbletoggl/settings.html?"+encodeURI(urlVars));	
	}else{
		console.log("http://klmz.nl/pebbletoggl/settings.html");
   		Pebble.openURL("http://klmz.nl/pebbletoggl/settings.html");	
	}
});

Pebble.addEventListener("webviewclosed", function(e) {
	var response = decodeURIComponent(e.response);
    var settings = JSON.parse(response);
	if(settings.token){
		localStorage.setItem("token", settings.token);
		token = localStorage.getItem("token");
	}
	
	if(settings.desc){
		localStorage.setItem("desc", settings.desc);
	}
	
	if(settings.offset){
		localStorage.setItem("offset", settings.offset);
		Pebble.sendAppMessage({
									"offset": parseInt(localStorage.getItem("offset"))
								});
    }
	
	console.log(e.response);
});


				  
				  /** LIBRARY **/
				  
// UTF8 Module
//
// Cleaner and modularized utf-8 encoding and decoding library for javascript.
//
// copyright: MIT
// author: Nijiko Yonskai, @nijikokun, nijikokun@gmail.com
(function (name, definition, context, dependencies) {
  if (typeof context['module'] !== 'undefined' && context['module']['exports']) { if (dependencies && context['require']) { for (var i = 0; i < dependencies.length; i++) context[dependencies[i]] = context['require'](dependencies[i]); } context['module']['exports'] = definition.apply(context); }
  else if (typeof context['define'] !== 'undefined' && context['define'] === 'function' && context['define']['amd']) { define(name, (dependencies || []), definition); }
  else { context[name] = definition.apply(context); }
})('utf8', function () {
  return {
    encode: function (string) {
      if (typeof string !== 'string') return string;
      else string = string.replace(/\r\n/g, "\n");
      var output = "", i = 0, charCode;
 
      for (i; i < string.length; i++) {
        charCode = string.charCodeAt(i);
 
        if (charCode < 128)
          output += String.fromCharCode(charCode);
        else if ((charCode > 127) && (charCode < 2048))
          output += String.fromCharCode((charCode >> 6) | 192),
          output += String.fromCharCode((charCode & 63) | 128);
        else
          output += String.fromCharCode((charCode >> 12) | 224),
          output += String.fromCharCode(((charCode >> 6) & 63) | 128),
          output += String.fromCharCode((charCode & 63) | 128);
      }
 
      return output;
    },
 
    decode: function (string) {
      if (typeof string !== 'string') return string;
      var output = "", i = 0, charCode = 0;
 
      while (i < string.length) {
        charCode = string.charCodeAt(i);
 
        if (charCode < 128)
          output += String.fromCharCode(charCode),
          i++;
        else if ((charCode > 191) && (charCode < 224))
          output += String.fromCharCode(((charCode & 31) << 6) | (string.charCodeAt(i + 1) & 63)),
          i += 2;
        else
          output += String.fromCharCode(((charCode & 15) << 12) | ((string.charCodeAt(i + 1) & 63) << 6) | (string.charCodeAt(i + 2) & 63)),
          i += 3;
      }
 
      return output;
    }
  };
}, this);
 
// Base64 Module
//
// Cleaner, modularized and properly scoped base64 encoding and decoding module for strings.
//
// copyright: MIT
// author: Nijiko Yonskai, @nijikokun, nijikokun@gmail.com
(function (name, definition, context, dependencies) {
  if (typeof context['module'] !== 'undefined' && context['module']['exports']) { if (dependencies && context['require']) { for (var i = 0; i < dependencies.length; i++) context[dependencies[i]] = context['require'](dependencies[i]); } context['module']['exports'] = definition.apply(context); }
  else if (typeof context['define'] !== 'undefined' && context['define'] === 'function' && context['define']['amd']) { define(name, (dependencies || []), definition); }
  else { context[name] = definition(); }
})('base64', function (utf8) {
  var $this = this;
  var $utf8 = utf8 || this.utf8;
  var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
 
  return {
    encode: function (input) {
      if (typeof $utf8 === 'undefined') throw { error: "MissingMethod", message: "UTF8 Module is missing." };
      if (typeof input !== 'string') return input;
      else input = $utf8.encode(input);
      if (typeof $this.btoa !== 'undefined') return $this.btoa(input);
      var output = "", a, b, c, d, e, f, g, i = 0;
 
      while (i < input.length) {
        a = input.charCodeAt(i++);
        b = input.charCodeAt(i++);
        c = input.charCodeAt(i++);
        d = a >> 2;
        e = ((a & 3) << 4) | (b >> 4);
        f = ((b & 15) << 2) | (c >> 6);
        g = c & 63;
 
        if (isNaN(b)) f = g = 64;
        else if (isNaN(c)) g = 64;
 
        output += map.charAt(d) + map.charAt(e) + map.charAt(f) + map.charAt(g);
      }
 
      return output;
    },
 
    decode: function (input) {
      if (typeof $utf8 === 'undefined') throw { error: "MissingMethod", message: "UTF8 Module is missing." };
      if (typeof input !== 'string') return input;
      else input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      if (typeof $this.atob !== 'undefined') return $this.atob(input);
      var output = "", a, b, c, d, e, f, g, i = 0;
 
      while (i < input.length) {
        d = map.indexOf(input.charAt(i++));
        e = map.indexOf(input.charAt(i++));
        f = map.indexOf(input.charAt(i++));
        g = map.indexOf(input.charAt(i++));
 
        a = (d << 2) | (e >> 4);
        b = ((e & 15) << 4) | (f >> 2);
        c = ((f & 3) << 6) | g;
 
        output += String.fromCharCode(a);
        if (f != 64) output += String.fromCharCode(b);
        if (g != 64) output += String.fromCharCode(c);
      }
 
      return $utf8.decode(output);
    }
  }
}, this, [ "utf8" ]);
																															   
																															   // Base64 Module
//
// Cleaner, modularized and properly scoped base64 encoding and decoding module for strings.
//
// copyright: MIT
// author: Nijiko Yonskai, @nijikokun, nijikokun@gmail.com
(function (name, definition, context, dependencies) {
  if (typeof context['module'] !== 'undefined' && context['module']['exports']) { if (dependencies && context['require']) { for (var i = 0; i < dependencies.length; i++) context[dependencies[i]] = context['require'](dependencies[i]); } context['module']['exports'] = definition.apply(context); }
  else if (typeof context['define'] !== 'undefined' && context['define'] === 'function' && context['define']['amd']) { define(name, (dependencies || []), definition); }
  else { context[name] = definition(); }
})('base64', function (utf8) {
  var $this = this;
  var $utf8 = utf8 || this.utf8;
  var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
 
  return {
    encode: function (input) {
      if (typeof $utf8 === 'undefined') throw { error: "MissingMethod", message: "UTF8 Module is missing." };
      if (typeof input !== 'string') return input;
      else input = $utf8.encode(input);
      if (typeof $this.btoa !== 'undefined') return $this.btoa(input);
      var output = "", a, b, c, d, e, f, g, i = 0;
 
      while (i < input.length) {
        a = input.charCodeAt(i++);
        b = input.charCodeAt(i++);
        c = input.charCodeAt(i++);
        d = a >> 2;
        e = ((a & 3) << 4) | (b >> 4);
        f = ((b & 15) << 2) | (c >> 6);
        g = c & 63;
 
        if (isNaN(b)) f = g = 64;
        else if (isNaN(c)) g = 64;
 
        output += map.charAt(d) + map.charAt(e) + map.charAt(f) + map.charAt(g);
      }
 
      return output;
    },
 
    decode: function (input) {
      if (typeof $utf8 === 'undefined') throw { error: "MissingMethod", message: "UTF8 Module is missing." };
      if (typeof input !== 'string') return input;
      else input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      if (typeof $this.atob !== 'undefined') return $this.atob(input);
      var output = "", a, b, c, d, e, f, g, i = 0;
 
      while (i < input.length) {
        d = map.indexOf(input.charAt(i++));
        e = map.indexOf(input.charAt(i++));
        f = map.indexOf(input.charAt(i++));
        g = map.indexOf(input.charAt(i++));
 
        a = (d << 2) | (e >> 4);
        b = ((e & 15) << 4) | (f >> 2);
        c = ((f & 3) << 6) | g;
 
        output += String.fromCharCode(a);
        if (f != 64) output += String.fromCharCode(b);
        if (g != 64) output += String.fromCharCode(c);
      }
 
      return $utf8.decode(output);
    }
  }
}, this, [ "utf8" ]);
																															   
																															   // UTF8 Module
//
// Cleaner and modularized utf-8 encoding and decoding library for javascript.
//
// copyright: MIT
// author: Nijiko Yonskai, @nijikokun, nijikokun@gmail.com
(function (name, definition, context, dependencies) {
  if (typeof context['module'] !== 'undefined' && context['module']['exports']) { if (dependencies && context['require']) { for (var i = 0; i < dependencies.length; i++) context[dependencies[i]] = context['require'](dependencies[i]); } context['module']['exports'] = definition.apply(context); }
  else if (typeof context['define'] !== 'undefined' && context['define'] === 'function' && context['define']['amd']) { define(name, (dependencies || []), definition); }
  else { context[name] = definition.apply(context); }
})('utf8', function () {
  return {
    encode: function (string) {
      if (typeof string !== 'string') return string;
      else string = string.replace(/\r\n/g, "\n");
      var output = "", i = 0, charCode;
 
      for (i; i < string.length; i++) {
        charCode = string.charCodeAt(i);
 
        if (charCode < 128)
          output += String.fromCharCode(charCode);
        else if ((charCode > 127) && (charCode < 2048))
          output += String.fromCharCode((charCode >> 6) | 192),
          output += String.fromCharCode((charCode & 63) | 128);
        else
          output += String.fromCharCode((charCode >> 12) | 224),
          output += String.fromCharCode(((charCode >> 6) & 63) | 128),
          output += String.fromCharCode((charCode & 63) | 128);
      }
 
      return output;
    },
 
    decode: function (string) {
      if (typeof string !== 'string') return string;
      var output = "", i = 0, charCode = 0;
 
      while (i < string.length) {
        charCode = string.charCodeAt(i);
 
        if (charCode < 128)
          output += String.fromCharCode(charCode),
          i++;
        else if ((charCode > 191) && (charCode < 224))
          output += String.fromCharCode(((charCode & 31) << 6) | (string.charCodeAt(i + 1) & 63)),
          i += 2;
        else
          output += String.fromCharCode(((charCode & 15) << 12) | ((string.charCodeAt(i + 1) & 63) << 6) | (string.charCodeAt(i + 2) & 63)),
          i += 3;
      }
 
      return output;
    }
  };
}, this);
