/*
File: duplikit.js

About: Version
	1.0

Project: DupliKit

Description:
	I can't believe it's not Cocoa!

Supports:
	- iPad (iPhone coming soon(?))
	
*/

/*
Class: DupliKit
	Scoped to the DupliKit Global Namespace
*/
var DupliKit = window.DupliKit || (function() {
	
	// Storing a variable to reference
	var $self = {};
	
	/*
	Namespace: DupliKit.vars
		Shared local variables
	*/
	$self.vars = {
		namespaceClass : "ui-dup"
	};
	
	/*
	Namespace: DupliKit.utils
		Shared local utilities
	*/
	$self.utils = {
		
		isStandalone : function() {
			return window.navigator.standalone;
		},
		
		/*
		sub: setTransform
			Applies a matrix value to the target element
		*/
		setTransform : function(el, matrix) {
			if (el) {
				el.style.webkitTransform = matrix;
			}
		},

		/*
		sub: resetTransition
			Resets transition duration to a specific value or zero
		*/
		resetTransition : function(el, duration, timing) {
			if (el) {
				el.style.webkitTransitionDuration = ((typeof duration !== "undefined") ? duration : 150) + "ms";
				el.style.webkitTransitionTimingFunction = ((typeof timing !== "undefined") ? timing : "");
			}
		},

		/*
		sub: getMatrix
			Returns the target element matrix
		*/
		getMatrix : function(el) {
			if (el) {
				var transform = window.getComputedStyle(el).webkitTransform,
				    matrix = new WebKitCSSMatrix(transform);

				return matrix;
			}
		},
		
		parseClass : function() {
			var suffix = arguments[1] || arguments[0],
			    prefix = arguments[1] ? arguments[0] : "";
			
			var value = prefix + $self.vars.namespaceClass + "-" + suffix;
			
			return value;
		},
		
		/*
		Property: addClass
			Adds class name to element

		Parameters:
			elClass - the class to add.
		*/
		addClass : function(el, elClass) {
			var curr = el.className;
			if (!new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i").test(curr)) {
				el.className = curr + ((curr.length > 0) ? " " : "") + elClass;
			}
			return el;
		},

		/*
		Property: removeClass
		 	Removes class name to element

		Parameters:
			elClass - _(optional)_ the class to remove.
		*/
		removeClass : function(el, elClass) {
			if (elClass) {
				var classReg = new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i");
				el.className = el.className.replace(classReg, function(e) {
					var value = "";
					if (new RegExp("^\\s+.*\\s+$").test(e)) {
						value = e.replace(/(\s+).+/, "$1");
					}
					return value;
				}).replace(/^\s+|\s+$/g, "");
				
				if (el.getAttribute("class") === "") {
					el.removeAttribute("class");
				}
			} else {
				el.className = "";
				el.removeAttribute("class");
			}
			return el;
		},
		
		/*
		Property: hasClass
		 	Tests if element has class

		Parameters:
			elClass - the class to test.
		*/
		hasClass : function(el, elClass) {
			return new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i").test(el.className);
		},

		/*
		Property: toggleClass
		 	Toggles a class on/off

		Parameters:
			elClass - the class to toggle.
		*/
		toggleClass : function(el, elClass) {
			$self.utils.hasClass(el, elClass) ? $self.utils.removeClass(el, elClass) : $self.utils.addClass(el, elClass);
			return el;
		},
		
		checkOrientation : function(e) {
			var orientation = Math.abs(window.orientation),
			    utils = $self.utils;
			
			if (orientation === 90) {
				utils.removeClass(document.body, "portrait");
				utils.addClass(document.body, "landscape");
			} else {
				utils.addClass(document.body, "portrait");
				utils.removeClass(document.body, "landscape");
			}
			
			$self.vars.orientationChange = true;
		},

		bindHoverClass : function(el) {
			var _hover = $self.utils.parseClass("hover");
			
			function addHover(el) {
				el.addEventListener("click", function(e) {
					e.preventDefault();
					e.stopPropagation();
					
					$self.utils.addClass(this, _hover);
				}, false);

				el.addEventListener("touchend", function(e) {
					$self.utils.removeClass(this, _hover);
				});
			}
			
			if (el && el[0]) {
				for (var i = 0, j = el.length; i < j; i++) {
					addHover(el[i]);
				}
			} else {
				addHover(el);
			}
		},
		
		showInstallReminder : function(view) {
			var standalone = $self.utils.isStandalone();
			
			if (!standalone) {
				var parent = document.createElement("div");
				$self.utils.addClass(parent, $self.utils.parseClass("reminder"));
				parent.innerHTML = "<div class=\"ui-dup-reminder-popover\"><h3>Install This App</h3><p>Tap the <em>+</em> icon and select 'Add to Home Screen'</p><div class=\"ui-dup-reminder-tip\"></div></div>";
				
				parent.addEventListener("touchend", function(e) {
					$self.utils.removeClass(parent, $self.utils.parseClass("reminder-active"));
					
					window.setTimeout(function() {
						parent.parentNode.removeChild(parent);
					}, 350);
				}, false);
				
				document.body.appendChild(parent);
				
				window.setTimeout(function() {
					$self.utils.addClass(parent, $self.utils.parseClass("reminder-active"));
				}, 1000);
			}
		},
		
		handleProperties : function(view, properties) {
			for (var key in properties) {
				if (properties[key] !== false && typeof $self.utils[key] === "function") {
					$self.utils[key](view);
				}
			}
		}
	};
	
	/*
	Namespace: DupliKit
		Under the DupliKit Local Namespace
	*/
	
	return function() {
		
		document.addEventListener("DOMContentLoaded", function() {
			window.addEventListener("orientationchange", $self.utils.checkOrientation, false);
			
			// Fire once on load to set initial class
			$self.utils.checkOrientation();
		}, false);
		
		return $self;
	}();
})();

/*
Class: DupliKit
	Shortcut to window.DupliKit
*/
window.Dup = window.Dup || window.DupliKit;