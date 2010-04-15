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
Class: Dup
	Scoped to the Dup Global Namespace
*/
var Dup = window.Dup || (function() {
	
	// Storing a variable to reference
	var $self = {};
	
	/*
	Namespace: Dup.vars
		Shared local variables
	*/
	$self.vars = {
		namespaceClass : "ui-dup"
	};
	
	/*
	Namespace: Dup.utils
		Shared local utilities
	*/
	$self.utils = {
		
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
					
					console.log(e);
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
		}
	};
	
	/*
	Namespace: Dup
		Under the Dup Local Namespace
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