/*
File: swipe.js

About: Version
	1.0

Project: Swipe JS

Description:
	Recreates native iPhone OS functionality

Supports:
	- iPad (iPhone coming soon(?))
	
*/

/*
Class: Swipe
	Scoped to the Swipe Global Namespace
*/
var Swipe = window.Swipe || (function() {
	
	// Storing a variable to reference
	var $self = {};
	
	/*
	Namespace: Swipe.vars
		Shared local variables
	*/
	$self.vars = {};
	
	/*
	Namespace: Swipe.utils
		Shared local utilities
	*/
	$self.utils = {
		
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
		}
	};
	
	/*
	Namespace: Swipe
		Under the Swipe Local Namespace
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