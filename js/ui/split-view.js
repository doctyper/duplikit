/*
File: rivet.js

About: Version
	1.0

Project: Swipe JS

Description:
	Enables fixed positioning on iPhone OS

Supports:
	- iPad (iPhone coming soon(?))
	
*/

/*
Class: Swipe
	Scoped to the Swipe Global Namespace
*/
var Swipe = window.Swipe || {};

/*
Namespace: Swipe.UI
	Under the Swipe.UI Local Namespace
*/
Swipe.UI = Swipe.UI || {};

/*
Namespace: Swipe.UI.SplitView
	Under the Swipe.UI.SplitView Local Namespace
*/
Swipe.UI.SplitView = (function (object) {
	
	// Storing a variable to reference
	var $space = Swipe;
	var $self = this;
	
	/*
	Namespace: Swipe.UI.vars
		Shared local variables
	*/
	$self.vars = {};
	
	/*
	Namespace: Swipe.UI.utils
		Shared local utilities
	*/
	$self.utils = {};
	
	$self.prepView = function(object) {
		var parent = object,
		    views = parent.querySelectorAll("view");
		
		for (var i = 0, j = views.length; i < j; i++) {
			new Swipe.UI.Rivet({
				target : views[i]
			});
		}
	};
	
	$self.addEventListeners = function(object) {
		var parent = object,
		    button = parent.querySelector($space.utils.parseClass(".", "popover-trigger"));
		
		console.log(button);
		button.addEventListener("touchend", function() {
			$space.utils.toggleClass(parent, $space.utils.parseClass("popover-active"));
		}, false);
		
		button.addEventListener("click", function(e) {
			e.preventDefault();
		}, false);
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		$self.prepView(object);
		$self.addEventListeners(object);
	}();
});