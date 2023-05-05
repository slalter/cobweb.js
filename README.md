# originator note
Original credit due to Mark Haferkamp in 2017. Scott Alter updated in 2023.

# cobweb.js
This is a simple [cobweb diagram](https://en.wikipedia.org/wiki/Cobweb_plot) generator in JavaScript, compatible with all modern browsers, and safely running without any plugins, etcetera.

# Run it now
It's currently available at [oak.ucc.nau.edu/jws8/cobweb/cobweb.html](http://oak.ucc.nau.edu/jws8/cobweb/cobweb.html), which should be fairly close to the latest version.

# Directions from source
1. Download at least the `cobweb.html`, `cobweb.js`, and `params.js` pages in the same folder.
2. Open `cobweb.html` in a browser.
3. Fill in the requested cobweb details and click `Generate cobweb diagram!`

# 2023 updates
* Added option to iterate in real time with a speed bar. This required a gross nesting of requestAnimationFrame() and major changes to the structure of the program.
* Changed the color of the web to be a linear gradient between two colors.
* Added nth Iterate option.
* Added sound according to a linear map from (xmin, xmax) to (220hz, 440hz) when iterated in real time.

# Planned updates
* More code cleanup/refactoring
* Proper themes support (at least light and dark, likely with a cookie to save the selection as an individual preference)
* More example functions (the logistic map isn't everything)
* Auto-updating sliders (i.e., slide to change a value and the diagram is regenerated accordingly)

# Copyright and License
This has been made by Mark Haferkamp and Scott Alter and is available under the MIT License. Please see the `LICENSE` file for details.
