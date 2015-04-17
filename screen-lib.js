window.onload = function() {
	var voiceIsOn = false;
	var voices = window.speechSynthesis.getVoices();
	var arrayTypes = {}; // caching-container to keep the adequate elements of the types

	var current = { 
		index: -1,
		mode: null,
		lastNode: null
	}

	//document.getElementById("fake-button").attributes["aria-role"]
	
	var keys = {
		h: 72, // to next header
		l: 76, // to next ordered or unordered list
		i: 73, // to next list item
		t: 84, // to next table
		k: 75, // to next regular link (visited or unvisited)
		u: 85, // to next unvisited link
		v: 86, // to next visited link
		f: 70, // to next formfield
		e: 69, // to next edit field
		b: 66, // to next button
		x: 88, // to next checkbox
		c: 67, // to next combo box
		r: 82, // to next radio button
		q: 81, // to next block quote
		s: 83, // to next seperator
		m: 77, // to next frame
		g: 71, //  to next graphic,
		1: 97,
		2: 98,
		3: 99,
		4: 100,
		5: 101,
		6: 102
	};

	types("a");
	types("button", "button");
	types("ul");
	types("li");
	types("input, textarea");
	types("img");
	types("h1", "header");
	types("h2", "header");
	types("h3", "header");
	// types("div");

	document.body.onkeyup = navigate;

	function navigate(e) {
		switch(e.which) {
			case keys.k: // regular link
				switchElem("anchor", "a", e);
				break;
			case keys.i: // list item
				switchElem("li", "li", e);
				break;
			case keys.b: // button
				switchElem("button", "button", e);
				break;
			case keys.g:
				switchElem("img", "img", e);
				break;
			case keys.e:
				switchElem("input, textarea", "input", e);
				break;
			case keys["1"]:
			case keys["2"]:
			case keys["3"]:
			case keys["4"]:
			case keys["5"]:
			case keys["6"]:
				switchElem("header", "H" + e.which, e);
			// etc
		}
	}

	function switchElem(newMode, type, e) {
		if(newMode != current.mode) {
			current.mode = newMode;
			current.index = -1;
		}

		var nextNode = (e.shiftKey)
			? arrayTypes[type][current.index-1]
			: arrayTypes[type][current.index+1]

		if(nextNode != undefined) {
			(e.shiftKey)
				? current.index--
				: current.index++;
			current.lastNode = nextNode;
			nextNode.tabIndex = -1; // still needs to be reset to preview value if necessary
			nextNode.focus();
		} else {
			(e.shiftKey) 
				? handleSpeaking("No previous " + newMode)
				: handleSpeaking("No next " + newMode);
		}
	}


	function focusElem(elem) {
		var c = elem.path[0];
			c.tabIndex = -999;
			c.focus();
	}

	function types(selector, ariaRole) {
		var all, query = "";
		var all2;

		if(typeof selector == "string") {
			query += selector;
			if(ariaRole) { // if set
				query += ", [aria-role=" + ariaRole + "]";
			}

			all = document.body.querySelectorAll(query);
			all = Array.prototype.slice.call(all); //  convert to real array

		}

		if (typeof selector == "array") { // impossible condition, but temporary placeholder

		}

		if(all.length > 0) {
			for(var i = 0; i < all.length; i++) {
				all[i].onclick = focusElem;
				all[i].onfocus = synthesize;
			}
			arrayTypes[selector] = all; // add to list
		}
	}

	function synthesize(e) {
		handleSpeaking(elemContent(e.path[0]));
	}

	function handleSpeaking(message) {

		if(speechSynthesis.speaking) {
			speechSynthesis.cancel()
		}

		var msg = new SpeechSynthesisUtterance();
		msg.voice = voices[4];
		msg.voiceURI = 'native';
		msg.volume = 1; // 0 to 1
		msg.rate = 1; // 0.1 to 10
		msg.pitch = 2; //0 to 2
		msg.text = message;

		msg.lang = 'en-UK';

		if(voiceIsOn) {
			speechSynthesis.speak(msg);
			speechSynthesis.resume();	
		}		
		console.log(message);
	}

	var objNames = {
		"A": "link",
		"INPUT": "edit",
		"TEXTAREA": "edit",
		"IMG": "graphic",
		"BUTTON": "button",
		"LI": "list item",
		"UL": "Unorder list",
		"OL": "Ordered list",
		"1": "one",
		"2": "two",
		"3": "three", 
		"4": "four",
		"5": "five",
		"6": "six"
	}

	function elemContent(elem) {

		if(elem.nodeName == "INPUT" || elem.nodeName == "TEXTAREA") {
			var text = "";

			if(elem.id) { // if has id
				var label = document.querySelector("label[for=" + elem.id + "]");
				if(label) { // and have assistive label
					text += label.innerText + " "; // then add description
				}
			}

			text += objNames["INPUT"] + " ";


			text += (elem.disabled) ? "unavailable " : " "; // if disabled
			text += elem.placeholder + " ";
			text += elem.value + ""; // 
			return text;
		}

		if(elem.nodeName == "UL" || elem.nodeName == "OL") {
			return objNames[elem.nodeName] + " " + elem.getElementsByTagName("li").length + " items";
		}


		if(elem.nodeName == "IMG") {
			var val = objNames["IMG"] + " ";

			if(elem.alt != "") 	{
				val += elem.alt + ".";
			} else {
				var src = elem.src;

				if(src.indexOf('/') >= 0) {
				   src = src.substring(src.lastIndexOf('/')+1) + " ";
				}

				val += src;
			}

			val += (elem.longDesc != "") ? " Description available. Press enter to listen." : " ";
			return val;

			// if(elem.alt != "") 	{
			// 	return elem.alt;
			// } else {
			// 	var src = elem.src;

			// 	if(src.indexOf('/') >= 0) {
			// 	   src = src.substring(src.lastIndexOf('/')+1);
			// 	}

			// 	src += (elem.longDesc != "") 
			// 	? " description available" : " no description available";
			// 	return src;
			// }
		}

		if(elem.nodeName == "A") {
			var href = objNames[elem.nodeName] + " " + elem.href;

				if(href.indexOf('/') >= 0) {
				   href = href.substring(href.lastIndexOf('/')+1) ;
				}
			return elem.title + elem.innerText + " location " + href;
		}

		if(elem.nodeName == "BUTTON") {
			return objNames[elem.nodeName] + " " + elem.innerText;
		}

		switch (elem.nodeName) {
			case "H1":
			case "H2":
			case "H3":
			case "H4":
			case "H5":
			case "H6":
				return "Header level " + objNames[elem.nodeName.substring(2, 1)] + " " + elem.innerText; 
		}

		if(elem.outerText != undefined || elem.outerText == "") {
			return elem.outerText;
		}

		return "No content provided"; // if none of above, say this
	}
};
