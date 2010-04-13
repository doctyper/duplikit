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
	$self.utils = {
		orientationChange : function(views) {
			for (var i = 0, j = views.length; i < j; i++) {
				var view = views[i];
				view.style.height = window.innerHeight - view.offsetTop + "px";
			}
		}
	};
	
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
		    views = parent.querySelectorAll("view > section"),
		    second = views[1],
		    button = parent.querySelector($space.utils.parseClass(".", "popover-trigger"));
		
		second.addEventListener("touchstart", function() {
			$space.utils.removeClass(parent, $space.utils.parseClass("popover-active"));
		}, false);
		
		button.addEventListener("touchend", function() {
			var utils = $space.utils,
			    _anim = $space.utils.parseClass("popover-animating"),
			    _class = $space.utils.parseClass("popover-active");
			
			if (utils.hasClass(parent, _class)) {
				$space.utils.addClass(parent, _anim);
				
				window.setTimeout(function() {
					$space.utils.removeClass(parent, _anim);
					$space.utils.removeClass(parent, _class);
				}, 500);
			} else {
				$space.utils.addClass(parent, _class);
			}
		}, false);
		
		button.addEventListener("click", function(e) {
			e.preventDefault();
		}, false);
		
		window.addEventListener("orientationchange", function() {
			$self.utils.orientationChange(views);
		}, false);
		
		$self.utils.orientationChange(views);
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		$self.addEventListeners(object);
		$self.prepView(object);
	}();
});