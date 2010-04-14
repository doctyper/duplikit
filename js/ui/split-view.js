/*
File: split-view.js

About: Version
	1.0

Project: DupliKit

Description:
	DupliKit's Split View Controller

Requires:
	- <dup.js>
	- <rivet.js>
	
*/

/*
Class: Dup
	Scoped to the Dup Global Namespace
*/
var Dup = window.Dup || {};

/*
Namespace: Dup.UI
	Under the Dup.UI Local Namespace
*/
Dup.UI = Dup.UI || {};

/*
Namespace: Dup.UI.SplitView
	Under the Dup.UI.SplitView Local Namespace
*/
Dup.UI.SplitView = (function (object) {
	
	// Storing a variable to reference
	var $space = Dup;
	var $self = this;
	
	/*
	Namespace: Dup.UI.vars
		Shared local variables
	*/
	$self.vars = {};
	
	/*
	Namespace: Dup.UI.utils
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
			new Dup.UI.Rivet({
				target : views[i]
			});
		}
	};
	
	$self.addEventListeners = function(object) {
		var parent = object,
		    views = parent.querySelectorAll("view > section"),
		    second = views[1],
		    button = parent.querySelector($space.utils.parseClass(".", "popover-trigger"));
		
		second.addEventListener("touchend", function() {
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