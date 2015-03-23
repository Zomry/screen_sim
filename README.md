# screen_sim
(School project in progress)
The internet allows the visual impaired to access information that they couldn't before. The assistive technology (JAWS, NVDA, Narrator and Voiceover to name a few) is getting better and more useful. They integrate a few open standards: e.g. HTML5 semenatics and WAI-ARIA. However, it is not easy to optimise a website if you have no idea how a screenreader works.

While I'm not an expert in the field, I saw an opportunity to create a proof of concept for a school project.
This project aims to create a simple - hence incomplete! - simulator of a screenreader in a web context. Inspired by NVDA/Voiceover, the script uses the experimental speechSynthesis-feature of Chrome 33+. While the script may work in Firefox and Safari, I do not actively test it for these browsers. The scope of the project is limited to creating an onofficial chrome extension.


Current features:

 - Navigate modes:
 	- k will navigate to the next hyperlink (a)
 	- i will navigate to the next list item (li)
 	- if you press down shift while using any of the above modes, you will return to the previous item of that type (if possible)

 - Reading out the type of element (e.g. a -> "anchor", "li" -> "list item"). The set, however, is still compact.

 - Images if the image has an alt-attribute, it will read this out loud
 It doesn't support ignoring an empty alt (alt="")-attribute for the time being.

- When encountering an (un)ordered list, it will read loud how many items it contains

- When navigating to the next element, it will stop reading the previous one and will read the new one.

To do:
- support more HTML elements
- build in different modes (navigate by headers, anchors ...)
- allow settings: to log or not to log / language / ...
- a lot ;-)
