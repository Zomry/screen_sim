# screen_sim
School project in progress
The idea is to make a simple screenreader simulator for webdesigners to use to get a bit more insight in how screenreaders work. It uses speak synthesis, which is currently only supported in Chrome 36.0+. This project will become an (unofficial) Chrome extension.

Current features:
- Images: if the image has an alt-attribute, it will read this. If it doesn't, it will read the file name.
To DO: ignore the image in the flow if it does have an empty alt (alt="").

- Input fields: it will read the type of the field, values and placeholders.

- Recognise the type of the element: currently images, input fields, buttons, ordered lists, unordered lists, anchors
- When encountering an (un)ordered list, it will read loud how many items it contains

To do:
- support more HTML elements
- build in different modes (navigate by headers, anchors ...)
- disable further reading when navigating to the next element
- allow settings: to log or not to log / language / ...
- a lot ;-)
