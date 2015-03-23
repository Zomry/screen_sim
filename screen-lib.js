window.onload = function() {
	var voices = window.speechSynthesis.getVoices();
	var arrayTypes = {}; // caching-container to keep the adequate elements of the types

	var current = { 
		index: -1,
		mode: null,
		lastNode: null
	}
	
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
		g: 71 //  to next graphic
	};

	types("a");
	types("button");
	types("ul");
	types("li");
	types("input");
	types("img");
	document.body.onkeyup = navigate;

	function navigate(e) {
		switch(e.which) {
			case keys.k: // regular link
				switchElem("anchor", "a", e);
				break;
			case keys.i: // list item
				switchElem("li", "li", e);
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

		console.log(nextNode);

		if(nextNode != undefined) {
			(e.shiftKey)
				? current.index--
				: current.index++;
			current.lastNode = nextNode;
			nextNode.tabIndex = -999; // still needs to be reset to preview value if necessary
			nextNode.focus();
		}
	}


	function focusElem(elem) {
		var c = elem.path[0];
			c.tabIndex = -999;
			c.focus();
	}

	function types(selector) {
		var all;

		if(typeof selector == "string") {
			all = document.body.querySelectorAll(selector);
			all = Array.prototype.slice.call(all); //  convert to real array
		} else if (typeof selector == "array") { // impossible condition, but temporary placeholder

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
		if(speechSynthesis.speaking) {
			speechSynthesis.cancel()
		}
		var msg = new SpeechSynthesisUtterance();
		msg.voice = voices[4];
		msg.voiceURI = 'native';
		msg.volume = 1; // 0 to 1
		msg.rate = 1; // 0.1 to 10
		msg.pitch = 2; //0 to 2
		msg.text = elemName(e.path[0]) + ". " + elemContent(e.path[0]);

		msg.lang = 'en-UK';
		speechSynthesis.speak(msg);
		speechSynthesis.resume();
	}

	function elemName(elem) {
		var name = elem.nodeName;
		switch(name) {
			case "A":
				return "Anchor";
			case "INPUT":
				return "Input " + elem.type || "Text";
			case "LI":
				return "List item";
			case "IMG":
				return "Image";
			case "BUTTON":
				return "Button";
			case "UL":
				return "Unordered list";
			case "OL":
				return "Ordered list";
		}

		return name; // fallback if not defined
	}

	function elemContent(elem) {
		if(elem.nodeName == "INPUT") {
			console.log("lalala");
			return elem.placeholder;
		}

		if(elem.nodeName == "UL" || elem.nodeName == "OL") {
			return elem.getElementsByTagName("li").length + " items";
		}


		if(elem.nodeName == "IMG") {
			if(elem.alt != "") 	{
				return elem.alt;
			} else {
				var src = elem.src;

				if(src.indexOf('/') >= 0) {
				   src = src.substring(src.lastIndexOf('/')+1);
				}
				return src;
			}
		}

		if(elem.nodeName == "A") {
			return elem.title + elem.innerText;
		}

		if(elem.outerText != undefined || elem.outerText == "") {
			return elem.outerText;
		}

		return "No content provided"; // if none of above, say this
	}
};
