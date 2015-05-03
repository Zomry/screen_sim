# Screen reader simulation
##Original aim
The internet allows the visual impaired to access information that they couldn't before. The assistive technology (JAWS, NVDA, Narrator and VoiceOver, to name a few) is getting better and more useful. They integrate a few open standards: e.g. HTML5 semantics, WAI-ARIA.
I notice that many developers find it difficult to get started with testing for screen readers because they do not have an idea how it might work. While I'm not an expert in the field, I saw a possibility to create a proof--of-concept screenreader for a school project. This project aims to create a simple - hence incomplete! - simulator of a screen reader in a web context. Inspired by NVDA/VoiceOver, the script uses the experimental speechSynthesis-feature of Chrome 33+. While the script might work in Firefox and Safari, I did not actively test for it.

##Result
A demo is provided in the .html-pages in the project. Most of the features are documented in index.html. Visual feedback is provided when a developer hovers an element, some elements can be navigated with

##Limitations
Apart from the available time, I faced two technical limitations (browser-level):
1. It is not possible to focus on a disabled editable field (input / areafield).
2. If you focus on a label connected with an editable field, it will not focus on the label, but on the editable field. This shouldn't be a problem.
