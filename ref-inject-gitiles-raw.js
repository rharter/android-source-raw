var rawSource;

var showRaw = function() {
	var url = window.location.href;

	if (rawSource) {
		showSource(rawSource);
	} else {
		var xmlhttp;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		xmlhttp.onreadystatechange = function() {
			onTextReceived(xmlhttp.responseText);
		}

		xmlhttp.open('GET', url, true);
		xmlhttp.setRequestHeader('Accept', 'text/plain');
		xmlhttp.send();
	}

	function onTextReceived(text) {
		rawSource = Base64.decode(text);
		showSource(rawSource);
	}

	function showSource(rawText) {

		var pre = document.getElementById('raw');
		pre.style.display = '';
		pre.textContent = rawText;

		var pretty = document.querySelector('ol.prettyprint');
		pretty.style.display = 'none';

		var link = document.getElementById('raw_link');
		link.innerText = 'formatted';
		link.setAttribute('onclick', 'hideRaw();')
	}
};

var hideRaw = function() {
	var pre = document.getElementById('raw');
	pre.style.display = 'none';

	var pretty = document.querySelector('ol.prettyprint');
	pretty.style.display = '';

	var link = document.getElementById('raw_link');
	link.innerText = 'raw';
	link.setAttribute('onclick', 'showRaw();')
}

function injectRawLink() {

	injectScript('Base64', Base64);
	injectVariable('rawSource', '');
	injectVariable('hideRaw', hideRaw);
	injectVariable('showRaw', showRaw);

	// Add the raw link
	var el = document.querySelector('div.sha1');

	var link = document.createElement('a');
	link.id = 'raw_link';
	link.innerText = 'raw';
	link.setAttribute('onclick', 'showRaw();');

	el.appendChild(document.createTextNode(' ['));
	el.appendChild(link);
	el.appendChild(document.createTextNode(']'));

	// Append the raw container
	var div = document.createElement('div');
	var pre = document.createElement('pre');
	pre.id = 'raw';
	pre.style.display = 'none';
	div.appendChild(pre);

	var footer = document.querySelector('div.footer');
	footer.parentNode.insertBefore(div, footer);
}

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);
			injectRawLink();
		}
	}, 10);
});

function injectVariable(name, func) {
  var code = '\nvar ' + name;
  if (func) {
  	code += ' = ' + func ;
  }
  code += ';\n';

  var headNode = document.getElementsByTagName('head')[0];
  var scriptNode = document.createElement('script');
  scriptNode.type = 'text/javascript';
  scriptNode.textContent = code;
  headNode.appendChild(scriptNode);
}

function injectScript(name, func) {
  var code = '\n;(' + func + ')();\n';

  var headNode = document.getElementsByTagName('head')[0];
  var scriptNode = document.createElement('script');
  scriptNode.type = 'text/javascript';
  scriptNode.textContent = code;
  headNode.appendChild(scriptNode);
}

var Base64 = function() {
	window.Base64 = window.Base64 || {

	    // private property
	    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	 
	    // public method for encoding
	    encode : function (input) {
	        var output = "";
	        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	        var i = 0;
	 
	        input = Base64._utf8_encode(input);
	 
	        while (i < input.length) {
	 
	            chr1 = input.charCodeAt(i++);
	            chr2 = input.charCodeAt(i++);
	            chr3 = input.charCodeAt(i++);
	 
	            enc1 = chr1 >> 2;
	            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	            enc4 = chr3 & 63;
	 
	            if (isNaN(chr2)) {
	                enc3 = enc4 = 64;
	            } else if (isNaN(chr3)) {
	                enc4 = 64;
	            }
	 
	            output = output +
	            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
	            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
	 
	        }
	 
	        return output;
	    },
	 
	    // public method for decoding
	    decode : function (input) {
	        var output = "";
	        var chr1, chr2, chr3;
	        var enc1, enc2, enc3, enc4;
	        var i = 0;
	 
	        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	 
	        while (i < input.length) {
	 
	            enc1 = this._keyStr.indexOf(input.charAt(i++));
	            enc2 = this._keyStr.indexOf(input.charAt(i++));
	            enc3 = this._keyStr.indexOf(input.charAt(i++));
	            enc4 = this._keyStr.indexOf(input.charAt(i++));
	 
	            chr1 = (enc1 << 2) | (enc2 >> 4);
	            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	            chr3 = ((enc3 & 3) << 6) | enc4;
	 
	            output = output + String.fromCharCode(chr1);
	 
	            if (enc3 != 64) {
	                output = output + String.fromCharCode(chr2);
	            }
	            if (enc4 != 64) {
	                output = output + String.fromCharCode(chr3);
	            }
	 
	        }
	 
	        output = Base64._utf8_decode(output);
	 
	        return output;
	 
	    },
	 
	    // private method for UTF-8 encoding
	    _utf8_encode : function (string) {
	        string = string.replace(/\r\n/g,"\n");
	        var utftext = "";
	 
	        for (var n = 0; n < string.length; n++) {
	 
	            var c = string.charCodeAt(n);
	 
	            if (c < 128) {
	                utftext += String.fromCharCode(c);
	            }
	            else if((c > 127) && (c < 2048)) {
	                utftext += String.fromCharCode((c >> 6) | 192);
	                utftext += String.fromCharCode((c & 63) | 128);
	            }
	            else {
	                utftext += String.fromCharCode((c >> 12) | 224);
	                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	                utftext += String.fromCharCode((c & 63) | 128);
	            }
	 
	        }
	 
	        return utftext;
	    },
	 
	    // private method for UTF-8 decoding
	    _utf8_decode : function (utftext) {
	        var string = "";
	        var i = 0;
	        var c = c1 = c2 = 0;
	 
	        while ( i < utftext.length ) {
	 
	            c = utftext.charCodeAt(i);
	 
	            if (c < 128) {
	                string += String.fromCharCode(c);
	                i++;
	            }
	            else if((c > 191) && (c < 224)) {
	                c2 = utftext.charCodeAt(i+1);
	                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
	                i += 2;
	            }
	            else {
	                c2 = utftext.charCodeAt(i+1);
	                c3 = utftext.charCodeAt(i+2);
	                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
	                i += 3;
	            }
	 
	        }
	 
	        return string;
	    }
	};
 
};