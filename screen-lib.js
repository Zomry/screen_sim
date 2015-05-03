window.onload = function() {
	var options = {
		voiceOn: true, 
		volume: 1.0
	};

	var descriptionDetails = {
		location: "longdesc.html",
		allowed: true
	}

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
		1: 97, // headers
		2: 98,
		3: 99,
		4: 100,
		5: 101,
		6: 102,
		esc: 27 // mute, unmute
	};

	var goTypes = [
		"a",
		"button",
		"ul",
		"li",
		"input",
		"textarea",
		"img",
		"h1",
		"h2",
		"h3",
	];

	types("a");
	types("button", "button");
	types("ul");
	types("ol");
	types("li");
	types(["input", "textarea"]);
	types("img");
	types("h1", "heading");
	types("h2", "heading");
	types("h3", "heading");
	types("table");
	types("th");
	types("td");
	types(["p", "article", "aside", "details", "header", "main", "mark", "nav", "section", "summary", "span",  "label"]);

	// types("*");
	// types("div");

	/* landmarks
		banner
		complementary
		contentinfo
		form
		main
		navigation
		search
	*/

	function heightDocument() { // source: http://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
		var body = document.body, html = document.documentElement;
		return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight,html.offsetHeight);
	}





	var textBalloon = document.createElement("div"); // visual feedback to user
	textBalloon.style.maxWidth = "90%";
	textBalloon.style.position = "absolute";
	textBalloon.style.color = "white";
	textBalloon.style.padding = "3px";
	textBalloon.style.boxShadow = "rgb(0, 0, 0) 2px 2px 9px";
	textBalloon.style.backgroundColor = "rgb(17, 153, 153)";
	textBalloon.style.display = "none";

	document.body.appendChild(textBalloon);
	document.body.onkeyup = navigate;

	function navigate(e) {
		switch(e.which) {
			case keys.k: // regular link
				switchElem("link", "a", e);
				break;
			case keys.i: // list item
				switchElem("list item", "li", e);
				break;
			case keys.b: // button
				switchElem("button", "button", e);
				break;
			case keys.g:
				switchElem("graphic", "img", e);
				break;
			case keys.e:
				switchElem("edit", "input", e);
				break;
			case keys["1"]:
			case keys["2"]:
			case keys["3"]:
			case keys["4"]:
			case keys["5"]:
			case keys["6"]:
				switchElem("header", "H" + e.which, e);
				break;
			case keys.esc:
				options.voiceOn = !options.voiceOn;
				if(options.voiceOn) {
					handleSpeaking("Voice on");
				} else {
					handleSpeaking("Voice off");
				}
				break;
			case keys.t:
				switchElem("table", "table", e);
				break;
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
				? handleSpeaking("No previous " + newMode, e)
				: handleSpeaking("No next " + newMode, e);
		}
	}


	function unFocusElem (elem) {
		var c = elem.path[0];
			c.tabIndex = c.dataset.tabIndex;
			c.blur();

			textBalloon.style.display = "none";
	}

	function focusElem(elem) {
		var c = elem.path[0];
			// c.data-tabIndex = c.tabIndex || "";
			c.tabIndex = -1;
			c.focus();
			textBalloon.style.display = "block";
	}

	function types(selector, ariaRole) {
		var all, query = "";

		if(typeof selector == "string") {
			query += selector;
			if(ariaRole) { // if set
				query += ", [aria-role=" + ariaRole + "]";
			}

		} else if (Array.isArray(selector)) { 
			for(var i = 0, n = selector.length; i < n; i++) {
				query += selector[i]
				if(i < n-1) { // if not last of list
					query += ",";
				}
			}
			
		}

		all = document.body.querySelectorAll(query);
		all = Array.prototype.slice.call(all); //  convert to real array


		if(all.length > 0) {
			for(var i = 0; i < all.length; i++) {
				all[i].onmouseover = focusElem;
				all[i].onmouseout = unFocusElem;
				all[i].onfocus = synthesize;
			} if(typeof selector == "string") {
				arrayTypes[selector] = all; // add to list
			} else if (Array.isArray(selector)) {
				arrayTypes[selector[0]] = all; // add to list
			}
		}
	}

	function toArray (res) {
	  return Array.prototype.slice.call(res); // convert to real array
	}

	function synthesize(e) {
		textBalloon.style.display = "block";
		handleSpeaking(elemContent(e.path[0]), e);
	}

	function handleSpeaking(message, e) {
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

		if(options.voiceOn) {
			speechSynthesis.speak(msg);
			speechSynthesis.resume();	
		}

		textBalloon.innerText = message;

		if(e != null) {
			var ref = e.path[0];
			var sumOffsetLeft = 0;
			var sumOffsetTop = 0;

			do {
				sumOffsetLeft += ref.offsetLeft;
				sumOffsetTop += ref.offsetTop;
				ref = ref.offsetParent;

			} while(ref.nodeName != "BODY") 

			if(heightDocument() - 50 < sumOffsetTop) {
				sumOffsetTop -= 50;
			}

			textBalloon.style.left = sumOffsetLeft + 50 +  "px";
			textBalloon.style.top = sumOffsetTop + 25 + "px";
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
		"UL": "Unordered list",
		"OL": "Ordered list",
		"1": "one",
		"2": "two",
		"3": "three", 
		"4": "four",
		"5": "five",
		"6": "six"
	}

	function findRow(node) { // source: http://stackoverflow.com/questions/13656921/fastest-way-to-find-the-index-of-a-child-node-in-parent
    var i = 1;
	    while (node = node.previousSibling) {
	        if (node.nodeType === 1) { ++i }
	    }
    	return i-1;
	}

	function findNearest(el, tag) { // source: http://stackoverflow.com/questions/18663941/finding-closest-element-without-jquery
	    while( el && el.tagName && el.tagName !== tag.toUpperCase()) {
	        el = el.parentNode;     
	    } return el;
	} 

	function elemContent(elem) {
		descriptionDetails.allowed = false; // reset

		if(elem.nodeName == "TABLE") {
			var theadSet = !!elem.querySelectorAll("thead").length;
			var tbodySet = !!elem.querySelectorAll("tbody").length; 
			var caption = elem.querySelector("caption");
			var rows, text, columns;

			if(theadSet) {
				rows = elem.querySelectorAll("tbody tr").length;
			} else {
				rows = elem.querySelectorAll("tr").length;
			}

			columns = elem.querySelector("tr").querySelectorAll("td, th").length;
			text = "table with " + columns + " columns and " + rows + " rows";
			
			if(caption) {
				text += " " + caption.innerText;
			}

			return text;
			// return "Table with " + elem.querySelector("table").length + " columns and " + elem.querySelector("tr").length + "rows."
		}

		if(elem.nodeName == "TD") {
			var text = "";
			var index = findRow(elem);
			var table = findNearest(elem, "table");
			var hasTableHeader = !!table.querySelectorAll("th").length;
			if(hasTableHeader) {
				text += table.querySelectorAll("th")[index].innerText;
			}
			text += " " + elem.innerText
			return text;
		}

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
			if(elem.value) {
				text += elem.value;
			} else {
				text += elem.placeholder;
			}
			return text;
		}

		if(elem.nodeName == "UL" || elem.nodeName == "OL") {
			console.log(elem.nodeName);
			var directChildren = 0, subChildrenCount = 0;
			var children = elem.children;
			var temp, subChildren, text;
			temp = toArray(elem.getElementsByTagName("ul"));
			subChildren = temp.concat(toArray(elem.getElementsByTagName("ol")));

			for(var i = 0, n = children.length; i < n ; i++) {
				if(children[i].nodeName == "LI") {
					directChildren++;
				}
			}

			if(subChildren.length > 0) {
				console.log("lengte is " + subChildren.length);
				for(var i = 0; i < subChildren.length; i++) {
					var currentListHolder = subChildren[i].children; // ul or ol
					console.dir(currentListHolder);

					for(var j = 0, n = currentListHolder.length; j < n; j++) {
						if(currentListHolder[j].nodeName == "LI") {
							subChildrenCount++;
						}
					}
				}				
			}

			text = objNames[elem.nodeName] + " " + directChildren + " item(s)";
			if(subChildrenCount) {
				text += " and " + subChildrenCount + " subitem(s).";
			}

			return text;
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

			if (elem.longDesc != "") { // no longdesc
				val += " Description available. Press enter to listen.";
				descriptionDetails.allowed = true;
				descriptionDetails.location = elem.longDesc;
				document.body.addEventListener("keyup", speakDescription);
			} else { 
				val += " ";
			}


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
			return objNames[elem.nodeName] + " " + elem.innerText;
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

	function speakDescription() {
		document.body.removeEventListener("keyup", speakDescription);

		if(descriptionDetails.allowed) {

		function whenReady () {
			descriptionDetails.allowed = false;
			handleSpeaking("Description: " + this.responseText);
		}

		var xhr = new XMLHttpRequest();
			xhr.onload = whenReady;
			xhr.open("get", descriptionDetails.location, true);
			xhr.send();
		}
	}
};
